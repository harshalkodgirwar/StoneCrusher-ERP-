-- ==============================================================================
-- STONECRUSHER ERP - COMPLETE SUPABASE SETUP SCRIPT
-- Contains All 14 Tables, Automated Triggers, and Full Client Demo Data
-- Instructions: Copy and Run this in Supabase SQL Editor (1-Click Setup)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- PART 1: TABLE DEFINITIONS & ENUMS
-- ==============================================================================

-- 1. Internal Roles & Users (Internal only: Owner, Office Operator, Site Operator)
DO $$ BEGIN
    CREATE TYPE internal_role AS ENUM ('OWNER_ADMIN', 'OFFICE_OPERATOR', 'SITE_OPERATOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS staff_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role internal_role NOT NULL DEFAULT 'SITE_OPERATOR',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Customers (NO ERP LOGIN - WhatsApp target)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    gst_number VARCHAR(50),
    billing_address TEXT NOT NULL,
    current_balance NUMERIC(12, 2) DEFAULT 0.00,
    credit_limit NUMERIC(12, 2) DEFAULT 100000.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Drivers (NO ERP LOGIN - WhatsApp target)
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Vehicles (Fleet & Transporters)
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50) DEFAULT 'Tipper 10-Wheeler',
    default_tare_weight_mt NUMERIC(8, 2) DEFAULT 10.50,
    max_capacity_mt NUMERIC(8, 2) DEFAULT 25.00,
    assigned_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Finished Aggregate Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'MT',
    current_stock_mt NUMERIC(12, 2) NOT NULL DEFAULT 500.00,
    min_threshold_mt NUMERIC(12, 2) NOT NULL DEFAULT 100.00,
    unit_price_inr NUMERIC(10, 2) NOT NULL DEFAULT 650.00,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Raw Materials (Boulders in Brass/MT)
CREATE TABLE IF NOT EXISTS raw_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'Brass',
    current_stock_brass NUMERIC(12, 2) NOT NULL DEFAULT 250.00,
    min_threshold_brass NUMERIC(12, 2) NOT NULL DEFAULT 50.00,
    unit_rate_inr NUMERIC(10, 2) NOT NULL DEFAULT 2800.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Suppliers & Labour Contractors (NO ERP LOGIN - WhatsApp receipt target)
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    supplier_type VARCHAR(50) DEFAULT 'Quarry Raw Material',
    balance_payable NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Spare Parts & Maintenance Inventory
CREATE TABLE IF NOT EXISTS spare_parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    part_number VARCHAR(100),
    category VARCHAR(100) DEFAULT 'Crusher Mechanical',
    current_stock INT NOT NULL DEFAULT 2,
    min_threshold INT NOT NULL DEFAULT 1,
    unit_cost_inr NUMERIC(10, 2) NOT NULL DEFAULT 15000.00,
    storage_bin VARCHAR(50) DEFAULT 'Main Shed - Rack B',
    last_replaced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Trips & FIFO Dispatch Queue
