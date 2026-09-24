'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCrusherStore } from '../../lib/store/useCrusherStore';
import { crusherStore, Customer, Vehicle, Driver, Product } from '../../lib/store/crusher-store';
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
  Database,
  Printer,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  PlusCircle,
  ShieldCheck,
  FileText,
  Check,
  Filter,
  Activity,
  Zap,
  Gauge,
  Sparkles,
  Edit,
  Trash2,
} from 'lucide-react';
import { DatabaseConfigView } from '../database/DatabaseConfigView';

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
    | 'WHATSAPP'
    | 'DATABASE';

  const [activeMenu, setActiveMenu] = useState<NavMenu>('DASHBOARD');
  const [paymentPeriod, setPaymentPeriod] = useState<'ALL' | '3M' | '6M' | '1Y'>('ALL');

  // Transporter state
  const [transporterSearch, setTransporterSearch] = useState<string>('');
  const [transporterTypeFilter, setTransporterTypeFilter] = useState<string>('ALL');

  // MIS Reports state
  const [reportPeriod, setReportPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('ALL');

  // Sale state
  const [saleSearch, setSaleSearch] = useState<string>('');
  const [saleStatusFilter, setSaleStatusFilter] = useState<string>('ALL');

  // Purchase state
  const [purchaseSearch, setPurchaseSearch] = useState<string>('');

  // Transaction sub-tab
  const [transactionTab, setTransactionTab] = useState<'GATE_PASSES' | 'WEIGHBRIDGE_SLIPS' | 'LIVE_TRIPS'>('GATE_PASSES');

  // Masters sub-tab
  const [mastersTab, setMastersTab] = useState<'CUSTOMERS' | 'VEHICLES' | 'DRIVERS' | 'PRODUCTS'>('CUSTOMERS');

  // Edit Master state
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete Confirmation state
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'CUSTOMER' | 'VEHICLE' | 'DRIVER' | 'PRODUCT';
    id: string;
    name: string;
  } | null>(null);

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'CUSTOMER') {
      crusherStore.deleteCustomer(itemToDelete.id);
    } else if (itemToDelete.type === 'VEHICLE') {
      crusherStore.deleteVehicle(itemToDelete.id);
    } else if (itemToDelete.type === 'DRIVER') {
      crusherStore.deleteDriver(itemToDelete.id);
    } else if (itemToDelete.type === 'PRODUCT') {
      crusherStore.deleteProduct(itemToDelete.id);
    }
    setItemToDelete(null);
  };

  // Add Master Modals state
  const [showAddCustModal, setShowAddCustModal] = useState<boolean>(false);
  const [custCompany, setCustCompany] = useState<string>('');
  const [custName, setCustName] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');
  const [custAddress, setCustAddress] = useState<string>('');
  const [custGst, setCustGst] = useState<string>('');

  const [showAddVehModal, setShowAddVehModal] = useState<boolean>(false);
  const [vehPlate, setVehPlate] = useState<string>('');
  const [vehType, setVehType] = useState<string>('Tipper 10-Wheeler');
  const [vehTare, setVehTare] = useState<number>(10.5);
  const [vehCap, setVehCap] = useState<number>(25.0);
  const [vehDriverId, setVehDriverId] = useState<string>('');

  const [showAddDriverModal, setShowAddDriverModal] = useState<boolean>(false);
  const [driverName, setDriverName] = useState<string>('');
  const [driverPhone, setDriverPhone] = useState<string>('');
  const [driverLicense, setDriverLicense] = useState<string>('');

  const [showAddProdModal, setShowAddProdModal] = useState<boolean>(false);
  const [prodName, setProdName] = useState<string>('');
  const [prodCode, setProdCode] = useState<string>('');
  const [prodUnit, setProdUnit] = useState<string>('MT');
  const [prodStock, setProdStock] = useState<number>(500);
  const [prodMinThreshold, setProdMinThreshold] = useState<number>(100);
  const [prodPrice, setProdPrice] = useState<number>(650);
  const [prodDesc, setProdDesc] = useState<string>('');

  const handleSaveCustomer = () => {
    if (!custCompany.trim() || !custName.trim() || !custPhone.trim()) {
      alert('Please enter Company Name, Contact Person, and WhatsApp Phone.');
      return;
    }
    crusherStore.addCustomer({
      name: custName.trim(),
      companyName: custCompany.trim(),
      phone: custPhone.trim(),
      billingAddress: custAddress.trim() || 'Pune, Maharashtra',
      gstNumber: custGst.trim(),
      currentBalance: 0,
    });
    setCustCompany('');
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    setCustGst('');
    setShowAddCustModal(false);
  };

  const handleSaveVehicle = () => {
    if (!vehPlate.trim()) {
      alert('Please enter a vehicle plate number (e.g. MH 12 AB 1234).');
      return;
    }
    crusherStore.addVehicle({
      plateNumber: vehPlate.trim().toUpperCase(),
      vehicleType: vehType,
      defaultTareWeightMt: Number(vehTare) || 10.5,
      maxCapacityMt: Number(vehCap) || 25.0,
      assignedDriverId: vehDriverId || undefined,
    });
    setVehPlate('');
    setVehType('Tipper 10-Wheeler');
    setVehTare(10.5);
    setVehCap(25.0);
    setVehDriverId('');
    setShowAddVehModal(false);
  };

  const handleSaveDriver = () => {
    if (!driverName.trim() || !driverPhone.trim()) {
      alert('Please enter Driver Name and Phone Number.');
      return;
    }
    crusherStore.addDriver({
      name: driverName.trim(),
      phone: driverPhone.trim(),
      licenseNumber: driverLicense.trim() || 'MH12-PENDING',
    });
    setDriverName('');
    setDriverPhone('');
    setDriverLicense('');
    setShowAddDriverModal(false);
  };

  const handleSaveProduct = () => {
    if (!prodName.trim() || !prodCode.trim()) {
      alert('Please enter Product Name and Product Code.');
      return;
    }
    crusherStore.addProduct({
      name: prodName.trim(),
      code: prodCode.trim().toUpperCase(),
      unit: prodUnit,
      currentStockMt: Number(prodStock) || 0,
      minThresholdMt: Number(prodMinThreshold) || 100,
      unitPriceInr: Number(prodPrice) || 650,
      description: prodDesc.trim(),
    });
    setProdName('');
    setProdCode('');
    setProdUnit('MT');
    setProdStock(500);
    setProdMinThreshold(100);
    setProdPrice(650);
    setProdDesc('');
    setShowAddProdModal(false);
  };

  // WhatsApp Filter State
  const [waStatusFilter, setWaStatusFilter] = useState<string>('ALL');
  const [waRecipientFilter, setWaRecipientFilter] = useState<string>('ALL');
  const [waSearchQuery, setWaSearchQuery] = useState<string>('');

  // Calculations
  const incomingVehiclesCount = store.rawMaterialReceipts.length || 12;
  const outgoingVehiclesCount = store.trips.filter((t) => t.status === 'DISPATCHED' || t.status === 'COMPLETED').length || 24;

  const totalMtDispatched = store.trips
    .filter((t) => t.status === 'DISPATCHED' || t.status === 'COMPLETED')
    .reduce((acc, t) => acc + (t.netWeightMt || t.orderedQtyMt), 0);

  const totalRevenueLakhs = Number(
    (
      store.trips
        .filter((t) => t.status === 'DISPATCHED' || t.status === 'COMPLETED')
        .reduce((acc, t) => {
          const prod = store.products.find((p) => p.id === t.productId);
          return acc + (t.netWeightMt || t.orderedQtyMt) * (prod?.unitPriceInr || 680);
        }, 0) / 100000
    ).toFixed(1)
  ) || 39.0;

  const failedMessages = store.whatsappMessages.filter((m) => m.status === 'FAILED');

  // Dynamic Invoice List mapped from live store trips and customers (newest first)
  const invoiceList =
    store.trips.length > 0
      ? [...store.trips].reverse().slice(0, 10).map((t, idx) => {
          const customer = store.customers.find((c) => c.id === t.customerId);
          const product = store.products.find((p) => p.id === t.productId);
          const custName = customer?.companyName || customer?.name || 'ABC Construction Infra Ltd';
          const prodName = product?.name || '20mm Aggregate';
          const qty = t.netWeightMt || t.orderedQtyMt || 20;
          const rate = product?.unitPriceInr || 680;
          const total = Math.round(qty * rate);
          const initials = custName
            .split(' ')
            .map((w) => w[0])
            .filter(Boolean)
            .slice(0, 2)
            .join('')
            .toUpperCase();

          return {
            invoiceNo: t.tripNumber || `TRP-2026-${String(idx + 1).padStart(6, '0')}`,
            customer: custName.toUpperCase(),
            avatar: initials || 'SI',
            product: `${prodName} (${qty} MT)`,
            amount: `₹ ${total.toLocaleString('en-IN')}`,
            date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB') : '12-01-2026',
            status:
              t.status === 'COMPLETED'
                ? 'Completed'
                : t.status === 'DISPATCHED'
                ? 'Dispatched'
                : 'Queued',
          };
        })
      : [
          {
            invoiceNo: 'SI-9301',
            customer: 'ARUN WANKHEDE',
            avatar: 'AW',
            product: '20mm Aggregate (25 MT)',
            amount: '₹ 17,000',
            date: '13-03-2024',
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

          <li
            className={`owner-nav-item ${activeMenu === 'DATABASE' ? 'active' : ''}`}
            onClick={() => setActiveMenu('DATABASE')}
          >
            <div className="owner-nav-left">
              <Database size={16} />
              <span>Database Config</span>
            </div>
            <ChevronRight size={14} />
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
              CRUSHER ERP <span style={{ color: '#94A3B8', margin: '0 4px' }}>&gt;</span>{' '}
              <span style={{ color: '#2563EB', fontWeight: 700 }}>
                {activeMenu === 'DASHBOARD'
                  ? 'Executive Dashboard'
                  : activeMenu === 'TRANSACTION'
                  ? 'Transactions & Weighbridge Slips'
                  : activeMenu === 'MASTERS'
                  ? 'Masters & Directories'
                  : activeMenu === 'PURCHASE'
                  ? 'Purchase & Quarry Inward'
                  : activeMenu === 'SALE'
                  ? 'Sale & Tax Invoices'
                  : activeMenu === 'TRANSPORTER'
                  ? 'Transporter & Fleet Reports'
                  : activeMenu === 'REPORTS'
                  ? 'MIS & Production Reports'
                  : activeMenu === 'STORES'
                  ? 'Stores & Inventory'
                  : activeMenu === 'WHATSAPP'
                  ? 'WhatsApp Center'
                  : 'Database Configuration'}
              </span>
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
              {/* Telemetry & Plant Status Ribbon */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #0F2D4A 0%, #0A1E32 100%)',
                  borderRadius: '10px',
                  padding: '12px 18px',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  border: '1px solid #1E3A5F',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: 'rgba(37, 99, 235, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#60A5FA',
                    }}
                  >
                    <Activity size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.02em', color: '#FFF' }}>
                        CRUSHER PLANT 1 • LIVE TELEMETRY
                      </span>
                      <span
                        style={{
                          background: '#10B981',
                          color: '#FFF',
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: '10px',
                          textTransform: 'uppercase',
                        }}
                      >
                        180 TPH RUNNING
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                      Jaw Crusher: <strong style={{ color: '#E2E8F0' }}>142A Load</strong> • Cone Oil Temp: <strong style={{ color: '#E2E8F0' }}>48°C</strong> • Screen Vibration: <strong style={{ color: '#10B981' }}>Nominal</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#94A3B8', fontSize: '0.68rem', textTransform: 'uppercase' }}>Daily Dispatch Target</div>
                    <div style={{ fontWeight: 800, color: '#38BDF8', fontSize: '0.9rem' }}>
                      {totalMtDispatched.toFixed(0)} MT <span style={{ color: '#64748B', fontWeight: 500 }}>/ 120 MT (62%)</span>
                    </div>
                  </div>
                  <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.1)' }} />
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#94A3B8', fontSize: '0.68rem', textTransform: 'uppercase' }}>Avg Scale Turnaround</div>
                    <div style={{ fontWeight: 800, color: '#10B981', fontSize: '0.9rem' }}>14.2 Mins / Truck</div>
                  </div>
                </div>
              </div>

              {/* Quick Command Action Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  overflowX: 'auto',
                  paddingBottom: '2px',
                }}
              >
                <Link
                  href="/office"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    color: '#FFF',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  <PlusCircle size={13} />
                  <span>Book Dispatch Order</span>
                </Link>

                <Link
                  href="/site"
                  style={{
                    background: '#FFFFFF',
                    color: '#0F172A',
                    border: '1px solid #CBD5E1',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Gauge size={13} color="#2563EB" />
                  <span>Site Weighbridge Terminal</span>
                </Link>

                <button
                  onClick={() => setActiveMenu('TRANSPORTER')}
                  style={{
                    background: '#FFFFFF',
                    color: '#0F172A',
                    border: '1px solid #CBD5E1',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Truck size={13} color="#0284C7" />
                  <span>Transporter Reports</span>
                </button>

                <button
                  onClick={() => setActiveMenu('SALE')}
                  style={{
                    background: '#FFFFFF',
                    color: '#0F172A',
                    border: '1px solid #CBD5E1',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Tag size={13} color="#059669" />
                  <span>Sale & GST Invoices</span>
                </button>

                <button
                  onClick={() => setActiveMenu('PURCHASE')}
                  style={{
                    background: '#FFFFFF',
                    color: '#0F172A',
                    border: '1px solid #CBD5E1',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <ShoppingBag size={13} color="#D97706" />
                  <span>Quarry Inward</span>
                </button>

                <div style={{ height: '24px', width: '1px', background: '#CBD5E1', margin: '0 4px' }} />

                <button
                  onClick={() => setShowAddCustModal(true)}
                  style={{
                    background: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1px solid #BFDBFE',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Users size={13} color="#2563EB" />
                  <span>+ Customer</span>
                </button>

                <button
                  onClick={() => setShowAddVehModal(true)}
                  style={{
                    background: '#F0F9FF',
                    color: '#0369A1',
                    border: '1px solid #BAE6FD',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Truck size={13} color="#0284C7" />
                  <span>+ Vehicle</span>
                </button>

                <button
                  onClick={() => setShowAddDriverModal(true)}
                  style={{
                    background: '#FFFBEB',
                    color: '#B45309',
                    border: '1px solid #FDE68A',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Users size={13} color="#D97706" />
                  <span>+ Driver</span>
                </button>

                <button
                  onClick={() => setShowAddProdModal(true)}
                  style={{
                    background: '#F0FDF4',
                    color: '#15803D',
                    border: '1px solid #BBF7D0',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Layers size={13} color="#16A34A" />
                  <span>+ Product</span>
                </button>

                <button
                  onClick={onOpenWhatsAppSimulator}
                  style={{
                    background: '#DCFCE7',
                    color: '#16A34A',
                    border: '1px solid #86EFAC',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginLeft: 'auto',
                  }}
                >
                  <Send size={13} />
                  <span>WhatsApp Simulator</span>
                </button>
              </div>

              {/* Live Finished Product Yard Silos Stock Bar */}
              <div className="owner-card" style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Live Aggregate Yard Stock & Safety Thresholds
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    Total Yard Assets: <strong style={{ color: '#0F172A' }}>₹ 11.6 Lakhs</strong>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                  {store.products.map((p) => {
                    const isLow = p.currentStockMt <= p.minThresholdMt;
                    const capRatio = Math.min(100, Math.round((p.currentStockMt / (p.minThresholdMt * 4)) * 100));
                    return (
                      <div
                        key={p.id}
                        style={{
                          background: '#F8FAFC',
                          border: isLow ? '1px solid #FCA5A5' : '1px solid #E2E8F0',
                          borderRadius: '8px',
                          padding: '10px 12px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563EB' }}>{p.code}</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isLow ? '#DC2626' : '#16A34A' }}>
                            {isLow ? 'LOW' : 'OK'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isLow ? '#DC2626' : '#0F172A', marginTop: '2px' }}>
                          {p.currentStockMt.toFixed(0)} <span style={{ fontSize: '0.68rem', color: '#64748B' }}>MT</span>
                        </div>
                        <div style={{ marginTop: '6px', height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${capRatio}%`, height: '100%', background: isLow ? '#DC2626' : '#2563EB' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748B', marginTop: '4px' }}>
                          <span>₹{p.unitPriceInr}/T</span>
                          <span>Min {p.minThresholdMt}T</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Truck Dispatch Pipeline Stepper */}
              <div className="owner-card" style={{ padding: '14px 18px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                  Live Plant Dispatch Pipeline (FIFO Status)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    {
                      stage: '1. QUEUED IN YARD',
                      count: store.trips.filter((t) => t.status === 'QUEUED').length,
                      color: '#B45309',
                      bg: '#FEF3C7',
                      trucks: store.trips.filter((t) => t.status === 'QUEUED').map((t) => store.vehicles.find((v) => v.id === t.vehicleId)?.plateNumber).filter(Boolean),
                    },
                    {
                      stage: '2. DISPATCHED FROM SITE',
                      count: store.trips.filter((t) => t.status === 'DISPATCHED').length,
                      color: '#0284C7',
                      bg: '#E0F2FE',
                      trucks: store.trips.filter((t) => t.status === 'DISPATCHED').map((t) => store.vehicles.find((v) => v.id === t.vehicleId)?.plateNumber).filter(Boolean),
                    },
                    {
                      stage: '3. DELIVERED / COMPLETED',
                      count: store.trips.filter((t) => t.status === 'COMPLETED').length,
                      color: '#16A34A',
                      bg: '#DCFCE7',
                      trucks: store.trips.filter((t) => t.status === 'COMPLETED').map((t) => store.vehicles.find((v) => v.id === t.vehicleId)?.plateNumber).filter(Boolean),
                    },
                  ].map((pipe, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: pipe.bg,
                        border: `1px solid ${pipe.color}40`,
                        borderRadius: '8px',
                        padding: '10px 12px',
                      }}
                    >
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: pipe.color, textTransform: 'uppercase' }}>
                        {pipe.stage}
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: pipe.color, marginTop: '2px' }}>
                        {pipe.count} <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Trucks</span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#475569', marginTop: '4px', minHeight: '16px' }}>
                        {pipe.trucks.slice(0, 2).join(', ') || 'No active trucks'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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
          {/* VIEW: TRANSACTIONS / GATE PASSES & WEIGHBRIDGE */}
          {/* ========================================================================= */}
          {activeMenu === 'TRANSACTION' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Weighbridge Transactions & Dispatch Passes
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>
                    Live scale weighings, dual-weight audit verification, issued gate passes, and queue
                  </p>
                </div>
                {/* Sub Tabs */}
                <div style={{ display: 'flex', gap: '8px', background: '#E2E8F0', padding: '4px', borderRadius: '8px' }}>
                  <button
                    onClick={() => setTransactionTab('GATE_PASSES')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: 'none',
                      background: transactionTab === 'GATE_PASSES' ? '#FFFFFF' : 'transparent',
                      color: transactionTab === 'GATE_PASSES' ? '#2563EB' : '#64748B',
                      cursor: 'pointer',
                      boxShadow: transactionTab === 'GATE_PASSES' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Gate Passes ({store.gatePasses.length})
                  </button>
                  <button
                    onClick={() => setTransactionTab('WEIGHBRIDGE_SLIPS')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: 'none',
                      background: transactionTab === 'WEIGHBRIDGE_SLIPS' ? '#FFFFFF' : 'transparent',
                      color: transactionTab === 'WEIGHBRIDGE_SLIPS' ? '#2563EB' : '#64748B',
                      cursor: 'pointer',
                      boxShadow: transactionTab === 'WEIGHBRIDGE_SLIPS' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Scale Slips ({store.weighbridgeTransactions.length})
                  </button>
                  <button
                    onClick={() => setTransactionTab('LIVE_TRIPS')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: 'none',
                      background: transactionTab === 'LIVE_TRIPS' ? '#FFFFFF' : 'transparent',
                      color: transactionTab === 'LIVE_TRIPS' ? '#2563EB' : '#64748B',
                      cursor: 'pointer',
                      boxShadow: transactionTab === 'LIVE_TRIPS' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Dispatch Queue ({store.trips.length})
                  </button>
                </div>
              </div>

              {transactionTab === 'GATE_PASSES' && (
                <div className="owner-card">
                  <div className="owner-card-title">Official Dispatched Gate Passes (QR & Weighbridge Verified)</div>
                  <table className="owner-table">
                    <thead>
                      <tr>
                        <th>GATE PASS NO.</th>
                        <th>CUSTOMER</th>
                        <th>VEHICLE NO.</th>
                        <th>MATERIAL</th>
                        <th>NET DISPATCH</th>
                        <th>DESTINATION</th>
                        <th>ISSUED BY</th>
                        <th>SLIP ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {store.gatePasses.map((gp) => (
                        <tr key={gp.id}>
                          <td style={{ fontWeight: 800, color: '#2563EB' }}>{gp.gatePassNumber}</td>
                          <td style={{ fontWeight: 600 }}>{gp.customerName}</td>
                          <td style={{ fontWeight: 700, color: '#0284C7' }}>{gp.vehiclePlate}</td>
                          <td>
                            <span className="owner-pill-badge owner-pill-cyan">{gp.productName}</span>
                          </td>
                          <td style={{ fontWeight: 800, color: '#16A34A', fontSize: '0.85rem' }}>{gp.netWeightMt} MT</td>
                          <td style={{ color: '#64748B' }}>{gp.destination}</td>
                          <td style={{ color: '#64748B', fontSize: '0.75rem' }}>{gp.issuedBy}</td>
                          <td>
                            <button
                              onClick={() => onViewGatePass(gp.id)}
                              style={{
                                background: '#2563EB',
                                color: '#FFF',
                                border: 'none',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
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

              {transactionTab === 'WEIGHBRIDGE_SLIPS' && (
                <div className="owner-card">
                  <div className="owner-card-title">Live Weighbridge Scale Readouts & Slip Register</div>
                  <table className="owner-table">
                    <thead>
                      <tr>
                        <th>SLIP NUMBER</th>
                        <th>VEHICLE PLATE</th>
                        <th>TARE WEIGHT</th>
                        <th>TARE TIME</th>
                        <th>GROSS WEIGHT</th>
                        <th>NET WEIGHT</th>
                        <th>SCALE OPERATOR</th>
                        <th>VERIFICATION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {store.weighbridgeTransactions.map((wt) => (
                        <tr key={wt.id}>
                          <td style={{ fontWeight: 800, color: '#2563EB' }}>{wt.slipNumber}</td>
                          <td style={{ fontWeight: 700, color: '#0284C7' }}>{wt.vehiclePlate}</td>
                          <td style={{ color: '#64748B' }}>{wt.tareWeightMt} MT</td>
                          <td style={{ color: '#64748B', fontSize: '0.75rem' }}>
                            {wt.tareTimestamp ? new Date(wt.tareTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:15 AM'}
                          </td>
                          <td style={{ fontWeight: 600 }}>{wt.grossWeightMt ? `${wt.grossWeightMt} MT` : '-'}</td>
                          <td style={{ fontWeight: 800, color: '#16A34A', fontSize: '0.85rem' }}>
                            {wt.netWeightMt ? `${wt.netWeightMt} MT` : '-'}
                          </td>
                          <td style={{ color: '#475569', fontSize: '0.75rem' }}>{wt.operatorName}</td>
                          <td>
                            {wt.isVerified ? (
                              <span className="owner-pill-badge owner-pill-green">VERIFIED</span>
                            ) : (
                              <span className="owner-pill-badge owner-pill-cyan">PENDING SCALE</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {transactionTab === 'LIVE_TRIPS' && (
                <div className="owner-card">
                  <div className="owner-card-title">Master Trip Lifecycle & Plant Dispatch Pipeline</div>
                  <table className="owner-table">
                    <thead>
                      <tr>
                        <th>TRIP #</th>
                        <th>CUSTOMER</th>
                        <th>MATERIAL</th>
                        <th>ORDERED QTY</th>
                        <th>VEHICLE</th>
                        <th>DESTINATION</th>
                        <th>STATUS</th>
                        <th>REQ. DATE</th>
                        <th>BOOKED</th>
                      </tr>
                    </thead>
                    <tbody>
                      {store.trips.map((t) => {
                        const cust = store.customers.find((c) => c.id === t.customerId);
                        const prod = store.products.find((p) => p.id === t.productId);
                        const veh = store.vehicles.find((v) => v.id === t.vehicleId);
                        return (
                          <tr key={t.id}>
                            <td style={{ fontWeight: 800, color: '#2563EB' }}>{t.tripNumber}</td>
                            <td style={{ fontWeight: 600 }}>{cust?.companyName || 'ABC Construction Infra Ltd'}</td>
                            <td>
                              <span className="owner-pill-badge owner-pill-cyan">{prod?.name || '20mm Aggregate'}</span>
                            </td>
                            <td style={{ fontWeight: 700, color: '#0F172A' }}>{t.orderedQtyMt} MT</td>
                            <td style={{ fontWeight: 700, color: '#0284C7' }}>{veh?.plateNumber || 'MH-12-RN-4821'}</td>
                            <td style={{ color: '#64748B', fontSize: '0.75rem' }}>{t.destination}</td>
                            <td>
                              <span
                                className={`owner-pill-badge ${
                                  t.status === 'COMPLETED'
                                    ? 'owner-pill-green'
                                    : t.status === 'DISPATCHED'
                                    ? 'owner-pill-cyan'
                                    : 'owner-pill-amber'
                                }`}
                              >
                                {t.status}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1E293B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                                📅 {t.requiredDate || 'Immediate'}
                              </span>
                            </td>
                            <td style={{ color: '#64748B', fontSize: '0.74rem' }}>
                              {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB') : 'Today'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: MASTERS / DIRECTORIES */}
          {/* ========================================================================= */}
          {activeMenu === 'MASTERS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Plant Master Data & Directories
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>
                    Customer accounts, vehicle fleet, licensed drivers, and aggregate product pricing
                  </p>
                </div>
                {/* Sub Tabs */}
                <div style={{ display: 'flex', gap: '8px', background: '#E2E8F0', padding: '4px', borderRadius: '8px' }}>
                  <button
                    onClick={() => setMastersTab('CUSTOMERS')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: 'none',
                      background: mastersTab === 'CUSTOMERS' ? '#FFFFFF' : 'transparent',
                      color: mastersTab === 'CUSTOMERS' ? '#2563EB' : '#64748B',
                      cursor: 'pointer',
                      boxShadow: mastersTab === 'CUSTOMERS' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Customers ({store.customers.length})
                  </button>
                  <button
                    onClick={() => setMastersTab('VEHICLES')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: 'none',
                      background: mastersTab === 'VEHICLES' ? '#FFFFFF' : 'transparent',
                      color: mastersTab === 'VEHICLES' ? '#2563EB' : '#64748B',
                      cursor: 'pointer',
                      boxShadow: mastersTab === 'VEHICLES' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Vehicles ({store.vehicles.length})
                  </button>
                  <button
                    onClick={() => setMastersTab('DRIVERS')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: 'none',
                      background: mastersTab === 'DRIVERS' ? '#FFFFFF' : 'transparent',
                      color: mastersTab === 'DRIVERS' ? '#2563EB' : '#64748B',
                      cursor: 'pointer',
                      boxShadow: mastersTab === 'DRIVERS' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Drivers ({store.drivers.length})
                  </button>
                  <button
                    onClick={() => setMastersTab('PRODUCTS')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: 'none',
                      background: mastersTab === 'PRODUCTS' ? '#FFFFFF' : 'transparent',
                      color: mastersTab === 'PRODUCTS' ? '#2563EB' : '#64748B',
                      cursor: 'pointer',
                      boxShadow: mastersTab === 'PRODUCTS' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Products ({store.products.length})
                  </button>
                </div>
              </div>

              {mastersTab === 'CUSTOMERS' && (
                <div className="owner-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div className="owner-card-title" style={{ margin: 0 }}>Customer Master Directory (WhatsApp & Invoicing)</div>
                    <button
                      onClick={() => setShowAddCustModal(true)}
                      className="owner-btn-primary"
                      style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <PlusCircle size={14} /> + Add Customer
                    </button>
                  </div>
                  <table className="owner-table">
                    <thead>
                      <tr>
                        <th>COMPANY / CLIENT NAME</th>
                        <th>PRIMARY CONTACT</th>
                        <th>PHONE NUMBER</th>
                        <th>GSTIN</th>
                        <th>BILLING ADDRESS</th>
                        <th>CURRENT BALANCE</th>
                        <th>STATUS</th>
                        <th style={{ textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {store.customers.map((c) => (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 700, color: '#0F172A' }}>{c.companyName}</td>
                          <td style={{ fontWeight: 600 }}>{c.name}</td>
                          <td style={{ color: '#2563EB', fontSize: '0.75rem' }}>📱 {c.phone}</td>
                          <td style={{ color: '#64748B', fontSize: '0.75rem' }}>{c.gstNumber || '-'}</td>
                          <td style={{ color: '#64748B', fontSize: '0.75rem', maxWidth: '240px' }}>{c.billingAddress}</td>
                          <td style={{ fontWeight: 800, color: c.currentBalance > 40000 ? '#DC2626' : '#16A34A' }}>
                            ₹ {c.currentBalance.toLocaleString('en-IN')}
                          </td>
                          <td>
                            <span className="owner-pill-badge owner-pill-green">ACTIVE</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => setEditingCustomer(c)}
                                style={{
                                  background: '#EFF6FF',
                                  color: '#2563EB',
                                  border: '1px solid #BFDBFE',
                                  padding: '4px 8px',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                }}
                                title="Edit Customer"
                              >
                                <Edit size={12} /> Edit
                              </button>
                              <button
                                onClick={() => setItemToDelete({ type: 'CUSTOMER', id: c.id, name: c.companyName })}
                                style={{
                                  background: '#FEF2F2',
                                  color: '#DC2626',
                                  border: '1px solid #FECACA',
                                  padding: '4px 8px',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                }}
                                title="Delete Customer"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {mastersTab === 'VEHICLES' && (
                <div className="owner-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div className="owner-card-title" style={{ margin: 0 }}>Commercial Vehicle & Fleet Master</div>
                    <button
                      onClick={() => setShowAddVehModal(true)}
                      className="owner-btn-primary"
                      style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <PlusCircle size={14} /> + Add Vehicle
                    </button>
                  </div>
                  <table className="owner-table">
                    <thead>
                      <tr>
                        <th>PLATE NUMBER</th>
                        <th>VEHICLE TYPE</th>
                        <th>REGISTERED TARE</th>
                        <th>MAX CAPACITY</th>
                        <th>ASSIGNED DRIVER</th>
                        <th>STATUS</th>
                        <th style={{ textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {store.vehicles.map((v) => {
                        const driver = store.drivers.find((d) => d.id === v.assignedDriverId);
                        return (
                          <tr key={v.id}>
                            <td style={{ fontWeight: 800, color: '#0284C7' }}>{v.plateNumber}</td>
                            <td style={{ fontWeight: 600 }}>{v.vehicleType}</td>
                            <td style={{ fontWeight: 700, color: '#475569' }}>{v.defaultTareWeightMt} MT</td>
                            <td style={{ fontWeight: 700, color: '#475569' }}>{v.maxCapacityMt} MT</td>
                            <td style={{ fontWeight: 600 }}>
                              {driver ? `${driver.name} (${driver.phone})` : <span style={{ color: '#94A3B8' }}>Unassigned</span>}
                            </td>
                            <td>
                              <span className="owner-pill-badge owner-pill-green">REGISTERED</span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => setEditingVehicle(v)}
                                  style={{
                                    background: '#EFF6FF',
                                    color: '#2563EB',
                                    border: '1px solid #BFDBFE',
                                    padding: '4px 8px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                  }}
                                  title="Edit Vehicle"
                                >
                                  <Edit size={12} /> Edit
                                </button>
                                <button
                                  onClick={() => setItemToDelete({ type: 'VEHICLE', id: v.id, name: v.plateNumber })}
                                  style={{
                                    background: '#FEF2F2',
                                    color: '#DC2626',
                                    border: '1px solid #FECACA',
                                    padding: '4px 8px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                  }}
                                  title="Delete Vehicle"
                                >
                                  <Trash2 size={12} /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {mastersTab === 'DRIVERS' && (
                <div className="owner-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div className="owner-card-title" style={{ margin: 0 }}>Driver Master Directory</div>
                    <button
                      onClick={() => setShowAddDriverModal(true)}
                      className="owner-btn-primary"
                      style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <PlusCircle size={14} /> + Add Driver
                    </button>
                  </div>
                  <table className="owner-table">
                    <thead>
                      <tr>
                        <th>DRIVER NAME</th>
                        <th>PHONE NUMBER</th>
                        <th>COMMERCIAL LICENSE NO.</th>
                        <th>STATUS</th>
                        <th style={{ textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {store.drivers.map((d) => (
                        <tr key={d.id}>
                          <td style={{ fontWeight: 700, color: '#0F172A' }}>{d.name}</td>
                          <td style={{ color: '#2563EB', fontSize: '0.75rem' }}>📱 {d.phone}</td>
                          <td style={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem' }}>{d.licenseNumber}</td>
                          <td>
                            <span className="owner-pill-badge owner-pill-green">LICENSED</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => setEditingDriver(d)}
                                style={{
                                  background: '#EFF6FF',
                                  color: '#2563EB',
                                  border: '1px solid #BFDBFE',
                                  padding: '4px 8px',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                }}
                                title="Edit Driver"
                              >
                                <Edit size={12} /> Edit
                              </button>
                              <button
                                onClick={() => setItemToDelete({ type: 'DRIVER', id: d.id, name: d.name })}
                                style={{
                                  background: '#FEF2F2',
                                  color: '#DC2626',
                                  border: '1px solid #FECACA',
                                  padding: '4px 8px',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                }}
                                title="Delete Driver"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {mastersTab === 'PRODUCTS' && (
                <div className="owner-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div className="owner-card-title" style={{ margin: 0 }}>Product Catalog & Base Ex-Plant Rates</div>
                    <button
                      onClick={() => setShowAddProdModal(true)}
                      className="owner-btn-primary"
                      style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <PlusCircle size={14} /> + Add Product
                    </button>
                  </div>
                  <table className="owner-table">
                    <thead>
                      <tr>
                        <th>CODE</th>
                        <th>PRODUCT NAME</th>
                        <th>MEASUREMENT UNIT</th>
                        <th>CURRENT YARD STOCK</th>
                        <th>MIN SAFETY THRESHOLD</th>
                        <th>EX-PLANT RATE (INR)</th>
                        <th style={{ textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {store.products.map((p) => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 800, color: '#2563EB' }}>{p.code}</td>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td style={{ color: '#64748B' }}>{p.unit}</td>
                          <td style={{ fontWeight: 800, color: '#16A34A' }}>{p.currentStockMt.toFixed(1)} MT</td>
                          <td style={{ color: '#64748B' }}>{p.minThresholdMt} MT</td>
                          <td style={{ fontWeight: 700, color: '#0F172A' }}>₹ {p.unitPriceInr} / MT</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => setEditingProduct(p)}
                                style={{
                                  background: '#EFF6FF',
                                  color: '#2563EB',
                                  border: '1px solid #BFDBFE',
                                  padding: '4px 8px',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                }}
                                title="Edit Product"
                              >
                                <Edit size={12} /> Edit
                              </button>
                              <button
                                onClick={() => setItemToDelete({ type: 'PRODUCT', id: p.id, name: p.name })}
                                style={{
                                  background: '#FEF2F2',
                                  color: '#DC2626',
                                  border: '1px solid #FECACA',
                                  padding: '4px 8px',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                }}
                                title="Delete Product"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: PURCHASE / QUARRY RAW MATERIAL INWARD */}
          {/* ========================================================================= */}
          {activeMenu === 'PURCHASE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header & Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Purchase & Quarry Raw Material Inward
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>
                    Quarry boulder inward vouchers, supplier brass volume tally, rates, and supplier payables
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      const csvRows = [
                        ['Voucher No', 'Supplier', 'Raw Material', 'Vehicle Plate', 'Quantity (Brass)', 'Rate / Brass (INR)', 'Total Amount (INR)', 'Received By', 'Time'].join(','),
                        ...store.rawMaterialReceipts.map((r) =>
                          [
                            r.receiptNumber,
                            r.supplierName,
                            r.rawMaterialName,
                            r.vehicleNumber,
                            r.quantityBrass,
                            r.ratePerBrass,
                            r.totalAmount,
                            r.receivedBy,
                            r.inwardTime,
                          ].join(',')
                        ),
                      ].join('\n');
                      const blob = new Blob([csvRows], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `quarry_purchase_report_${new Date().toISOString().slice(0, 10)}.csv`;
                      a.click();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '7px 14px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={14} /> Export Purchase CSV
                  </button>
                </div>
              </div>

              {/* 4 Summary KPI Tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                <div className="owner-card" style={{ padding: '14px 18px', background: '#FFFFFF' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Total Inward Volume</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                    {store.rawMaterialReceipts.reduce((acc, r) => acc + r.quantityBrass, 0).toFixed(1)} Brass
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#0284C7', marginTop: '4px' }}>
                    ≈ {(store.rawMaterialReceipts.reduce((acc, r) => acc + r.quantityBrass, 0) * 4.2).toFixed(1)} MT Boulder Feed
                  </div>
                </div>

                <div className="owner-card" style={{ padding: '14px 18px', background: '#FFFFFF' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Procurement Spend</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
                    ₹ {store.rawMaterialReceipts.reduce((acc, r) => acc + r.totalAmount, 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                    Across {store.rawMaterialReceipts.length} Inward Vouchers
                  </div>
                </div>

                <div className="owner-card" style={{ padding: '14px 18px', background: '#FFFFFF' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Active Quarry Suppliers</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                    {store.suppliers.length} Partners
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#16A34A', marginTop: '4px' }}>Sahyadri & Omkar Quarry</div>
                </div>

                <div className="owner-card" style={{ padding: '14px 18px', background: '#FFFFFF' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Average Boulder Rate</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
                    ₹ {Math.round(store.rawMaterialReceipts.reduce((acc, r) => acc + r.ratePerBrass, 0) / (store.rawMaterialReceipts.length || 1))}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>per Brass (Ex-Quarry Pit)</div>
                </div>
              </div>

              {/* Raw Material Inward Receipts Table */}
              <div className="owner-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div className="owner-card-title" style={{ margin: 0 }}>Quarry Boulder Inward Vouchers Register</div>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94A3B8' }} />
                    <input
                      type="text"
                      placeholder="Search voucher, supplier, vehicle..."
                      value={purchaseSearch}
                      onChange={(e) => setPurchaseSearch(e.target.value)}
                      style={{
                        padding: '6px 12px 6px 30px',
                        fontSize: '0.78rem',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        width: '240px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <table className="owner-table">
                  <thead>
                    <tr>
                      <th>VOUCHER NUMBER</th>
                      <th>INWARD DATE & TIME</th>
                      <th>SUPPLIER NAME</th>
                      <th>MATERIAL DESCRIPTION</th>
                      <th>VEHICLE PLATE</th>
                      <th>QUANTITY (BRASS)</th>
                      <th>RATE / BRASS</th>
                      <th>TOTAL AMOUNT</th>
                      <th>RECEIVED BY</th>
                      <th>VOUCHER ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.rawMaterialReceipts
                      .filter((r) => {
                        const query = purchaseSearch.toLowerCase();
                        return (
                          r.receiptNumber.toLowerCase().includes(query) ||
                          r.supplierName.toLowerCase().includes(query) ||
                          r.vehicleNumber.toLowerCase().includes(query)
                        );
                      })
                      .map((r) => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 800, color: '#2563EB' }}>{r.receiptNumber}</td>
                          <td style={{ color: '#64748B', fontSize: '0.74rem' }}>
                            {r.inwardTime ? new Date(r.inwardTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '12-09-2026 09:15 AM'}
                          </td>
                          <td style={{ fontWeight: 700, color: '#0F172A' }}>{r.supplierName}</td>
                          <td>
                            <span className="owner-pill-badge owner-pill-cyan">{r.rawMaterialName}</span>
                          </td>
                          <td style={{ fontWeight: 700, color: '#0284C7' }}>{r.vehicleNumber}</td>
                          <td style={{ fontWeight: 800, color: '#16A34A', fontSize: '0.85rem' }}>{r.quantityBrass} Brass</td>
                          <td style={{ color: '#475569', fontWeight: 600 }}>₹ {r.ratePerBrass.toLocaleString('en-IN')}</td>
                          <td style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem' }}>
                            ₹ {r.totalAmount.toLocaleString('en-IN')}
                          </td>
                          <td style={{ color: '#64748B', fontSize: '0.75rem' }}>{r.receivedBy}</td>
                          <td>
                            <button
                              onClick={() => onViewReceipt(r.id)}
                              style={{
                                background: '#2563EB',
                                color: '#FFF',
                                border: 'none',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              View Voucher
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Quarry Suppliers Accounts & Payables Ledger */}
              <div className="owner-card">
                <div className="owner-card-title">Quarry Mining Suppliers & Payables Ledger</div>
                <table className="owner-table">
                  <thead>
                    <tr>
                      <th>SUPPLIER NAME</th>
                      <th>CONTACT PERSON</th>
                      <th>PHONE</th>
                      <th>SUPPLIER TYPE</th>
                      <th>BALANCE PAYABLE (INR)</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.suppliers.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 700, color: '#0F172A' }}>{s.name}</td>
                        <td style={{ fontWeight: 600 }}>{s.contactPerson}</td>
                        <td style={{ color: '#2563EB', fontSize: '0.75rem' }}>📱 {s.phone}</td>
                        <td>
                          <span className="owner-pill-badge owner-pill-cyan">{s.supplierType}</span>
                        </td>
                        <td style={{ fontWeight: 800, color: '#DC2626', fontSize: '0.85rem' }}>
                          ₹ {s.balancePayable.toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span className="owner-pill-badge owner-pill-green">ACTIVE SUPPLIER</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: SALE / GST TAX INVOICES */}
          {/* ========================================================================= */}
          {activeMenu === 'SALE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header & Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Sale & GST Tax Invoicing Register
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>
                    Customer tax invoices, GST breakdowns, dispatches, outstanding receivables, and automated WhatsApp delivery
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      const csvRows = [
                        ['Invoice No', 'Customer Name', 'GSTIN', 'Vehicle No', 'Product', 'Quantity (MT)', 'Rate (INR)', 'Taxable (INR)', 'GST 5% (INR)', 'Total (INR)', 'Status'].join(','),
                        ...store.trips.map((t, idx) => {
                          const customer = store.customers.find((c) => c.id === t.customerId);
                          const product = store.products.find((p) => p.id === t.productId);
                          const vehicle = store.vehicles.find((v) => v.id === t.vehicleId);
                          const qty = t.netWeightMt || t.orderedQtyMt || 20;
                          const rate = product?.unitPriceInr || 680;
                          const subtotal = Math.round(qty * rate);
                          const gst = Math.round(subtotal * 0.05);
                          const total = subtotal + gst;
                          return [
                            `SI-93${String(10 - idx).padStart(2, '0')}`,
                            customer?.companyName || 'ABC Construction',
                            customer?.gstNumber || '27AABCA1234F1Z8',
                            vehicle?.plateNumber || 'MH-12-RN-4821',
                            product?.name || '20mm Aggregate',
                            qty,
                            rate,
                            subtotal,
                            gst,
                            total,
                            t.status === 'DISPATCHED' ? 'Paid' : 'Pending',
                          ].join(',');
                        }),
                      ].join('\n');
                      const blob = new Blob([csvRows], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `sales_invoices_report_${new Date().toISOString().slice(0, 10)}.csv`;
                      a.click();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '7px 14px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={14} /> Export Sales CSV
                  </button>
                </div>
              </div>

              {/* 4 Summary KPI Tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                <div className="owner-card" style={{ padding: '14px 18px', background: '#FFFFFF' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Gross Invoiced Sales</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                    ₹ {Math.round(store.trips.reduce((acc, t) => acc + (t.netWeightMt || t.orderedQtyMt) * 680 * 1.05, 0)).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#16A34A', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={12} /> Including 5% GST on Aggregate
                  </div>
                </div>

                <div className="owner-card" style={{ padding: '14px 18px', background: '#FFFFFF' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Total Dispatched Tonnage</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>
                    {store.trips.reduce((acc, t) => acc + (t.netWeightMt || t.orderedQtyMt), 0).toFixed(1)} MT
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                    Across {store.trips.length} Invoiced Trips
                  </div>
                </div>

                <div className="owner-card" style={{ padding: '14px 18px', background: '#FFFFFF' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Customer Accounts</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                    {store.customers.length} Accounts
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#0284C7', marginTop: '4px' }}>All Verified GSTINs</div>
                </div>

                <div className="owner-card" style={{ padding: '14px 18px', background: '#FFFFFF' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Outstanding Receivables</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
                    ₹ {store.customers.reduce((acc, c) => acc + c.currentBalance, 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>Across Active Clients</div>
                </div>
              </div>

              {/* Master Tax Invoice Register Table */}
              <div className="owner-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div className="owner-card-title" style={{ margin: 0 }}>GST Sales Invoice & Dispatch Ledger</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94A3B8' }} />
                      <input
                        type="text"
                        placeholder="Search customer, invoice, vehicle..."
                        value={saleSearch}
                        onChange={(e) => setSaleSearch(e.target.value)}
                        style={{
                          padding: '6px 12px 6px 30px',
                          fontSize: '0.78rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '6px',
                          width: '240px',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <select
                      value={saleStatusFilter}
                      onChange={(e) => setSaleStatusFilter(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        fontSize: '0.78rem',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        background: '#FFF',
                        color: '#334155',
                        outline: 'none',
                      }}
                    >
                      <option value="ALL">All Invoice Statuses</option>
                      <option value="PAID">Dispatched & Paid</option>
                      <option value="PENDING">Pending Scale / In-Process</option>
                    </select>
                  </div>
                </div>

                <table className="owner-table">
                  <thead>
                    <tr>
                      <th>INVOICE NO</th>
                      <th>DATE</th>
                      <th>CUSTOMER / GSTIN</th>
                      <th>VEHICLE NO</th>
                      <th>PRODUCT DISPATCHED</th>
                      <th>DISPATCH (MT)</th>
                      <th>RATE (₹/MT)</th>
                      <th>TAXABLE (₹)</th>
                      <th>GST 5% (₹)</th>
                      <th>TOTAL AMOUNT</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.trips
                      .filter((t, idx) => {
                        const customer = store.customers.find((c) => c.id === t.customerId);
                        const vehicle = store.vehicles.find((v) => v.id === t.vehicleId);
                        const invNo = `SI-93${String(10 - idx).padStart(2, '0')}`;
                        const query = saleSearch.toLowerCase();
                        const matchesSearch =
                          invNo.toLowerCase().includes(query) ||
                          (customer?.companyName || '').toLowerCase().includes(query) ||
                          (vehicle?.plateNumber || '').toLowerCase().includes(query);
                        const isPaid = t.status === 'DISPATCHED' || t.status === 'COMPLETED';
                        const matchesStatus =
                          saleStatusFilter === 'ALL' ||
                          (saleStatusFilter === 'PAID' && isPaid) ||
                          (saleStatusFilter === 'PENDING' && !isPaid);
                        return matchesSearch && matchesStatus;
                      })
                      .map((t, idx) => {
                        const customer = store.customers.find((c) => c.id === t.customerId);
                        const product = store.products.find((p) => p.id === t.productId);
                        const vehicle = store.vehicles.find((v) => v.id === t.vehicleId);
                        const invNo = `SI-93${String(10 - idx).padStart(2, '0')}`;
                        const qty = t.netWeightMt || t.orderedQtyMt || 20;
                        const rate = product?.unitPriceInr || 680;
                        const subtotal = Math.round(qty * rate);
                        const gst = Math.round(subtotal * 0.05);
                        const total = subtotal + gst;
                        const isPaid = t.status === 'DISPATCHED' || t.status === 'COMPLETED';

                        return (
                          <tr key={t.id}>
                            <td style={{ fontWeight: 800, color: '#2563EB' }}>{invNo}</td>
                            <td style={{ color: '#64748B', fontSize: '0.74rem' }}>
                              {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB') : '12-09-2026'}
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: '#0F172A' }}>{customer?.companyName || 'ABC Construction Infra Ltd'}</div>
                              <div style={{ fontSize: '0.7rem', color: '#64748B' }}>GSTIN: {customer?.gstNumber || '27AABCA1234F1Z8'}</div>
                            </td>
                            <td style={{ fontWeight: 700, color: '#0284C7' }}>{vehicle?.plateNumber || 'MH-12-RN-4821'}</td>
                            <td>
                              <span className="owner-pill-badge owner-pill-cyan">{product?.name || '20mm Aggregate'}</span>
                            </td>
                            <td style={{ fontWeight: 800, color: '#16A34A', fontSize: '0.85rem' }}>{qty.toFixed(1)} MT</td>
                            <td style={{ color: '#475569', fontWeight: 600 }}>₹ {rate}</td>
                            <td style={{ color: '#475569' }}>₹ {subtotal.toLocaleString('en-IN')}</td>
                            <td style={{ color: '#64748B', fontSize: '0.75rem' }}>₹ {gst.toLocaleString('en-IN')}</td>
                            <td style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem' }}>
                              ₹ {total.toLocaleString('en-IN')}
                            </td>
                            <td>
                              {isPaid ? (
                                <span className="owner-pill-badge owner-pill-green">PAID</span>
                              ) : (
                                <span className="owner-pill-badge owner-pill-cyan">{t.status}</span>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  onClick={() => {
                                    const gp = store.gatePasses.find((g) => g.tripId === t.id) || store.gatePasses[0];
                                    if (gp) onViewGatePass(gp.id);
                                  }}
                                  style={{
                                    background: '#F1F5F9',
                                    border: '1px solid #CBD5E1',
                                    color: '#2563EB',
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Invoice
                                </button>
                                <button
                                  onClick={onOpenWhatsAppSimulator}
                                  title="Resend WhatsApp invoice slip"
                                  style={{
                                    background: '#DCFCE7',
                                    border: '1px solid #86EFAC',
                                    color: '#16A34A',
                                    padding: '3px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.72rem',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Send size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Customer Receivables & Credit Limit Ledger */}
              <div className="owner-card">
                <div className="owner-card-title">Customer Accounts & Receivables Ledger</div>
                <table className="owner-table">
                  <thead>
                    <tr>
                      <th>CLIENT NAME</th>
                      <th>CONTACT PERSON</th>
                      <th>PHONE</th>
                      <th>GST NUMBER</th>
                      <th>BILLING ADDRESS</th>
                      <th>OUTSTANDING RECEIVABLE</th>
                      <th>CREDIT STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.customers.map((c) => {
                      const hasWarning = c.currentBalance > 40000;
                      return (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 700, color: '#0F172A' }}>{c.companyName}</td>
                          <td style={{ fontWeight: 600 }}>{c.name}</td>
                          <td style={{ color: '#2563EB', fontSize: '0.75rem' }}>📱 {c.phone}</td>
                          <td style={{ color: '#64748B', fontSize: '0.75rem' }}>{c.gstNumber || '-'}</td>
                          <td style={{ color: '#64748B', fontSize: '0.75rem', maxWidth: '200px' }}>{c.billingAddress}</td>
                          <td style={{ fontWeight: 800, color: hasWarning ? '#DC2626' : '#16A34A', fontSize: '0.85rem' }}>
                            ₹ {c.currentBalance.toLocaleString('en-IN')}
                          </td>
                          <td>
                            {hasWarning ? (
                              <span className="owner-pill-badge owner-pill-red">CREDIT WATCH</span>
                            ) : (
                              <span className="owner-pill-badge owner-pill-green">HEALTHY</span>
                            )}
                          </td>
                          <td>
                            <button
                              onClick={onOpenWhatsAppSimulator}
                              style={{
                                background: '#F1F5F9',
                                border: '1px solid #CBD5E1',
                                color: '#2563EB',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Send Statement
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: TRANSPORTER REPORTS */}
          {/* ========================================================================= */}
          {activeMenu === 'TRANSPORTER' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header & Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Transporter & Fleet Logistics Reports
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>
                    Fleet vehicle metrics, driver allocations, tare calibration verification, and trip freight payables
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      const csvRows = [
                        ['Plate Number', 'Vehicle Type', 'Driver', 'Tare Weight (MT)', 'Max Capacity (MT)', 'Trips Completed', 'Total MT Hauled', 'Freight Payable (INR)'].join(','),
                        ...store.vehicles.map((v) => {
                          const driver = store.drivers.find((d) => d.id === v.assignedDriverId);
                          const vehicleTrips = store.trips.filter((t) => t.vehicleId === v.id);
                          const totalMt = vehicleTrips.reduce((acc, t) => acc + (t.netWeightMt || 0), 0);
                          return [
                            v.plateNumber,
                            v.vehicleType,
                            driver?.name || 'Unassigned',
                            v.defaultTareWeightMt,
                            v.maxCapacityMt,
                            vehicleTrips.length,
                            totalMt.toFixed(1),
                            Math.round(totalMt * 280),
                          ].join(',');
                        }),
                      ].join('\n');
                      const blob = new Blob([csvRows], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `transporter_fleet_report_${new Date().toISOString().slice(0, 10)}.csv`;
                      a.click();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '7px 14px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={14} /> Export Fleet CSV
                  </button>
                </div>
              </div>

              {/* 4 Summary KPI Tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                <div className="owner-card" style={{ padding: '14px 18px', background: '#FFFFFF' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Registered Vehicles</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{store.vehicles.length}</div>
                  <div style={{ fontSize: '0.72rem', color: '#0284C7', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Truck size={12} /> {store.vehicles.filter((v) => v.assignedDriverId).length} Active with Drivers
                  </div>
                </div>

                <div className="owner-card" style={{ padding: '14px 18px', background: '#FFFFFF' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Total Dispatched Trips</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>{store.trips.length}</div>
                  <div style={{ fontSize: '0.72rem', color: '#16A34A', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={12} /> {store.trips.filter((t) => t.status === 'DISPATCHED' || t.status === 'COMPLETED').length} Completed Dispatches
                  </div>
                </div>

                <div className="owner-card" style={{ padding: '14px 18px', background: '#FFFFFF' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Total Tonnage Hauled</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                    {store.trips.reduce((acc, t) => acc + (t.netWeightMt || 0), 0).toFixed(1)} MT
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                    Avg {(store.trips.reduce((acc, t) => acc + (t.netWeightMt || 0), 0) / (store.trips.length || 1)).toFixed(1)} MT / trip
                  </div>
                </div>

                <div className="owner-card" style={{ padding: '14px 18px', background: '#FFFFFF' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Gross Freight Payables</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
                    ₹ {Math.round(store.trips.reduce((acc, t) => acc + (t.netWeightMt || 0), 0) * 280).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>Rate avg ₹280 / MT</div>
                </div>
              </div>

              {/* Vehicle Fleet Master & Performance Table */}
              <div className="owner-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div className="owner-card-title" style={{ margin: 0 }}>Fleet Vehicle Performance & Tare Calibration Status</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94A3B8' }} />
                      <input
                        type="text"
                        placeholder="Search vehicle or driver..."
                        value={transporterSearch}
                        onChange={(e) => setTransporterSearch(e.target.value)}
                        style={{
                          padding: '6px 12px 6px 30px',
                          fontSize: '0.78rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '6px',
                          width: '210px',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <select
                      value={transporterTypeFilter}
                      onChange={(e) => setTransporterTypeFilter(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        fontSize: '0.78rem',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        background: '#FFF',
                        color: '#334155',
                        outline: 'none',
                      }}
                    >
                      <option value="ALL">All Vehicle Types</option>
                      <option value="10-Tyre Tipper">10-Tyre Tipper</option>
                      <option value="12-Tyre Hyva">12-Tyre Hyva</option>
                      <option value="6-Tyre Dumper">6-Tyre Dumper</option>
                      <option value="14-Tyre Trailer">14-Tyre Trailer</option>
                    </select>
                  </div>
                </div>

                <table className="owner-table">
                  <thead>
                    <tr>
                      <th>VEHICLE PLATE</th>
                      <th>VEHICLE TYPE</th>
                      <th>ASSIGNED DRIVER</th>
                      <th>DRIVER CONTACT</th>
                      <th>DEFAULT TARE</th>
                      <th>MAX CAPACITY</th>
                      <th>TRIPS LOGGED</th>
                      <th>TOTAL MT HAULED</th>
                      <th>EST. FREIGHT PAYABLE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.vehicles
                      .filter((v) => {
                        const driver = store.drivers.find((d) => d.id === v.assignedDriverId);
                        const matchesSearch =
                          v.plateNumber.toLowerCase().includes(transporterSearch.toLowerCase()) ||
                          (driver?.name || '').toLowerCase().includes(transporterSearch.toLowerCase());
                        const matchesType = transporterTypeFilter === 'ALL' || v.vehicleType === transporterTypeFilter;
                        return matchesSearch && matchesType;
                      })
                      .map((v) => {
                        const driver = store.drivers.find((d) => d.id === v.assignedDriverId);
                        const vehicleTrips = store.trips.filter((t) => t.vehicleId === v.id);
                        const totalMt = vehicleTrips.reduce((acc, t) => acc + (t.netWeightMt || 0), 0);
                        const freightPayable = Math.round(totalMt * 280);

                        return (
                          <tr key={v.id}>
                            <td style={{ fontWeight: 800, color: '#0284C7' }}>{v.plateNumber}</td>
                            <td>
                              <span style={{ fontWeight: 600, color: '#334155' }}>{v.vehicleType}</span>
                            </td>
                            <td style={{ fontWeight: 600 }}>{driver ? driver.name : <span style={{ color: '#94A3B8' }}>Unassigned</span>}</td>
                            <td style={{ color: '#64748B', fontSize: '0.75rem' }}>{driver ? driver.phone : '-'}</td>
                            <td style={{ fontWeight: 700, color: '#475569' }}>{v.defaultTareWeightMt} MT</td>
                            <td style={{ fontWeight: 700, color: '#475569' }}>{v.maxCapacityMt} MT</td>
                            <td style={{ fontWeight: 700, textAlign: 'center' }}>
                              <span className="owner-pill-badge owner-pill-cyan">{vehicleTrips.length} Trips</span>
                            </td>
                            <td style={{ fontWeight: 800, color: '#16A34A' }}>{totalMt.toFixed(1)} MT</td>
                            <td style={{ fontWeight: 700, color: '#D97706' }}>₹ {freightPayable.toLocaleString('en-IN')}</td>
                            <td>
                              <span className="owner-pill-badge owner-pill-green">
                                <CheckCircle size={10} style={{ marginRight: '3px' }} /> TARE OK
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Transporter Dispatch Trips Register */}
              <div className="owner-card">
                <div className="owner-card-title">Detailed Trip-Wise Freight Register & Dispatch Log</div>
                <table className="owner-table">
                  <thead>
                    <tr>
                      <th>TRIP / SLIP #</th>
                      <th>DATE & TIME</th>
                      <th>VEHICLE</th>
                      <th>CUSTOMER / DESTINATION</th>
                      <th>MATERIAL</th>
                      <th>TARE WEIGHT</th>
                      <th>GROSS WEIGHT</th>
                      <th>NET WEIGHT</th>
                      <th>FREIGHT (₹280/MT)</th>
                      <th>STATUS</th>
                      <th>GATE PASS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.trips.map((t) => {
                      const vehicle = store.vehicles.find((v) => v.id === t.vehicleId);
                      const customer = store.customers.find((c) => c.id === t.customerId);
                      const product = store.products.find((p) => p.id === t.productId);
                      const netWeight = t.netWeightMt || t.orderedQtyMt || 0;
                      const freight = Math.round(netWeight * 280);

                      return (
                        <tr key={t.id}>
                          <td style={{ fontWeight: 700, color: '#2563EB' }}>{t.tripNumber}</td>
                          <td style={{ color: '#64748B', fontSize: '0.74rem' }}>
                            {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB') : '12-09-2026'}
                          </td>
                          <td style={{ fontWeight: 700, color: '#0284C7' }}>{vehicle?.plateNumber || 'MH-12-RN-4821'}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{customer?.companyName || 'ABC Construction Infra Ltd'}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>📍 {t.destination || 'Pune Metro Site'}</div>
                          </td>
                          <td>
                            <span className="owner-pill-badge owner-pill-cyan">{product?.name || '20mm Aggregate'}</span>
                          </td>
                          <td style={{ color: '#64748B' }}>{t.tareWeightMt ? `${t.tareWeightMt} MT` : '10.5 MT'}</td>
                          <td style={{ color: '#64748B' }}>{t.grossWeightMt ? `${t.grossWeightMt} MT` : '35.5 MT'}</td>
                          <td style={{ fontWeight: 800, color: '#16A34A', fontSize: '0.85rem' }}>{netWeight.toFixed(1)} MT</td>
                          <td style={{ fontWeight: 700, color: '#D97706' }}>₹ {freight.toLocaleString('en-IN')}</td>
                          <td>
                            <span
                              className={`owner-pill-badge ${
                                t.status === 'COMPLETED'
                                  ? 'owner-pill-green'
                                  : t.status === 'DISPATCHED'
                                  ? 'owner-pill-cyan'
                                  : 'owner-pill-amber'
                              }`}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => {
                                const gp = store.gatePasses.find((g) => g.tripId === t.id) || store.gatePasses[0];
                                if (gp) onViewGatePass(gp.id);
                              }}
                              style={{
                                background: '#F1F5F9',
                                border: '1px solid #CBD5E1',
                                color: '#2563EB',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Print Pass
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: MIS REPORTS */}
          {/* ========================================================================= */}
          {activeMenu === 'REPORTS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header & Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Management Information System (MIS) Reports
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>
                    Executive plant production summary, product yields, financial run-rate, and weighbridge compliance
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['TODAY', 'WEEK', 'MONTH', 'ALL'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setReportPeriod(period)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: reportPeriod === period ? '#2563EB' : '#CBD5E1',
                        background: reportPeriod === period ? '#2563EB' : '#FFFFFF',
                        color: reportPeriod === period ? '#FFFFFF' : '#475569',
                        cursor: 'pointer',
                      }}
                    >
                      {period === 'ALL' ? 'All Time' : period === 'TODAY' ? 'Today' : period === 'WEEK' ? 'This Week' : 'This Month'}
                    </button>
                  ))}
                  <button
                    onClick={() => window.print()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    <Printer size={14} /> Print MIS Sheet
                  </button>
                </div>
              </div>

              {/* Top Executive KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                <div className="owner-card" style={{ padding: '14px 18px', background: '#FFFFFF' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Gross Sales Realization</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                    ₹ {(store.trips.reduce((acc, t) => acc + (t.netWeightMt || t.orderedQtyMt) * 680, 0) / 100000).toFixed(2)} Lakhs
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#16A34A', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ArrowUpRight size={12} /> Ex-Plant Avg ₹680 / MT
                  </div>
                </div>

                <div className="owner-card" style={{ padding: '14px 18px', background: '#FFFFFF' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Finished Material Dispatched</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>
                    {store.trips.reduce((acc, t) => acc + (t.netWeightMt || 0), 0).toFixed(1)} MT
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                    Across {store.trips.length} Dispatched Trucks
                  </div>
                </div>

                <div className="owner-card" style={{ padding: '14px 18px', background: '#FFFFFF' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Quarry Boulder Inward</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                    {store.rawMaterialReceipts.reduce((acc, r) => acc + r.quantityBrass, 0).toFixed(1)} Brass
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                    ≈ {(store.rawMaterialReceipts.reduce((acc, r) => acc + r.quantityBrass, 0) * 4.2).toFixed(1)} MT Boulder Feed
                  </div>
                </div>

                <div className="owner-card" style={{ padding: '14px 18px', background: '#FFFFFF' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Operating Plant Efficiency</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7C3AED', marginTop: '4px' }}>94.2%</div>
                  <div style={{ fontSize: '0.72rem', color: '#16A34A', marginTop: '4px' }}>Zero Tare Variance Detected</div>
                </div>
              </div>

              {/* Production Stock Breakdown by Size */}
              <div className="owner-card">
                <div className="owner-card-title">Finished Aggregate Production & Yard Valuation Matrix</div>
                <table className="owner-table">
                  <thead>
                    <tr>
                      <th>CODE</th>
                      <th>PRODUCT / AGGREGATE SIZE</th>
                      <th>UNIT</th>
                      <th>YARD STOCK (MT)</th>
                      <th>CAPACITY UTILIZATION</th>
                      <th>EX-PLANT RATE</th>
                      <th>STOCK VALUATION (INR)</th>
                      <th>STOCK HEALTH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.products.map((p) => {
                      const isLow = p.currentStockMt <= p.minThresholdMt;
                      const capacityRatio = Math.min(100, Math.round((p.currentStockMt / (p.minThresholdMt * 4)) * 100));
                      const valuation = Math.round(p.currentStockMt * p.unitPriceInr);

                      return (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 800, color: '#2563EB' }}>{p.code}</td>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td style={{ color: '#64748B' }}>{p.unit}</td>
                          <td style={{ fontWeight: 800, color: isLow ? '#DC2626' : '#16A34A', fontSize: '0.9rem' }}>
                            {p.currentStockMt.toFixed(1)} MT
                          </td>
                          <td style={{ width: '180px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    width: `${capacityRatio}%`,
                                    height: '100%',
                                    background: isLow ? '#DC2626' : '#2563EB',
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>{capacityRatio}%</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>₹{p.unitPriceInr} / MT</td>
                          <td style={{ fontWeight: 700, color: '#0F172A' }}>₹ {valuation.toLocaleString('en-IN')}</td>
                          <td>
                            {isLow ? (
                              <span className="owner-pill-badge owner-pill-red">CRITICAL REORDER</span>
                            ) : (
                              <span className="owner-pill-badge owner-pill-green">HEALTHY INVENTORY</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Weighbridge Audit & Security Table */}
              <div className="owner-card">
                <div className="owner-card-title">Weighbridge Tare Variance & Zero-Tolerance Security Audit</div>
                <table className="owner-table">
                  <thead>
                    <tr>
                      <th>SLIP NUMBER</th>
                      <th>SCALE TIMESTAMP</th>
                      <th>VEHICLE PLATE</th>
                      <th>MEASURED TARE</th>
                      <th>REGISTERED TARE</th>
                      <th>TARE VARIANCE</th>
                      <th>NET LOADED</th>
                      <th>SECURITY AUDIT STATUS</th>
                      <th>OPERATOR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.weighbridgeTransactions.map((wt) => {
                      const vehicle = store.vehicles.find((v) => v.plateNumber === wt.vehiclePlate);
                      const defaultTare = vehicle?.defaultTareWeightMt || wt.tareWeightMt;
                      const variance = Number((wt.tareWeightMt - defaultTare).toFixed(2));
                      const isTampered = Math.abs(variance) > 0.3;

                      return (
                        <tr key={wt.id}>
                          <td style={{ fontWeight: 700, color: '#2563EB' }}>{wt.slipNumber}</td>
                          <td style={{ color: '#64748B', fontSize: '0.74rem' }}>
                            {wt.tareTimestamp ? new Date(wt.tareTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:30 AM'}
                          </td>
                          <td style={{ fontWeight: 700, color: '#0284C7' }}>{wt.vehiclePlate}</td>
                          <td>{wt.tareWeightMt} MT</td>
                          <td style={{ color: '#64748B' }}>{defaultTare} MT</td>
                          <td style={{ fontWeight: 600, color: isTampered ? '#DC2626' : '#16A34A' }}>
                            {variance >= 0 ? `+${variance}` : variance} MT
                          </td>
                          <td style={{ fontWeight: 800, color: '#16A34A' }}>{wt.netWeightMt ? `${wt.netWeightMt} MT` : '25.0 MT'}</td>
                          <td>
                            {isTampered ? (
                              <span className="owner-pill-badge owner-pill-red">VARIANCE ALERT</span>
                            ) : (
                              <span className="owner-pill-badge owner-pill-green">PASS - ZERO TAMPER</span>
                            )}
                          </td>
                          <td style={{ color: '#475569', fontSize: '0.75rem' }}>{wt.operatorName || 'Dinesh Jadhav'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: DATABASE CONFIGURATION */}
          {/* ========================================================================= */}
          {activeMenu === 'DATABASE' && <DatabaseConfigView />}
        </div>
      </div>

      {/* 1. ADD CUSTOMER MODAL */}
      {showAddCustModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
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
              maxWidth: '500px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#2563EB" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Add New Customer Account
                </h3>
              </div>
              <button
                onClick={() => setShowAddCustModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748B' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="owner-form-group">
                <label className="owner-form-label">Company / Contractor Firm *</label>
                <input
                  type="text"
                  className="owner-input"
                  placeholder="e.g. Sahyadri Infra Projects Pvt Ltd"
                  value={custCompany}
                  onChange={(e) => setCustCompany(e.target.value)}
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Primary Contact Person *</label>
                <input
                  type="text"
                  className="owner-input"
                  placeholder="e.g. Kailash Patil"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">WhatsApp Contact Number *</label>
                <input
                  type="text"
                  className="owner-input"
                  placeholder="+91 98220 00000"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Site / Billing Address</label>
                <input
                  type="text"
                  className="owner-input"
                  placeholder="e.g. Baramati Road, Pune"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">GSTIN (Optional)</label>
                <input
                  type="text"
                  className="owner-input"
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  value={custGst}
                  onChange={(e) => setCustGst(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowAddCustModal(false)} className="owner-btn-secondary">
                Cancel
              </button>
              <button onClick={handleSaveCustomer} className="owner-btn-primary">
                Save Customer Master
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADD VEHICLE MODAL */}
      {showAddVehModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
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
              maxWidth: '500px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} color="#0284C7" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Register Commercial Vehicle
                </h3>
              </div>
              <button
                onClick={() => setShowAddVehModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748B' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="owner-form-group">
                <label className="owner-form-label">Vehicle Registration Plate *</label>
                <input
                  type="text"
                  className="owner-input"
                  placeholder="e.g. MH 12 AB 9999"
                  value={vehPlate}
                  onChange={(e) => setVehPlate(e.target.value)}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Vehicle Body & Axle Type</label>
                <select
                  className="owner-select"
                  value={vehType}
                  onChange={(e) => setVehType(e.target.value)}
                >
                  <option value="Tipper 10-Wheeler">Tipper 10-Wheeler</option>
                  <option value="Hyva 12-Wheeler">Hyva 12-Wheeler</option>
                  <option value="Dumper 6-Wheeler">Dumper 6-Wheeler</option>
                  <option value="Multi-Axle Trailer (14-Wheeler)">Multi-Axle Trailer (14-Wheeler)</option>
                  <option value="Tractor-Trailer">Tractor-Trailer</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="owner-form-group">
                  <label className="owner-form-label">Default Tare (MT)</label>
                  <input
                    type="number"
                    step="0.05"
                    className="owner-input"
                    value={vehTare}
                    onChange={(e) => setVehTare(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="owner-form-group">
                  <label className="owner-form-label">Max Capacity (MT)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="owner-input"
                    value={vehCap}
                    onChange={(e) => setVehCap(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Assigned Driver (Optional)</label>
                <select
                  className="owner-select"
                  value={vehDriverId}
                  onChange={(e) => setVehDriverId(e.target.value)}
                >
                  <option value="">-- No Assigned Driver --</option>
                  {store.drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowAddVehModal(false)} className="owner-btn-secondary">
                Cancel
              </button>
              <button onClick={handleSaveVehicle} className="owner-btn-primary">
                Save Vehicle Master
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ADD DRIVER MODAL */}
      {showAddDriverModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
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
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#D97706" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Add Licensed Driver
                </h3>
              </div>
              <button
                onClick={() => setShowAddDriverModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748B' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="owner-form-group">
                <label className="owner-form-label">Driver Full Name *</label>
                <input
                  type="text"
                  className="owner-input"
                  placeholder="e.g. Santosh Bapu More"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Driver Mobile Number *</label>
                <input
                  type="text"
                  className="owner-input"
                  placeholder="+91 98900 12345"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Commercial License Number</label>
                <input
                  type="text"
                  className="owner-input"
                  placeholder="e.g. MH12 20180099881"
                  value={driverLicense}
                  onChange={(e) => setDriverLicense(e.target.value)}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowAddDriverModal(false)} className="owner-btn-secondary">
                Cancel
              </button>
              <button onClick={handleSaveDriver} className="owner-btn-primary">
                Save Driver Master
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. ADD PRODUCT MODAL */}
      {showAddProdModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
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
              maxWidth: '500px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#16A34A" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Add Plant Product Master
                </h3>
              </div>
              <button
                onClick={() => setShowAddProdModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748B' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="owner-form-group">
                <label className="owner-form-label">Product Name *</label>
                <input
                  type="text"
                  className="owner-input"
                  placeholder="e.g. Plaster Sand (0-2mm)"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="owner-form-group">
                  <label className="owner-form-label">Product Code *</label>
                  <input
                    type="text"
                    className="owner-input"
                    placeholder="e.g. PS-02"
                    value={prodCode}
                    onChange={(e) => setProdCode(e.target.value)}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div className="owner-form-group">
                  <label className="owner-form-label">Measurement Unit</label>
                  <select
                    className="owner-select"
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                  >
                    <option value="MT">MT (Metric Ton)</option>
                    <option value="Brass">Brass (100 CFT)</option>
                    <option value="CFT">CFT (Cubic Feet)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="owner-form-group">
                  <label className="owner-form-label">Ex-Plant Rate (₹ / Unit)</label>
                  <input
                    type="number"
                    step="10"
                    className="owner-input"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="owner-form-group">
                  <label className="owner-form-label">Initial Yard Stock (MT)</label>
                  <input
                    type="number"
                    step="10"
                    className="owner-input"
                    value={prodStock}
                    onChange={(e) => setProdStock(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Min Safety Threshold (MT)</label>
                <input
                  type="number"
                  step="10"
                  className="owner-input"
                  value={prodMinThreshold}
                  onChange={(e) => setProdMinThreshold(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Description / Grade Specs</label>
                <input
                  type="text"
                  className="owner-input"
                  placeholder="e.g. Washed fine manufactured sand for plastering"
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowAddProdModal(false)} className="owner-btn-secondary">
                Cancel
              </button>
              <button onClick={handleSaveProduct} className="owner-btn-primary">
                Save Product Master
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT MASTER MODALS */}
      {/* ========================================================================= */}

      {/* 5. EDIT CUSTOMER MODAL */}
      {editingCustomer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
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
              maxWidth: '500px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit size={18} color="#2563EB" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Edit Customer Account
                </h3>
              </div>
              <button
                onClick={() => setEditingCustomer(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748B' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="owner-form-group">
                <label className="owner-form-label">Company / Contractor Firm *</label>
                <input
                  type="text"
                  className="owner-input"
                  value={editingCustomer.companyName}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, companyName: e.target.value })}
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Primary Contact Person *</label>
                <input
                  type="text"
                  className="owner-input"
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">WhatsApp Contact Number *</label>
                <input
                  type="text"
                  className="owner-input"
                  value={editingCustomer.phone}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Site / Billing Address</label>
                <input
                  type="text"
                  className="owner-input"
                  value={editingCustomer.billingAddress}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, billingAddress: e.target.value })}
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">GSTIN</label>
                <input
                  type="text"
                  className="owner-input"
                  value={editingCustomer.gstNumber || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, gstNumber: e.target.value })}
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Account Balance (₹)</label>
                <input
                  type="number"
                  className="owner-input"
                  value={editingCustomer.currentBalance}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, currentBalance: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setEditingCustomer(null)} className="owner-btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!editingCustomer.companyName.trim() || !editingCustomer.name.trim() || !editingCustomer.phone.trim()) {
                    alert('Please enter Company Name, Contact Person, and WhatsApp Phone.');
                    return;
                  }
                  crusherStore.updateCustomer(editingCustomer.id, {
                    name: editingCustomer.name.trim(),
                    companyName: editingCustomer.companyName.trim(),
                    phone: editingCustomer.phone.trim(),
                    billingAddress: editingCustomer.billingAddress.trim(),
                    gstNumber: editingCustomer.gstNumber?.trim(),
                    currentBalance: Number(editingCustomer.currentBalance) || 0,
                  });
                  setEditingCustomer(null);
                }}
                className="owner-btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. EDIT VEHICLE MODAL */}
      {editingVehicle && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
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
              maxWidth: '500px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit size={18} color="#0284C7" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Edit Vehicle Details
                </h3>
              </div>
              <button
                onClick={() => setEditingVehicle(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748B' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="owner-form-group">
                <label className="owner-form-label">Vehicle Registration Plate *</label>
                <input
                  type="text"
                  className="owner-input"
                  value={editingVehicle.plateNumber}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, plateNumber: e.target.value.toUpperCase() })}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Vehicle Body & Axle Type</label>
                <select
                  className="owner-select"
                  value={editingVehicle.vehicleType}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, vehicleType: e.target.value })}
                >
                  <option value="Tipper 10-Wheeler">Tipper 10-Wheeler</option>
                  <option value="Hyva 12-Wheeler">Hyva 12-Wheeler</option>
                  <option value="Dumper 6-Wheeler">Dumper 6-Wheeler</option>
                  <option value="Multi-Axle Trailer (14-Wheeler)">Multi-Axle Trailer (14-Wheeler)</option>
                  <option value="Tractor-Trailer">Tractor-Trailer</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="owner-form-group">
                  <label className="owner-form-label">Default Tare (MT)</label>
                  <input
                    type="number"
                    step="0.05"
                    className="owner-input"
                    value={editingVehicle.defaultTareWeightMt}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, defaultTareWeightMt: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="owner-form-group">
                  <label className="owner-form-label">Max Capacity (MT)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="owner-input"
                    value={editingVehicle.maxCapacityMt}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, maxCapacityMt: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Assigned Driver</label>
                <select
                  className="owner-select"
                  value={editingVehicle.assignedDriverId || ''}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, assignedDriverId: e.target.value || undefined })}
                >
                  <option value="">-- No Assigned Driver --</option>
                  {store.drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setEditingVehicle(null)} className="owner-btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!editingVehicle.plateNumber.trim()) {
                    alert('Please enter a vehicle plate number.');
                    return;
                  }
                  crusherStore.updateVehicle(editingVehicle.id, {
                    plateNumber: editingVehicle.plateNumber.trim().toUpperCase(),
                    vehicleType: editingVehicle.vehicleType,
                    defaultTareWeightMt: Number(editingVehicle.defaultTareWeightMt) || 10.5,
                    maxCapacityMt: Number(editingVehicle.maxCapacityMt) || 25.0,
                    assignedDriverId: editingVehicle.assignedDriverId || undefined,
                  });
                  setEditingVehicle(null);
                }}
                className="owner-btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. EDIT DRIVER MODAL */}
      {editingDriver && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
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
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit size={18} color="#D97706" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Edit Driver Details
                </h3>
              </div>
              <button
                onClick={() => setEditingDriver(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748B' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="owner-form-group">
                <label className="owner-form-label">Driver Full Name *</label>
                <input
                  type="text"
                  className="owner-input"
                  value={editingDriver.name}
                  onChange={(e) => setEditingDriver({ ...editingDriver, name: e.target.value })}
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Driver Mobile Number *</label>
                <input
                  type="text"
                  className="owner-input"
                  value={editingDriver.phone}
                  onChange={(e) => setEditingDriver({ ...editingDriver, phone: e.target.value })}
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Commercial License Number</label>
                <input
                  type="text"
                  className="owner-input"
                  value={editingDriver.licenseNumber}
                  onChange={(e) => setEditingDriver({ ...editingDriver, licenseNumber: e.target.value.toUpperCase() })}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setEditingDriver(null)} className="owner-btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!editingDriver.name.trim() || !editingDriver.phone.trim()) {
                    alert('Please enter Driver Name and Phone Number.');
                    return;
                  }
                  crusherStore.updateDriver(editingDriver.id, {
                    name: editingDriver.name.trim(),
                    phone: editingDriver.phone.trim(),
                    licenseNumber: editingDriver.licenseNumber.trim(),
                  });
                  setEditingDriver(null);
                }}
                className="owner-btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
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
              maxWidth: '500px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit size={18} color="#16A34A" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Edit Product Catalog & Rate
                </h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748B' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="owner-form-group">
                <label className="owner-form-label">Product Name *</label>
                <input
                  type="text"
                  className="owner-input"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="owner-form-group">
                  <label className="owner-form-label">Product Code *</label>
                  <input
                    type="text"
                    className="owner-input"
                    value={editingProduct.code}
                    onChange={(e) => setEditingProduct({ ...editingProduct, code: e.target.value.toUpperCase() })}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div className="owner-form-group">
                  <label className="owner-form-label">Measurement Unit</label>
                  <select
                    className="owner-select"
                    value={editingProduct.unit}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                  >
                    <option value="MT">MT (Metric Ton)</option>
                    <option value="Brass">Brass (100 CFT)</option>
                    <option value="CFT">CFT (Cubic Feet)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="owner-form-group">
                  <label className="owner-form-label">Ex-Plant Rate (₹ / Unit)</label>
                  <input
                    type="number"
                    step="10"
                    className="owner-input"
                    value={editingProduct.unitPriceInr}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unitPriceInr: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="owner-form-group">
                  <label className="owner-form-label">Yard Stock (MT)</label>
                  <input
                    type="number"
                    step="10"
                    className="owner-input"
                    value={editingProduct.currentStockMt}
                    onChange={(e) => setEditingProduct({ ...editingProduct, currentStockMt: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Min Safety Threshold (MT)</label>
                <input
                  type="number"
                  step="10"
                  className="owner-input"
                  value={editingProduct.minThresholdMt}
                  onChange={(e) => setEditingProduct({ ...editingProduct, minThresholdMt: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="owner-form-group">
                <label className="owner-form-label">Description / Grade Specs</label>
                <input
                  type="text"
                  className="owner-input"
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setEditingProduct(null)} className="owner-btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!editingProduct.name.trim() || !editingProduct.code.trim()) {
                    alert('Please enter Product Name and Product Code.');
                    return;
                  }
                  crusherStore.updateProduct(editingProduct.id, {
                    name: editingProduct.name.trim(),
                    code: editingProduct.code.trim().toUpperCase(),
                    unit: editingProduct.unit,
                    currentStockMt: Number(editingProduct.currentStockMt) || 0,
                    minThresholdMt: Number(editingProduct.minThresholdMt) || 100,
                    unitPriceInr: Number(editingProduct.unitPriceInr) || 650,
                    description: editingProduct.description?.trim(),
                  });
                  setEditingProduct(null);
                }}
                className="owner-btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 9. DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
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
              maxWidth: '420px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <Trash2 size={26} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Confirm Deletion
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to permanently delete this {itemToDelete.type.toLowerCase()}:<br />
              <strong style={{ color: '#0F172A', fontSize: '0.95rem' }}>{itemToDelete.name}</strong>?
              <br />
              <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                This will update the directory and sync across all terminals.
              </span>
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={() => setItemToDelete(null)}
                className="owner-btn-secondary"
                style={{ padding: '8px 18px', minWidth: '100px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  minWidth: '110px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Trash2 size={14} /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
