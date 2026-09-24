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
      code,
      unit = 'MT',
      currentStockMt = 500,
      minThresholdMt = 100,
      unitPriceInr = 650,
      description = '',
    } = body;

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, message: 'Local storage fallback (Supabase not configured)' });
    }

    const productId = isUuid(id) ? id : crypto.randomUUID();
    const productName = (name || '').trim();
    const productCode = (code || '').trim().toUpperCase();

    if (!productName || !productCode) {
      return NextResponse.json({ error: 'Product name and product code are required' }, { status: 400 });
    }

    const payload = {
      name: productName,
      code: productCode,
      unit: unit || 'MT',
      current_stock_mt: Number(currentStockMt) || 0,
      min_threshold_mt: Number(minThresholdMt) || 100,
      unit_price_inr: Number(unitPriceInr) || 650,
      description: description || '',
      updated_at: new Date().toISOString(),
    };

    // Check if product already exists by code or id
    const { data: existingRows } = await supabase
      .from('products')
      .select('id')
      .or(`id.eq.${productId},code.eq.${productCode}`)
      .limit(1);

    let res;
    if (existingRows && existingRows.length > 0) {
      res = await supabase
        .from('products')
        .update(payload)
        .eq('id', existingRows[0].id)
        .select()
        .single();
    } else {
      res = await supabase
        .from('products')
        .insert({ id: productId, ...payload, created_at: new Date().toISOString() })
        .select()
        .single();
    }

    if (res.error) {
      console.warn('Supabase products write warning:', res.error.message);
      return NextResponse.json({ success: true, warning: res.error.message, productId }, { status: 200 });
    }

    return NextResponse.json({ success: true, product: res.data, productId });
  } catch (err: any) {
    console.error('Error creating product in database:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, name, code, unit, currentStockMt, minThresholdMt, unitPriceInr, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, message: 'Local storage fallback' });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (name !== undefined) updatePayload.name = name.trim();
    if (code !== undefined) updatePayload.code = code.trim().toUpperCase();
    if (unit !== undefined) updatePayload.unit = unit;
    if (currentStockMt !== undefined) updatePayload.current_stock_mt = Number(currentStockMt);
    if (minThresholdMt !== undefined) updatePayload.min_threshold_mt = Number(minThresholdMt);
    if (unitPriceInr !== undefined) updatePayload.unit_price_inr = Number(unitPriceInr);
    if (description !== undefined) updatePayload.description = description.trim();

    const { data, error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('Supabase product update warning:', error.message);
      return NextResponse.json({ success: true, warning: error.message }, { status: 200 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    console.error('Error updating product:', err);
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
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, message: 'Local storage fallback' });
    }

    const { error: deleteError } = await supabase.from('products').delete().eq('id', id);

    if (deleteError) {
      console.warn('Delete product FK constraint:', deleteError.message);
      // Soft update or mark inactive if possible
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error('Error deleting product:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
