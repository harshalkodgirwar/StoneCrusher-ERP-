-- ==============================================================================
-- STONECRUSHER ERP - SUPABASE POSTGRESQL SCHEMA
-- Revised User Roles & WhatsApp Communication System
-- ==============================================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. INTERNAL ROLES & USERS (Internal only: Owner, Office Operator, Site Operator)
-- External users (Customer, Driver, Supplier) DO NOT have ERP dashboard accounts.
-- ------------------------------------------------------------------------------
CREATE TYPE internal_role AS ENUM ('OWNER_ADMIN', 'OFFICE_OPERATOR', 'SITE_OPERATOR');

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

-- ------------------------------------------------------------------------------
-- 2. MASTER DIRECTORIES
-- ------------------------------------------------------------------------------

-- Customers (NO ERP LOGIN - WhatsApp communication only)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL, -- WhatsApp notification target
    email VARCHAR(255),
    gst_number VARCHAR(50),
    billing_address TEXT NOT NULL,
    current_balance NUMERIC(12, 2) DEFAULT 0.00,
    credit_limit NUMERIC(12, 2) DEFAULT 100000.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drivers (NO ERP LOGIN - WhatsApp communication only)
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL, -- WhatsApp notification target
    license_number VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vehicles (Fleet & Transporters)
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

-- Finished Products (Stone Aggregate types)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- e.g. "20mm Aggregate", "10mm Aggregate", "GSB", "Crusher Dust", "M-Sand"
    code VARCHAR(50) UNIQUE NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'MT', -- Metric Ton
    current_stock_mt NUMERIC(12, 2) NOT NULL DEFAULT 500.00,
    min_threshold_mt NUMERIC(12, 2) NOT NULL DEFAULT 100.00,
    unit_price_inr NUMERIC(10, 2) NOT NULL DEFAULT 650.00,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Raw Materials (Boulders, Quarry Run, Blast Stone)
CREATE TABLE IF NOT EXISTS raw_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- e.g. "Boulder Stone (Raw)", "Quarry Run Stone"
    code VARCHAR(50) UNIQUE NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'Brass', -- Brass / MT
    current_stock_brass NUMERIC(12, 2) NOT NULL DEFAULT 250.00,
    min_threshold_brass NUMERIC(12, 2) NOT NULL DEFAULT 50.00,
    unit_rate_inr NUMERIC(10, 2) NOT NULL DEFAULT 2800.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Suppliers & Labour (NO ERP LOGIN - WhatsApp communication only)
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20) NOT NULL, -- WhatsApp receipt target
    supplier_type VARCHAR(50) DEFAULT 'Quarry Raw Material', -- 'Raw Material Supplier', 'Labour Contractor', 'Spare Parts'
    balance_payable NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spare Parts & Maintenance Items
CREATE TABLE IF NOT EXISTS spare_parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- e.g. "Jaw Plate 36x24 Manganese", "V-Belt C-144", "Bearing 22320"
    part_number VARCHAR(100),
    category VARCHAR(100) DEFAULT 'Crusher Mechanical',
    current_stock INT NOT NULL DEFAULT 2,
    min_threshold INT NOT NULL DEFAULT 1,
    unit_cost_inr NUMERIC(10, 2) NOT NULL DEFAULT 15000.00,
    storage_bin VARCHAR(50) DEFAULT 'Main Shed - Rack B',
    last_replaced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. TRIPS & FIFO DISPATCH QUEUE
-- ------------------------------------------------------------------------------

CREATE TYPE trip_status AS ENUM (
    'QUEUED',           -- Created by Office Operator, waiting in FIFO queue
    'CALLED_TO_SCALE',  -- Site Operator signaled truck to weighbridge
    'TARE_WEIGHED',     -- Empty tare recorded
    'LOADING',          -- Loading aggregate under hopper
    'GROSS_WEIGHED',    -- Loaded gross recorded & verified
    'GATE_PASS_ISSUED', -- Gate Pass generated
    'DISPATCHED',       -- Exited crusher site
    'CANCELLED'
);

CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. TRP-2026-000001
    customer_id UUID NOT NULL REFERENCES customers(id),
    product_id UUID NOT NULL REFERENCES products(id),
    ordered_qty_mt NUMERIC(8, 2) NOT NULL,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    driver_id UUID NOT NULL REFERENCES drivers(id),
    destination VARCHAR(255) NOT NULL,
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

-- Index for FIFO ordering
CREATE INDEX IF NOT EXISTS idx_trips_fifo ON trips(status, fifo_sequence ASC, created_at ASC);

-- ------------------------------------------------------------------------------
-- 4. WEIGHBRIDGE TRANSACTIONS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS weighbridge_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slip_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. WB-2026-000001
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

-- ------------------------------------------------------------------------------
-- 5. GATE PASSES
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS gate_passes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gate_pass_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. GP-2026-000001
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

-- ------------------------------------------------------------------------------
-- 6. RAW MATERIAL INWARD RECEIPTS (Supplier / Labour)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS raw_material_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. RM-2026-000001
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

-- ------------------------------------------------------------------------------
-- 7. WHATSAPP DELIVERY TRACKING (Crucial: ERP is source of truth, WhatsApp logs here)
-- ------------------------------------------------------------------------------

CREATE TYPE whatsapp_recipient_type AS ENUM ('CUSTOMER', 'DRIVER', 'SUPPLIER', 'OWNER');
CREATE TYPE whatsapp_message_status AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED');

CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_phone VARCHAR(25) NOT NULL,
    recipient_type whatsapp_recipient_type NOT NULL,
    recipient_name VARCHAR(255),
    message_type VARCHAR(50) NOT NULL, -- 'TEXT' or 'DOCUMENT'
    template_name VARCHAR(100) NOT NULL,
    message_body TEXT NOT NULL,
    document_url TEXT,
    document_filename VARCHAR(255),
    related_entity VARCHAR(50), -- 'TRIP', 'GATE_PASS', 'RAW_RECEIPT', 'INVENTORY', 'PAYMENT'
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

CREATE INDEX IF NOT EXISTS idx_wa_status ON whatsapp_messages(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wa_entity ON whatsapp_messages(related_entity, related_entity_id);

-- ------------------------------------------------------------------------------
-- 8. AUTOMATIC INVENTORY DEDUCTION TRIGGER
-- Triggered when gross weight is recorded & verified in weighbridge_transactions.
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION trigger_deduct_inventory_on_weighbridge()
RETURNS TRIGGER AS $$
DECLARE
    v_product_id UUID;
    v_net_weight NUMERIC(8, 2);
BEGIN
    -- Only run when net_weight is computed and not previously deducted
    IF NEW.gross_weight_mt IS NOT NULL AND NEW.is_verified = true AND (OLD.inventory_deducted IS DISTINCT FROM true) THEN
        v_net_weight := NEW.gross_weight_mt - NEW.tare_weight_mt;
        NEW.net_weight_mt := v_net_weight;

        -- Find product associated with trip
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

-- ------------------------------------------------------------------------------
-- 9. AUDIT LOGS
-- ------------------------------------------------------------------------------

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
-- END OF SCHEMA
-- ==============================================================================
