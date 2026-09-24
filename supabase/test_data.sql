-- ==============================================================================
-- STONECRUSHER ERP - ADDITIONAL TEST DATA SCRIPT
-- Contains active test orders, weighbridge scale slips, trucks, and audit trail
-- Run this anytime to add extra test records into Supabase
-- ==============================================================================

-- 1. Additional Customers
INSERT INTO customers (id, name, company_name, phone, billing_address, current_balance, credit_limit) VALUES
('c0000006-0000-0000-0000-000000000006', 'Rohan Sharma', 'Rohan Infra Projects Pvt Ltd', '+919890888999', 'Baner-Balewadi High St, Pune', 85000.00, 300000.00),
('c0000007-0000-0000-0000-000000000007', 'Vikas Bansal', 'Pune Metro Rail Line-3 JV', '+919890666777', 'Metro Casting Yard, Hinjawadi Phase 3, Pune', 240000.00, 1000000.00)
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

-- 2. Additional Drivers
INSERT INTO drivers (id, name, phone, license_number) VALUES
('d0000005-0000-0000-0000-000000000005', 'Ganesh Mane', '+919765556677', 'MH12-2021-0089123'),
('d0000006-0000-0000-0000-000000000006', 'Nitin Salunkhe', '+919765667788', 'MH14-2018-0067451')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. Additional Fleet Vehicles
INSERT INTO vehicles (id, plate_number, vehicle_type, default_tare_weight_mt, max_capacity_mt, assigned_driver_id) VALUES
('e0000005-0000-0000-0000-000000000005', 'MH12PK7788', 'Tipper 10-Wheeler', 10.80, 24.00, 'd0000005-0000-0000-0000-000000000005'),
('e0000006-0000-0000-0000-000000000006', 'MH14RT2211', 'Dumper 12-Wheeler', 13.10, 32.00, 'd0000006-0000-0000-0000-000000000006')
ON CONFLICT (id) DO UPDATE SET plate_number = EXCLUDED.plate_number;

-- 4. Additional Test Trips in Varied Stages
INSERT INTO trips (id, trip_number, customer_id, product_id, ordered_qty_mt, vehicle_id, driver_id, destination, status, fifo_sequence, tare_weight_mt, gross_weight_mt, net_weight_mt) VALUES
('90000006-0000-0000-0000-000000000006', 'TRP-2026-000006', 'c0000006-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000001', 30.00, 'e0000005-0000-0000-0000-000000000005', 'd0000005-0000-0000-0000-000000000005', 'Baner-Balewadi High St, Pune', 'QUEUED', 6, NULL, NULL, NULL),
('90000007-0000-0000-0000-000000000007', 'TRP-2026-000007', 'c0000007-0000-0000-0000-000000000007', 'a0000004-0000-0000-0000-000000000004', 32.00, 'e0000006-0000-0000-0000-000000000006', 'd0000006-0000-0000-0000-000000000006', 'Metro Casting Yard, Hinjawadi Phase 3, Pune', 'QUEUED', 7, 13.10, NULL, NULL),
('90000008-0000-0000-0000-000000000008', 'TRP-2026-000008', 'c0000002-0000-0000-0000-000000000002', 'a0000002-0000-0000-0000-000000000002', 15.00, 'e0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'Sector 18, Kharadi Bypass, Pune', 'COMPLETED', 8, 10.40, 25.40, 15.00),
('90000009-0000-0000-0000-000000000009', 'TRP-2026-000009', 'c0000001-0000-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000005', 20.00, 'e0000002-0000-0000-0000-000000000002', 'd0000002-0000-0000-0000-000000000002', 'MIDC Hinjawadi Phase 2, Pune', 'QUEUED', 9, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

-- 5. Additional Weighbridge Transactions
INSERT INTO weighbridge_transactions (id, slip_number, trip_id, vehicle_plate, tare_weight_mt, tare_timestamp, gross_weight_mt, gross_timestamp, net_weight_mt, is_verified, inventory_deducted) VALUES
('ba000004-0000-0000-0000-000000000004', 'WB-2026-000004', '90000007-0000-0000-0000-000000000007', 'MH14RT2211', 13.10, NOW(), NULL, NULL, NULL, false, false),
('ba000005-0000-0000-0000-000000000005', 'WB-2026-000005', '90000008-0000-0000-0000-000000000008', 'MH12AB1234', 10.40, NOW(), 25.40, NOW(), 15.00, true, true)
ON CONFLICT (id) DO UPDATE SET is_verified = EXCLUDED.is_verified;

-- 6. Audit Logs
INSERT INTO audit_logs (user_name, user_role, action, entity, entity_id, details) VALUES
('Amit Patil (Office Operator)', 'OFFICE_OPERATOR', 'BOOK_ORDER', 'TRIPS', 'TRP-2026-000006', '{"product": "20mm Aggregate", "quantity_mt": 30, "customer": "Rohan Infra Projects"}'),
('Suresh Gaikwad (Site Operator)', 'SITE_OPERATOR', 'CAPTURE_TARE_WEIGHT', 'WEIGHBRIDGE', 'WB-2026-000004', '{"vehicle": "MH14RT2211", "tare_mt": 13.10}'),
('Suresh Gaikwad (Site Operator)', 'SITE_OPERATOR', 'VERIFY_GROSS_DISPATCH', 'WEIGHBRIDGE', 'WB-2026-000005', '{"vehicle": "MH12AB1234", "net_mt": 15.00, "product_deducted": "10mm Aggregate"}'),
('Vikramaditya Shinde (Owner)', 'OWNER_ADMIN', 'PRICE_UPDATE_REVIEW', 'PRODUCTS', 'AGG-20MM', '{"rate_inr": 680.00, "margin_pct": 22}');

-- 7. WhatsApp Delivery Notifications
INSERT INTO whatsapp_messages (id, recipient_phone, recipient_type, recipient_name, message_type, template_name, message_body, status) VALUES
('ea000005-0000-0000-0000-000000000005', '+919890888999', 'CUSTOMER', 'Rohan Sharma (Rohan Infra)', 'TEXT', 'ORDER_CONFIRMED', 'Your order for 30 MT of 20mm Aggregate has been confirmed. Vehicle MH12PK7788 called to scale.', 'DELIVERED'),
('ea000006-0000-0000-0000-000000000006', '+919765556677', 'DRIVER', 'Ganesh Mane (Driver)', 'TEXT', 'SCALE_CALLOUT', 'Vehicle MH12PK7788: Please drive onto Weighbridge Scale 1 for Tare Weighment.', 'READ')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;
