import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { error: 'Supabase credentials not configured in environment variables' },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false },
      global: {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            signal: AbortSignal.timeout(3500),
          }),
      },
    });

    const [
      customersRes,
      productsRes,
      vehiclesRes,
      driversRes,
      tripsRes,
      wbRes,
      gatePassesRes,
      rawMaterialsRes,
      suppliersRes,
      sparePartsRes,
      auditLogsRes,
      whatsappRes,
      rawReceiptsRes,
    ] = await Promise.all([
      supabase.from('customers').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('name', { ascending: true }),
      supabase.from('vehicles').select('*').order('plate_number', { ascending: true }),
      supabase.from('drivers').select('*').order('name', { ascending: true }),
      supabase.from('trips').select('*').order('fifo_sequence', { ascending: true }),
      supabase.from('weighbridge_transactions').select('*').order('created_at', { ascending: false }),
      supabase.from('gate_passes').select('*').order('issued_at', { ascending: false }),
      supabase.from('raw_materials').select('*').order('name', { ascending: true }),
      supabase.from('suppliers').select('*').order('name', { ascending: true }),
      supabase.from('spare_parts').select('*').order('name', { ascending: true }),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('whatsapp_messages').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('raw_material_receipts').select('*').order('created_at', { ascending: false }),
    ]);

    // If critical tables failed (e.g. host unreachable, offline, or network error), return 502 instead of false empty success
    if (customersRes.error || productsRes.error || vehiclesRes.error || driversRes.error || tripsRes.error) {
      const err = customersRes.error || productsRes.error || vehiclesRes.error || driversRes.error || tripsRes.error;
      return NextResponse.json(
        {
          success: false,
          connected: false,
          error: err?.message || 'Supabase query error',
        },
        { status: 502 }
      );
    }

    // Map rows to camelCase for the frontend store
    const customers = (customersRes.data || []).map((c) => ({
      id: c.id,
      name: c.name,
      companyName: c.company_name || c.name,
      phone: c.phone,
      email: c.email || '',
      gstNumber: c.gst_number || '',
      billingAddress: c.billing_address || '',
      currentBalance: Number(c.current_balance || 0),
    }));

    const products = (productsRes.data || []).map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      unit: p.unit || 'MT',
      currentStockMt: Number(p.current_stock_mt || 0),
      minThresholdMt: Number(p.min_threshold_mt || 0),
      unitPriceInr: Number(p.unit_price_inr || 0),
      description: p.description || '',
    }));

    const vehicles = (vehiclesRes.data || []).map((v) => ({
      id: v.id,
      plateNumber: v.plate_number,
      vehicleType: v.vehicle_type || 'Tipper',
      defaultTareWeightMt: Number(v.default_tare_weight_mt || 10.5),
      maxCapacityMt: Number(v.max_capacity_mt || 25.0),
      assignedDriverId: v.assigned_driver_id || '',
    }));

    const drivers = (driversRes.data || []).map((d) => ({
      id: d.id,
      name: d.name,
      phone: d.phone,
      licenseNumber: d.license_number || '',
    }));

    const trips = (tripsRes.data || []).map((t) => ({
      id: t.id,
      tripNumber: t.trip_number,
      customerId: t.customer_id,
      productId: t.product_id,
      orderedQtyMt: Number(t.ordered_qty_mt || 0),
      vehicleId: t.vehicle_id,
      driverId: t.driver_id,
      destination: t.destination || '',
      requiredDate: t.required_date ? String(t.required_date).split('T')[0] : (t.created_at ? String(t.created_at).split('T')[0] : undefined),
      status: t.status,
      fifoSequence: Number(t.fifo_sequence || 1),
      tareWeightMt: t.tare_weight_mt ? Number(t.tare_weight_mt) : undefined,
      grossWeightMt: t.gross_weight_mt ? Number(t.gross_weight_mt) : undefined,
      netWeightMt: t.net_weight_mt ? Number(t.net_weight_mt) : undefined,
      notes: t.notes || '',
      createdAt: t.created_at,
      dispatchedAt: t.dispatched_at,
      completedAt: t.completed_at,
    }));

    const weighbridgeTransactions = (wbRes.data || []).map((w) => ({
      id: w.id,
      slipNumber: w.slip_number,
      tripId: w.trip_id,
      vehiclePlate: w.vehicle_plate,
      tareWeightMt: Number(w.tare_weight_mt || 0),
      tareTimestamp: w.tare_timestamp,
      grossWeightMt: w.gross_weight_mt ? Number(w.gross_weight_mt) : undefined,
      grossTimestamp: w.gross_timestamp,
      netWeightMt: w.net_weight_mt ? Number(w.net_weight_mt) : undefined,
      operatorId: w.operator_id,
      isVerified: Boolean(w.is_verified),
      inventoryDeducted: Boolean(w.inventory_deducted),
      createdAt: w.created_at,
    }));

    const gatePasses = (gatePassesRes.data || []).map((g) => ({
      id: g.id,
      gatePassNumber: g.gate_pass_number,
      tripId: g.trip_id,
      weighbridgeId: g.weighbridge_id,
      customerName: g.customer_name,
      vehiclePlate: g.vehicle_plate,
      driverName: g.driver_name,
      productName: g.product_name,
      netWeightMt: Number(g.net_weight_mt || 0),
      destination: g.destination,
      qrCodePayload: g.qr_code_payload || '',
      pdfUrl: g.pdf_url,
      issuedBy: g.issued_by || 'Site Operator',
      issuedAt: g.issued_at,
    }));

    const rawMaterials = (rawMaterialsRes.data || []).map((r) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      unit: r.unit || 'Brass',
      currentStockBrass: Number(r.current_stock_brass || 0),
      minThresholdBrass: Number(r.min_threshold_brass || 0),
      unitRateInr: Number(r.unit_rate_inr || 0),
    }));

    const suppliers = (suppliersRes.data || []).map((s) => ({
      id: s.id,
      name: s.name,
      contactPerson: s.contact_person || '',
      phone: s.phone,
      supplierType: s.supplier_type || 'Quarry Supplier',
      balancePayable: Number(s.balance_payable || 0),
    }));

    const spareParts = (sparePartsRes.data || []).map((sp) => ({
      id: sp.id,
      name: sp.name,
      partNumber: sp.part_number || '',
      category: sp.category || '',
      currentStock: Number(sp.current_stock || 0),
      minThreshold: Number(sp.min_threshold || 0),
      unitCostInr: Number(sp.unit_cost_inr || 0),
      storageBin: sp.storage_bin || '',
      lastReplacedAt: sp.last_replaced_at,
    }));

    const auditLogs = (auditLogsRes.data || []).map((a) => ({
      id: a.id,
      userName: a.user_name,
      userRole: a.user_role,
      action: a.action,
      entity: a.entity,
      entityId: a.entity_id || '',
      details: typeof a.details === 'object' ? JSON.stringify(a.details) : String(a.details || ''),
      createdAt: a.created_at,
    }));

    const whatsappMessages = (whatsappRes.data || []).map((wa) => ({
      id: wa.id,
      recipientPhone: wa.recipient_phone,
      recipientType: wa.recipient_type,
      recipientName: wa.recipient_name || '',
      messageType: wa.message_type || 'TEXT',
      templateName: wa.template_name,
      body: wa.message_body,
      status: wa.status,
      failureReason: wa.failure_reason,
      retryCount: wa.retry_count || 0,
      sentAt: wa.sent_at,
      deliveredAt: wa.delivered_at,
      readAt: wa.read_at,
      createdAt: wa.created_at,
    }));

    const rawMaterialReceipts = (rawReceiptsRes.data || []).map((rm) => {
      const supp = (suppliersRes.data || []).find((s) => s.id === rm.supplier_id);
      const mat = (rawMaterialsRes.data || []).find((m) => m.id === rm.raw_material_id);
      return {
        id: rm.id,
        receiptNumber: rm.receipt_number,
        supplierId: rm.supplier_id,
        supplierName: supp?.name || 'Sahyadri Mining Contractors',
        rawMaterialId: rm.raw_material_id,
        rawMaterialName: mat?.name || 'Black Basalt Boulder (200-400mm)',
        vehicleNumber: rm.vehicle_number,
        quantityBrass: Number(rm.quantity_brass || 0),
        ratePerBrass: Number(rm.rate_per_brass || 0),
        totalAmount: Number(rm.total_amount || 0),
        inwardTime: rm.created_at || new Date().toISOString(),
        receivedBy: rm.received_by || 'Quarry Supervisor',
      };
    });

    return NextResponse.json({
      success: true,
      customers,
      products,
      vehicles,
      drivers,
      trips,
      weighbridgeTransactions,
      gatePasses,
      rawMaterials,
      suppliers,
      spareParts,
      auditLogs,
      whatsappMessages,
      rawMaterialReceipts,
      rawRows: {
        customers: customersRes.data || [],
        products: productsRes.data || [],
        vehicles: vehiclesRes.data || [],
        drivers: driversRes.data || [],
        trips: tripsRes.data || [],
        weighbridge_transactions: wbRes.data || [],
        gate_passes: gatePassesRes.data || [],
        raw_materials: rawMaterialsRes.data || [],
        suppliers: suppliersRes.data || [],
        spare_parts: sparePartsRes.data || [],
        audit_logs: auditLogsRes.data || [],
        whatsapp_messages: whatsappRes.data || [],
        raw_material_receipts: rawReceiptsRes.data || [],
      },
    });
  } catch (error: any) {
    console.error('Error fetching Supabase data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
