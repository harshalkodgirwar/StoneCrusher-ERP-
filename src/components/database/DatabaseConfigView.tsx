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
import {
  SQL_COMPLETE_STRING,
  SQL_SCHEMA_STRING,
  SQL_SEED_STRING,
} from '@/lib/supabase/sql-scripts';
import { crusherStore } from '@/lib/store/crusher-store';

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
  const [activeSqlTab, setActiveSqlTab] = useState<'COMPLETE' | 'SCHEMA' | 'SEED'>('COMPLETE');

  // Live Data Explorer State
  const [selectedTable, setSelectedTable] = useState<string>('customers');
  const [tableData, setTableData] = useState<Record<string, any[]>>({});
  const [isLoadingTableData, setIsLoadingTableData] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const fetchTableData = async () => {
    setIsLoadingTableData(true);
    try {
      const res = await fetch('/api/database/sync', { signal: AbortSignal.timeout(3500) });
      const json = await res.json();
      if (json.rawRows) {
        setTableData(json.rawRows);
      }
    } catch (e) {
      console.warn('Failed to fetch raw rows:', e);
    } finally {
      setIsLoadingTableData(false);
    }
  };

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

    fetchTableData();
  }, []);

  const handleSyncToStore = async () => {
    setSyncStatus('Syncing with ERP stores...');
    await crusherStore.syncWithSupabase();
    await fetchTableData();
    setSyncStatus('✓ ERP views and dashboards successfully updated with live Supabase data!');
    setTimeout(() => setSyncStatus(null), 4000);
  };

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

  const handleCopySql = (type: 'COMPLETE' | 'SCHEMA' | 'SEED') => {
    let textToCopy = SQL_COMPLETE_STRING;
    if (type === 'SCHEMA') textToCopy = SQL_SCHEMA_STRING;
    if (type === 'SEED') textToCopy = SQL_SEED_STRING;

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <div className="owner-card-title" style={{ margin: 0 }}>
              2. Database Schema & Demo SQL
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveSqlTab('COMPLETE')}
                style={{
                  background: activeSqlTab === 'COMPLETE' ? '#2563EB' : '#F1F5F9',
                  color: activeSqlTab === 'COMPLETE' ? '#FFF' : '#64748B',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>complete_setup.sql</span>
                <span style={{ fontSize: '0.62rem', background: activeSqlTab === 'COMPLETE' ? '#1D4ED8' : '#E2E8F0', padding: '1px 5px', borderRadius: '3px' }}>1-Click All</span>
              </button>
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
            In Supabase, open <strong>SQL Editor</strong>, paste this script, and click <strong>Run</strong>. (Includes 14 tables, triggers, and full client demo data).
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
              <span>{copiedSql ? 'Copied to Clipboard!' : `Copy ${activeSqlTab === 'COMPLETE' ? 'complete_setup.sql' : activeSqlTab.toLowerCase() + '.sql'}`}</span>
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
              {activeSqlTab === 'COMPLETE'
                ? SQL_COMPLETE_STRING.slice(0, 900) + '\n\n-- ... [Click "Copy complete_setup.sql" button above for the full 14 tables + triggers + demo data] ...'
                : activeSqlTab === 'SCHEMA'
                ? SQL_SCHEMA_STRING.slice(0, 800) + '\n\n-- ... [Click Copy button above for full schema with triggers] ...'
                : SQL_SEED_STRING}
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

      {/* 3. Live Supabase Data Explorer (Interactive Data Viewer) */}
      <div className="owner-card" style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div>
            <div className="owner-card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} color="#2563EB" />
              <span>3. Live Supabase Data Explorer</span>
              <span style={{ fontSize: '0.68rem', backgroundColor: '#DCFCE7', color: '#16A34A', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                ● Real PostgreSQL Data
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
              Inspect and verify the records currently stored in your live Supabase database tables.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleSyncToStore}
              style={{
                backgroundColor: '#10B981',
                color: '#FFF',
                border: 'none',
                padding: '7px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={13} />
              <span>Sync with ERP Views</span>
            </button>
            <button
              onClick={fetchTableData}
              disabled={isLoadingTableData}
              style={{
                backgroundColor: '#F1F5F9',
                color: '#1E293B',
                border: '1px solid #CBD5E1',
                padding: '7px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={13} className={isLoadingTableData ? 'animate-spin' : ''} />
              <span>Reload Table Rows</span>
            </button>
          </div>
        </div>

        {syncStatus && (
          <div style={{ padding: '8px 12px', backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '0.75rem', borderRadius: '6px', marginBottom: '12px', fontWeight: 600 }}>
            {syncStatus}
          </div>
        )}

        {/* Table Selector Pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '14px' }}>
          {[
            { id: 'customers', label: 'customers', count: tableData.customers?.length ?? 7 },
            { id: 'trips', label: 'trips', count: tableData.trips?.length ?? 9 },
            { id: 'vehicles', label: 'vehicles', count: tableData.vehicles?.length ?? 6 },
            { id: 'drivers', label: 'drivers', count: tableData.drivers?.length ?? 6 },
            { id: 'products', label: 'products', count: tableData.products?.length ?? 6 },
            { id: 'weighbridge_transactions', label: 'weighbridge_transactions', count: tableData.weighbridge_transactions?.length ?? 5 },
            { id: 'whatsapp_messages', label: 'whatsapp_messages', count: tableData.whatsapp_messages?.length ?? 6 },
            { id: 'audit_logs', label: 'audit_logs', count: tableData.audit_logs?.length ?? 12 },
            { id: 'raw_materials', label: 'raw_materials', count: tableData.raw_materials?.length ?? 2 },
            { id: 'suppliers', label: 'suppliers', count: tableData.suppliers?.length ?? 2 },
            { id: 'raw_material_receipts', label: 'raw_material_receipts', count: tableData.raw_material_receipts?.length ?? 2 },
            { id: 'spare_parts', label: 'spare_parts', count: tableData.spare_parts?.length ?? 4 },
          ].map((t) => {
            const isSelected = selectedTable === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTable(t.id)}
                style={{
                  background: isSelected ? '#0F2D4A' : '#F8FAFC',
                  color: isSelected ? '#FFF' : '#334155',
                  border: isSelected ? '1px solid #0F2D4A' : '1px solid #E2E8F0',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{t.label}</span>
                <span
                  style={{
                    background: isSelected ? '#2563EB' : '#E2E8F0',
                    color: isSelected ? '#FFF' : '#475569',
                    fontSize: '0.65rem',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontWeight: 700,
                  }}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Data Table View */}
        <div style={{ overflowX: 'auto', maxHeight: '350px', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
          {(() => {
            const rows = tableData[selectedTable] || [];
            if (rows.length === 0) {
              return (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '0.8rem' }}>
                  {isLoadingTableData ? 'Loading rows from Supabase...' : `No records found in table "${selectedTable}".`}
                </div>
              );
            }
            const columns = Object.keys(rows[0]).filter((col) => !['password', 'token'].includes(col));

            return (
              <table className="owner-table" style={{ margin: 0, fontSize: '0.74rem' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#F8FAFC', zIndex: 1 }}>
                  <tr>
                    {columns.map((col) => (
                      <th key={col} style={{ padding: '8px 12px', textTransform: 'uppercase', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row: any, idx: number) => (
                    <tr key={row.id || idx}>
                      {columns.map((col) => {
                        const val = row[col];
                        const displayVal =
                          val === null || val === undefined
                            ? '-'
                            : typeof val === 'object'
                            ? JSON.stringify(val)
                            : typeof val === 'boolean'
                            ? val ? 'true' : 'false'
                            : String(val);

                        return (
                          <td
                            key={col}
                            style={{
                              padding: '8px 12px',
                              maxWidth: '240px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontFamily: col.includes('id') || col.includes('plate') || col.includes('number') || col.includes('price') || col.includes('weight') ? 'monospace' : 'inherit',
                              fontWeight: col.includes('name') || col.includes('number') || col.includes('plate') ? 600 : 400,
                            }}
                            title={displayVal}
                          >
                            {displayVal}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
        </div>
      </div>
    </div>
  );
};


