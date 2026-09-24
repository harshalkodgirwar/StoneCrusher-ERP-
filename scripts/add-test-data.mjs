import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://foaegmxkmspuaymhsrys.supabase.co';
const supabaseKey = 'sb_publishable_3ggur8EMZWRbpVDgA1bvDQ_EjbAtKNN';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Inserting additional testing data into Supabase...');

  // 1. Add New Customers
  const { data: custData, error: custErr } = await supabase.from('customers').upsert([
    {
      id: 'c0000006-0000-0000-0000-000000000006',
      name: 'Rohan Sharma',
      company_name: 'Rohan Infra Projects Pvt Ltd',
      phone: '+919890888999',
      billing_address: 'Baner-Balewadi High St, Pune',
      current_balance: 85000.00,
      credit_limit: 300000.00,
    },
    {
      id: 'c0000007-0000-0000-0000-000000000007',
      name: 'Vikas Bansal',
      company_name: 'Pune Metro Rail Line-3 JV',
      phone: '+919890666777',
      billing_address: 'Metro Casting Yard, Hinjawadi Phase 3, Pune',
      current_balance: 240000.00,
      credit_limit: 1000000.00,
    },
  ]);
  if (custErr) console.error('Error inserting customers:', custErr);
  else console.log('✓ Customers added');

  // 2. Add New Drivers
  const { data: drvData, error: drvErr } = await supabase.from('drivers').upsert([
    {
      id: 'd0000005-0000-0000-0000-000000000005',
      name: 'Ganesh Mane',
      phone: '+919765556677',
      license_number: 'MH12-2021-0089123',
    },
    {
      id: 'd0000006-0000-0000-0000-000000000006',
      name: 'Nitin Salunkhe',
      phone: '+919765667788',
      license_number: 'MH14-2018-0067451',
    },
  ]);
  if (drvErr) console.error('Error inserting drivers:', drvErr);
  else console.log('✓ Drivers added');

  // 3. Add New Vehicles
  const { data: vehData, error: vehErr } = await supabase.from('vehicles').upsert([
    {
      id: 'e0000005-0000-0000-0000-000000000005',
      plate_number: 'MH12PK7788',
      vehicle_type: 'Tipper 10-Wheeler',
      default_tare_weight_mt: 10.80,
      max_capacity_mt: 24.00,
      assigned_driver_id: 'd0000005-0000-0000-0000-000000000005',
    },
    {
      id: 'e0000006-0000-0000-0000-000000000006',
      plate_number: 'MH14RT2211',
      vehicle_type: 'Dumper 12-Wheeler',
      default_tare_weight_mt: 13.10,
      max_capacity_mt: 32.00,
      assigned_driver_id: 'd0000006-0000-0000-0000-000000000006',
    },
  ]);
  if (vehErr) console.error('Error inserting vehicles:', vehErr);
  else console.log('✓ Vehicles added');

  // 4. Add Live Test Trips in Various Queue Stages
  const { data: tripData, error: tripErr } = await supabase.from('trips').upsert([
    {
      id: '90000006-0000-0000-0000-000000000006',
      trip_number: 'TRP-2026-000006',
      customer_id: 'c0000006-0000-0000-0000-000000000006',
      product_id: 'a0000001-0000-0000-0000-000000000001', // 20mm
      ordered_qty_mt: 30.00,
      vehicle_id: 'e0000005-0000-0000-0000-000000000005',
      driver_id: 'd0000005-0000-0000-0000-000000000005',
      destination: 'Baner-Balewadi High St, Pune',
      status: 'CALLED_TO_SCALE',
      fifo_sequence: 6,
    },
    {
      id: '90000007-0000-0000-0000-000000000007',
      trip_number: 'TRP-2026-000007',
      customer_id: 'c0000007-0000-0000-0000-000000000007',
      product_id: 'a0000004-0000-0000-0000-000000000004', // GSB Mix
      ordered_qty_mt: 32.00,
      vehicle_id: 'e0000006-0000-0000-0000-000000000006',
      driver_id: 'd0000006-0000-0000-0000-000000000006',
      destination: 'Metro Casting Yard, Hinjawadi Phase 3, Pune',
      status: 'TARE_WEIGHED',
      fifo_sequence: 7,
      tare_weight_mt: 13.10,
    },
    {
      id: '90000008-0000-0000-0000-000000000008',
      trip_number: 'TRP-2026-000008',
      customer_id: 'c0000002-0000-0000-0000-000000000002', // Deshmukh
      product_id: 'a0000002-0000-0000-0000-000000000002', // 10mm
      ordered_qty_mt: 15.00,
      vehicle_id: 'e0000001-0000-0000-0000-000000000001',
      driver_id: 'd0000001-0000-0000-0000-000000000001',
      destination: 'Sector 18, Kharadi Bypass, Pune',
      status: 'GROSS_WEIGHED',
      fifo_sequence: 8,
      tare_weight_mt: 10.40,
      gross_weight_mt: 25.40,
      net_weight_mt: 15.00,
    },
    {
      id: '90000009-0000-0000-0000-000000000009',
      trip_number: 'TRP-2026-000009',
      customer_id: 'c0000001-0000-0000-0000-000000000001',
      product_id: 'a0000005-0000-0000-0000-000000000005', // Crusher Dust
      ordered_qty_mt: 20.00,
      vehicle_id: 'e0000002-0000-0000-0000-000000000002',
      driver_id: 'd0000002-0000-0000-0000-000000000002',
      destination: 'MIDC Hinjawadi Phase 2, Pune',
      status: 'QUEUED',
      fifo_sequence: 9,
    },
  ]);
  if (tripErr) console.error('Error inserting trips:', tripErr);
  else console.log('✓ Trips added');

  // 5. Add Weighbridge Transactions
  const { data: wbData, error: wbErr } = await supabase.from('weighbridge_transactions').upsert([
    {
      id: 'ba000004-0000-0000-0000-000000000004',
      slip_number: 'WB-2026-000004',
      trip_id: '90000007-0000-0000-0000-000000000007',
      vehicle_plate: 'MH14RT2211',
      tare_weight_mt: 13.10,
      tare_timestamp: new Date().toISOString(),
      is_verified: false,
      inventory_deducted: false,
    },
    {
      id: 'ba000005-0000-0000-0000-000000000005',
      slip_number: 'WB-2026-000005',
      trip_id: '90000008-0000-0000-0000-000000000008',
      vehicle_plate: 'MH12AB1234',
      tare_weight_mt: 10.40,
      tare_timestamp: new Date().toISOString(),
      gross_weight_mt: 25.40,
      gross_timestamp: new Date().toISOString(),
      net_weight_mt: 15.00,
      is_verified: true,
      inventory_deducted: true,
    },
  ]);
  if (wbErr) console.error('Error inserting weighbridge slips:', wbErr);
  else console.log('✓ Weighbridge slips added');

  // 6. Add Audit Logs
  const { data: logData, error: logErr } = await supabase.from('audit_logs').insert([
    {
      user_name: 'Amit Patil (Office Operator)',
      user_role: 'OFFICE_OPERATOR',
      action: 'BOOK_ORDER',
      entity: 'TRIPS',
      entity_id: 'TRP-2026-000006',
      details: { product: '20mm Aggregate', quantity_mt: 30, customer: 'Rohan Infra Projects' },
    },
    {
      user_name: 'Suresh Gaikwad (Site Operator)',
      user_role: 'SITE_OPERATOR',
      action: 'CAPTURE_TARE_WEIGHT',
      entity: 'WEIGHBRIDGE',
      entity_id: 'WB-2026-000004',
      details: { vehicle: 'MH14RT2211', tare_mt: 13.10 },
    },
    {
      user_name: 'Suresh Gaikwad (Site Operator)',
      user_role: 'SITE_OPERATOR',
      action: 'VERIFY_GROSS_DISPATCH',
      entity: 'WEIGHBRIDGE',
      entity_id: 'WB-2026-000005',
      details: { vehicle: 'MH12AB1234', net_mt: 15.00, product_deducted: '10mm Aggregate' },
    },
    {
      user_name: 'Vikramaditya Shinde (Owner)',
      user_role: 'OWNER_ADMIN',
      action: 'PRICE_UPDATE_REVIEW',
      entity: 'PRODUCTS',
      entity_id: 'AGG-20MM',
      details: { rate_inr: 680.00, margin_pct: 22 },
    },
  ]);
  if (logErr) console.error('Error inserting audit logs:', logErr);
  else console.log('✓ Audit logs added');

  // 7. Add WhatsApp notification logs
  const { data: waData, error: waErr } = await supabase.from('whatsapp_messages').upsert([
    {
      id: 'ea000005-0000-0000-0000-000000000005',
      recipient_phone: '+919890888999',
      recipient_type: 'CUSTOMER',
      recipient_name: 'Rohan Sharma (Rohan Infra)',
      message_type: 'TEXT',
      template_name: 'ORDER_CONFIRMED',
      message_body: 'Your order for 30 MT of 20mm Aggregate has been confirmed. Vehicle MH12PK7788 called to scale.',
      status: 'DELIVERED',
    },
    {
      id: 'ea000006-0000-0000-0000-000000000006',
      recipient_phone: '+919765556677',
      recipient_type: 'DRIVER',
      recipient_name: 'Ganesh Mane (Driver)',
      message_type: 'TEXT',
      template_name: 'SCALE_CALLOUT',
      message_body: 'Vehicle MH12PK7788: Please drive onto Weighbridge Scale 1 for Tare Weighment.',
      status: 'READ',
    },
  ]);
  if (waErr) console.error('Error inserting whatsapp logs:', waErr);
  else console.log('✓ WhatsApp logs added');

  console.log('Finished inserting all test data!');
}

run();
