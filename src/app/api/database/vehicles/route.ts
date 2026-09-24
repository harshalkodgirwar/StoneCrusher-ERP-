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

function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      plateNumber,
      vehicleType = 'Tipper 10-Wheeler',
      defaultTareWeightMt = 10.5,
      maxCapacityMt = 25.0,
      assignedDriverId,
    } = body;

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, message: 'Local storage fallback (Supabase not configured)' });
    }

    const vehicleId = isUuid(id) ? id : crypto.randomUUID();
    const normalizedPlate = (plateNumber || '').trim().toUpperCase();

    if (!normalizedPlate) {
      return NextResponse.json({ error: 'Vehicle plate number is required' }, { status: 400 });
    }

    // Verify driver ID if provided
    let validDriverId: string | null = null;
    if (assignedDriverId && isUuid(assignedDriverId)) {
      const { data: driverRow } = await supabase.from('drivers').select('id').eq('id', assignedDriverId).limit(1);
      if (driverRow && driverRow.length > 0) {
        validDriverId = assignedDriverId;
      }
    }

    const payload = {
      plate_number: normalizedPlate,
      vehicle_type: vehicleType,
      default_tare_weight_mt: Number(defaultTareWeightMt) || 10.5,
      max_capacity_mt: Number(maxCapacityMt) || 25.0,
      assigned_driver_id: validDriverId,
      is_active: true,
    };

    // Check if vehicle already exists by plate_number or id
    const { data: existingRows } = await supabase
      .from('vehicles')
      .select('id')
      .or(`id.eq.${vehicleId},plate_number.eq.${normalizedPlate}`)
      .limit(1);

    let res;
    if (existingRows && existingRows.length > 0) {
      res = await supabase
        .from('vehicles')
        .update(payload)
        .eq('id', existingRows[0].id)
        .select()
        .single();
    } else {
      res = await supabase
        .from('vehicles')
        .insert({ id: vehicleId, ...payload, created_at: new Date().toISOString() })
        .select()
        .single();
    }

    if (res.error) {
      console.warn('Supabase vehicles write warning:', res.error.message);
      return NextResponse.json({ success: true, warning: res.error.message, vehicleId }, { status: 200 });
    }

    return NextResponse.json({ success: true, vehicle: res.data, vehicleId });
  } catch (err: any) {
    console.error('Error creating vehicle in database:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, plateNumber, vehicleType, defaultTareWeightMt, maxCapacityMt, assignedDriverId } = body;

    if (!id) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, message: 'Local storage fallback' });
    }

    const updatePayload: Record<string, any> = {};
    if (plateNumber !== undefined) updatePayload.plate_number = plateNumber.trim().toUpperCase();
    if (vehicleType !== undefined) updatePayload.vehicle_type = vehicleType;
    if (defaultTareWeightMt !== undefined) updatePayload.default_tare_weight_mt = Number(defaultTareWeightMt);
    if (maxCapacityMt !== undefined) updatePayload.max_capacity_mt = Number(maxCapacityMt);
    if (assignedDriverId !== undefined) {
      updatePayload.assigned_driver_id = isUuid(assignedDriverId) ? assignedDriverId : null;
    }

    const { data, error } = await supabase
      .from('vehicles')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('Supabase vehicle update warning:', error.message);
      return NextResponse.json({ success: true, warning: error.message }, { status: 200 });
    }

    return NextResponse.json({ success: true, vehicle: data });
  } catch (err: any) {
    console.error('Error updating vehicle:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, message: 'Local storage fallback' });
    }

    const { error: deleteError } = await supabase.from('vehicles').delete().eq('id', id);

    if (deleteError) {
      console.warn('Delete constraint, soft-deactivating vehicle:', deleteError.message);
      await supabase.from('vehicles').update({ is_active: false }).eq('id', id);
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error('Error deleting vehicle:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