DO $$ BEGIN
    CREATE TYPE trip_status AS ENUM (
        'QUEUED',
        'DISPATCHED',
        'COMPLETED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    product_id UUID NOT NULL REFERENCES products(id),
    ordered_qty_mt NUMERIC(8, 2) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id),
    driver_id UUID REFERENCES drivers(id),
    destination VARCHAR(255) NOT NULL,
    required_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status trip_status NOT NULL DEFAULT 'QUEUED',
    fifo_sequence INT NOT NULL DEFAULT 1,
    created_by UUID REFERENCES staff_users(id),
    tare_weight_mt NUMERIC(8, 2),
    gross_weight_mt NUMERIC(8, 2),
    net_weight_mt NUMERIC(8, 2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    dispatched_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_trips_fifo ON trips(status, fifo_sequence ASC, created_at ASC);

-- 10. Weighbridge Transactions
CREATE TABLE IF NOT EXISTS weighbridge_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slip_number VARCHAR(50) UNIQUE NOT NULL,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    vehicle_plate VARCHAR(50) NOT NULL,
    tare_weight_mt NUMERIC(8, 2) NOT NULL,
    tare_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    gross_weight_mt NUMERIC(8, 2),
    gross_timestamp TIMESTAMPTZ,
    net_weight_mt NUMERIC(8, 2),
    operator_id UUID REFERENCES staff_users(id),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    inventory_deducted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Gate Passes (Official Dispatched Slips)
CREATE TABLE IF NOT EXISTS gate_passes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gate_pass_number VARCHAR(50) UNIQUE NOT NULL,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    weighbridge_id UUID REFERENCES weighbridge_transactions(id),
    customer_name VARCHAR(255) NOT NULL,
    vehicle_plate VARCHAR(50) NOT NULL,
    driver_name VARCHAR(255) NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    net_weight_mt NUMERIC(8, 2) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    qr_code_payload TEXT,
    pdf_url TEXT,
    issued_by UUID REFERENCES staff_users(id),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Raw Material Inward Receipts (Supplier / Labour)
CREATE TABLE IF NOT EXISTS raw_material_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    raw_material_id UUID NOT NULL REFERENCES raw_materials(id),
    vehicle_number VARCHAR(50) NOT NULL,
    quantity_brass NUMERIC(8, 2) NOT NULL,
    rate_per_brass NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    inward_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    received_by UUID REFERENCES staff_users(id),
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. WhatsApp Delivery Tracking (Decoupled Notification Engine)
DO $$ BEGIN
    CREATE TYPE whatsapp_recipient_type AS ENUM ('CUSTOMER', 'DRIVER', 'SUPPLIER', 'OWNER');
    CREATE TYPE whatsapp_message_status AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_phone VARCHAR(25) NOT NULL,
    recipient_type whatsapp_recipient_type NOT NULL,
    recipient_name VARCHAR(255),
    message_type VARCHAR(50) NOT NULL DEFAULT 'TEXT',
    template_name VARCHAR(100) NOT NULL,
    message_body TEXT NOT NULL,
    document_url TEXT,
    document_filename VARCHAR(255),
    related_entity VARCHAR(50),
    related_entity_id VARCHAR(100),
    status whatsapp_message_status NOT NULL DEFAULT 'PENDING',
    provider_message_id VARCHAR(100),
    retry_count INT NOT NULL DEFAULT 0,
    failure_reason TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Audit Logs (System Action History)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name VARCHAR(255) NOT NULL DEFAULT 'System',
    user_role VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- PART 2: AUTOMATIC INVENTORY DEDUCTION TRIGGER
-- Deducts finished product stock by Net Weight MT upon weighbridge verification
-- ==============================================================================

CREATE OR REPLACE FUNCTION trigger_deduct_inventory_on_weighbridge()
RETURNS TRIGGER AS $$
DECLARE
    v_product_id UUID;
    v_net_weight NUMERIC(8, 2);
BEGIN
    IF NEW.gross_weight_mt IS NOT NULL AND NEW.is_verified = true AND (OLD.inventory_deducted IS DISTINCT FROM true) THEN
        v_net_weight := NEW.gross_weight_mt - NEW.tare_weight_mt;
        NEW.net_weight_mt := v_net_weight;

        SELECT product_id INTO v_product_id FROM trips WHERE id = NEW.trip_id;

        IF v_product_id IS NOT NULL THEN
            UPDATE products 
            SET current_stock_mt = GREATEST(0, current_stock_mt - v_net_weight),
                updated_at = NOW()
            WHERE id = v_product_id;

            NEW.inventory_deducted := true;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_weighbridge_inventory_deduct ON weighbridge_transactions;
CREATE TRIGGER trg_weighbridge_inventory_deduct
BEFORE UPDATE OR INSERT ON weighbridge_transactions
FOR EACH ROW
EXECUTE FUNCTION trigger_deduct_inventory_on_weighbridge();

-- ==============================================================================
-- PART 3: REALISTIC CLIENT DEMO DATA
-- ==============================================================================

-- 1. Staff Users
INSERT INTO staff_users (id, email, full_name, phone, role) VALUES
('11111111-1111-1111-1111-111111111111', 'owner@stonecrusher.com', 'Vikramaditya Shinde', '+919822011223', 'OWNER_ADMIN'),
('22222222-2222-2222-2222-222222222222', 'office@stonecrusher.com', 'Amit Patil', '+919822033445', 'OFFICE_OPERATOR'),
('33333333-3333-3333-3333-333333333333', 'site@stonecrusher.com', 'Suresh Gaikwad', '+919822055667', 'SITE_OPERATOR')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- 2. Finished Aggregate Products
INSERT INTO products (id, name, code, unit, current_stock_mt, min_threshold_mt, unit_price_inr, description) VALUES
('a0000001-0000-0000-0000-000000000001', '20mm Aggregate', 'AGG-20MM', 'MT', 480.00, 100.00, 680.00, 'Blue basalt crushed aggregate 20mm for concrete mix'),
('a0000002-0000-0000-0000-000000000002', '10mm Aggregate', 'AGG-10MM', 'MT', 320.00, 80.00, 720.00, 'Clean 10mm aggregate for RCC roofing and slab columns'),
('a0000003-0000-0000-0000-000000000003', '40mm Aggregate', 'AGG-40MM', 'MT', 210.00, 60.00, 610.00, 'Sub-base stone aggregate 40mm for road foundation'),
('a0000004-0000-0000-0000-000000000004', 'GSB (Granular Sub Base)', 'GSB-MIX', 'MT', 650.00, 120.00, 480.00, 'Granular sub-base highway road construction mix'),
('a0000005-0000-0000-0000-000000000005', 'Crusher Dust', 'CR-DUST', 'MT', 410.00, 90.00, 390.00, 'Fine quarry dust 0-4mm for paver blocks and backfilling'),
('a0000006-0000-0000-0000-000000000006', 'M-Sand (Manufactured)', 'M-SAND', 'MT', 75.00, 100.00, 850.00, 'Washed artificial sand for plastering (LOW STOCK ALERT)')
ON CONFLICT (id) DO UPDATE SET current_stock_mt = EXCLUDED.current_stock_mt;

-- 3. Raw Materials (Inward boulder reserves)
INSERT INTO raw_materials (id, name, code, unit, current_stock_brass, min_threshold_brass, unit_rate_inr) VALUES
('b0000001-0000-0000-0000-000000000001', 'Black Basalt Boulder', 'RM-BOULDER', 'Brass', 185.00, 40.00, 3200.00),
('b0000002-0000-0000-0000-000000000002', 'Quarry Run Overburden Stone', 'RM-QRUN', 'Brass', 92.00, 30.00, 2100.00)
ON CONFLICT (id) DO UPDATE SET current_stock_brass = EXCLUDED.current_stock_brass;

-- 4. Customers
INSERT INTO customers (id, name, company_name, phone, billing_address, current_balance) VALUES
('c0000001-0000-0000-0000-000000000001', 'Rajesh Kulkarni', 'ABC Construction Infra Ltd', '+919890111222', 'Plot 42, MIDC Hinjawadi Phase 2, Pune', 45000.00),
('c0000002-0000-0000-0000-000000000002', 'Mahesh Deshmukh', 'Deshmukh Developers & Builders', '+919890333444', 'Sector 18, Kharadi Bypass, Pune', 125000.00),
('c0000003-0000-0000-0000-000000000003', 'Anand Rao', 'Highway Roadways Pvt Ltd', '+919890555666', 'Survey 104, Pune-Bangalore Expressway', 0.00),
('c0000004-0000-0000-0000-000000000004', 'Arun Wankhede', 'Wankhede Infrastructure Co', '+919890777888', 'Katraj-Kondhwa Road, Pune', 18000.00),
('c0000005-0000-0000-0000-000000000005', 'Hitesh Patel', 'Hitesh Construction Projects', '+919890999000', 'Wakad Dange Chowk, Pune', 62000.00)
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

-- 5. Drivers
INSERT INTO drivers (id, name, phone, license_number) VALUES
('d0000001-0000-0000-0000-000000000001', 'Raj Kumar', '+919765112233', 'MH12-2018-0098231'),
('d0000002-0000-0000-0000-000000000002', 'Sunil Jadhav', '+919765223344', 'MH14-2015-0044198'),
('d0000003-0000-0000-0000-000000000003', 'Pappu Yadav', '+919765334455', 'MH12-2020-0012876'),
('d0000004-0000-0000-0000-000000000004', 'Baban Shinde', '+919765445566', 'MH12-2019-0055412')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 6. Vehicles
INSERT INTO vehicles (id, plate_number, vehicle_type, default_tare_weight_mt, max_capacity_mt, assigned_driver_id) VALUES
('e0000001-0000-0000-0000-000000000001', 'MH12AB1234', 'Tipper 10-Wheeler', 10.40, 22.00, 'd0000001-0000-0000-0000-000000000001'),
('e0000002-0000-0000-0000-000000000002', 'MH14CD5678', 'Tipper 12-Wheeler', 12.80, 30.00, 'd0000002-0000-0000-0000-000000000002'),
('e0000003-0000-0000-0000-000000000003', 'MH12XY9988', 'Tipper 6-Wheeler', 6.20, 14.00, 'd0000003-0000-0000-0000-000000000003'),
('e0000004-0000-0000-0000-000000000004', 'MH12TR4567', 'Dumper 10-Wheeler', 11.20, 24.00, 'd0000004-0000-0000-0000-000000000004')
ON CONFLICT (id) DO UPDATE SET plate_number = EXCLUDED.plate_number;

-- 7. Suppliers & Labour Contractors
INSERT INTO suppliers (id, name, contact_person, phone, supplier_type, balance_payable) VALUES
('f0000001-0000-0000-0000-000000000001', 'Sahyadri Mining Contractors', 'Dattatray Shinde', '+919922887766', 'Raw Material Boulder Supplier', 84000.00),
('f0000002-0000-0000-0000-000000000002', 'Omkar Excavation & Blasting', 'Omkar More', '+919922445566', 'Labour & Quarry Contractor', 32000.00)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 8. Spare Parts
INSERT INTO spare_parts (id, name, part_number, category, current_stock, min_threshold, unit_cost_inr, storage_bin) VALUES
('80000001-0000-0000-0000-000000000001', 'Manganese Jaw Plate 36x24 Stationary', 'JP-3624-MN', 'Jaw Crusher', 2, 1, 48000.00, 'Rack A-1'),
('80000002-0000-0000-0000-000000000002', 'Manganese Jaw Plate 36x24 Movable', 'JP-3624-MN-MOV', 'Jaw Crusher', 1, 1, 52000.00, 'Rack A-2'),
('80000003-0000-0000-0000-000000000003', 'Heavy Duty V-Belt C-144', 'VB-C144-HD', 'Belt Drives', 8, 4, 1850.00, 'Rack C-4'),
('80000004-0000-0000-0000-000000000004', 'Spherical Roller Bearing 22320 CC/W33', 'BRG-22320', 'Crusher Bearings', 3, 2, 28000.00, 'Secure Cabinet B')
ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock;

-- 9. Trips & Queue Records
INSERT INTO trips (id, trip_number, customer_id, product_id, ordered_qty_mt, vehicle_id, driver_id, destination, status, fifo_sequence, tare_weight_mt, gross_weight_mt, net_weight_mt) VALUES
('90000001-0000-0000-0000-000000000001', 'TRP-2026-000001', 'c0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 20.00, 'e0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'Plot 42, MIDC Hinjawadi Phase 2, Pune', 'COMPLETED', 1, 10.40, 30.40, 20.00),
('90000002-0000-0000-0000-000000000002', 'TRP-2026-000002', 'c0000002-0000-0000-0000-000000000002', 'a0000002-0000-0000-0000-000000000002', 15.00, 'e0000002-0000-0000-0000-000000000002', 'd0000002-0000-0000-0000-000000000002', 'Sector 18, Kharadi Bypass, Pune', 'DISPATCHED', 2, 12.80, 27.80, 15.00),
('90000003-0000-0000-0000-000000000003', 'TRP-2026-000003', 'c0000003-0000-0000-0000-000000000003', 'a0000004-0000-0000-0000-000000000004', 25.00, 'e0000003-0000-0000-0000-000000000003', 'd0000003-0000-0000-0000-000000000003', 'Survey 104, Pune-Bangalore Expressway', 'COMPLETED', 3, 6.20, 31.20, 25.00),
('90000004-0000-0000-0000-000000000004', 'TRP-2026-000004', 'c0000004-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 22.00, 'e0000004-0000-0000-0000-000000000004', 'd0000004-0000-0000-0000-000000000004', 'Katraj-Kondhwa Road, Pune', 'QUEUED', 4, 11.20, NULL, NULL),
('90000005-0000-0000-0000-000000000005', 'TRP-2026-000005', 'c0000005-0000-0000-0000-000000000005', 'a0000005-0000-0000-0000-000000000005', 20.00, 'e0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'Wakad Dange Chowk, Pune', 'QUEUED', 5, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

-- 10. Weighbridge Slips
INSERT INTO weighbridge_transactions (id, slip_number, trip_id, vehicle_plate, tare_weight_mt, gross_weight_mt, net_weight_mt, is_verified, inventory_deducted) VALUES
('ba000001-0000-0000-0000-000000000001', 'WB-2026-000001', '90000001-0000-0000-0000-000000000001', 'MH12AB1234', 10.40, 30.40, 20.00, true, true),
('ba000002-0000-0000-0000-000000000002', 'WB-2026-000002', '90000002-0000-0000-0000-000000000002', 'MH14CD5678', 12.80, 27.80, 15.00, true, true),
('ba000003-0000-0000-0000-000000000003', 'WB-2026-000003', '90000003-0000-0000-0000-000000000003', 'MH12XY9988', 6.20, 31.20, 25.00, true, true)
ON CONFLICT (id) DO UPDATE SET is_verified = EXCLUDED.is_verified;

-- 11. Official Gate Passes
INSERT INTO gate_passes (id, gate_pass_number, trip_id, customer_name, vehicle_plate, driver_name, product_name, net_weight_mt, destination, qr_code_payload) VALUES
('ca000001-0000-0000-0000-000000000001', 'GP-2026-000001', '90000001-0000-0000-0000-000000000001', 'ABC Construction Infra Ltd', 'MH12AB1234', 'Raj Kumar', '20mm Aggregate', 20.00, 'Plot 42, MIDC Hinjawadi Phase 2, Pune', 'CRUSHER_GATEPASS|GP-2026-000001|TRP-2026-000001|MH12AB1234|20.00MT|VERIFIED'),
('ca000002-0000-0000-0000-000000000002', 'GP-2026-000002', '90000002-0000-0000-0000-000000000002', 'Deshmukh Developers & Builders', 'MH14CD5678', 'Sunil Jadhav', '10mm Aggregate', 15.00, 'Sector 18, Kharadi Bypass, Pune', 'CRUSHER_GATEPASS|GP-2026-000002|TRP-2026-000002|MH14CD5678|15.00MT|VERIFIED')
ON CONFLICT (id) DO UPDATE SET gate_pass_number = EXCLUDED.gate_pass_number;

-- 12. Raw Material Inward Receipts
INSERT INTO raw_material_receipts (id, receipt_number, supplier_id, raw_material_id, vehicle_number, quantity_brass, rate_per_brass, total_amount) VALUES
('da000001-0000-0000-0000-000000000001', 'RM-2026-000001', 'f0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'MH12XY4455', 15.00, 3200.00, 48000.00),
('da000002-0000-0000-0000-000000000002', 'RM-2026-000002', 'f0000002-0000-0000-0000-000000000002', 'b0000002-0000-0000-0000-000000000002', 'MH14AA8899', 20.00, 2100.00, 42000.00)
ON CONFLICT (id) DO UPDATE SET receipt_number = EXCLUDED.receipt_number;

-- 13. WhatsApp Notification Log (Proof of External Notifications)
INSERT INTO whatsapp_messages (id, recipient_phone, recipient_type, recipient_name, message_type, template_name, message_body, document_filename, status, read_at) VALUES
('ea000001-0000-0000-0000-000000000001', '+919890111222', 'CUSTOMER', 'Rajesh Kulkarni (ABC Construction)', 'DOCUMENT', 'CUSTOMER_DISPATCHED', 'Your material has been dispatched.\n\nTrip ID: TRP-2026-000001\nVehicle: MH12AB1234\nDriver: Raj Kumar\nProduct: 20mm Aggregate\nQuantity: 20 MT\nDestination: Plot 42, MIDC Hinjawadi Phase 2, Pune\n\nGate Pass: GP-2026-000001\n\nYour gate pass is attached.', 'GP-2026-000001.pdf', 'READ', NOW()),
('ea000002-0000-0000-0000-000000000002', '+919765112233', 'DRIVER', 'Raj Kumar (Driver)', 'DOCUMENT', 'DRIVER_GATE_PASS', 'Gate Pass Generated\n\nTrip: TRP-2026-000001\nGate Pass: GP-2026-000001\nVehicle: MH12AB1234\nProduct: 20mm Aggregate\nQuantity: 20 MT\n\nPlease keep the attached gate pass for dispatch.', 'GP-2026-000001.pdf', 'READ', NOW()),
('ea000003-0000-0000-0000-000000000003', '+919922887766', 'SUPPLIER', 'Sahyadri Mining Contractors', 'DOCUMENT', 'SUPPLIER_RECEIPT', 'Raw Material Receipt\n\nReceipt No: RM-2026-000001\n\nSupplier: Sahyadri Mining Contractors\nVehicle: MH12XY4455\nMaterial: Black Basalt Boulder\nQuantity: 15 Brass\n\nReceipt attached.', 'RM-2026-000001.pdf', 'DELIVERED', NOW()),
('ea000004-0000-0000-0000-000000000004', '+919822011223', 'OWNER', 'Vikramaditya Shinde (Owner)', 'TEXT', 'OWNER_DISPATCH_ALERT', 'Dispatch Completed\n\nTrip: TRP-2026-000001\nCustomer: ABC Construction Infra Ltd\nVehicle: MH12AB1234\nProduct: 20mm Aggregate\nQuantity: 20 MT\nGate Pass: GP-2026-000001\n\nInventory Updated:\nBefore: 500 MT\nAfter: 480 MT', NULL, 'DELIVERED', NOW())
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

-- ==============================================================================
-- SETUP COMPLETE
-- All 14 Tables and Realistic Client Demo Data are Active!
-- ==============================================================================

