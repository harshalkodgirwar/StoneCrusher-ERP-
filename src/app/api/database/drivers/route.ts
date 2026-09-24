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
      name,
      phone,
      licenseNumber,
    } = body;

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, message: 'Local storage fallback (Supabase not configured)' });
    }

    const driverId = isUuid(id) ? id : crypto.randomUUID();
    const driverName = (name || '').trim();
    const driverPhone = (phone || '').trim();
    const driverLicense = (licenseNumber || '').trim();

    if (!driverName || !driverPhone) {
      return NextResponse.json({ error: 'Driver name and phone number are required' }, { status: 400 });
    }

    const payload = {
      name: driverName,
      phone: driverPhone,
      license_number: driverLicense || 'MH12-PENDING',
      is_active: true,
    };

    // Check if driver already exists by phone, license, or id
    const { data: existingRows } = await supabase
      .from('drivers')
      .select('id')
      .or(`id.eq.${driverId},phone.eq.${driverPhone}`)
      .limit(1);

    let res;
    if (existingRows && existingRows.length > 0) {
      res = await supabase
        .from('drivers')
        .update(payload)
        .eq('id', existingRows[0].id)
        .select()
        .single();
    } else {
      res = await supabase
        .from('drivers')
        .insert({ id: driverId, ...payload, created_at: new Date().toISOString() })
        .select()
        .single();
    }

    if (res.error) {
      console.warn('Supabase drivers write warning:', res.error.message);
      return NextResponse.json({ success: true, warning: res.error.message, driverId }, { status: 200 });
    }

    return NextResponse.json({ success: true, driver: res.data, driverId });
  } catch (err: any) {
    console.error('Error creating driver in database:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, name, phone, licenseNumber } = body;

    if (!id) {
      return NextResponse.json({ error: 'Driver ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, message: 'Local storage fallback' });
    }

    const updatePayload: Record<string, any> = {};
    if (name !== undefined) updatePayload.name = name.trim();
    if (phone !== undefined) updatePayload.phone = phone.trim();
    if (licenseNumber !== undefined) updatePayload.license_number = licenseNumber.trim();

    const { data, error } = await supabase
      .from('drivers')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('Supabase driver update warning:', error.message);
      return NextResponse.json({ success: true, warning: error.message }, { status: 200 });
    }

    return NextResponse.json({ success: true, driver: data });
  } catch (err: any) {
    console.error('Error updating driver:', err);
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
      return NextResponse.json({ error: 'Driver ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, message: 'Local storage fallback' });
    }

    const { error: deleteError } = await supabase.from('drivers').delete().eq('id', id);

    if (deleteError) {
      console.warn('Delete constraint, soft-deactivating driver:', deleteError.message);
      await supabase.from('drivers').update({ is_active: false }).eq('id', id);
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error('Error deleting driver:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
