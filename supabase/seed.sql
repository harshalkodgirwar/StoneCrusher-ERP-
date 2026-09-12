-- ==============================================================================
-- STONECRUSHER ERP - INITIAL SEED DATA
-- ==============================================================================

-- 1. Staff Users (Internal only)
INSERT INTO staff_users (id, email, full_name, phone, role) VALUES
('11111111-1111-1111-1111-111111111111', 'owner@stonecrusher.com', 'Vikramaditya Shinde', '+919822011223', 'OWNER_ADMIN'),
('22222222-2222-2222-2222-222222222222', 'office@stonecrusher.com', 'Amit Patil', '+919822033445', 'OFFICE_OPERATOR'),
('33333333-3333-3333-3333-333333333333', 'site@stonecrusher.com', 'Suresh Gaikwad', '+919822055667', 'SITE_OPERATOR')
ON CONFLICT DO NOTHING;

-- 2. Finished Aggregate Products
INSERT INTO products (id, name, code, unit, current_stock_mt, min_threshold_mt, unit_price_inr, description) VALUES
('a0000001-0000-0000-0000-000000000001', '20mm Aggregate', 'AGG-20MM', 'MT', 480.00, 100.00, 680.00, 'Blue basalt crushed aggregate 20mm for concrete mix'),
('a0000002-0000-0000-0000-000000000002', '10mm Aggregate', 'AGG-10MM', 'MT', 320.00, 80.00, 720.00, 'Clean 10mm aggregate for RCC roofing and columns'),
('a0000003-0000-0000-0000-000000000003', '40mm Aggregate', 'AGG-40MM', 'MT', 210.00, 60.00, 610.00, 'Sub-base stone aggregate 40mm'),
('a0000004-0000-0000-0000-000000000004', 'GSB (Granular Sub Base)', 'GSB-MIX', 'MT', 650.00, 120.00, 480.00, 'Granular sub base road construction mix'),
('a0000005-0000-0000-0000-000000000005', 'Crusher Dust', 'CR-DUST', 'MT', 410.00, 90.00, 390.00, 'Fine quarry dust 0-4mm for paver blocks and backfilling'),
('a0000006-0000-0000-0000-000000000006', 'M-Sand (Manufactured Sand)', 'M-SAND', 'MT', 75.00, 100.00, 850.00, 'Washed artificial sand for plastering (LOW STOCK ALERT)')
ON CONFLICT DO NOTHING;

-- 3. Raw Materials (Inward boulder reserves)
INSERT INTO raw_materials (id, name, code, unit, current_stock_brass, min_threshold_brass, unit_rate_inr) VALUES
('b0000001-0000-0000-0000-000000000001', 'Black Basalt Boulder', 'RM-BOULDER', 'Brass', 185.00, 40.00, 3200.00),
('b0000002-0000-0000-0000-000000000002', 'Quarry Run Overburden Stone', 'RM-QRUN', 'Brass', 92.00, 30.00, 2100.00)
ON CONFLICT DO NOTHING;

-- 4. External Customers (WhatsApp recipients, NO LOGIN)
INSERT INTO customers (id, name, company_name, phone, billing_address, current_balance) VALUES
('c0000001-0000-0000-0000-000000000001', 'Rajesh Kulkarni', 'ABC Construction Infra Ltd', '+919890111222', 'Plot 42, MIDC Hinjawadi, Pune', 45000.00),
('c0000002-0000-0000-0000-000000000002', 'Mahesh Deshmukh', 'Deshmukh Developers & Builders', '+919890333444', 'Sector 18, Kharadi Bypass, Pune', 125000.00),
('c0000003-0000-0000-0000-000000000003', 'Anand Rao', 'Highway Roadways Pvt Ltd', '+919890555666', 'Survey 104, Pune-Bangalore Highway', 0.00)
ON CONFLICT DO NOTHING;

-- 5. External Drivers (WhatsApp recipients, NO LOGIN)
INSERT INTO drivers (id, name, phone, license_number) VALUES
('d0000001-0000-0000-0000-000000000001', 'Raj Kumar', '+919765112233', 'MH12-2018-0098231'),
('d0000002-0000-0000-0000-000000000002', 'Sunil Jadhav', '+919765223344', 'MH14-2015-0044198'),
('d0000003-0000-0000-0000-000000000003', 'Pappu Yadav', '+919765334455', 'MH12-2020-0012876')
ON CONFLICT DO NOTHING;

-- 6. Fleet Vehicles
INSERT INTO vehicles (id, plate_number, vehicle_type, default_tare_weight_mt, max_capacity_mt, assigned_driver_id) VALUES
('e0000001-0000-0000-0000-000000000001', 'MH12AB1234', 'Tipper 10-Wheeler', 10.40, 22.00, 'd0000001-0000-0000-0000-000000000001'),
('e0000002-0000-0000-0000-000000000002', 'MH14CD5678', 'Tipper 12-Wheeler', 12.80, 30.00, 'd0000002-0000-0000-0000-000000000002'),
('e0000003-0000-0000-0000-000000000003', 'MH12XY9988', 'Tipper 6-Wheeler', 6.20, 14.00, 'd0000003-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- 7. Suppliers & Labour Contractors (WhatsApp recipients, NO LOGIN)
INSERT INTO suppliers (id, name, contact_person, phone, supplier_type, balance_payable) VALUES
('f0000001-0000-0000-0000-000000000001', 'Sahyadri Mining Contractors', 'Dattatray Shinde', '+919922887766', 'Raw Material Boulder Supplier', 84000.00),
('f0000002-0000-0000-0000-000000000002', 'Omkar Excavation & Blasting', 'Omkar More', '+919922445566', 'Labour & Quarry Contractor', 32000.00)
ON CONFLICT DO NOTHING;

-- 8. Spare Parts
INSERT INTO spare_parts (name, part_number, category, current_stock, min_threshold, unit_cost_inr, storage_bin) VALUES
('Manganese Jaw Plate 36x24 Stationary', 'JP-3624-MN', 'Jaw Crusher', 2, 1, 48000.00, 'Rack A-1'),
('Manganese Jaw Plate 36x24 Movable', 'JP-3624-MN-MOV', 'Jaw Crusher', 1, 1, 52000.00, 'Rack A-2'),
('Heavy Duty V-Belt C-144', 'VB-C144-HD', 'Belt Drives', 8, 4, 1850.00, 'Rack C-4'),
('Spherical Roller Bearing 22320 CC/W33', 'BRG-22320', 'Crusher Shaft Bearings', 3, 2, 28000.00, 'Secure Cabinet B')
ON CONFLICT DO NOTHING;
