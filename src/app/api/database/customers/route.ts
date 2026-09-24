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
      companyName,
      phone,
      email = '',
      gstNumber = '',
      billingAddress = 'Pune, Maharashtra',
      currentBalance = 0,
      creditLimit = 100000,
    } = body;

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, message: 'Local storage fallback (Supabase not configured)' });
    }

    const customerId = isUuid(id) ? id : crypto.randomUUID();

    const payload = {
      name: name || companyName || 'Customer',
      company_name: companyName || name || 'Contractor',
      phone: phone || '+919800000000',
      email: email || '',
      gst_number: gstNumber || '',
      billing_address: billingAddress || 'Pune, Maharashtra',
      current_balance: Number(currentBalance) || 0,
      credit_limit: Number(creditLimit) || 100000,
      is_active: true,
    };

    // Check if customer already exists by id or phone
    const { data: existingRows } = await supabase
      .from('customers')
      .select('id')
      .or(`id.eq.${customerId},phone.eq.${payload.phone}`)
      .limit(1);

    let res;
    if (existingRows && existingRows.length > 0) {
      const existingId = existingRows[0].id;
      res = await supabase
        .from('customers')
        .update(payload)
        .eq('id', existingId)
        .select()
        .single();
    } else {
      res = await supabase
        .from('customers')
        .insert({ id: customerId, ...payload, created_at: new Date().toISOString() })
        .select()
        .single();
    }

    if (res.error) {
      console.warn('Supabase customers write warning:', res.error.message);
      return NextResponse.json({ success: true, warning: res.error.message, customerId }, { status: 200 });
    }

    return NextResponse.json({ success: true, customer: res.data, customerId });
  } catch (err: any) {
    console.error('Error creating customer in database:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, name, companyName, phone, email, gstNumber, billingAddress, currentBalance, creditLimit } = body;

    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required for update' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, message: 'Local storage fallback' });
    }

    const updatePayload: Record<string, any> = {};
    if (name !== undefined) updatePayload.name = name;
    if (companyName !== undefined) updatePayload.company_name = companyName;
    if (phone !== undefined) updatePayload.phone = phone;
    if (email !== undefined) updatePayload.email = email;
    if (gstNumber !== undefined) updatePayload.gst_number = gstNumber;
    if (billingAddress !== undefined) updatePayload.billing_address = billingAddress;
    if (currentBalance !== undefined) updatePayload.current_balance = Number(currentBalance);
    if (creditLimit !== undefined) updatePayload.credit_limit = Number(creditLimit);

    const { data, error } = await supabase
      .from('customers')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('Supabase customer update warning:', error.message);
      return NextResponse.json({ success: true, warning: error.message }, { status: 200 });
    }

    return NextResponse.json({ success: true, customer: data });
  } catch (err: any) {
    console.error('Error updating customer:', err);
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
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, message: 'Local storage fallback' });
    }

    // Attempt hard delete; if foreign key constraint exists, soft delete by marking is_active = false
    const { error: deleteError } = await supabase.from('customers').delete().eq('id', id);

    if (deleteError) {
      console.warn('Delete constraint, soft-deactivating customer:', deleteError.message);
      await supabase.from('customers').update({ is_active: false }).eq('id', id);
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error('Error deleting customer:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
