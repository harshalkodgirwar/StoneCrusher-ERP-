'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCrusherStore } from '../../lib/store/useCrusherStore';
import { crusherStore } from '../../lib/store/crusher-store';
import {
  Layers,
  LayoutDashboard,
  Receipt,
  Users,
  ShoppingBag,
  Tag,
  Truck,
  FileBarChart,
  Warehouse,
  Send,
  Bell,
  Maximize2,
  ChevronRight,
  Menu,
  ChevronDown,
  RotateCw,
  Search,
  CheckCircle,
  Clock,
  Download,
  AlertTriangle,
  Play,
  Calendar,
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

  type NavMenu =
    | 'DASHBOARD'
    | 'TRANSACTION'
    | 'MASTERS'
    | 'PURCHASE'
    | 'SALE'
    | 'TRANSPORTER'
    | 'REPORTS'
    | 'STORES'
    | 'WHATSAPP';

  const [activeMenu, setActiveMenu] = useState<NavMenu>('DASHBOARD');
  const [paymentPeriod, setPaymentPeriod] = useState<'ALL' | '3M' | '6M' | '1Y'>('ALL');

  // WhatsApp Filter State
  const [waStatusFilter, setWaStatusFilter] = useState<string>('ALL');
  const [waRecipientFilter, setWaRecipientFilter] = useState<string>('ALL');
  const [waSearchQuery, setWaSearchQuery] = useState<string>('');

  // Calculations
  const incomingVehiclesCount = store.rawMaterialReceipts.length || 12;
  const outgoingVehiclesCount = store.trips.filter((t) => t.status === 'DISPATCHED').length || 24;

  const totalMtDispatched = store.trips
    .filter((t) => t.status === 'DISPATCHED')
    .reduce((acc, t) => acc + (t.netWeightMt || t.orderedQtyMt), 0);

  const totalRevenueLakhs = Number(
    (
      store.trips
        .filter((t) => t.status === 'DISPATCHED')
        .reduce((acc, t) => {
          const prod = store.products.find((p) => p.id === t.productId);
          return acc + (t.netWeightMt || t.orderedQtyMt) * (prod?.unitPriceInr || 680);
        }, 0) / 100000
    ).toFixed(1)
  ) || 39.0;

  const failedMessages = store.whatsappMessages.filter((m) => m.status === 'FAILED');

  // Sample Invoice List matching the screenshot
  const invoiceList = [
    {
      invoiceNo: 'SI-9301',
      customer: 'ARUN WANKHEDE',
      avatar: 'AW',
      product: '20mm Aggregate (25 MT)',
      amount: '₹ 17,000',
      date: '13-03-2024',
      status: 'Paid',
    },
    {
      invoiceNo: 'SI-9300',
      customer: 'SIDHESHWAR RMC PLANT ( KAP )',
      avatar: 'SR',
      product: '10mm Blue Basalt (30 MT)',
      amount: '₹ 21,600',
      date: '12-03-2024',
      status: 'Paid',
    },
    {
      invoiceNo: 'SI-9299',
      customer: 'GOPAL IRON',
      avatar: 'GI',
      product: 'GSB Road Mix (40 MT)',
      amount: '₹ 19,200',
      date: '11-03-2024',
      status: 'Paid',
    },
    {
      invoiceNo: 'SI-9298',
      customer: 'HITESH CONSTRUCTION',
      avatar: 'HC',
      product: '20mm Aggregate (20 MT)',
      amount: '₹ 13,600',
      date: '09-03-2024',
      status: 'Paid',
    },
    {
      invoiceNo: 'SI-9297',
      customer: 'HITESH CONSTRUCTION',
      avatar: 'HC',
      product: 'Crusher Dust (25 MT)',
      amount: '₹ 9,750',
      date: '09-03-2024',
      status: 'Paid',
    },
    {
      invoiceNo: 'SI-9296',
      customer: 'HITESH CONSTRUCTION',
      avatar: 'HC',
      product: 'M-Sand Washed (22 MT)',
      amount: '₹ 18,700',
      date: '08-03-2024',
      status: 'Paid',
    },
  ];

  // Bar Chart Data (Monthly Jan to Dec)
  const monthlyActivity = [
    { month: 'Jan', val: 3.5 },
    { month: 'Feb', val: 0.0 },
    { month: 'Mar', val: 0.0 },
    { month: 'Apr', val: 6.8 },
    { month: 'May', val: 6.2 },
    { month: 'Jun', val: 6.0 },
    { month: 'Jul', val: 6.9 },
    { month: 'Aug', val: 6.5 },
    { month: 'Sep', val: 5.8 },
    { month: 'Oct', val: 8.2 },
    { month: 'Nov', val: 5.2 },
    { month: 'Dec', val: 0.0 },
  ];

  // Filtered WhatsApp Messages for the WhatsApp tab
  const filteredWhatsAppMessages = store.whatsappMessages.filter((m) => {
    if (waStatusFilter !== 'ALL' && m.status !== waStatusFilter) return false;
    if (waRecipientFilter !== 'ALL' && m.recipientType !== waRecipientFilter) return false;
    if (waSearchQuery) {
      const q = waSearchQuery.toLowerCase();
      return (
        m.recipientPhone.toLowerCase().includes(q) ||
        m.recipientName.toLowerCase().includes(q) ||
        m.templateName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="owner-layout">
      {/* 1. Deep Blue Sidebar matching screenshot */}
      <aside className="owner-sidebar">
        {/* Logo */}
        <div className="owner-sidebar-logo">
          <div className="owner-logo-icon">
            <Layers size={20} />
          </div>
          <div className="owner-logo-text">
            <div className="owner-logo-title">CRUSHER</div>
            <div className="owner-logo-sub">PLANT MGMT SYST</div>
          </div>
        </div>

        {/* Menu Items */}
        <ul className="owner-nav-list">
          <li
            className={`owner-nav-item ${activeMenu === 'DASHBOARD' ? 'active' : ''}`}
            onClick={() => setActiveMenu('DASHBOARD')}
          >
            <div className="owner-nav-left">
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </div>
            <ChevronRight size={14} />
          </li>

          <li
            className={`owner-nav-item ${activeMenu === 'TRANSACTION' ? 'active' : ''}`}
            onClick={() => setActiveMenu('TRANSACTION')}
          >
            <div className="owner-nav-left">
              <Receipt size={16} />
              <span>Transaction</span>
            </div>
            <ChevronRight size={14} />
          </li>

          <li
            className={`owner-nav-item ${activeMenu === 'MASTERS' ? 'active' : ''}`}
            onClick={() => setActiveMenu('MASTERS')}
          >
            <div className="owner-nav-left">
              <Users size={16} />
              <span>Masters</span>
            </div>
            <ChevronRight size={14} />
          </li>

          <li
            className={`owner-nav-item ${activeMenu === 'PURCHASE' ? 'active' : ''}`}
            onClick={() => setActiveMenu('PURCHASE')}
          >
            <div className="owner-nav-left">
              <ShoppingBag size={16} />
              <span>Purchase</span>
            </div>
            <ChevronRight size={14} />
          </li>

          <li
            className={`owner-nav-item ${activeMenu === 'SALE' ? 'active' : ''}`}
            onClick={() => setActiveMenu('SALE')}
          >
            <div className="owner-nav-left">
              <Tag size={16} />
              <span>Sale</span>
            </div>
            <ChevronRight size={14} />
          </li>

          <li
            className={`owner-nav-item ${activeMenu === 'TRANSPORTER' ? 'active' : ''}`}
            onClick={() => setActiveMenu('TRANSPORTER')}
          >
            <div className="owner-nav-left">
              <Truck size={16} />
              <span>Transporter Reports</span>
            </div>
            <ChevronRight size={14} />
          </li>

          <li
            className={`owner-nav-item ${activeMenu === 'REPORTS' ? 'active' : ''}`}
            onClick={() => setActiveMenu('REPORTS')}
          >
            <div className="owner-nav-left">
              <FileBarChart size={16} />
              <span>MIS Reports</span>
            </div>
            <ChevronRight size={14} />
          </li>

          <li
            className={`owner-nav-item ${activeMenu === 'STORES' ? 'active' : ''}`}
            onClick={() => setActiveMenu('STORES')}
          >
            <div className="owner-nav-left">
              <Warehouse size={16} />
              <span>Stores</span>
            </div>
            <ChevronRight size={14} />
          </li>

          <li
            className={`owner-nav-item ${activeMenu === 'WHATSAPP' ? 'active' : ''}`}
            onClick={() => setActiveMenu('WHATSAPP')}
          >
            <div className="owner-nav-left">
              <Send size={16} />
              <span>WhatsApp Center</span>
            </div>
            {failedMessages.length > 0 && (
              <span className="owner-pill-badge owner-pill-red">{failedMessages.length}</span>
            )}
          </li>
        </ul>

        {/* Bottom Shortcut to Site & Office Portals */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>
            OPERATOR PORTALS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Link
              href="/site"
              style={{
                color: '#94A3B8',
                fontSize: '0.75rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 0',
              }}
            >
              <span>⚖️ Site Operator Scale</span>
            </Link>
            <Link
              href="/office"
              style={{
                color: '#94A3B8',
                fontSize: '0.75rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 0',
              }}
            >
              <span>🖥️ Office Operator Order</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* 2. Main Body Container */}
      <div className="owner-main-container">
        {/* Topbar matching screenshot */}
        <div className="owner-topbar">
          <div className="owner-topbar-left">
            <button className="owner-icon-btn">
              <Menu size={18} />
            </button>
            <div className="owner-layout-toggle">
              <span>Layout: Horizontal</span>
            </div>
            <div className="owner-breadcrumbs">
              DASHBOARD <span style={{ color: '#94A3B8', margin: '0 4px' }}>&gt;</span>{' '}
              <span style={{ color: '#2563EB' }}>Dashboard</span>
            </div>
          </div>

          <div className="owner-topbar-right">
            {/* Indian Flag */}
            <span style={{ fontSize: '1.1rem', cursor: 'pointer' }} title="India Region">
              🇮🇳
            </span>

            {/* Fullscreen icon */}
            <button className="owner-icon-btn" title="Toggle Fullscreen">
              <Maximize2 size={16} />
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenWhatsAppSimulator}
              className="owner-icon-btn"
              style={{ position: 'relative' }}
              title="WhatsApp Notifications & System Alerts"
            >
              <Bell size={16} />
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: failedMessages.length > 0 ? '#EF4444' : '#10B981',
                }}
              />
            </button>

            {/* User Profile Pill */}
            <div className="owner-user-pill">
              <div className="owner-avatar">A</div>
              <span>Abhay</span>
              <ChevronDown size={14} color="#64748B" />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="owner-content-body">
          {/* ========================================================================= */}
          {/* VIEW: MAIN DASHBOARD (MATCHING THE SCREENSHOT EXACTLY) */}
          {/* ========================================================================= */}
          {activeMenu === 'DASHBOARD' && (
            <>
              {/* Row 1: Today's Incoming/Outgoing Vehicles + This Week's Overview */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Card 1: Today's Incoming and Outgoing Vehicles */}
                <div className="owner-card">
                  <div className="owner-card-title">Today's Incoming and Outgoing Vehicles</div>
                  <div className="owner-vehicle-grid">
                    {/* Incoming */}
                    <div className="owner-vehicle-tile">
                      <div>
                        <div className="owner-vehicle-metric">{incomingVehiclesCount}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                          Incoming Trips
                        </div>
                        <div className="owner-pill-badge owner-pill-cyan">0.00% since last week</div>
                      </div>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          backgroundColor: '#E0F2FE',
                          color: '#0284C7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Truck size={22} />
                      </div>
                    </div>

                    {/* Outgoing */}
                    <div className="owner-vehicle-tile">
                      <div>
                        <div className="owner-vehicle-metric">{outgoingVehiclesCount}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                          Outgoing Trips
                        </div>
                        <div className="owner-pill-badge owner-pill-red">0.00% since last week</div>
                      </div>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          backgroundColor: '#CFFAFE',
                          color: '#0891B2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Truck size={22} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: This Week's Overview */}
                <div className="owner-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div className="owner-card-title" style={{ margin: 0 }}>
                      This Week's Overview
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>SORT BY: Current</span>
                  </div>

                  <div className="owner-overview-stats">
                    {/* Stat 1: Clients Added */}
                    <div className="owner-stat-item">
                      <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
                          {store.customers.length}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Clients Added</div>
                        <div className="owner-pill-badge owner-pill-cyan">0.00% since last week</div>
                      </div>
                      <svg width="40" height="40" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E2E8F0"
                          strokeWidth="3.5"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#0284C7"
                          strokeWidth="3.5"
                          strokeDasharray="65, 100"
                        />
                      </svg>
                    </div>

                    {/* Stat 2: Contracts Signed */}
                    <div className="owner-stat-item">
                      <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>0</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Contracts Signed</div>
                        <div className="owner-pill-badge owner-pill-red">0.00% since this month</div>
                      </div>
                      <svg width="40" height="40" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E2E8F0"
                          strokeWidth="3.5"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="3.5"
                          strokeDasharray="40, 100"
                        />
                      </svg>
                    </div>

                    {/* Stat 3: Invoice Sent */}
                    <div className="owner-stat-item">
                      <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
                          {store.gatePasses.length || 6}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Invoice Sent</div>
                        <div className="owner-pill-badge owner-pill-cyan">0.00% since this month</div>
                      </div>
                      <svg width="40" height="40" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E2E8F0"
                          strokeWidth="3.5"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#0891B2"
                          strokeWidth="3.5"
                          strokeDasharray="80, 100"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: PAYMENT ACTIVITY (LAC) + STRUCTURE */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                {/* PAYMENT ACTIVITY (LAC) */}
                <div className="owner-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="owner-card-title" style={{ margin: 0 }}>
                      PAYMENT ACTIVITY(LAC)
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {(['ALL', '3M', '6M', '1Y'] as const).map((period) => (
                        <button
                          key={period}
                          onClick={() => setPaymentPeriod(period)}
                          style={{
                            border: 'none',
                            background: paymentPeriod === period ? '#2563EB' : '#F1F5F9',
                            color: paymentPeriod === period ? '#FFF' : '#64748B',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Headline & Sub-indicators */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      margin: '14px 0 10px',
                    }}
                  >
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
                      ₹ {totalRevenueLakhs}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem' }}>
                      <span style={{ color: '#2563EB', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ● ₹ 83 Incomes
                      </span>
                      <span style={{ color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ● ₹ 44 Expenses
                      </span>
                    </div>
                  </div>

                  {/* Bar Chart matching screenshot */}
                  <div style={{ height: '160px', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '10px 0 0' }}>
                    {monthlyActivity.map((item, idx) => {
                      const barHeight = Math.max(12, item.val * 16);
                      const isZero = item.val === 0;

                      return (
                        <div
                          key={idx}
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            height: '100%',
                            justifyContent: 'flex-end',
                          }}
                        >
                          {!isZero && (
                            <div
                              style={{
                                width: '10px',
                                height: `${barHeight}px`,
                                backgroundColor: '#2563EB',
                                borderRadius: '3px 3px 0 0',
                                transition: 'height 0.3s ease',
                              }}
                              title={`${item.month}: ₹${item.val} Lac`}
                            />
                          )}
                          <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '8px' }}>
                            {item.month}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* STRUCTURE */}
                <div className="owner-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div className="owner-card-title" style={{ margin: 0 }}>
                      STRUCTURE
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>SORT</span>
                  </div>

                  {/* Donut Chart matching screenshot */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '14px 0' }}>
                    <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                      <svg width="130" height="130" viewBox="0 0 42 42">
                        <circle cx="21" cy="21" r="15.91549430918954" fill="#fff" />
                        <circle
                          cx="21"
                          cy="21"
                          r="15.91549430918954"
                          fill="transparent"
                          stroke="#E2E8F0"
                          strokeWidth="6"
                        />
                        {/* 60% Arc in blue */}
                        <circle
                          cx="21"
                          cy="21"
                          r="15.91549430918954"
                          fill="transparent"
                          stroke="#2563EB"
                          strokeWidth="6"
                          strokeDasharray="60 40"
                          strokeDashoffset="25"
                        />
                      </svg>
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                        }}
                      >
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>60.0%</span>
                        <span style={{ fontSize: '0.62rem', color: '#64748B' }}>Paid</span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem', color: '#64748B', marginTop: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB' }} /> Invoice
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} /> Collected
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} /> Outstanding
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Trends & Overlays matching screenshot */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                {/* Left: Dual Line Trend Chart */}
                <div className="owner-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div className="owner-card-title" style={{ margin: 0 }}>
                      PRODUCTION & DISPATCH VOLUME TREND
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>MT / Day</span>
                  </div>

                  {/* Dual Line SVG */}
                  <div style={{ height: '140px', width: '100%', position: 'relative' }}>
                    <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="0" y1="30" x2="400" y2="30" stroke="#F1F5F9" strokeWidth="1" />
                      <line x1="0" y1="60" x2="400" y2="60" stroke="#F1F5F9" strokeWidth="1" />
                      <line x1="0" y1="90" x2="400" y2="90" stroke="#F1F5F9" strokeWidth="1" />

                      {/* Series A (Pink / Red) */}
                      <polyline
                        fill="none"
                        stroke="#F43F5E"
                        strokeWidth="2.5"
                        points="10,95 60,82 120,68 180,92 240,78 300,60 360,35 390,20"
                      />

                      {/* Series B (Cyan / Blue) */}
                      <polyline
                        fill="none"
                        stroke="#06B6D4"
                        strokeWidth="2.5"
                        points="10,85 60,70 120,60 180,50 240,40 300,38 360,25 390,15"
                      />
                    </svg>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94A3B8', marginTop: '4px' }}>
                      <span>2018</span>
                      <span>2020</span>
                      <span>2022</span>
                      <span>2024</span>
                      <span>2026</span>
                    </div>
                  </div>
                </div>

                {/* Right: Payment Overview Wave Chart */}
                <div className="owner-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div className="owner-card-title" style={{ margin: 0 }}>
                      PAYMENT OVERVIEW
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>SORT BY: Monthly ▾</span>
                  </div>

                  {/* Smooth wave area */}
                  <div style={{ height: '140px', width: '100%' }}>
                    <svg width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="none">
                      <path
                        d="M 0 110 Q 50 40 100 60 T 200 40 T 300 80 L 300 120 L 0 120 Z"
                        fill="rgba(37, 99, 235, 0.08)"
                      />
                      <path
                        d="M 0 110 Q 50 40 100 60 T 200 40 T 300 80"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Row 4: INVOICE LIST & PLANT ACTIVITY WIDGETS (Matching Reference) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
                {/* INVOICE LIST TABLE */}
                <div className="owner-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div className="owner-card-title" style={{ margin: 0 }}>
                      INVOICE LIST
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Recent Dispatches</span>
                  </div>

                  <table className="owner-table">
                    <thead>
                      <tr>
                        <th>INVOICE NO.</th>
                        <th>CUSTOMER</th>
                        <th>MATERIAL & QTY</th>
                        <th>AMOUNT</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceList.map((inv, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700, color: '#2563EB' }}>{inv.invoiceNo}</td>
                          <td>
                            <div className="owner-customer-cell">
                              <div className="owner-cust-avatar">{inv.avatar}</div>
                              <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>{inv.customer}</span>
                            </div>
                          </td>
                          <td style={{ color: '#64748B' }}>{inv.product}</td>
                          <td style={{ fontWeight: 700, color: '#0F172A' }}>{inv.amount}</td>
                          <td>
                            <span className="owner-paid-badge">{inv.status}</span>
                          </td>
                          <td>
                            <button
                              onClick={() => {
                                const gp = store.gatePasses[0];
                                if (gp) onViewGatePass(gp.id);
                                else alert(`Gate Pass for ${inv.invoiceNo} is verified.`);
                              }}
                              style={{
                                background: '#F1F5F9',
                                border: '1px solid #E2E8F0',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                fontSize: '0.72rem',
                                color: '#475569',
                                cursor: 'pointer',
                              }}
                            >
                              •••
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mini Side Widgets: Date/Status + Plant Activity + Donut */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Plant Running Activity Widget */}
                  <div className="owner-card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '8px' }}>
                      12/01/2026 • PLANT STATUS
                    </div>

                    <div className="owner-plant-activity">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                        <span style={{ fontWeight: 600 }}>Plant Running</span>
                      </div>
                      <span
                        style={{
                          backgroundColor: '#FCE7F3',
                          color: '#BE185D',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        13Hrs
                      </span>
                    </div>

                    <div style={{ marginTop: '10px', fontSize: '0.72rem', color: '#64748B' }}>
                      Jaw Crusher primary feeder running at 180 TPH nominal rate.
                    </div>
                  </div>

                  {/* Multi-Color Segment Donut Widget (from screenshot) */}
                  <div className="owner-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ position: 'relative', width: '70px', height: '70px', flexShrink: 0 }}>
                      <svg width="70" height="70" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.915" fill="#fff" />
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F59E0B" strokeWidth="5" strokeDasharray="40 60" />
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#EC4899" strokeWidth="5" strokeDasharray="30 70" strokeDashoffset="-40" />
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#06B6D4" strokeWidth="5" strokeDasharray="30 70" strokeDashoffset="-70" />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>
                        2%
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                        Aggregate Share
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                        20mm: 42% • 10mm: 28% • GSB: 18% • Dust: 12%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* VIEW: WHATSAPP CENTER TAB */}
          {/* ========================================================================= */}
          {activeMenu === 'WHATSAPP' && (
            <div className="owner-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div className="owner-card-title" style={{ margin: 0 }}>
                    WhatsApp Notification Delivery Hub
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                    Audit log of all automated customer orders, driver trip assignments, gate pass documents, and supplier receipts.
                  </div>
                </div>

                <button
                  onClick={onOpenWhatsAppSimulator}
                  style={{
                    backgroundColor: '#10B981',
                    color: '#FFF',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Send size={14} /> Launch WhatsApp Simulator
                </button>
              </div>

              {/* Filter Row */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search phone, recipient, or message..."
                  value={waSearchQuery}
                  onChange={(e) => setWaSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '220px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.8rem',
                  }}
                />

                <select
                  value={waRecipientFilter}
                  onChange={(e) => setWaRecipientFilter(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }}
                >
                  <option value="ALL">All Recipients</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="DRIVER">Driver</option>
                  <option value="SUPPLIER">Supplier</option>
                  <option value="OWNER">Owner</option>
                </select>

                <select
                  value={waStatusFilter}
                  onChange={(e) => setWaStatusFilter(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }}
                >
                  <option value="ALL">All Status</option>
                  <option value="SENT">Sent</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="READ">Read</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>

              {/* WhatsApp Table */}
              <table className="owner-table">
                <thead>
                  <tr>
                    <th>TIME</th>
                    <th>RECIPIENT</th>
                    <th>ROLE</th>
                    <th>TEMPLATE</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWhatsAppMessages.map((m) => (
                    <tr key={m.id}>
                      <td style={{ color: '#64748B' }}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <strong>{m.recipientName}</strong>
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{m.recipientPhone}</div>
                      </td>
                      <td>
                        <span className="owner-pill-badge owner-pill-cyan">{m.recipientType}</span>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: '#475569' }}>{m.templateName}</td>
                      <td>
                        {m.status === 'FAILED' ? (
                          <span className="owner-pill-badge owner-pill-red">Failed</span>
                        ) : m.status === 'READ' ? (
                          <span className="owner-pill-badge owner-pill-green">Read</span>
                        ) : (
                          <span className="owner-pill-badge owner-pill-cyan">{m.status}</span>
                        )}
                      </td>
                      <td>
                        {m.status === 'FAILED' && (
                          <button
                            onClick={() => crusherStore.retryWhatsAppMessage(m.id)}
                            style={{
                              background: '#EF4444',
                              color: '#FFF',
                              border: 'none',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                            }}
                          >
                            <RotateCw size={10} /> Retry
                          </button>
                        )}
                        {m.documentFileName && (
                          <button
                            onClick={() => {
                              if (m.relatedEntity === 'GATE_PASS') onViewGatePass(m.relatedEntityId);
                              if (m.relatedEntity === 'RAW_RECEIPT') onViewReceipt(m.relatedEntityId);
                            }}
                            style={{
                              background: '#F1F5F9',
                              border: '1px solid #CBD5E1',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                            }}
                          >
                            View PDF
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: STORES / INVENTORY */}
          {/* ========================================================================= */}
          {activeMenu === 'STORES' && (
            <div className="owner-card">
              <div className="owner-card-title">Quarry Finished Products & Raw Material Stores</div>
              <table className="owner-table">
                <thead>
                  <tr>
                    <th>CODE</th>
                    <th>PRODUCT DESCRIPTION</th>
                    <th>UNIT</th>
                    <th>AVAILABLE STOCK</th>
                    <th>MIN THRESHOLD</th>
                    <th>EX-PLANT RATE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {store.products.map((p) => {
                    const isLow = p.currentStockMt <= p.minThresholdMt;
                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 700, color: '#2563EB' }}>{p.code}</td>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td style={{ color: '#64748B' }}>{p.unit}</td>
                        <td style={{ fontWeight: 800, color: isLow ? '#DC2626' : '#16A34A', fontSize: '0.9rem' }}>
                          {p.currentStockMt.toFixed(1)} MT
                        </td>
                        <td style={{ color: '#64748B' }}>{p.minThresholdMt} MT</td>
                        <td style={{ fontWeight: 600 }}>₹{p.unitPriceInr} / MT</td>
                        <td>
                          {isLow ? (
                            <span className="owner-pill-badge owner-pill-red">LOW STOCK</span>
                          ) : (
                            <span className="owner-pill-badge owner-pill-green">HEALTHY</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: TRANSACTIONS / GATE PASSES */}
          {/* ========================================================================= */}
          {activeMenu === 'TRANSACTION' && (
            <div className="owner-card">
              <div className="owner-card-title">Weighbridge Transactions & Gate Passes</div>
              <table className="owner-table">
                <thead>
                  <tr>
                    <th>GATE PASS NO.</th>
                    <th>CUSTOMER</th>
                    <th>VEHICLE NO.</th>
                    <th>MATERIAL</th>
                    <th>NET DISPATCH</th>
                    <th>DESTINATION</th>
                    <th>SLIP ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {store.gatePasses.map((gp) => (
                    <tr key={gp.id}>
                      <td style={{ fontWeight: 700, color: '#2563EB' }}>{gp.gatePassNumber}</td>
                      <td style={{ fontWeight: 600 }}>{gp.customerName}</td>
                      <td>{gp.vehiclePlate}</td>
                      <td>{gp.productName}</td>
                      <td style={{ fontWeight: 800, color: '#16A34A' }}>{gp.netWeightMt} MT</td>
                      <td style={{ color: '#64748B' }}>{gp.destination}</td>
                      <td>
                        <button
                          onClick={() => onViewGatePass(gp.id)}
                          style={{
                            background: '#2563EB',
                            color: '#FFF',
                            border: 'none',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                          }}
                        >
                          Print Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: MASTERS / DIRECTORIES */}
          {activeMenu === 'MASTERS' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="owner-card">
                <div className="owner-card-title">Customers Master (WhatsApp Target)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {store.customers.map((c) => (
                    <div key={c.id} style={{ padding: '8px 12px', background: '#F8FAFC', borderRadius: '6px', fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 700 }}>{c.companyName}</div>
                      <div style={{ color: '#64748B', fontSize: '0.75rem' }}>{c.name} • 📱 {c.phone}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="owner-card">
                <div className="owner-card-title">Vehicles & Transporters</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {store.vehicles.map((v) => (
                    <div key={v.id} style={{ padding: '8px 12px', background: '#F8FAFC', borderRadius: '6px', fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 700, color: '#0284C7' }}>{v.plateNumber}</div>
                      <div style={{ color: '#64748B', fontSize: '0.75rem' }}>{v.vehicleType} • Tare: {v.defaultTareWeightMt} MT</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
