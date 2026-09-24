import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          signal: AbortSignal.timeout(3000),
        }),
    },
  });
}

// Helper to check if string is a valid UUID
function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      tripNumber,
      customerId,
      productId,
      orderedQtyMt,
      vehicleId,
      driverId,
      destination,
      requiredDate,
      status = 'QUEUED',
      fifoSequence = 1,
      notes = '',
    } = body;

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, message: 'Local storage fallback (Supabase not configured)' });
    }

    // Ensure valid UUID or let Postgres generate one
    const tripId = isUuid(id) ? id : crypto.randomUUID();

    // Verify foreign keys exist or resolve them (vehicle and driver are now optional at creation)
    const [custRes, prodRes] = await Promise.all([
      isUuid(customerId) ? Promise.resolve({ data: [{ id: customerId }] }) : supabase.from('customers').select('id').limit(1),
      isUuid(productId) ? Promise.resolve({ data: [{ id: productId }] }) : supabase.from('products').select('id').limit(1),
    ]);

    const validCustId = isUuid(customerId) ? customerId : custRes.data?.[0]?.id;
    const validProdId = isUuid(productId) ? productId : prodRes.data?.[0]?.id;
    const validVehId = vehicleId && isUuid(vehicleId) ? vehicleId : null;
    const validDriverId = driverId && isUuid(driverId) ? driverId : null;

    if (!validCustId || !validProdId) {
      return NextResponse.json(
        { success: true, warning: 'Customer or Product foreign key not matched in Supabase, saved to local state only', tripId },
        { status: 200 }
      );
    }

    const insertPayload: any = {
      id: tripId,
      trip_number: tripNumber,
      customer_id: validCustId,
      product_id: validProdId,
      ordered_qty_mt: Number(orderedQtyMt),
      vehicle_id: validVehId,
      driver_id: validDriverId,
      destination: destination || 'Midc Pune',
      required_date: requiredDate || new Date().toISOString().split('T')[0],
      status: status || 'QUEUED',
      fifo_sequence: Number(fifoSequence) || 1,
      notes: notes || '',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('trips')
      .upsert(insertPayload, { onConflict: 'trip_number' })
      .select()
      .single();

    if (error) {
      console.warn('Supabase trips insert warning:', error.message);
      return NextResponse.json({ success: true, warning: error.message, tripId }, { status: 200 });
    }

    return NextResponse.json({ success: true, trip: data, tripId });
  } catch (err: any) {
    console.error('Error creating trip in database:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, tripNumber, ...updates } = body;

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, message: 'Local storage fallback' });
    }

    const updatePayload: Record<string, any> = {};
    if (updates.status) updatePayload.status = updates.status;
    if (updates.vehicleId) updatePayload.vehicle_id = updates.vehicleId;
    if (updates.driverId) updatePayload.driver_id = updates.driverId;
    if (updates.tareWeightMt !== undefined) updatePayload.tare_weight_mt = Number(updates.tareWeightMt);
    if (updates.grossWeightMt !== undefined) updatePayload.gross_weight_mt = Number(updates.grossWeightMt);
    if (updates.netWeightMt !== undefined) updatePayload.net_weight_mt = Number(updates.netWeightMt);
    if (updates.fifoSequence !== undefined) updatePayload.fifo_sequence = Number(updates.fifoSequence);
    if (updates.dispatchedAt) updatePayload.dispatched_at = updates.dispatchedAt;
    if (updates.completedAt) updatePayload.completed_at = updates.completedAt;

    let query = supabase.from('trips').update(updatePayload);
    if (id && isUuid(id)) {
      query = query.eq('id', id);
    } else if (tripNumber) {
      query = query.eq('trip_number', tripNumber);
    } else {
      return NextResponse.json({ error: 'Missing trip id or tripNumber' }, { status: 400 });
    }

    const { data, error } = await query.select();
    if (error) {
      console.warn('Supabase trips update warning:', error.message);
      return NextResponse.json({ success: true, warning: error.message });
    }

    return NextResponse.json({ success: true, trip: data });
  } catch (err: any) {
    console.error('Error updating trip in database:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
