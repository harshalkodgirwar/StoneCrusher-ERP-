'use client';

import React, { useState, useMemo } from 'react';
import { Customer, CustomerPayment, PaymentMode, crusherStore } from '../../lib/store/crusher-store';
import { useCrusherStore } from '../../lib/store/useCrusherStore';
import {
  X,
  Printer,
  Share2,
  Calendar,
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  IndianRupee,
  Truck,
  Building2,
  Phone,
  FileText,
  CheckCircle2,
  Clock,
  Trash2,
  CreditCard,
  AlertCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface CustomerAccountBookModalProps {
  customer: Customer | null;
  onClose: () => void;
  onOpenGatePass?: (tripId: string) => void;
}

export const CustomerAccountBookModal: React.FC<CustomerAccountBookModalProps> = ({
  customer,
  onClose,
  onOpenGatePass,
}) => {
  const store = useCrusherStore();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<'ALL' | 'THIS_MONTH' | 'LAST_30_DAYS'>('ALL');
  const [activeSideView, setActiveSideView] = useState<'SPLIT' | 'PAYMENTS_ONLY' | 'TRIPS_ONLY'>('SPLIT');

  // New Payment Form Modal State
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [payMode, setPayMode] = useState<PaymentMode>('NEFT_RTGS');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Fallback if no customer selected
  if (!customer) return null;

  // Active customer data from current live store (in case balance updated)
  const currentCustomer = store.customers.find((c) => c.id === customer.id) || customer;

  // Trips for this customer
  const customerTrips = useMemo(() => {
    return (store.trips || []).filter((t) => t.customerId === currentCustomer.id);
  }, [store.trips, currentCustomer.id]);

  // Payments received from this customer
  const customerPayments = useMemo(() => {
    return (store.customerPayments || []).filter((p) => p.customerId === currentCustomer.id);
  }, [store.customerPayments, currentCustomer.id]);

  // Filtered trips
  const filteredTrips = useMemo(() => {
    return customerTrips.filter((t) => {
      const product = store.products.find((p) => p.id === t.productId);
      const vehicle = store.vehicles.find((v) => v.id === t.vehicleId);
      const tripNo = (t.tripNumber || '').toLowerCase();
      const prodName = (product?.name || '').toLowerCase();
      const plate = (vehicle?.plateNumber || '').toLowerCase();
      const dest = (t.destination || '').toLowerCase();
      const query = searchTerm.toLowerCase();

      const matchesSearch =
        !searchTerm ||
        tripNo.includes(query) ||
        prodName.includes(query) ||
        plate.includes(query) ||
        dest.includes(query);

      if (!matchesSearch) return false;

      if (dateRange === 'ALL') return true;
      const tripDate = new Date(t.createdAt).getTime();
      const now = Date.now();
      if (dateRange === 'LAST_30_DAYS') {
        return tripDate >= now - 30 * 86400000;
      }
      if (dateRange === 'THIS_MONTH') {
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const d = new Date(t.createdAt);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }
      return true;
    });
  }, [customerTrips, store.products, store.vehicles, searchTerm, dateRange]);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return customerPayments.filter((p) => {
      const receiptNo = (p.paymentNumber || '').toLowerCase();
      const ref = (p.referenceNumber || '').toLowerCase();
      const notes = (p.notes || '').toLowerCase();
      const mode = (p.paymentMode || '').toLowerCase();
      const query = searchTerm.toLowerCase();

      const matchesSearch =
        !searchTerm ||
        receiptNo.includes(query) ||
        ref.includes(query) ||
        notes.includes(query) ||
        mode.includes(query);

      if (!matchesSearch) return false;

      if (dateRange === 'ALL') return true;
      const payTime = new Date(p.paymentDate).getTime();
      const now = Date.now();
      if (dateRange === 'LAST_30_DAYS') {
        return payTime >= now - 30 * 86400000;
      }
      if (dateRange === 'THIS_MONTH') {
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const d = new Date(p.paymentDate);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }
      return true;
    });
  }, [customerPayments, searchTerm, dateRange]);

  // Financial calculations
  // Trips calculation: Total Owed (Debits)
  const tripTotals = useMemo(() => {
    let grossTaxable = 0;
    let totalGst = 0;
    let totalOwed = 0;
    let totalTonnage = 0;

    filteredTrips.forEach((t) => {
      const product = store.products.find((p) => p.id === t.productId);
      const qty = t.netWeightMt || t.orderedQtyMt || 20;
      const rate = t.unitPriceInr || product?.unitPriceInr || 680;
      const taxable = Math.round(qty * rate);
      const gst = Math.round(taxable * 0.05);
      const tripTotal = taxable + gst;

      grossTaxable += taxable;
      totalGst += gst;
      totalOwed += tripTotal;
      totalTonnage += qty;
    });

    return { grossTaxable, totalGst, totalOwed, totalTonnage };
  }, [filteredTrips, store.products]);

  // Payments calculation: Total Received (Credits)
  const totalReceived = useMemo(() => {
    return filteredPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  }, [filteredPayments]);

  // Net Balance
  const netDue = tripTotals.totalOwed - totalReceived;

  // Live total customer balance from full store ledger (all trips minus all payments)
  const liveCustomerBalance = useMemo(() => {
    return crusherStore.getCustomerBalance(currentCustomer.id);
  }, [store.trips, store.customerPayments, currentCustomer.id]);

  // Handle Recording a New Payment
  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(payAmount);
    if (!amountNum || amountNum <= 0) {
      alert('Please enter a valid received amount.');
      return;
    }

    setIsSubmittingPay(true);
    try {
      crusherStore.recordCustomerPayment({
        customerId: currentCustomer.id,
        amount: amountNum,
        paymentDate: payDate,
        paymentMode: payMode,
        referenceNumber: payRef.trim(),
        notes: payNotes.trim(),
        receivedBy: store.currentStaffName,
      });

      setPayAmount('');
      setPayRef('');
      setPayNotes('');
      setShowAddPaymentModal(false);
    } finally {
      setIsSubmittingPay(false);
    }
  };

  // Handle Deleting a Payment Receipt
  const handleDeletePayment = (paymentId: string, receiptNo: string, amt: number) => {
    if (confirm(`Are you sure you want to delete payment receipt ${receiptNo} of ₹${amt.toLocaleString('en-IN')}?`)) {
      crusherStore.deleteCustomerPayment(paymentId);
    }
  };

  // WhatsApp Statement share handler
  const handleShareStatement = () => {
    const summaryText = `*SHREE SHIVAJI CRUSHER & QUARRY MINES*
*CUSTOMER ACCOUNT BOOK STATEMENT*
----------------------------------------
*Client:* ${currentCustomer.companyName}
*Contact:* ${currentCustomer.name} (${currentCustomer.phone})
*Date:* ${new Date().toLocaleDateString('en-IN')}
----------------------------------------
*TOTAL DISPATCHED TRIPS (OWED):* ₹ ${tripTotals.totalOwed.toLocaleString('en-IN')}
*TOTAL PAYMENTS RECEIVED:* ₹ ${totalReceived.toLocaleString('en-IN')}
----------------------------------------
*NET BALANCE DUE:* ₹ ${netDue.toLocaleString('en-IN')} ${netDue > 0 ? '(Pending Payment)' : '(Clear / In Advance)'}
----------------------------------------
_Please remit balance via RTGS / NEFT / UPI. Thank you for your business!_`;

    navigator.clipboard.writeText(summaryText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);

    // Open WhatsApp Web with the client's number
    const cleanPhone = currentCustomer.phone.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(summaryText)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="printable-document animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '1360px',
          height: '92vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ===================== MODAL HEADER ===================== */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #1E293B',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
              }}
            >
              <IndianRupee size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {currentCustomer.companyName}
                </h2>
                <span
                  style={{
                    backgroundColor: '#1E293B',
                    color: '#93C5FD',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                  }}
                >
                  TOTAL ACCOUNT BOOK & KHATA
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '0.78rem',
                  color: '#94A3B8',
                  marginTop: '4px',
                }}
              >
                <span>👤 Contact: <strong style={{ color: '#F1F5F9' }}>{currentCustomer.name}</strong></span>
                <span>📱 Phone: <strong style={{ color: '#F1F5F9' }}>{currentCustomer.phone}</strong></span>
                {currentCustomer.gstNumber && (
                  <span>📑 GSTIN: <strong style={{ color: '#F1F5F9' }}>{currentCustomer.gstNumber}</strong></span>
                )}
                <span>📍 {currentCustomer.billingAddress || 'MIDC, Pune'}</span>
                <span
                  style={{
                    backgroundColor: liveCustomerBalance > 0 ? '#450A0A' : '#064E3B',
                    color: liveCustomerBalance > 0 ? '#FCA5A5' : '#86EFAC',
                    border: liveCustomerBalance > 0 ? '1px solid #7F1D1D' : '1px solid #065F46',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                  }}
                >
                  Current Balance: ₹ {Math.abs(liveCustomerBalance).toLocaleString('en-IN')}{' '}
                  {liveCustomerBalance > 0 ? '(Dr - Due)' : liveCustomerBalance < 0 ? '(Cr - Advance)' : '(Settled)'}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowAddPaymentModal(true)}
              style={{
                backgroundColor: '#059669',
                color: '#FFFFFF',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)',
              }}
            >
              <Plus size={15} /> + Record Payment Received
            </button>

            <button
              onClick={handleShareStatement}
              style={{
                backgroundColor: '#1E293B',
                color: '#22C55E',
                border: '1px solid #334155',
                padding: '7px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
              title="Share Statement via WhatsApp / Copy to Clipboard"
            >
              <Share2 size={14} /> {copiedNotification ? 'Copied!' : 'WhatsApp Statement'}
            </button>

            <button
              onClick={() => window.print()}
              style={{
                backgroundColor: '#1E293B',
                color: '#E2E8F0',
                border: '1px solid #334155',
                padding: '7px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
              title="Print Account Book"
            >
              <Printer size={14} /> Print
            </button>

            <button
              onClick={onClose}
              style={{
                backgroundColor: '#334155',
                color: '#FFFFFF',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginLeft: '4px',
              }}
              title="Close Account Book"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ===================== SUMMARY KPI STRIP ===================== */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '14px',
            flexShrink: 0,
          }}
        >
          {/* Card 1: Total Received (Left Side Summary) */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              padding: '12px 16px',
              border: '1px solid #BBF7D0',
              borderLeft: '4px solid #16A34A',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: '#15803D', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Money Received (Credits)
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16A34A', marginTop: '2px' }}>
                ₹ {totalReceived.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                {filteredPayments.length} payment voucher(s)
              </div>
            </div>
            <div style={{ backgroundColor: '#DCFCE7', padding: '10px', borderRadius: '8px' }}>
              <ArrowDownLeft size={22} color="#16A34A" />
            </div>
          </div>

          {/* Card 2: Total Owed (Right Side Summary) */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              padding: '12px 16px',
              border: '1px solid #BFDBFE',
              borderLeft: '4px solid #2563EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: '#1D4ED8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Money Owed (Trip Debits)
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1D4ED8', marginTop: '2px' }}>
                ₹ {tripTotals.totalOwed.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                {filteredTrips.length} trip dispatches (incl. 5% GST)
              </div>
            </div>
            <div style={{ backgroundColor: '#DBEAFE', padding: '10px', borderRadius: '8px' }}>
              <ArrowUpRight size={22} color="#2563EB" />
            </div>
          </div>

          {/* Card 3: Net Account Balance */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              padding: '12px 16px',
              border: liveCustomerBalance > 0 ? '1px solid #FECACA' : '1px solid #BBF7D0',
              borderLeft: liveCustomerBalance > 0 ? '4px solid #DC2626' : '4px solid #16A34A',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: liveCustomerBalance > 0 ? '#B91C1C' : '#15803D',
                  letterSpacing: '0.04em',
                }}
              >
                {liveCustomerBalance > 0 ? 'Net Outstanding Due' : 'Advance Credit Balance'}
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: liveCustomerBalance > 0 ? '#DC2626' : '#16A34A',
                  marginTop: '2px',
                }}
              >
                ₹ {Math.abs(liveCustomerBalance).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                {liveCustomerBalance > 0 ? 'Customer owes stone crusher' : liveCustomerBalance < 0 ? 'Customer has surplus advance' : 'All accounts settled'}
              </div>
            </div>
            <div style={{ backgroundColor: liveCustomerBalance > 0 ? '#FEE2E2' : '#DCFCE7', padding: '10px', borderRadius: '8px' }}>
              {liveCustomerBalance > 0 ? <AlertCircle size={22} color="#DC2626" /> : <CheckCircle2 size={22} color="#16A34A" />}
            </div>
          </div>

          {/* Card 4: Total Tonnage Dispatched */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              padding: '12px 16px',
              border: '1px solid #E2E8F0',
              borderLeft: '4px solid #64748B',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Material Supplied
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                {tripTotals.totalTonnage.toFixed(2)} MT
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                Taxable: ₹ {tripTotals.grossTaxable.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ backgroundColor: '#F1F5F9', padding: '10px', borderRadius: '8px' }}>
              <Truck size={22} color="#475569" />
            </div>
          </div>
        </div>

        {/* ===================== CONTROLS & FILTER BAR ===================== */}
        <div
          style={{
            padding: '10px 24px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          {/* Search box */}
          <div style={{ position: 'relative', width: '360px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search trip no, vehicle, receipt no, ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                fontSize: '0.78rem',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Date filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748B' }}>
              <Calendar size={14} />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                style={{
                  padding: '5px 8px',
                  fontSize: '0.78rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All Time Transactions</option>
                <option value="THIS_MONTH">This Month</option>
                <option value="LAST_30_DAYS">Last 30 Days</option>
              </select>
            </div>

            {/* View layout switch */}
            <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '2px', borderRadius: '6px' }}>
              <button
                onClick={() => setActiveSideView('SPLIT')}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: activeSideView === 'SPLIT' ? '#FFFFFF' : 'transparent',
                  color: activeSideView === 'SPLIT' ? '#0F172A' : '#64748B',
                  boxShadow: activeSideView === 'SPLIT' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Split Account Book
              </button>
              <button
                onClick={() => setActiveSideView('PAYMENTS_ONLY')}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: activeSideView === 'PAYMENTS_ONLY' ? '#FFFFFF' : 'transparent',
                  color: activeSideView === 'PAYMENTS_ONLY' ? '#16A34A' : '#64748B',
                  boxShadow: activeSideView === 'PAYMENTS_ONLY' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Money Received Only
              </button>
              <button
                onClick={() => setActiveSideView('TRIPS_ONLY')}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: activeSideView === 'TRIPS_ONLY' ? '#FFFFFF' : 'transparent',
                  color: activeSideView === 'TRIPS_ONLY' ? '#2563EB' : '#64748B',
                  boxShadow: activeSideView === 'TRIPS_ONLY' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Money Owed Only (Trips)
              </button>
            </div>
          </div>
        </div>

        {/* ===================== THE SPLIT TWO-SIDED ACCOUNT BOOK ===================== */}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns:
              activeSideView === 'SPLIT'
                ? '1fr 1fr'
                : activeSideView === 'PAYMENTS_ONLY'
                ? '1fr 0fr'
                : '0fr 1fr',
            overflow: 'hidden',
            backgroundColor: '#F1F5F9',
            gap: '1px',
          }}
        >
          {/* ======================================================== */}
          {/* LEFT SIDE: ALL MONEY COMES FROM CUSTOMER (CREDITS)      */}
          {/* ======================================================== */}
          {(activeSideView === 'SPLIT' || activeSideView === 'PAYMENTS_ONLY') && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
                borderRight: '1px solid #CBD5E1',
              }}
            >
              {/* Left Column Header Banner */}
              <div
                style={{
                  padding: '12px 18px',
                  backgroundColor: '#ECFDF5',
                  borderBottom: '2px solid #10B981',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ArrowDownLeft size={16} color="#FFFFFF" />
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        color: '#065F46',
                        letterSpacing: '0.02em',
                      }}
                    >
                      MONEY RECEIVED FROM CUSTOMER
                    </h3>
                    <div style={{ fontSize: '0.68rem', color: '#047857' }}>
                      (Customer Inward Receipts • RTGS • Cheques • UPI • Advance)
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      backgroundColor: '#D1FAE5',
                      color: '#065F46',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                    }}
                  >
                    Total: ₹ {totalReceived.toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => setShowAddPaymentModal(true)}
                    style={{
                      backgroundColor: '#10B981',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '5px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Plus size={12} /> Add Receipt
                  </button>
                </div>
              </div>

              {/* Payments List / Table */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
                {filteredPayments.length === 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '48px 24px',
                      color: '#64748B',
                      textAlign: 'center',
                    }}
                  >
                    <ArrowDownLeft size={36} color="#CBD5E1" style={{ marginBottom: '8px' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>
                      No Payments Recorded Yet
                    </div>
                    <div style={{ fontSize: '0.75rem', marginTop: '4px', maxWidth: '300px' }}>
                      Record all payments, NEFT transfers, cheques, and cash advances received from this customer.
                    </div>
                    <button
                      onClick={() => setShowAddPaymentModal(true)}
                      style={{
                        marginTop: '14px',
                        backgroundColor: '#10B981',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Plus size={14} /> Record First Payment
                    </button>
                  </div>
                ) : (
                  <table className="owner-table" style={{ margin: 0 }}>
                    <thead>
                      <tr style={{ position: 'sticky', top: 0, backgroundColor: '#F8FAFC', zIndex: 1 }}>
                        <th style={{ width: '85px' }}>DATE</th>
                        <th style={{ width: '110px' }}>RECEIPT #</th>
                        <th>MODE & REFERENCE</th>
                        <th>REMARKS / NOTE</th>
                        <th style={{ textAlign: 'right', width: '120px' }}>AMOUNT (₹)</th>
                        <th style={{ width: '40px', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((p) => (
                        <tr key={p.id}>
                          <td style={{ fontSize: '0.74rem', color: '#475569', whiteSpace: 'nowrap' }}>
                            {new Date(p.paymentDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td>
                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                fontSize: '0.74rem',
                                color: '#047857',
                              }}
                            >
                              {p.paymentNumber}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span
                                style={{
                                  backgroundColor: '#DCFCE7',
                                  color: '#166534',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                }}
                              >
                                {p.paymentMode.replace('_', ' ')}
                              </span>
                              {p.referenceNumber && (
                                <span style={{ fontSize: '0.7rem', color: '#475569', fontFamily: 'monospace' }}>
                                  Ref: {p.referenceNumber}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.73rem', color: '#64748B', maxWidth: '180px' }}>
                            {p.notes || '-'}
                          </td>
                          <td
                            style={{
                              textAlign: 'right',
                              fontWeight: 800,
                              color: '#16A34A',
                              fontSize: '0.85rem',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            + ₹ {p.amount.toLocaleString('en-IN')}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleDeletePayment(p.id, p.paymentNumber, p.amount)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#EF4444',
                                cursor: 'pointer',
                                padding: '2px',
                                opacity: 0.6,
                              }}
                              title="Delete Receipt"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Left Column Bottom Subtotal Strip */}
              <div
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#F0FDF4',
                  borderTop: '1px solid #BBF7D0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#166534' }}>
                  TOTAL INWARD CREDITS ({filteredPayments.length} Vouchers):
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#15803D' }}>
                  ₹ {totalReceived.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* RIGHT SIDE: ALL MONEY OWED TO STONE CRUSHER (TRIP-WISE) */}
          {/* ======================================================== */}
          {(activeSideView === 'SPLIT' || activeSideView === 'TRIPS_ONLY') && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
              }}
            >
              {/* Right Column Header Banner */}
              <div
                style={{
                  padding: '12px 18px',
                  backgroundColor: '#EFF6FF',
                  borderBottom: '2px solid #2563EB',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Truck size={16} color="#FFFFFF" />
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        color: '#1E40AF',
                        letterSpacing: '0.02em',
                      }}
                    >
                      MONEY OWED TO STONE CRUSHER (TRIP-WISE)
                    </h3>
                    <div style={{ fontSize: '0.68rem', color: '#1D4ED8' }}>
                      (Material Dispatches • Weighbridge Weighing • GST Taxable Debits)
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      backgroundColor: '#DBEAFE',
                      color: '#1E40AF',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                    }}
                  >
                    Total: ₹ {tripTotals.totalOwed.toLocaleString('en-IN')}
                  </span>
                  <span
                    style={{
                      backgroundColor: '#EFF6FF',
                      color: '#3B82F6',
                      border: '1px solid #BFDBFE',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    }}
                  >
                    {filteredTrips.length} Dispatches
                  </span>
                </div>
              </div>

              {/* Trip Table */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
                {filteredTrips.length === 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '48px 24px',
                      color: '#64748B',
                      textAlign: 'center',
                    }}
                  >
                    <Truck size={36} color="#CBD5E1" style={{ marginBottom: '8px' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>
                      No Trips or Dispatches Found
                    </div>
                    <div style={{ fontSize: '0.75rem', marginTop: '4px', maxWidth: '300px' }}>
                      Orders created or dispatched for this customer will automatically show up here trip by trip.
                    </div>
                  </div>
                ) : (
                  <table className="owner-table" style={{ margin: 0 }}>
                    <thead>
                      <tr style={{ position: 'sticky', top: 0, backgroundColor: '#F8FAFC', zIndex: 1 }}>
                        <th style={{ width: '80px' }}>DATE</th>
                        <th style={{ width: '100px' }}>TRIP NO</th>
                        <th>VEHICLE & MATERIAL</th>
                        <th>DISPATCH WT & RATE</th>
                        <th>TAXABLE + 5% GST</th>
                        <th style={{ textAlign: 'right', width: '110px' }}>OWED TOTAL (₹)</th>
                        <th style={{ width: '70px', textAlign: 'center' }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTrips.map((t) => {
                        const product = store.products.find((p) => p.id === t.productId);
                        const vehicle = store.vehicles.find((v) => v.id === t.vehicleId);
                        const qty = t.netWeightMt || t.orderedQtyMt || 20;
                        const rate = t.unitPriceInr || product?.unitPriceInr || 680;
                        const taxable = Math.round(qty * rate);
                        const gst = Math.round(taxable * 0.05);
                        const tripTotal = taxable + gst;

                        return (
                          <tr key={t.id}>
                            <td style={{ fontSize: '0.74rem', color: '#475569', whiteSpace: 'nowrap' }}>
                              {new Date(t.createdAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </td>
                            <td>
                              <span
                                style={{
                                  fontFamily: 'monospace',
                                  fontWeight: 700,
                                  fontSize: '0.74rem',
                                  color: '#2563EB',
                                }}
                              >
                                {t.tripNumber}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, fontSize: '0.76rem', color: '#0F172A' }}>
                                {product?.name || 'Basalt Aggregate'}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                                🚛 {vehicle?.plateNumber || 'MH12AB1234'}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, fontSize: '0.74rem' }}>
                                {qty.toFixed(2)} MT
                              </div>
                              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                                @ ₹{rate}/MT
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.72rem', color: '#334155' }}>
                                ₹{taxable.toLocaleString('en-IN')}
                              </div>
                              <div style={{ fontSize: '0.66rem', color: '#64748B' }}>
                                + GST: ₹{gst.toLocaleString('en-IN')}
                              </div>
                            </td>
                            <td
                              style={{
                                textAlign: 'right',
                                fontWeight: 800,
                                color: '#1E40AF',
                                fontSize: '0.85rem',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              ₹ {tripTotal.toLocaleString('en-IN')}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span
                                className={`owner-pill-badge ${
                                  t.status === 'COMPLETED'
                                    ? 'owner-pill-green'
                                    : t.status === 'DISPATCHED'
                                    ? 'owner-pill-blue'
                                    : 'owner-pill-amber'
                                }`}
                                style={{ fontSize: '0.62rem', padding: '2px 5px' }}
                              >
                                {t.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Right Column Bottom Subtotal Strip */}
              <div
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#EFF6FF',
                  borderTop: '1px solid #BFDBFE',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#1E40AF' }}>
                  TOTAL DEBITS ({filteredTrips.length} Dispatches • {tripTotals.totalTonnage.toFixed(2)} MT):
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1D4ED8' }}>
                  ₹ {tripTotals.totalOwed.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===================== FOOTER RECONCILIATION SUMMARY ===================== */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            borderTop: '1px solid #1E293B',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          {/* Left formula breakdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#94A3B8' }}>Total Dispatches Owed:</span>
              <strong style={{ color: '#93C5FD' }}>₹ {tripTotals.totalOwed.toLocaleString('en-IN')}</strong>
            </div>
            <span style={{ color: '#64748B', fontWeight: 800 }}>—</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#94A3B8' }}>Total Money Received:</span>
              <strong style={{ color: '#86EFAC' }}>₹ {totalReceived.toLocaleString('en-IN')}</strong>
            </div>
            <span style={{ color: '#64748B', fontWeight: 800 }}>=</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#94A3B8' }}>Net Ledger Balance:</span>
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 900,
                  color: netDue > 0 ? '#F87171' : netDue < 0 ? '#4ADE80' : '#E2E8F0',
                }}
              >
                ₹ {Math.abs(netDue).toLocaleString('en-IN')}{' '}
                <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                  {netDue > 0 ? '(Dr - Due to Stone Crusher)' : netDue < 0 ? '(Cr - Customer Advance)' : '(Settled)'}
                </span>
              </span>
            </div>
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleShareStatement}
              style={{
                backgroundColor: '#1E293B',
                color: '#22C55E',
                border: '1px solid #334155',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Share2 size={13} /> {copiedNotification ? 'Copied to Clipboard!' : 'Share Statement'}
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Close Account Book
            </button>
          </div>
        </div>
      </div>

      {/* ===================== RECORD PAYMENT POPUP MODAL ===================== */}
      {showAddPaymentModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddPaymentModal(false);
          }}
        >
          <div
            className="animate-scale-in"
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                backgroundColor: '#065F46',
                color: '#FFFFFF',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ArrowDownLeft size={20} color="#34D399" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                  Record Payment Received (Inward Voucher)
                </h3>
              </div>
              <button
                onClick={() => setShowAddPaymentModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSavePayment} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Customer / Client Name
                </label>
                <input
                  type="text"
                  value={currentCustomer.companyName}
                  disabled
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    color: '#64748B',
                    fontWeight: 600,
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Amount Received (₹) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '10px',
                        top: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#64748B',
                      }}
                    >
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 50000"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 26px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        outline: 'none',
                        color: '#065F46',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.8rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Payment Mode *
                  </label>
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value as PaymentMode)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.8rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="NEFT_RTGS">RTGS / NEFT Transfer</option>
                    <option value="UPI">UPI (PhonePe / GPay)</option>
                    <option value="CHEQUE">Bank Cheque</option>
                    <option value="CASH">Cash Deposit</option>
                    <option value="NET_BANKING">Net Banking (IMPS)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Reference / UTR / Cheque No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UTR1928392182"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.8rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Notes / Particulars
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Advance payment for 100 MT 20mm aggregate order"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPay}
                  style={{
                    padding: '8px 20px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.4)',
                  }}
                >
                  {isSubmittingPay ? 'Recording...' : 'Save & Credit Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
