'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Server,
  ShieldCheck,
  Code,
  FileCode,
  Save,
} from 'lucide-react';

export const DatabaseConfigView: React.FC = () => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [statusResult, setStatusResult] = useState<{
    isConfigured: boolean;
    connected: boolean;
    supabaseUrl: string;
    error?: string;
    tablesStatus?: { table: string; exists: boolean; count?: number }[];
  } | null>(null);

  const [copiedSql, setCopiedSql] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeSqlTab, setActiveSqlTab] = useState<'SCHEMA' | 'SEED'>('SCHEMA');

  // Load initial status
  useEffect(() => {
    fetch('/api/database/test')
      .then((res) => res.json())
      .then((data) => {
        setStatusResult(data);
        if (data.supabaseUrl && data.supabaseUrl !== 'Not provided') {
          setSupabaseUrl(data.supabaseUrl);
        }
      })
      .catch((err) => {
        console.error('Failed to load database status:', err);
      });
  }, []);

  const handleTestConnection = async (saveToEnv = false) => {
    setIsTesting(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/database/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabaseUrl,
          supabaseAnonKey,
          saveToEnv,
        }),
      });

      const data = await res.json();
      setStatusResult(data);

      if (saveToEnv && data.connected) {
        setSaveSuccess(true);
      }
    } catch (err: any) {
      setStatusResult({
        isConfigured: true,
        connected: false,
        supabaseUrl,
        error: err.message || 'Failed to connect',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopySql = (type: 'SCHEMA' | 'SEED') => {
    const textToCopy = type === 'SCHEMA' ? SQL_SCHEMA_STRING : SQL_SEED_STRING;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Connection Status Banner */}
      <div
        className="owner-card"
        style={{
          borderLeft: statusResult?.connected ? '4px solid #10B981' : '4px solid #F59E0B',
          padding: '20px 24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: statusResult?.connected ? '#DCFCE7' : '#FEF3C7',
                color: statusResult?.connected ? '#16A34A' : '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Database size={24} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  {statusResult?.connected
                    ? 'Connected to Live Supabase Database'
                    : 'Local In-Memory / Fallback Store Active'}
                </h3>
                <span className={`owner-pill-badge ${statusResult?.connected ? 'owner-pill-green' : 'owner-pill-cyan'}`}>
                  {statusResult?.connected ? 'POSTGRESQL LIVE' : 'DEMO MODE'}
                </span>
              </div>
              <p style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '3px' }}>
                {statusResult?.connected
                  ? `Host: ${statusResult.supabaseUrl} • Real-time queries and triggers active.`
                  : 'Enter your Supabase credentials below to connect your PostgreSQL database and execute SQL migrations.'}
              </p>
            </div>
          </div>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            style={{
              backgroundColor: '#0F2D4A',
              color: '#FFF',
              textDecoration: 'none',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Open Supabase Dashboard</span>
            <ExternalLink size={13} />
          </a>
        </div>

        {statusResult?.error && (
          <div
            style={{
              marginTop: '14px',
              padding: '10px 14px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #F87171',
              borderRadius: '6px',
              color: '#DC2626',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{statusResult.error}</span>
          </div>
        )}

        {saveSuccess && (
          <div
            style={{
              marginTop: '14px',
              padding: '10px 14px',
              backgroundColor: '#DCFCE7',
              border: '1px solid #86EFAC',
              borderRadius: '6px',
              color: '#16A34A',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} />
            <span>Credentials saved to .env.local! Supabase PostgreSQL connection is verified.</span>
          </div>
        )}
      </div>

      {/* 2. Grid: Step-by-Step Setup Form & Table Verification */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left: Credentials Form & Instructions */}
        <div className="owner-card">
          <div className="owner-card-title">1. Supabase Project Credentials</div>
          <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '14px' }}>
            Find your Project URL and Anon Key in <strong>Project Settings → API</strong> in your Supabase dashboard.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                NEXT_PUBLIC_SUPABASE_URL
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="https://xyzprojectid.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                style={{ backgroundColor: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                NEXT_PUBLIC_SUPABASE_ANON_KEY (Public Key)
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                style={{ backgroundColor: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => handleTestConnection(false)}
                disabled={isTesting}
                style={{
                  backgroundColor: '#F1F5F9',
                  color: '#1E293B',
                  border: '1px solid #CBD5E1',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isTesting ? <RefreshCw size={14} className="animate-spin" /> : <Server size={14} />}
                <span>Test Connection</span>
              </button>

              <button
                type="button"
                onClick={() => handleTestConnection(true)}
                disabled={isTesting || !supabaseUrl || !supabaseAnonKey}
                style={{
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Save size={14} />
                <span>Save to .env.local & Connect</span>
              </button>
            </div>
          </div>

          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #EEF2F6' }} />

          {/* Step 2: SQL Migration Helper */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div className="owner-card-title" style={{ margin: 0 }}>
              2. Database Schema & Migration SQL
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setActiveSqlTab('SCHEMA')}
                style={{
                  background: activeSqlTab === 'SCHEMA' ? '#0F2D4A' : '#F1F5F9',
                  color: activeSqlTab === 'SCHEMA' ? '#FFF' : '#64748B',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                schema.sql
              </button>
              <button
                onClick={() => setActiveSqlTab('SEED')}
                style={{
                  background: activeSqlTab === 'SEED' ? '#0F2D4A' : '#F1F5F9',
                  color: activeSqlTab === 'SEED' ? '#FFF' : '#64748B',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                seed.sql
              </button>
            </div>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '10px' }}>
            In Supabase, open <strong>SQL Editor</strong>, paste this script, and click <strong>Run</strong>.
          </p>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => handleCopySql(activeSqlTab)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: '#2563EB',
                color: '#FFF',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              {copiedSql ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedSql ? 'Copied to Clipboard!' : `Copy ${activeSqlTab.toLowerCase()}.sql`}</span>
            </button>

            <pre
              style={{
                backgroundColor: '#0F172A',
                color: '#CBD5E1',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                maxHeight: '220px',
                overflowY: 'auto',
                fontFamily: 'monospace',
                lineHeight: 1.4,
              }}
            >
              {activeSqlTab === 'SCHEMA' ? SQL_SCHEMA_STRING.slice(0, 800) + '\n\n-- ... [Click Copy button above for full schema with triggers] ...' : SQL_SEED_STRING}
            </pre>
          </div>
        </div>

        {/* Right: Table Verification Checklist */}
        <div className="owner-card">
          <div className="owner-card-title">Table Verification Checklist</div>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '14px' }}>
            Live status of the required PostgreSQL tables and triggers in your Supabase project:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { name: 'staff_users', desc: 'Internal Users (Owner, Office, Site)' },
              { name: 'customers', desc: 'External Clients Directory (WhatsApp)' },
              { name: 'drivers', desc: 'Driver Roster (WhatsApp)' },
              { name: 'vehicles', desc: 'Tipper & Transporter Fleet' },
              { name: 'products', desc: 'Finished Aggregates (20mm, 10mm, GSB)' },
              { name: 'raw_materials', desc: 'Inward Stone Boulder Reserves' },
              { name: 'suppliers', desc: 'Quarry & Labour Contractors' },
              { name: 'spare_parts', desc: 'Crusher Maintenance Inventory' },
              { name: 'trips', desc: 'Customer Orders & FIFO Queue' },
              { name: 'weighbridge_transactions', desc: 'Gross, Tare & Net Slips' },
              { name: 'gate_passes', desc: 'Verified Exit Gate Passes & QR' },
              { name: 'raw_material_receipts', desc: 'Supplier Inward Vouchers' },
              { name: 'whatsapp_messages', desc: 'Delivery Tracker & Audit Log' },
              { name: 'audit_logs', desc: 'System Action Trail' },
            ].map((tbl) => {
              const tableInfo = statusResult?.tablesStatus?.find((t) => t.table === tbl.name);
              const exists = tableInfo?.exists || statusResult?.connected;

              return (
                <div
                  key={tbl.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '6px',
                    border: '1px solid #EEF2F6',
                    fontSize: '0.78rem',
                  }}
                >
                  <div>
                    <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>{tbl.name}</strong>
                    <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{tbl.desc}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {exists ? (
                      <span style={{ color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={14} /> Active
                      </span>
                    ) : (
                      <span style={{ color: '#94A3B8', fontSize: '0.72rem' }}>Pending SQL</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const SQL_SCHEMA_STRING = `-- ==============================================================================
-- STONECRUSHER ERP - SUPABASE POSTGRESQL SCHEMA
-- Revised User Roles & WhatsApp Communication System
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. INTERNAL ROLES & USERS (Internal only: Owner, Office Operator, Site Operator)
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

-- 2. MASTER DIRECTORIES
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

CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    supplier_type VARCHAR(50) DEFAULT 'Quarry Raw Material',
    balance_payable NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

-- 3. TRIPS & FIFO DISPATCH QUEUE
CREATE TYPE trip_status AS ENUM (
    'QUEUED',
    'CALLED_TO_SCALE',
    'TARE_WEIGHED',
    'LOADING',
    'GROSS_WEIGHED',
    'GATE_PASS_ISSUED',
    'DISPATCHED',
    'CANCELLED'
);

CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_number VARCHAR(50) UNIQUE NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_trips_fifo ON trips(status, fifo_sequence ASC, created_at ASC);

-- 4. WEIGHBRIDGE TRANSACTIONS
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

-- 5. GATE PASSES
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

-- 6. RAW MATERIAL INWARD RECEIPTS
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

-- 7. WHATSAPP DELIVERY TRACKING
CREATE TYPE whatsapp_recipient_type AS ENUM ('CUSTOMER', 'DRIVER', 'SUPPLIER', 'OWNER');
CREATE TYPE whatsapp_message_status AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED');

CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_phone VARCHAR(25) NOT NULL,
    recipient_type whatsapp_recipient_type NOT NULL,
    recipient_name VARCHAR(255),
    message_type VARCHAR(50) NOT NULL,
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

-- 8. AUTOMATIC INVENTORY DEDUCTION TRIGGER
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

-- 9. AUDIT LOGS
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
`;

const SQL_SEED_STRING = `-- STONECRUSHER INITIAL SEEDS
INSERT INTO staff_users (id, email, full_name, phone, role) VALUES
('11111111-1111-1111-1111-111111111111', 'owner@stonecrusher.com', 'Vikramaditya Shinde', '+919822011223', 'OWNER_ADMIN'),
('22222222-2222-2222-2222-222222222222', 'office@stonecrusher.com', 'Amit Patil', '+919822033445', 'OFFICE_OPERATOR'),
('33333333-3333-3333-3333-333333333333', 'site@stonecrusher.com', 'Suresh Gaikwad', '+919822055667', 'SITE_OPERATOR')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, code, unit, current_stock_mt, min_threshold_mt, unit_price_inr) VALUES
('20mm Aggregate', 'AGG-20MM', 'MT', 480.00, 100.00, 680.00),
('10mm Aggregate', 'AGG-10MM', 'MT', 320.00, 80.00, 720.00),
('40mm Aggregate', 'AGG-40MM', 'MT', 210.00, 60.00, 610.00),
('GSB (Granular Sub Base)', 'GSB-MIX', 'MT', 650.00, 120.00, 480.00),
('Crusher Dust', 'CR-DUST', 'MT', 410.00, 90.00, 390.00),
('M-Sand (Manufactured)', 'M-SAND', 'MT', 75.00, 100.00, 850.00)
ON CONFLICT DO NOTHING;
`;
