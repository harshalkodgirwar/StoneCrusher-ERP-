'use client';

import React, { useState } from 'react';
import { useCrusherStore } from '../../lib/store/useCrusherStore';
import { crusherStore } from '../../lib/store/crusher-store';
import {
  TrendingUp,
  Scale,
  Truck,
  Layers,
  RotateCw,
  Send,
  Users,
  Search,
} from 'lucide-react';

interface OwnerAdminDashboardProps {
  onOpenWhatsAppSimulator: () => void;
  onViewGatePass: (gatePassId: string) => void;
  onViewReceipt: (receiptId: string) => void;
}

export const OwnerAdminDashboard: React.FC<OwnerAdminDashboardProps> = ({
  onOpenWhatsAppSimulator,
  onViewGatePass,
  onViewReceipt,
}) => {
  const store = useCrusherStore();

  type OwnerTab = 'OVERVIEW' | 'WHATSAPP' | 'OPERATIONS' | 'INVENTORY' | 'DIRECTORIES';
  const [activeTab, setActiveTab] = useState<OwnerTab>('OVERVIEW');

  const [waStatusFilter, setWaStatusFilter] = useState<string>('ALL');
  const [waRecipientFilter, setWaRecipientFilter] = useState<string>('ALL');
  const [waSearchQuery, setWaSearchQuery] = useState<string>('');

  const totalDispatchedTrips = store.trips.filter((t) => t.status === 'DISPATCHED');
  const totalMtDispatched = totalDispatchedTrips.reduce(
    (acc, t) => acc + (t.netWeightMt || t.orderedQtyMt),
    0
  );
  const totalRevenue = totalDispatchedTrips.reduce((acc, t) => {
    const prod = store.products.find((p) => p.id === t.productId);
    return acc + (t.netWeightMt || t.orderedQtyMt) * (prod?.unitPriceInr || 680);
  }, 0);

  const totalRawBrass = store.rawMaterialReceipts.reduce(
    (acc, r) => acc + r.quantityBrass,
    0
  );

  const failedMessages = store.whatsappMessages.filter((m) => m.status === 'FAILED');
  const lowStockProducts = store.products.filter((p) => p.currentStockMt <= p.minThresholdMt);

  const filteredMessages = store.whatsappMessages.filter((m) => {
    if (waStatusFilter !== 'ALL' && m.status !== waStatusFilter) return false;
    if (waRecipientFilter !== 'ALL' && m.recipientType !== waRecipientFilter) return false;
    if (waSearchQuery) {
      const q = waSearchQuery.toLowerCase();
      return (
        m.recipientPhone.toLowerCase().includes(q) ||
        m.recipientName.toLowerCase().includes(q) ||
        m.templateName.toLowerCase().includes(q) ||
        m.body.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid #1F2937',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Owner & Admin Overview</h2>
          <p style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
            Operations performance, inventory balances, and WhatsApp dispatch tracking.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={activeTab === 'OVERVIEW' ? 'btn-primary' : 'btn-secondary'}
          >
            <TrendingUp size={14} /> Overview
          </button>
          <button
            onClick={() => setActiveTab('WHATSAPP')}
            className={activeTab === 'WHATSAPP' ? 'btn-primary' : 'btn-secondary'}
          >
            <Send size={14} /> WhatsApp Hub
            {failedMessages.length > 0 && (
              <span style={{ color: '#F87171', fontWeight: 700, marginLeft: '4px' }}>
                ({failedMessages.length})
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('OPERATIONS')}
            className={activeTab === 'OPERATIONS' ? 'btn-primary' : 'btn-secondary'}
          >
            <Scale size={14} /> Weighbridge & Passes
          </button>
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={activeTab === 'INVENTORY' ? 'btn-primary' : 'btn-secondary'}
          >
            <Layers size={14} /> Inventory
          </button>
          <button
            onClick={() => setActiveTab('DIRECTORIES')}
            className={activeTab === 'DIRECTORIES' ? 'btn-primary' : 'btn-secondary'}
          >
            <Users size={14} /> Fleet & Customers
          </button>
        </div>
      </div>

      {/* Subtle Alerts Strip */}
      {(lowStockProducts.length > 0 || failedMessages.length > 0) && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {lowStockProducts.length > 0 && (
            <div
              style={{
                flex: 1,
                backgroundColor: '#1C1518',
                border: '1px solid #7F1D1D',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '0.78rem',
                color: '#FCA5A5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>
                <strong>Low Stock:</strong>{' '}
                {lowStockProducts.map((p) => `${p.name} (${p.currentStockMt} MT)`).join(', ')}
              </span>
              <button
                onClick={() => setActiveTab('INVENTORY')}
                style={{ background: 'transparent', border: 'none', color: '#FCA5A5', textDecoration: 'underline', cursor: 'pointer' }}
              >
                View
              </button>
            </div>
          )}

          {failedMessages.length > 0 && (
            <div
              style={{
                flex: 1,
                backgroundColor: '#1C1914',
                border: '1px solid #78350F',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '0.78rem',
                color: '#FDE68A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>
                <strong>{failedMessages.length} WhatsApp message(s) failed delivery.</strong> (ERP data safe)
              </span>
              <button
                onClick={() => setActiveTab('WHATSAPP')}
                style={{ background: 'transparent', border: 'none', color: '#FDE68A', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Simple Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div className="crusher-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Dispatched Volume</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px' }}>
                {totalMtDispatched.toFixed(1)} <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>MT</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px' }}>
                {totalDispatchedTrips.length} gate passes issued
              </div>
            </div>

            <div className="crusher-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Total Sales (Est.)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px', color: '#10B981' }}>
                ₹{totalRevenue.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px' }}>
                Ex-plant dispatched value
              </div>
            </div>

            <div className="crusher-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Raw Boulder Inward</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px' }}>
                {totalRawBrass} <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>Brass</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px' }}>
                {store.rawMaterialReceipts.length} vouchers recorded
              </div>
            </div>

            <div className="crusher-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>WhatsApp Delivered</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px' }}>
                {store.whatsappMessages.filter((m) => m.status === 'SENT' || m.status === 'DELIVERED' || m.status === 'READ').length}
                <span style={{ fontSize: '0.9rem', color: '#9CA3AF' }}> / {store.whatsappMessages.length}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px' }}>
                Automated customer & driver msgs
              </div>
            </div>
          </div>

          {/* 2 Column: Recent Operations & Stock Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="crusher-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px' }}>
                Active & Queued Trips
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {store.trips.slice(0, 5).map((t) => {
                  const cust = store.customers.find((c) => c.id === t.customerId);
                  const prod = store.products.find((p) => p.id === t.productId);
                  return (
                    <div
                      key={t.id}
                      style={{
                        padding: '8px 10px',
                        backgroundColor: '#0D1424',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.78rem',
                      }}
                    >
                      <div>
                        <strong>{t.tripNumber}</strong> • {cust?.companyName}
                        <div style={{ color: '#9CA3AF', fontSize: '0.72rem' }}>
                          {prod?.name} ({t.orderedQtyMt} MT)
                        </div>
                      </div>
                      <span className="badge badge-slate">{t.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="crusher-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px' }}>
                Current Aggregate Inventory
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {store.products.map((p) => {
                  const isLow = p.currentStockMt <= p.minThresholdMt;
                  return (
                    <div
                      key={p.id}
                      style={{
                        padding: '8px 10px',
                        backgroundColor: '#0D1424',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.78rem',
                      }}
                    >
                      <div>
                        <strong>{p.name}</strong>
                        <span style={{ color: '#9CA3AF', marginLeft: '6px' }}>({p.code})</span>
                      </div>
                      <div>
                        <strong style={{ color: isLow ? '#F87171' : '#F3F4F6' }}>
                          {p.currentStockMt.toFixed(1)} MT
                        </strong>
                        {isLow && <span className="badge badge-crimson" style={{ marginLeft: '6px' }}>Low</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WHATSAPP DELIVERY HUB */}
      {activeTab === 'WHATSAPP' && (
        <div className="crusher-card" style={{ padding: '18px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>WhatsApp Delivery Tracking</h3>
              <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                Audit trail of outgoing messages to Customers, Drivers, and Suppliers.
              </p>
            </div>

            <button onClick={onOpenWhatsAppSimulator} className="btn-primary" style={{ fontSize: '0.78rem' }}>
              Open Phone Simulator
            </button>
          </div>

          {/* Clean Filter Row */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '12px',
              flexWrap: 'wrap',
              fontSize: '0.78rem',
            }}
          >
            <input
              type="text"
              placeholder="Search recipient, phone or text..."
              className="input-field"
              value={waSearchQuery}
              onChange={(e) => setWaSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: '200px', padding: '6px 10px' }}
            />

            <select
              className="input-field"
              value={waRecipientFilter}
              onChange={(e) => setWaRecipientFilter(e.target.value)}
              style={{ width: '130px', padding: '6px 10px' }}
            >
              <option value="ALL">All Roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="DRIVER">Driver</option>
              <option value="SUPPLIER">Supplier</option>
              <option value="OWNER">Owner</option>
            </select>

            <select
              className="input-field"
              value={waStatusFilter}
              onChange={(e) => setWaStatusFilter(e.target.value)}
              style={{ width: '130px', padding: '6px 10px' }}
            >
              <option value="ALL">All Status</option>
              <option value="SENT">Sent</option>
              <option value="DELIVERED">Delivered</option>
              <option value="READ">Read</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#9CA3AF', borderBottom: '1px solid #1F2937' }}>
                <th style={{ padding: '8px' }}>Time</th>
                <th style={{ padding: '8px' }}>Recipient</th>
                <th style={{ padding: '8px' }}>Role</th>
                <th style={{ padding: '8px' }}>Template</th>
                <th style={{ padding: '8px' }}>Status</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '16px', color: '#6B7280' }}>
                    No messages match criteria.
                  </td>
                </tr>
              ) : (
                filteredMessages.map((m) => {
                  const isFailed = m.status === 'FAILED';
                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid #1F2937' }}>
                      <td style={{ padding: '8px', color: '#9CA3AF' }}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '8px' }}>
                        <strong>{m.recipientName}</strong>
                        <div style={{ color: '#6B7280', fontSize: '0.7rem' }}>{m.recipientPhone}</div>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <span className="badge badge-slate">{m.recipientType}</span>
                      </td>
                      <td style={{ padding: '8px', fontFamily: 'monospace', color: '#9CA3AF' }}>
                        {m.templateName}
                      </td>
                      <td style={{ padding: '8px' }}>
                        {isFailed ? (
                          <span className="badge badge-crimson">Failed</span>
                        ) : m.status === 'READ' ? (
                          <span className="badge badge-emerald">Read</span>
                        ) : m.status === 'DELIVERED' ? (
                          <span className="badge badge-emerald">Delivered</span>
                        ) : (
                          <span className="badge badge-blue">{m.status}</span>
                        )}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>
                        {isFailed && (
                          <button
                            onClick={() => crusherStore.retryWhatsAppMessage(m.id)}
                            className="btn-primary"
                            style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                          >
                            <RotateCw size={11} /> Retry
                          </button>
                        )}
                        {!isFailed && m.documentFileName && (
                          <button
                            onClick={() => {
                              if (m.relatedEntity === 'GATE_PASS') onViewGatePass(m.relatedEntityId);
                              if (m.relatedEntity === 'RAW_RECEIPT') onViewReceipt(m.relatedEntityId);
                            }}
                            className="btn-secondary"
                            style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                          >
                            PDF
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: WEIGHBRIDGE & GATE PASSES */}
      {activeTab === 'OPERATIONS' && (
        <div className="crusher-card" style={{ padding: '18px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>
            Issued Gate Passes & Weighbridge Slips
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#9CA3AF', borderBottom: '1px solid #1F2937' }}>
                <th style={{ padding: '8px' }}>Pass No</th>
                <th style={{ padding: '8px' }}>Customer</th>
                <th style={{ padding: '8px' }}>Vehicle</th>
                <th style={{ padding: '8px' }}>Material</th>
                <th style={{ padding: '8px' }}>Net Weight</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Slip</th>
              </tr>
            </thead>
            <tbody>
              {store.gatePasses.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '16px', color: '#6B7280' }}>
                    No gate passes issued yet.
                  </td>
                </tr>
              ) : (
                store.gatePasses.map((gp) => (
                  <tr key={gp.id} style={{ borderBottom: '1px solid #1F2937' }}>
                    <td style={{ padding: '8px', fontWeight: 600, color: '#60A5FA' }}>{gp.gatePassNumber}</td>
                    <td style={{ padding: '8px' }}>{gp.customerName}</td>
                    <td style={{ padding: '8px' }}>{gp.vehiclePlate}</td>
                    <td style={{ padding: '8px' }}>{gp.productName}</td>
                    <td style={{ padding: '8px', fontWeight: 700 }}>{gp.netWeightMt} MT</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>
                      <button
                        onClick={() => onViewGatePass(gp.id)}
                        className="btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                      >
                        Print Slip
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: INVENTORY */}
      {activeTab === 'INVENTORY' && (
        <div className="crusher-card" style={{ padding: '18px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>
            Quarry Products & Raw Stone Stocks
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#9CA3AF', borderBottom: '1px solid #1F2937' }}>
                <th style={{ padding: '8px' }}>Code</th>
                <th style={{ padding: '8px' }}>Name</th>
                <th style={{ padding: '8px' }}>Stock</th>
                <th style={{ padding: '8px' }}>Threshold</th>
                <th style={{ padding: '8px' }}>Price/MT</th>
                <th style={{ padding: '8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {store.products.map((p) => {
                const isLow = p.currentStockMt <= p.minThresholdMt;
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #1F2937' }}>
                    <td style={{ padding: '8px', color: '#9CA3AF' }}>{p.code}</td>
                    <td style={{ padding: '8px', fontWeight: 500 }}>{p.name}</td>
                    <td style={{ padding: '8px', fontWeight: 600 }}>{p.currentStockMt.toFixed(1)} MT</td>
                    <td style={{ padding: '8px', color: '#9CA3AF' }}>{p.minThresholdMt} MT</td>
                    <td style={{ padding: '8px' }}>₹{p.unitPriceInr}</td>
                    <td style={{ padding: '8px' }}>
                      {isLow ? <span className="badge badge-crimson">Low</span> : <span className="badge badge-emerald">OK</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: DIRECTORIES */}
      {activeTab === 'DIRECTORIES' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="crusher-card" style={{ padding: '16px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px' }}>Customers</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {store.customers.map((c) => (
                <div key={c.id} style={{ padding: '8px', background: '#0D1424', borderRadius: '4px', fontSize: '0.78rem' }}>
                  <strong>{c.companyName}</strong> ({c.name})
                  <div style={{ color: '#9CA3AF', fontSize: '0.72rem' }}>WhatsApp: {c.phone}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="crusher-card" style={{ padding: '16px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px' }}>Fleet Vehicles</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {store.vehicles.map((v) => (
                <div key={v.id} style={{ padding: '8px', background: '#0D1424', borderRadius: '4px', fontSize: '0.78rem' }}>
                  <strong>{v.plateNumber}</strong> - {v.vehicleType}
                  <div style={{ color: '#9CA3AF', fontSize: '0.72rem' }}>Default Tare: {v.defaultTareWeightMt} MT</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
