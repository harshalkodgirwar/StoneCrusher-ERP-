'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCrusherStore } from '../../lib/store/useCrusherStore';
import { crusherStore } from '../../lib/store/crusher-store';
import {
  PlusCircle,
  Truck,
  CheckCircle2,
  Clock,
  Send,
  Users,
  Layers,
  FileText,
  Building2,
  Search,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  CreditCard,
  PhoneCall,
  MapPin,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface OfficeOperatorDashboardProps {
  onOpenWhatsAppSimulator: () => void;
  onViewGatePass?: (gatePassId: string) => void;
}

type OfficeNavTab = 'NEW_ORDER' | 'FIFO_QUEUE' | 'RECENT_DISPATCH' | 'CUSTOMERS' | 'PRICING_STOCK';

export const OfficeOperatorDashboard: React.FC<OfficeOperatorDashboardProps> = ({
  onOpenWhatsAppSimulator,
  onViewGatePass,
}) => {
  const store = useCrusherStore();
  const [activeTab, setActiveTab] = useState<OfficeNavTab>('NEW_ORDER');

  // Form state
  const [customerId, setCustomerId] = useState(store.customers[0]?.id || '');
  const [productId, setProductId] = useState(store.products[0]?.id || '');
  const [orderedQtyMt, setOrderedQtyMt] = useState('25');
  const [vehicleId, setVehicleId] = useState(store.vehicles[0]?.id || '');
  const [driverId, setDriverId] = useState(store.drivers[0]?.id || '');
  const [destination, setDestination] = useState('MIDC Phase 2, Pune Highway Project');
  const [requiredDate, setRequiredDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [orderCreatedSuccess, setOrderCreatedSuccess] = useState<string | null>(null);

  // Search in tables
  const [customerSearch, setCustomerSearch] = useState('');

  // Add customer modal
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustCompany, setNewCustCompany] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('+91 98');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustGst, setNewCustGst] = useState('');

  const handleVehicleChange = (vId: string) => {
    setVehicleId(vId);
    const veh = store.vehicles.find((v) => v.id === vId);
    if (veh?.assignedDriverId) {
      setDriverId(veh.assignedDriverId);
    }
  };

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !productId || !orderedQtyMt || !destination) {
      alert('Please fill all required fields');
      return;
    }

    const qty = parseFloat(orderedQtyMt);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity in MT');
      return;
    }

    const newTrip = crusherStore.createTrip({
      customerId,
      productId,
      orderedQtyMt: qty,
      destination,
      requiredDate,
      notes,
    });

    setOrderCreatedSuccess(newTrip.tripNumber);
    setNotes('');

    setTimeout(() => {
      setOrderCreatedSuccess(null);
    }, 6000);
  };

  const selectedProduct = store.products.find((p) => p.id === productId);
  const selectedCustomer = store.customers.find((c) => c.id === customerId);
  const selectedVehicle = store.vehicles.find((v) => v.id === vehicleId);

  const numQty = parseFloat(orderedQtyMt) || 0;
  const subtotalEst = selectedProduct ? numQty * selectedProduct.unitPriceInr : 0;
  const gstEst = Math.round(subtotalEst * 0.05);
  const grandTotalEst = subtotalEst + gstEst;

  const queuedTrips = store.trips.filter((t) => t.status === 'QUEUED');
  const dispatchedTrips = store.trips.filter((t) => t.status === 'DISPATCHED' || t.status === 'COMPLETED');

  const totalOrderedTodayMt = store.trips.reduce((acc, t) => acc + (t.orderedQtyMt || 0), 0);

  return (
    <div className="owner-layout">
      {/* 1. Deep Blue Sidebar (Identical to Owner Dashboard) */}
      <aside className="owner-sidebar">
        <div className="owner-sidebar-logo">
          <div className="owner-logo-icon">
            <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>❖</span>
          </div>
          <div className="owner-logo-text">
            <div className="owner-logo-title">CRUSHER</div>
            <div className="owner-logo-sub">OFFICE DESK</div>
          </div>
        </div>

        {/* Role Pill Indicator */}
        <div style={{ padding: '12px 14px 4px' }}>
          <div
            style={{
              backgroundColor: 'rgba(37, 99, 235, 0.15)',
              border: '1px solid rgba(37, 99, 235, 0.35)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#93C5FD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>ROLE: OFFICE OPERATOR</span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#60A5FA' }} />
          </div>
        </div>

        {/* Navigation Menu */}
        <ul className="owner-nav-list">
          <li>
            <a
              onClick={() => setActiveTab('NEW_ORDER')}
              className={`owner-nav-item ${activeTab === 'NEW_ORDER' ? 'active' : ''}`}
            >
              <div className="owner-nav-left">
                <PlusCircle size={16} />
                <span>Book Dispatch Order</span>
              </div>
            </a>
          </li>

          <li>
            <a
              onClick={() => setActiveTab('FIFO_QUEUE')}
              className={`owner-nav-item ${activeTab === 'FIFO_QUEUE' ? 'active' : ''}`}
            >
              <div className="owner-nav-left">
                <Clock size={16} />
                <span>Delivery Schedule Queue</span>
              </div>
              <span
                style={{
                  backgroundColor: queuedTrips.length > 0 ? '#D97706' : '#334155',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '10px',
                }}
              >
                {queuedTrips.length}
              </span>
            </a>
          </li>

          <li>
            <a
              onClick={() => setActiveTab('RECENT_DISPATCH')}
              className={`owner-nav-item ${activeTab === 'RECENT_DISPATCH' ? 'active' : ''}`}
            >
              <div className="owner-nav-left">
                <Truck size={16} />
                <span>Recent Dispatches</span>
              </div>
              <span
                style={{
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '10px',
                }}
              >
                {dispatchedTrips.length}
              </span>
            </a>
          </li>

          <li>
            <a
              onClick={() => setActiveTab('CUSTOMERS')}
              className={`owner-nav-item ${activeTab === 'CUSTOMERS' ? 'active' : ''}`}
            >
              <div className="owner-nav-left">
                <Users size={16} />
                <span>Customer Directory</span>
              </div>
              <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{store.customers.length}</span>
            </a>
          </li>

          <li>
            <a
              onClick={() => setActiveTab('PRICING_STOCK')}
              className={`owner-nav-item ${activeTab === 'PRICING_STOCK' ? 'active' : ''}`}
            >
              <div className="owner-nav-left">
                <Layers size={16} />
                <span>Rates & Stock Silos</span>
              </div>
            </a>
          </li>

          <li style={{ marginTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
            <a onClick={onOpenWhatsAppSimulator} className="owner-nav-item">
              <div className="owner-nav-left">
                <Send size={16} style={{ color: '#25D366' }} />
                <span style={{ color: '#86EFAC' }}>WhatsApp Simulator</span>
              </div>
              <span
                style={{
                  backgroundColor: '#25D366',
                  color: '#064E3B',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                LIVE
              </span>
            </a>
          </li>
        </ul>

        {/* Bottom Role Portals */}
        <div style={{ padding: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '8px' }}>
            SWITCH PORTAL
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Link
              href="/owner"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: '#CBD5E1',
                fontSize: '0.72rem',
                textDecoration: 'none',
              }}
            >
              <span>👑 Owner Dashboard</span>
              <ChevronRight size={12} />
            </Link>
            <Link
              href="/site"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: '#CBD5E1',
                fontSize: '0.72rem',
                textDecoration: 'none',
              }}
            >
              <span>⚖️ Site Scale Deck</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </aside>

      {/* 2. Main Container with Topbar & Content */}
      <main className="owner-main-container">
        {/* Sticky White Topbar */}
        <header className="owner-topbar">
          <div className="owner-topbar-left">
            <div className="owner-breadcrumbs">
              CRUSHER ERP &gt; <strong style={{ color: '#0F172A' }}>Office Operations & Order Booking</strong>
            </div>
          </div>

          <div className="owner-topbar-right">
            {/* Live Connectivity Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
              DELIVERY SCHEDULE SYNCED
            </div>

            <div style={{ fontSize: '1.15rem' }} title="India Region">🇮🇳</div>

            {/* User Avatar */}
            <div className="owner-user-pill">
              <div className="owner-avatar">AP</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ lineHeight: 1.1, fontSize: '0.78rem' }}>Amit Patil</div>
                <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 500 }}>Office Desk Dispatcher</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body Content */}
        <div className="owner-content-body">
          {/* Top 4 Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div className="owner-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Total Bookings Today</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                {store.trips.length} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748B' }}>trips</span>
              </div>
              <div className="owner-pill-badge owner-pill-cyan" style={{ marginTop: '8px' }}>
                +100% On-time Delivery
              </div>
            </div>

            <div className="owner-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Ordered Volume Today</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                {totalOrderedTodayMt.toFixed(1)} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748B' }}>MT</span>
              </div>
              <div className="owner-pill-badge owner-pill-green" style={{ marginTop: '8px' }}>
                Crusher Capacity OK
              </div>
            </div>

            <div className="owner-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Waiting in Yard Queue</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
                {queuedTrips.length} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748B' }}>trucks</span>
              </div>
              <div className="owner-pill-badge owner-pill-cyan" style={{ marginTop: '8px' }}>
                Site Weighbridge Live
              </div>
            </div>

            <div className="owner-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Active Customer Master</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                {store.customers.length} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748B' }}>accounts</span>
              </div>
              <div className="owner-pill-badge owner-pill-green" style={{ marginTop: '8px' }}>
                GST Verified & Active
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {orderCreatedSuccess && (
            <div
              style={{
                backgroundColor: '#DCFCE7',
                border: '1px solid #86EFAC',
                borderRadius: '8px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#15803D',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={20} color="#16A34A" />
                <span style={{ fontSize: '0.85rem' }}>
                  Trip Order <strong>{orderCreatedSuccess}</strong> booked successfully! Pushed directly to Site Weighbridge Delivery Queue and WhatsApp confirmation sent.
                </span>
              </div>
              <button
                onClick={onOpenWhatsAppSimulator}
                className="owner-btn-secondary"
                style={{ backgroundColor: '#FFFFFF', fontSize: '0.75rem', padding: '5px 10px' }}
              >
                View WhatsApp Simulator →
              </button>
            </div>
          )}

          {/* TAB CONTENT */}

          {/* TAB 1: NEW ORDER FORM */}
          {activeTab === 'NEW_ORDER' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '20px', alignItems: 'start' }}>
              {/* Order Booking Card */}
              <div className="owner-card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 className="owner-card-title" style={{ marginBottom: '2px', fontSize: '1rem' }}>
                      Book Dispatch Order (New Trip)
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Generates immediate delivery schedule entry for site weighbridge scale.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddCustomer(true)}
                    className="owner-btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                  >
                    <Users size={13} /> + New Customer
                  </button>
                </div>

                <form onSubmit={handleCreateTrip} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Customer Selection */}
                  <div className="owner-form-group">
                    <label className="owner-form-label">Customer / Contractor *</label>
                    <select
                      className="owner-select"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      required
                    >
                      {store.customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.companyName} — Contact: {c.name} ({c.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Product & Quantity */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>
                    <div className="owner-form-group">
                      <label className="owner-form-label">Aggregate Material *</label>
                      <select
                        className="owner-select"
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        required
                      >
                        {store.products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (₹{p.unitPriceInr}/MT — Avail: {p.currentStockMt.toFixed(0)} MT)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="owner-form-group">
                      <label className="owner-form-label">Target Quantity (MT) *</label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        className="owner-input"
                        value={orderedQtyMt}
                        onChange={(e) => setOrderedQtyMt(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Site Operator Dynamic Assignment Notice */}
                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div style={{ backgroundColor: '#DCFCE7', padding: '8px', borderRadius: '6px' }}>
                      <Truck size={18} color="#16A34A" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>
                        Truck & Driver Assigned at Site Scale
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#15803D' }}>
                        Vehicle & driver will be dynamically allocated by the Site Operator based on yard availability when truck is called to deck.
                      </div>
                    </div>
                  </div>

                  {/* Destination & Required Date */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '14px' }}>
                    <div className="owner-form-group">
                      <label className="owner-form-label">Site / Delivery Destination *</label>
                      <input
                        type="text"
                        className="owner-input"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="e.g. Pune Highway Project, MIDC Chakan"
                        required
                      />
                    </div>

                    <div className="owner-form-group">
                      <label className="owner-form-label">Required Delivery Date *</label>
                      <input
                        type="date"
                        className="owner-input"
                        value={requiredDate}
                        onChange={(e) => setRequiredDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Special Notes */}
                  <div className="owner-form-group">
                    <label className="owner-form-label">Special Dispatch Instructions / Chalan Notes</label>
                    <input
                      type="text"
                      className="owner-input"
                      placeholder="Optional notes for weighbridge or billing desk"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  {/* Submit Button */}
                  <div style={{ marginTop: '8px' }}>
                    <button type="submit" className="owner-btn-primary" style={{ width: '100%', padding: '12px' }}>
                      <PlusCircle size={16} /> Book Trip & Push to Delivery Queue
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Side: Live Price Summary & Stock Checks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Proforma Calculation Card */}
                <div className="owner-card" style={{ padding: '20px', borderLeft: '4px solid #2563EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                      Proforma Order Estimate
                    </div>
                    <span className="owner-paid-badge" style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8' }}>
                      5% GST APPLICABLE
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                      <span>Selected Material</span>
                      <strong style={{ color: '#0F172A' }}>{selectedProduct?.name || '--'}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                      <span>Unit Rate</span>
                      <span>₹{selectedProduct?.unitPriceInr.toLocaleString() || '0'} / MT</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                      <span>Ordered Weight</span>
                      <strong style={{ color: '#0F172A' }}>{numQty} MT</strong>
                    </div>

                    <div style={{ borderTop: '1px dashed #E2E8F0', margin: '4px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                      <span>Subtotal</span>
                      <span>₹{subtotalEst.toLocaleString()}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                      <span>GST (5% SGST + CGST)</span>
                      <span>₹{gstEst.toLocaleString()}</span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#F8FAFC',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        marginTop: '4px',
                      }}
                    >
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>Estimated Total</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563EB' }}>
                        ₹{grandTotalEst.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Customer Credit Status */}
                  {selectedCustomer && (
                    <div
                      style={{
                        marginTop: '14px',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#F1F5F9',
                        fontSize: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>Customer Credit Balance:</span>
                        <strong style={{ color: selectedCustomer.currentBalance >= 0 ? '#15803D' : '#DC2626' }}>
                          ₹{Math.abs(selectedCustomer.currentBalance).toLocaleString()}{' '}
                          {selectedCustomer.currentBalance >= 0 ? 'Cr (Advance)' : 'Dr (Outstanding)'}
                        </strong>
                      </div>
                      <div style={{ color: '#64748B', marginTop: '4px', fontSize: '0.7rem' }}>
                        Auto-receipt will be sent to <strong>{selectedCustomer.phone}</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Aggregate Silo Availability Status */}
                <div className="owner-card" style={{ padding: '18px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
                    Live Aggregate Silos Stock
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {store.products.map((p) => {
                      const isLow = p.currentStockMt <= p.minThresholdMt;
                      const isSelected = p.id === productId;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setProductId(p.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                            border: isSelected ? '1px solid #3B82F6' : '1px solid #EEF2F6',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: isSelected ? 700 : 500, color: isSelected ? '#1D4ED8' : '#1E293B' }}>
                              {p.name}
                            </span>
                            {isSelected && (
                              <span style={{ fontSize: '0.65rem', color: '#2563EB', fontWeight: 700 }}>(Selected)</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 700, color: isLow ? '#DC2626' : '#0F172A' }}>
                              {p.currentStockMt.toFixed(1)} MT
                            </span>
                            <span
                              style={{
                                fontSize: '0.65rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                backgroundColor: isLow ? '#FEE2E2' : '#DCFCE7',
                                color: isLow ? '#DC2626' : '#15803D',
                              }}
                            >
                              {isLow ? 'LOW' : 'OK'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE FIFO QUEUE */}
          {activeTab === 'FIFO_QUEUE' && (
            <div className="owner-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 className="owner-card-title" style={{ marginBottom: '2px' }}>
                    Site Weighbridge Delivery Queue ({queuedTrips.length} Waiting / Active)
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Trips are prioritized and sequenced by required delivery date for the site weighbridge scale operator.
                  </p>
                </div>
                <button onClick={() => setActiveTab('NEW_ORDER')} className="owner-btn-primary" style={{ fontSize: '0.75rem' }}>
                  <PlusCircle size={14} /> + Book Another Order
                </button>
              </div>

              {queuedTrips.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                  <Clock size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Yard Queue is Currently Clear</div>
                  <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>All trucks have been weighed and dispatched.</p>
                </div>
              ) : (
                <table className="owner-table">
                  <thead>
                    <tr>
                      <th>Seq #</th>
                      <th>Trip Number</th>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Target Qty</th>
                      <th>Vehicle Plate</th>
                      <th>Driver Contact</th>
                      <th>Req. Date</th>
                      <th>Status</th>
                      <th>Destination</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queuedTrips.map((trip, idx) => {
                      const cust = store.customers.find((c) => c.id === trip.customerId);
                      const prod = store.products.find((p) => p.id === trip.productId);
                      const veh = store.vehicles.find((v) => v.id === trip.vehicleId);
                      const driver = store.drivers.find((d) => d.id === trip.driverId);

                      return (
                        <tr key={trip.id}>
                          <td>
                            <strong style={{ color: '#2563EB' }}>#{idx + 1}</strong>
                          </td>
                          <td>
                            <strong>{trip.tripNumber}</strong>
                          </td>
                          <td>
                            <div className="owner-customer-cell">
                              <div className="owner-cust-avatar">
                                {cust?.companyName?.slice(0, 2).toUpperCase() || 'CU'}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600 }}>{cust?.companyName}</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{cust?.name}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <strong>{prod?.name}</strong>
                          </td>
                          <td>{trip.orderedQtyMt} MT</td>
                          <td>
                            {veh ? (
                              <span style={{ fontFamily: 'monospace', fontWeight: 700, backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                                {veh.plateNumber}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.72rem', color: '#B45309', backgroundColor: '#FEF3C7', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                ⏳ Pending Site Assignment
                              </span>
                            )}
                          </td>
                          <td>
                            {driver ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <PhoneCall size={12} color="#64748B" />
                                <span>{driver.name} ({driver.phone})</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontStyle: 'italic' }}>
                                Site Operator assigns
                              </span>
                            )}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                              📅 {trip.requiredDate || 'Today'}
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                backgroundColor:
                                  trip.status === 'QUEUED'
                                    ? '#FEF3C7'
                                    : trip.status === 'DISPATCHED'
                                    ? '#DBEAFE'
                                    : '#DCFCE7',
                                color:
                                  trip.status === 'QUEUED'
                                    ? '#B45309'
                                    : trip.status === 'DISPATCHED'
                                    ? '#1D4ED8'
                                    : '#15803D',
                              }}
                            >
                              {trip.status}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.75rem', color: '#64748B' }}>{trip.destination}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 3: RECENT DISPATCHES */}
          {activeTab === 'RECENT_DISPATCH' && (
            <div className="owner-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 className="owner-card-title" style={{ marginBottom: '2px' }}>
                    Recent Completed Dispatches ({dispatchedTrips.length})
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Verified weighments and QR-coded Gate Passes issued at site scale.
                  </p>
                </div>
              </div>

              {dispatchedTrips.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                  <Truck size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>No Dispatches Recorded Today</div>
                  <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>Dispatched trips with printed gate passes will appear here.</p>
                </div>
              ) : (
                <table className="owner-table">
                  <thead>
                    <tr>
                      <th>Trip #</th>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Tare (MT)</th>
                      <th>Gross (MT)</th>
                      <th>Net Dispatched (MT)</th>
                      <th>Vehicle Plate</th>
                      <th>Status</th>
                      <th>Gate Pass</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dispatchedTrips.map((trip) => {
                      const cust = store.customers.find((c) => c.id === trip.customerId);
                      const prod = store.products.find((p) => p.id === trip.productId);
                      const veh = store.vehicles.find((v) => v.id === trip.vehicleId);
                      const gatePass = store.gatePasses.find((g) => g.tripId === trip.id);

                      return (
                        <tr key={trip.id}>
                          <td><strong>{trip.tripNumber}</strong></td>
                          <td>
                            <div className="owner-customer-cell">
                              <div className="owner-cust-avatar">
                                {cust?.companyName?.slice(0, 2).toUpperCase() || 'CU'}
                              </div>
                              <span style={{ fontWeight: 600 }}>{cust?.companyName}</span>
                            </div>
                          </td>
                          <td><strong>{prod?.name}</strong></td>
                          <td>{trip.tareWeightMt ? `${trip.tareWeightMt} MT` : '--'}</td>
                          <td>{trip.grossWeightMt ? `${trip.grossWeightMt} MT` : '--'}</td>
                          <td>
                            <strong style={{ color: '#16A34A' }}>
                              {trip.netWeightMt ? `${trip.netWeightMt} MT` : `${trip.orderedQtyMt} MT`}
                            </strong>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                              {veh?.plateNumber}
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                backgroundColor:
                                  trip.status === 'DISPATCHED'
                                    ? '#DBEAFE'
                                    : '#DCFCE7',
                                color:
                                  trip.status === 'DISPATCHED'
                                    ? '#1D4ED8'
                                    : '#15803D',
                              }}
                            >
                              {trip.status}
                            </span>
                          </td>
                          <td>
                            {gatePass && onViewGatePass ? (
                              <button
                                onClick={() => onViewGatePass(gatePass.id)}
                                className="owner-btn-secondary"
                                style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                              >
                                <FileText size={12} /> View Gate Pass
                              </button>
                            ) : (
                              <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Issued</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 4: CUSTOMERS MASTER */}
          {activeTab === 'CUSTOMERS' && (
            <div className="owner-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 className="owner-card-title" style={{ marginBottom: '2px' }}>
                    Customer Master & Accounts Directory
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Pre-registered contractors, credit limits, and billing destinations.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94A3B8' }} />
                    <input
                      type="text"
                      className="owner-input"
                      placeholder="Search customer name or phone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      style={{ paddingLeft: '32px', width: '220px' }}
                    />
                  </div>
                  <button onClick={() => setShowAddCustomer(true)} className="owner-btn-primary" style={{ fontSize: '0.75rem' }}>
                    <Users size={14} /> + Add Customer
                  </button>
                </div>
              </div>

              <table className="owner-table">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Contact Person</th>
                    <th>WhatsApp Phone</th>
                    <th>Billing Address</th>
                    <th>Account Balance</th>
                    <th>Quick Action</th>
                  </tr>
                </thead>
                <tbody>
                  {store.customers
                    .filter(
                      (c) =>
                        c.companyName.toLowerCase().includes(customerSearch.toLowerCase()) ||
                        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                        c.phone.includes(customerSearch)
                    )
                    .map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div className="owner-customer-cell">
                            <div className="owner-cust-avatar">
                              {c.companyName.slice(0, 2).toUpperCase()}
                            </div>
                            <strong style={{ color: '#0F172A' }}>{c.companyName}</strong>
                          </div>
                        </td>
                        <td>{c.name}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#25D366' }}>●</span>
                            <strong>{c.phone}</strong>
                          </div>
                        </td>
                        <td style={{ color: '#64748B', fontSize: '0.75rem' }}>{c.billingAddress}</td>
                        <td>
                          <strong style={{ color: c.currentBalance >= 0 ? '#15803D' : '#DC2626' }}>
                            ₹{Math.abs(c.currentBalance).toLocaleString()}{' '}
                            {c.currentBalance >= 0 ? 'Cr (Advance)' : 'Dr (Due)'}
                          </strong>
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setCustomerId(c.id);
                              setActiveTab('NEW_ORDER');
                            }}
                            className="owner-btn-secondary"
                            style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                          >
                            Create Order →
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: RATES & SILOS */}
          {activeTab === 'PRICING_STOCK' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
              <div className="owner-card" style={{ padding: '20px' }}>
                <h3 className="owner-card-title" style={{ marginBottom: '4px' }}>
                  Aggregate Material Price Master
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '14px' }}>
                  Current commercial dispatch rates per metric ton (MT) excluding 5% GST.
                </p>

                <table className="owner-table">
                  <thead>
                    <tr>
                      <th>Product Grade</th>
                      <th>Unit</th>
                      <th>Rate (₹/MT)</th>
                      <th>Live Stock (MT)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.products.map((p) => {
                      const isLow = p.currentStockMt <= p.minThresholdMt;
                      return (
                        <tr key={p.id}>
                          <td><strong>{p.name}</strong></td>
                          <td>{p.unit}</td>
                          <td>
                            <strong style={{ color: '#2563EB' }}>₹{p.unitPriceInr.toLocaleString()}</strong>
                          </td>
                          <td>
                            <strong>{p.currentStockMt.toFixed(1)} MT</strong>
                          </td>
                          <td>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                backgroundColor: isLow ? '#FEE2E2' : '#DCFCE7',
                                color: isLow ? '#DC2626' : '#15803D',
                              }}
                            >
                              {isLow ? 'Low Stock' : 'Ample Supply'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="owner-card" style={{ padding: '20px' }}>
                <h3 className="owner-card-title" style={{ marginBottom: '4px' }}>
                  Raw Boulder Quarry Stock
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '14px' }}>
                  Unprocessed blasted basalt rocks fed to primary Jaw Crusher.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {store.rawMaterials.map((rm) => (
                    <div
                      key={rm.id}
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: '#0F172A', fontSize: '0.9rem' }}>{rm.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                            Supplier: Black Rock Quarry Cluster #3
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                            {rm.currentStockBrass} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Brass</span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 600 }}>~{(rm.currentStockBrass * 4.5).toFixed(0)} MT eqv</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            className="owner-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                Add New Customer Account
              </h3>
              <button
                onClick={() => setShowAddCustomer(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748B' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="owner-form-group">
                <label className="owner-form-label">Company / Contractor Name *</label>
                <input
                  type="text"
                  className="owner-input"
                  placeholder="e.g. Apex Infra Projects Ltd."
                  value={newCustCompany}
                  onChange={(e) => setNewCustCompany(e.target.value)}
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Contact Person Name *</label>
                <input
                  type="text"
                  className="owner-input"
                  placeholder="e.g. Rajesh Shinde"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">WhatsApp Contact Number *</label>
                <input
                  type="text"
                  className="owner-input"
                  placeholder="+91 98230 00000"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Site / Billing Address</label>
                <input
                  type="text"
                  className="owner-input"
                  placeholder="e.g. MIDC Chakan Phase 2, Pune"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">GST Number (Optional)</label>
                <input
                  type="text"
                  className="owner-input"
                  placeholder="27AAAAA0000A1Z5"
                  value={newCustGst}
                  onChange={(e) => setNewCustGst(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowAddCustomer(false)} className="owner-btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newCustCompany || !newCustName || !newCustPhone) {
                    alert('Please enter company name, contact person, and phone number.');
                    return;
                  }
                  const created = crusherStore.addCustomer({
                    name: newCustName,
                    companyName: newCustCompany,
                    phone: newCustPhone,
                    billingAddress: newCustAddress || 'Pune, Maharashtra',
                    gstNumber: newCustGst,
                    currentBalance: 0,
                  });
                  setCustomerId(created.id);
                  setNewCustCompany('');
                  setNewCustName('');
                  setNewCustPhone('');
                  setNewCustAddress('');
                  setNewCustGst('');
                  setShowAddCustomer(false);
                }}
                className="owner-btn-primary"
              >
                Save & Select Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
