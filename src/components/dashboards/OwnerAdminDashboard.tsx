'use client';

import React, { useState } from 'react';
import { useCrusherStore } from '../../lib/store/useCrusherStore';
import { crusherStore } from '../../lib/store/crusher-store';
import { WhatsAppMessageStatus, WhatsAppRecipientType } from '../../lib/notifications/types';
import {
  TrendingUp,
  Scale,
  Truck,
  Layers,
  AlertTriangle,
  RotateCw,
  Send,
  Users,
  CheckCircle2,
  Clock,
  Briefcase,
  DollarSign,
  Package,
  Wrench,
  FileCheck,
  Shield,
  Search,
  Filter,
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

  type OwnerTab =
    | 'OVERVIEW'
    | 'WHATSAPP_CENTER'
    | 'OPERATIONS'
    | 'INVENTORY'
    | 'CUSTOMERS_FLEET'
    | 'FINANCES'
    | 'AUDIT_LOGS';

  const [activeTab, setActiveTab] = useState<OwnerTab>('OVERVIEW');

  // WhatsApp Filter State
  const [waStatusFilter, setWaStatusFilter] = useState<string>('ALL');
  const [waRecipientFilter, setWaRecipientFilter] = useState<string>('ALL');
  const [waSearchQuery, setWaSearchQuery] = useState<string>('');

  // Operations Metrics Calculations
  const totalTripsDispatched = store.trips.filter((t) => t.status === 'DISPATCHED').length;
  const totalMtDispatched = store.trips
    .filter((t) => t.status === 'DISPATCHED')
    .reduce((acc, t) => acc + (t.netWeightMt || t.orderedQtyMt), 0);

  const totalRawBrassReceived = store.rawMaterialReceipts.reduce(
    (acc, r) => acc + r.quantityBrass,
    0
  );

  const totalRevenueEst = store.trips
    .filter((t) => t.status === 'DISPATCHED')
    .reduce((acc, t) => {
      const prod = store.products.find((p) => p.id === t.productId);
      const rate = prod?.unitPriceInr || 680;
      return acc + (t.netWeightMt || t.orderedQtyMt) * rate;
    }, 0);

  const lowStockProducts = store.products.filter(
    (p) => p.currentStockMt <= p.minThresholdMt
  );

  const failedMessages = store.whatsappMessages.filter((m) => m.status === 'FAILED');

  // Filtered WhatsApp Messages
  const filteredWhatsAppMessages = store.whatsappMessages.filter((m) => {
    if (waStatusFilter !== 'ALL' && m.status !== waStatusFilter) return false;
    if (waRecipientFilter !== 'ALL' && m.recipientType !== waRecipientFilter) return false;
    if (waSearchQuery) {
      const q = waSearchQuery.toLowerCase();
      return (
        m.recipientPhone.toLowerCase().includes(q) ||
        m.recipientName.toLowerCase().includes(q) ||
        m.templateName.toLowerCase().includes(q) ||
        m.body.toLowerCase().includes(q) ||
        (m.relatedEntityId && m.relatedEntityId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Welcome & Summary Header */}
      <div
        className="crusher-card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          borderLeft: '4px solid #F59E0B',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Owner & Executive Command Center</h2>
            <span className="badge badge-amber">Full ERP Governance</span>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '4px' }}>
            Executive oversight of quarry production, automated weighbridge operations, fleet logistics,
            and external WhatsApp communication health.
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={activeTab === 'OVERVIEW' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '7px 14px', fontSize: '0.8rem' }}
          >
            <TrendingUp size={14} /> Overview & KPIs
          </button>
          <button
            onClick={() => setActiveTab('WHATSAPP_CENTER')}
            className={activeTab === 'WHATSAPP_CENTER' ? 'btn-primary' : 'btn-secondary'}
            style={{
              padding: '7px 14px',
              fontSize: '0.8rem',
              position: 'relative',
              borderColor: failedMessages.length > 0 ? '#EF4444' : undefined,
            }}
          >
            <Send size={14} /> WhatsApp Delivery Hub
            {failedMessages.length > 0 && (
              <span
                style={{
                  backgroundColor: '#EF4444',
                  color: '#FFF',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  marginLeft: '4px',
                }}
              >
                {failedMessages.length} Fail
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('OPERATIONS')}
            className={activeTab === 'OPERATIONS' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '7px 14px', fontSize: '0.8rem' }}
          >
            <Scale size={14} /> Weighbridge & Trips
          </button>
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={activeTab === 'INVENTORY' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '7px 14px', fontSize: '0.8rem' }}
          >
            <Layers size={14} /> Quarry Inventory
          </button>
          <button
            onClick={() => setActiveTab('CUSTOMERS_FLEET')}
            className={activeTab === 'CUSTOMERS_FLEET' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '7px 14px', fontSize: '0.8rem' }}
          >
            <Users size={14} /> Customers & Fleet
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={activeTab === 'AUDIT_LOGS' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '7px 14px', fontSize: '0.8rem' }}
          >
            <Shield size={14} /> Audit Trail
          </button>
        </div>
      </div>

      {/* Critical Alerts Strip (if any low inventory or failed WhatsApp delivery) */}
      {(lowStockProducts.length > 0 || failedMessages.length > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {lowStockProducts.length > 0 && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #EF4444',
                borderRadius: '8px',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={18} color="#EF4444" />
                <span style={{ fontSize: '0.85rem', color: '#FCA5A5' }}>
                  <strong>Critical Inventory Alert:</strong>{' '}
                  {lowStockProducts.map((p) => `${p.name} (${p.currentStockMt} MT < ${p.minThresholdMt} MT min)`).join(', ')}
                </span>
              </div>
              <button
                onClick={() => setActiveTab('INVENTORY')}
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.72rem', borderColor: '#EF4444', color: '#FFF' }}
              >
                Inspect Stock →
              </button>
            </div>
          )}

          {failedMessages.length > 0 && (
            <div
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid #F59E0B',
                borderRadius: '8px',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Send size={18} color="#F59E0B" />
                <span style={{ fontSize: '0.85rem', color: '#FDE68A' }}>
                  <strong>WhatsApp Delivery Warning:</strong> {failedMessages.length} notification(s) failed delivery. (ERP transactions remain fully intact).
                </span>
              </div>
              <button
                onClick={() => setActiveTab('WHATSAPP_CENTER')}
                className="btn-primary"
                style={{ padding: '4px 12px', fontSize: '0.72rem' }}
              >
                Review & Retry Failed →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: EXECUTIVE OVERVIEW & KPIS */}
      {/* ========================================================================= */}
      {activeTab === 'OVERVIEW' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Key Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {/* Metric 1 */}
            <div className="crusher-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>
                  TOTAL AGGREGATE DISPATCHED
                </span>
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '6px', borderRadius: '6px' }}>
                  <Truck size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34D399', marginTop: '10px' }}>
                {totalMtDispatched.toFixed(1)} <span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>MT</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                Across {totalTripsDispatched} completed vehicle gate passes today
              </div>
            </div>

            {/* Metric 2 */}
            <div className="crusher-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>
                  ESTIMATED SALES VALUE
                </span>
                <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', padding: '6px', borderRadius: '6px' }}>
                  <DollarSign size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FBBF24', marginTop: '10px' }}>
                ₹{totalRevenueEst.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                Based on verified weighbridge net weights
              </div>
            </div>

            {/* Metric 3 */}
            <div className="crusher-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>
                  RAW BOULDER INWARD
                </span>
                <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', padding: '6px', borderRadius: '6px' }}>
                  <Package size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60A5FA', marginTop: '10px' }}>
                {totalRawBrassReceived} <span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>Brass</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                {store.rawMaterialReceipts.length} supplier inward receipts logged
              </div>
            </div>

            {/* Metric 4 */}
            <div className="crusher-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>
                  WHATSAPP DISPATCH HEALTH
                </span>
                <div style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#25D366', padding: '6px', borderRadius: '6px' }}>
                  <Send size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#25D366', marginTop: '10px' }}>
                {store.whatsappMessages.filter((m) => m.status === 'SENT' || m.status === 'DELIVERED' || m.status === 'READ').length}
                <span style={{ fontSize: '1rem', color: '#94A3B8' }}> / {store.whatsappMessages.length}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                Customer, Driver, and Supplier notifications
              </div>
            </div>
          </div>

          {/* Quick Operations Overview Split */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            {/* Live FIFO Dispatch Queue & Trips */}
            <div className="crusher-card" style={{ padding: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  paddingBottom: '10px',
                  borderBottom: '1px solid #1E293B',
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Live Operations & Trip Status</h3>
                <span className="badge badge-amber">{store.trips.length} Total Trips</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {store.trips.slice(0, 5).map((trip) => {
                  const cust = store.customers.find((c) => c.id === trip.customerId);
                  const prod = store.products.find((p) => p.id === trip.productId);
                  const veh = store.vehicles.find((v) => v.id === trip.vehicleId);

                  return (
                    <div
                      key={trip.id}
                      style={{
                        backgroundColor: '#0F1626',
                        border: '1px solid #1E2A44',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ color: '#FFF' }}>{trip.tripNumber}</strong>
                          <span className="badge badge-slate" style={{ fontSize: '0.62rem' }}>
                            {trip.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>
                          {cust?.companyName} • {prod?.name} ({trip.orderedQtyMt} MT)
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748B' }}>
                        <div>{veh?.plateNumber}</div>
                        <div>{trip.destination}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inventory Stock Snapshot */}
            <div className="crusher-card" style={{ padding: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  paddingBottom: '10px',
                  borderBottom: '1px solid #1E293B',
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Aggregate Stock Health</h3>
                <button
                  onClick={() => setActiveTab('INVENTORY')}
                  className="btn-secondary"
                  style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                >
                  Manage Stock
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {store.products.slice(0, 5).map((p) => {
                  const isLow = p.currentStockMt <= p.minThresholdMt;
                  return (
                    <div
                      key={p.id}
                      style={{
                        backgroundColor: '#0F1626',
                        border: isLow ? '1px solid #EF4444' : '1px solid #1E2A44',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#FFF', fontSize: '0.85rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Min Safety: {p.minThresholdMt} MT</div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: isLow ? '#EF4444' : '#10B981', fontSize: '1.05rem' }}>
                          {p.currentStockMt.toFixed(1)} MT
                        </div>
                        {isLow && <span className="badge badge-crimson" style={{ fontSize: '0.6rem' }}>Low</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WHATSAPP NOTIFICATION DELIVERY CENTER (CRITICAL AUDIT HUB) */}
      {/* ========================================================================= */}
      {activeTab === 'WHATSAPP_CENTER' && (
        <div className="crusher-card" style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={20} color="#25D366" /> WhatsApp Notification Delivery Center
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>
                Audit log of all automated customer orders, driver trip assignments, gate pass documents,
                and supplier receipts sent via WhatsApp.
              </p>
            </div>

            <button onClick={onOpenWhatsAppSimulator} className="btn-success" style={{ fontSize: '0.8rem' }}>
              Launch Virtual Phone Simulator
            </button>
          </div>

          {/* Filter Bar */}
          <div
            style={{
              backgroundColor: '#0F1626',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid #1F2D4A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '16px',
            }}
          >
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '240px', flex: 1 }}>
              <Search size={16} color="#64748B" />
              <input
                type="text"
                className="input-field"
                placeholder="Search phone, recipient, or template..."
                value={waSearchQuery}
                onChange={(e) => setWaSearchQuery(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              />
            </div>

            {/* Recipient Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Recipient:</span>
              <select
                className="input-field"
                value={waRecipientFilter}
                onChange={(e) => setWaRecipientFilter(e.target.value)}
                style={{ width: '130px', padding: '6px 10px', fontSize: '0.78rem' }}
              >
                <option value="ALL">All Recipients</option>
                <option value="CUSTOMER">Customer</option>
                <option value="DRIVER">Driver</option>
                <option value="SUPPLIER">Supplier</option>
                <option value="OWNER">Owner</option>
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Status:</span>
              <select
                className="input-field"
                value={waStatusFilter}
                onChange={(e) => setWaStatusFilter(e.target.value)}
                style={{ width: '130px', padding: '6px 10px', fontSize: '0.78rem' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="SENT">SENT</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="READ">READ</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
          </div>

          {/* WhatsApp Message Audit Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#0F1626', color: '#94A3B8', textAlign: 'left', borderBottom: '1px solid #1E293B' }}>
                  <th style={{ padding: '10px 12px' }}>Time</th>
                  <th style={{ padding: '10px 12px' }}>Recipient</th>
                  <th style={{ padding: '10px 12px' }}>Type</th>
                  <th style={{ padding: '10px 12px' }}>Template</th>
                  <th style={{ padding: '10px 12px' }}>Attachment</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWhatsAppMessages.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>
                      No WhatsApp notifications matched your query.
                    </td>
                  </tr>
                ) : (
                  filteredWhatsAppMessages.map((msg) => {
                    const isFailed = msg.status === 'FAILED';

                    return (
                      <tr
                        key={msg.id}
                        style={{
                          borderBottom: '1px solid #141E33',
                          background: isFailed ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '12px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 600, color: '#FFF' }}>{msg.recipientName}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{msg.recipientPhone}</div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span
                            className={
                              msg.recipientType === 'CUSTOMER'
                                ? 'badge badge-amber'
                                : msg.recipientType === 'DRIVER'
                                ? 'badge badge-emerald'
                                : msg.recipientType === 'SUPPLIER'
                                ? 'badge badge-blue'
                                : 'badge badge-slate'
                            }
                            style={{ fontSize: '0.62rem' }}
                          >
                            {msg.recipientType}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontFamily: 'monospace', color: '#CBD5E1' }}>
                          {msg.templateName}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {msg.messageType === 'DOCUMENT' ? (
                            <span style={{ color: '#38BDF8', fontWeight: 600, fontSize: '0.75rem' }}>
                              📎 {msg.documentFileName || 'Document.pdf'}
                            </span>
                          ) : (
                            <span style={{ color: '#64748B' }}>Text Msg</span>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {msg.status === 'FAILED' ? (
                            <div>
                              <span className="badge badge-crimson" style={{ fontSize: '0.62rem' }}>
                                FAILED
                              </span>
                              <div style={{ fontSize: '0.65rem', color: '#F87171', marginTop: '2px', maxWidth: '160px' }}>
                                {msg.failureReason || 'Error'}
                              </div>
                            </div>
                          ) : msg.status === 'READ' ? (
                            <span className="badge badge-emerald" style={{ fontSize: '0.62rem' }}>
                              READ (BLUE TICKS)
                            </span>
                          ) : msg.status === 'DELIVERED' ? (
                            <span className="badge badge-emerald" style={{ fontSize: '0.62rem' }}>
                              DELIVERED
                            </span>
                          ) : msg.status === 'SENT' ? (
                            <span className="badge badge-blue" style={{ fontSize: '0.62rem' }}>
                              SENT
                            </span>
                          ) : (
                            <span className="badge badge-slate" style={{ fontSize: '0.62rem' }}>
                              PENDING
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {isFailed && (
                            <button
                              onClick={() => crusherStore.retryWhatsAppMessage(msg.id)}
                              className="btn-primary"
                              style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                            >
                              <RotateCw size={12} /> Retry
                            </button>
                          )}
                          {!isFailed && msg.documentFileName && (
                            <button
                              onClick={() => {
                                if (msg.relatedEntity === 'GATE_PASS') {
                                  onViewGatePass(msg.relatedEntityId);
                                } else if (msg.relatedEntity === 'RAW_RECEIPT') {
                                  onViewReceipt(msg.relatedEntityId);
                                }
                              }}
                              className="btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                            >
                              View PDF
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WEIGHBRIDGE TRANSACTIONS & GATE PASSES */}
      {/* ========================================================================= */}
      {activeTab === 'OPERATIONS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Gate Passes Log */}
          <div className="crusher-card" style={{ padding: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #1E293B',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck size={18} color="#10B981" /> Official Dispatched Gate Passes
              </h3>
              <span className="badge badge-emerald">{store.gatePasses.length} Passes</span>
            </div>

            {store.gatePasses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>
                No gate passes issued yet today.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: '#0F1626', color: '#94A3B8', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px' }}>Pass No</th>
                      <th style={{ padding: '8px 12px' }}>Customer</th>
                      <th style={{ padding: '8px 12px' }}>Vehicle</th>
                      <th style={{ padding: '8px 12px' }}>Material</th>
                      <th style={{ padding: '8px 12px' }}>Net Weight</th>
                      <th style={{ padding: '8px 12px' }}>Destination</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Slip Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.gatePasses.map((gp) => (
                      <tr key={gp.id} style={{ borderBottom: '1px solid #141E33' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#38BDF8' }}>
                          {gp.gatePassNumber}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#FFF' }}>{gp.customerName}</td>
                        <td style={{ padding: '12px' }}>{gp.vehiclePlate}</td>
                        <td style={{ padding: '12px' }}>{gp.productName}</td>
                        <td style={{ padding: '12px', fontWeight: 800, color: '#10B981' }}>{gp.netWeightMt} MT</td>
                        <td style={{ padding: '12px', color: '#94A3B8' }}>{gp.destination}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button
                            onClick={() => onViewGatePass(gp.id)}
                            className="btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                          >
                            Print Gate Pass
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: INVENTORY FULL MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'INVENTORY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="crusher-card" style={{ padding: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #1E293B',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Finished Stone Aggregates Inventory</h3>
              <span className="badge badge-amber">{store.products.length} Products</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#0F1626', color: '#94A3B8', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>Product Code</th>
                    <th style={{ padding: '10px 12px' }}>Description</th>
                    <th style={{ padding: '10px 12px' }}>Unit</th>
                    <th style={{ padding: '10px 12px' }}>Current Stock</th>
                    <th style={{ padding: '10px 12px' }}>Safety Threshold</th>
                    <th style={{ padding: '10px 12px' }}>Ex-Plant Rate</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {store.products.map((p) => {
                    const isLow = p.currentStockMt <= p.minThresholdMt;

                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #141E33' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#38BDF8' }}>{p.code}</td>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#FFF' }}>{p.name}</td>
                        <td style={{ padding: '12px', color: '#94A3B8' }}>{p.unit}</td>
                        <td style={{ padding: '12px', fontWeight: 800, color: isLow ? '#EF4444' : '#10B981', fontSize: '1rem' }}>
                          {p.currentStockMt.toFixed(1)} MT
                        </td>
                        <td style={{ padding: '12px', color: '#94A3B8' }}>{p.minThresholdMt} MT</td>
                        <td style={{ padding: '12px', fontWeight: 700 }}>₹{p.unitPriceInr} / MT</td>
                        <td style={{ padding: '12px' }}>
                          {isLow ? (
                            <span className="badge badge-crimson">LOW STOCK</span>
                          ) : (
                            <span className="badge badge-emerald">HEALTHY</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: EXTERNAL DIRECTORIES (CUSTOMERS, DRIVERS, FLEET) */}
      {/* ========================================================================= */}
      {activeTab === 'CUSTOMERS_FLEET' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Customers Directory */}
          <div className="crusher-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
              Customers Directory (WhatsApp Contact List)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {store.customers.map((c) => (
                <div
                  key={c.id}
                  style={{
                    backgroundColor: '#0F1626',
                    border: '1px solid #1E2A44',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: '#FFF' }}>{c.companyName}</strong>
                    <span style={{ color: '#25D366', fontSize: '0.78rem', fontWeight: 700 }}>
                      📱 {c.phone}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                    Contact: {c.name} • GST: {c.gstNumber || 'Not provided'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                    Address: {c.billingAddress}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Drivers & Fleet */}
          <div className="crusher-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
              Drivers & Transport Fleet
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {store.vehicles.map((v) => {
                const drv = store.drivers.find((d) => d.id === v.assignedDriverId);
                return (
                  <div
                    key={v.id}
                    style={{
                      backgroundColor: '#0F1626',
                      border: '1px solid #1E2A44',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ color: '#F59E0B' }}>{v.plateNumber}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{v.vehicleType}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#E2E8F0', marginTop: '4px' }}>
                      Assigned Driver: {drv ? `${drv.name} (${drv.phone})` : 'Unassigned'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                      Tare Baseline: {v.defaultTareWeightMt} MT • Max Gross: {v.maxCapacityMt} MT
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="crusher-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
            System Security & Action Audit Trail
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#0F1626', color: '#94A3B8', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px' }}>Timestamp</th>
                  <th style={{ padding: '8px 12px' }}>Staff User</th>
                  <th style={{ padding: '8px 12px' }}>Role</th>
                  <th style={{ padding: '8px 12px' }}>Action</th>
                  <th style={{ padding: '8px 12px' }}>Target Entity</th>
                  <th style={{ padding: '8px 12px' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {store.auditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #141E33' }}>
                    <td style={{ padding: '10px 12px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#FFF' }}>{log.userName}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className="badge badge-slate" style={{ fontSize: '0.62rem' }}>
                        {log.userRole}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#F59E0B' }}>{log.action}</td>
                    <td style={{ padding: '10px 12px', color: '#38BDF8' }}>{log.entity}</td>
                    <td style={{ padding: '10px 12px', color: '#CBD5E1' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
