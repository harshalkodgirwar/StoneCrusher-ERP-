'use client';

import React, { useState } from 'react';
import { useCrusherStore } from '../../lib/store/useCrusherStore';
import {
  X,
  Printer,
  ShieldCheck,
  QrCode,
  Truck,
  Calendar,
  MapPin,
  User,
  Building2,
  Check,
  Copy,
  Clock,
  Phone,
  FileText,
  Scale,
  Award,
} from 'lucide-react';

interface GatePassModalProps {
  gatePassId: string | null;
  onClose: () => void;
}

function numberToWords(num: number): string {
  const rounded = Math.round(num * 100) / 100;
  const wholePart = Math.floor(rounded);
  const decimalPart = Math.round((rounded - wholePart) * 100);

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertGroup = (n: number): string => {
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += ones[n] + ' ';
    }
    return str.trim();
  };

  if (wholePart === 0) return 'Zero Metric Tonnes Only';

  let result = '';
  if (wholePart >= 1000) {
    result += convertGroup(Math.floor(wholePart / 1000)) + ' Thousand ';
  }
  const rem = wholePart % 1000;
  if (rem > 0) {
    result += convertGroup(rem) + ' ';
  }

  result = result.trim() + ' Metric Tonnes';
  if (decimalPart > 0) {
    result += ' and ' + convertGroup(decimalPart) + ' Hundredths';
  }
  return result + ' Only';
}

export const GatePassModal: React.FC<GatePassModalProps> = ({ gatePassId, onClose }) => {
  const store = useCrusherStore();
  const [copied, setCopied] = useState(false);

  if (!gatePassId) return null;

  const gatePass = store.gatePasses.find(
    (g) => g.id === gatePassId || g.gatePassNumber === gatePassId
  );
  const trip = gatePass ? store.trips.find((t) => t.id === gatePass.tripId) : null;
  const wb = trip ? store.weighbridgeTransactions.find((w) => w.tripId === trip.id) : null;
  const customer = trip ? store.customers.find((c) => c.id === trip.customerId) : null;
  const vehicle = trip ? store.vehicles.find((v) => v.id === trip.vehicleId) : null;
  const driver = trip ? store.drivers.find((d) => d.id === trip.driverId) : null;
  const product = trip ? store.products.find((p) => p.id === trip.productId) : null;

  if (!gatePass) return null;

  const netWeight = gatePass.netWeightMt || trip?.netWeightMt || trip?.orderedQtyMt || 20;
  const tareWeight = wb?.tareWeightMt || trip?.tareWeightMt || 10.4;
  const grossWeight = wb?.grossWeightMt || trip?.grossWeightMt || Number((tareWeight + netWeight).toFixed(2));
  const plateNumber = vehicle?.plateNumber || gatePass.vehiclePlate || 'MH 12 AB 1234';
  const customerName = customer?.companyName || gatePass.customerName || 'ABC Construction Infra Ltd';
  const driverName = driver?.name || gatePass.driverName || 'Ramesh Shinde';
  const driverPhone = driver?.phone || '+91 98234 56789';
  const destination = trip?.destination || gatePass.destination || 'MIDC Hinjawadi Phase 2, Pune';
  const productName = product?.name || gatePass.productName || '20mm Basalt Aggregate';
  const hsnCode = '25171010';
  const issuedDate = new Date(gatePass.issuedAt);
  const formattedDate = issuedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const formattedTime = issuedDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const handleCopySummary = () => {
    const text = `*SHREE SHIVAJI STONE CRUSHER & MINES*
*DISPATCH GATE PASS:* ${gatePass.gatePassNumber}
----------------------------------------
*Trip ID:* ${trip?.tripNumber || 'N/A'}
*Date & Time:* ${formattedDate} ${formattedTime}
*Customer:* ${customerName}
*Destination:* ${destination}
*Vehicle No:* ${plateNumber}
*Driver:* ${driverName} (${driverPhone})
*Material:* ${productName} (HSN: ${hsnCode})
----------------------------------------
*Gross Wt:* ${grossWeight.toFixed(2)} MT
*Tare Wt:* ${tareWeight.toFixed(2)} MT
*Net Dispatched:* ${netWeight.toFixed(2)} MT (${numberToWords(netWeight)})
----------------------------------------
*Weighbridge Slip:* ${wb?.slipNumber || 'WB-2026-0001'}
*Status:* VERIFIED & DISPATCHED
*Verification Link:* https://stonecrusher.internal/verify/${gatePass.gatePassNumber}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
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
          maxWidth: '780px',
          backgroundColor: '#F8FAFC',
          borderRadius: '16px',
          padding: '0',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Top Control Bar (Hidden when printing) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            borderBottom: '1px solid #1E293B',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1rem',
              }}
            >
              ❖
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Official Transit Gate Pass</span>
                <span
                  style={{
                    backgroundColor: '#16A34A',
                    color: '#FFF',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    letterSpacing: '0.05em',
                  }}
                >
                  VERIFIED
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{gatePass.gatePassNumber} • Ready for Print & Dispatch</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleCopySummary}
              className="owner-btn-secondary"
              style={{
                padding: '7px 12px',
                fontSize: '0.78rem',
                backgroundColor: '#1E293B',
                color: '#E2E8F0',
                border: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              {copied ? <Check size={14} color="#22C55E" /> : <Copy size={14} />}
              {copied ? 'Copied Slip!' : 'Copy Summary'}
            </button>

            <button
              onClick={() => window.print()}
              style={{
                padding: '7px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
              }}
            >
              <Printer size={14} /> Print Gate Pass
            </button>

            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#1E293B',
                color: '#94A3B8',
                border: '1px solid #334155',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div style={{ overflowY: 'auto', padding: '20px', backgroundColor: '#F1F5F9' }}>
          {/* Printable White Paper Sheet */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #CBD5E1',
              borderRadius: '8px',
              padding: '24px 28px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              position: 'relative',
              color: '#0F172A',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}
          >
            {/* Top Navy Security Stripe */}
            <div
              style={{
                height: '5px',
                background: 'linear-gradient(90deg, #1E3A8A 0%, #2563EB 50%, #1E3A8A 100%)',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                borderTopLeftRadius: '6px',
                borderTopRightRadius: '6px',
              }}
            />

            {/* Header / Letterhead */}
            <div style={{ borderBottom: '2px solid #0F172A', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      backgroundColor: '#0F172A',
                      color: '#F59E0B',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.75rem',
                      fontWeight: 900,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    }}
                  >
                    ❖
                  </div>
                  <div>
                    <h1 style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '0.02em', color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
                      SHREE SHIVAJI STONE CRUSHER & MINES LLP
                    </h1>
                    <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#475569', marginTop: '2px' }}>
                      Certified Basalt Aggregate Processing Plant & 60 MT Pitless Electronic Weighbridge
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                      Survey No. 84/2, Saswad-Pune Road, Tal: Purandar, Dist: Pune - 412301, Maharashtra
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.7rem', color: '#475569', lineHeight: 1.5 }}>
                  <div><strong>GSTIN:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>27AABCS8899K1Z5</span></div>
                  <div><strong>DGM Royalty Lic:</strong> <span style={{ fontFamily: 'monospace' }}>DGM/MH/PUN/2026-784</span></div>
                  <div><strong>Legal Metrology:</strong> <span style={{ fontFamily: 'monospace' }}>W&M/PUN/2026/098</span></div>
                </div>
              </div>

              {/* Title Banner */}
              <div
                style={{
                  marginTop: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '4px',
                }}
              >
                <div style={{ fontSize: '0.88rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  MINERAL TRANSIT DISPATCH GATE PASS
                </div>
                <div style={{ fontSize: '0.72rem', color: '#FCD34D', fontWeight: 700, letterSpacing: '0.04em' }}>
                  ORIGINAL FOR TRANSPORTER / CONSIGNEE
                </div>
              </div>
            </div>

            {/* Key Pass Identifiers Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '10px 14px',
                marginBottom: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Gate Pass No</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2563EB', fontFamily: 'monospace' }}>
                  {gatePass.gatePassNumber}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Trip Booking ID</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', fontFamily: 'monospace' }}>
                  {trip?.tripNumber || 'TRP-2026-0001'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Issue Date & Time</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                  {formattedDate} • {formattedTime}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Weighbridge Slip Ref</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', fontFamily: 'monospace' }}>
                  {wb?.slipNumber || 'WB-2026-0001'}
                </div>
              </div>
            </div>

            {/* Consignee & Transport 2-Column Section */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '14px',
                marginBottom: '16px',
              }}
            >
              {/* Consignee Details */}
              <div
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '12px 14px',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#2563EB',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Building2 size={13} /> Consignee / Billed Contractor
                </div>

                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                  {customerName}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#475569', marginBottom: '2px' }}>
                  <strong>GSTIN:</strong> <span style={{ fontFamily: 'monospace' }}>{customer?.gstNumber || '27AABCA1234F1Z8'}</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '4px', marginTop: '4px' }}>
                  <MapPin size={13} style={{ flexShrink: 0, marginTop: '2px', color: '#EF4444' }} />
                  <span><strong>Destination:</strong> {destination}</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '4px' }}>
                  <strong>Scheduled Delivery:</strong> {trip?.requiredDate || 'Immediate Dispatch'}
                </div>
              </div>

              {/* Vehicle & Transporter Details */}
              <div
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '12px 14px',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#2563EB',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Truck size={13} /> Transport & Vehicle Particulars
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Truck Reg. No:</span>
                  <div
                    style={{
                      backgroundColor: '#FEF08A',
                      color: '#000000',
                      border: '2px solid #000000',
                      borderRadius: '4px',
                      padding: '2px 10px',
                      fontFamily: 'monospace',
                      fontWeight: 900,
                      fontSize: '0.95rem',
                      letterSpacing: '0.08em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ fontSize: '0.6rem', color: '#4B5563' }}>IND</span>
                    <span>{plateNumber}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.74rem', color: '#475569', marginBottom: '2px' }}>
                  <strong>Assigned Driver:</strong> <span style={{ fontWeight: 700, color: '#0F172A' }}>{driverName}</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#475569', marginBottom: '2px' }}>
                  <strong>Contact Phone:</strong> {driverPhone}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                  <strong>Driver License:</strong> <span style={{ fontFamily: 'monospace' }}>{driver?.licenseNumber || 'MH-1220180045921'}</span>
                </div>
              </div>
            </div>

            {/* Certified Weighment Details Table */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Scale size={14} color="#16A34A" /> Certified Electronic Weighbridge Measurements
              </div>

              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.8rem',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #CBD5E1' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: '0.72rem' }}>MATERIAL DESCRIPTION</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#475569', fontSize: '0.72rem' }}>HSN CODE</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '0.72rem' }}>TARE WT (EMPTY)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '0.72rem' }}>GROSS WT (LOADED)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 800, color: '#16A34A', fontSize: '0.75rem' }}>NET WEIGHT DISPATCHED</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>{productName}</strong>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Machine Crushed Basalt Stone Aggregate (Graded)</div>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'monospace', color: '#64748B' }}>
                      {hsnCode}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>
                      {tareWeight.toFixed(2)} MT
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>
                      {grossWeight.toFixed(2)} MT
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', backgroundColor: '#F0FDF4' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#15803D' }}>
                        {netWeight.toFixed(2)} MT
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Weight in words banner */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderTop: 'none',
                  padding: '8px 12px',
                  fontSize: '0.75rem',
                }}
              >
                <div>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Weight in Words: </span>
                  <strong style={{ color: '#0F172A' }}>{numberToWords(netWeight)}</strong>
                </div>
                <div style={{ color: '#15803D', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}>
                  <ShieldCheck size={13} /> Zero Tolerance Electronic Sensor Verified
                </div>
              </div>
            </div>

            {/* Security Verification & Signatures */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 2fr',
                gap: '16px',
                borderTop: '1px solid #E2E8F0',
                paddingTop: '14px',
                marginTop: '10px',
              }}
            >
              {/* Security QR Code & Stamp */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '74px',
                    height: '74px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <QrCode size={64} color="#0F172A" />
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase' }}>
                    Government Transit QR
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '2px', lineHeight: 1.3 }}>
                    Scan to verify authenticity on Maharashtra Mining E-Transit Portal.
                  </div>
                  {/* Official Stamp */}
                  <div
                    style={{
                      display: 'inline-block',
                      marginTop: '6px',
                      padding: '2px 8px',
                      border: '1.5px dashed #DC2626',
                      borderRadius: '4px',
                      color: '#DC2626',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    ★ EXIT CLEARED - SECURITY GATE 01 ★
                  </div>
                </div>
              </div>

              {/* Three Signatures */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div style={{ height: '36px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: '0.8rem', color: '#475569', fontStyle: 'italic' }}>
                    {driverName.slice(0, 10)}
                  </div>
                  <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '4px', fontSize: '0.65rem', fontWeight: 700, color: '#475569' }}>
                    Driver Signature
                  </div>
                  <div style={{ fontSize: '0.58rem', color: '#94A3B8' }}>Material Received</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div style={{ height: '36px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontFamily: 'serif', fontSize: '1rem', fontWeight: 700, color: '#1E3A8A' }}>
                    {gatePass.issuedBy || 'S. Gaikwad'}
                  </div>
                  <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '4px', fontSize: '0.65rem', fontWeight: 700, color: '#475569' }}>
                    Weighbridge Officer
                  </div>
                  <div style={{ fontSize: '0.58rem', color: '#94A3B8' }}>Certified Scale Deck</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div style={{ height: '36px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', color: '#16A34A', fontWeight: 700, fontSize: '0.78rem' }}>
                    GATE-01 PASS
                  </div>
                  <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '4px', fontSize: '0.65rem', fontWeight: 700, color: '#475569' }}>
                    Security In-Charge
                  </div>
                  <div style={{ fontSize: '0.58rem', color: '#94A3B8' }}>Outward Verified</div>
                </div>
              </div>
            </div>

            {/* Legal / Transit Footer Notice */}
            <div
              style={{
                marginTop: '14px',
                borderTop: '1px dashed #CBD5E1',
                paddingTop: '8px',
                fontSize: '0.6rem',
                color: '#94A3B8',
                textAlign: 'center',
                lineHeight: 1.4,
              }}
            >
              This Gate Pass certifies official weighment and exit clearance under Maharashtra Minor Mineral Extraction & Transit Rules.
              Valid for transit within 24 hours of issue time. Any unauthorized diversion of mineral transit is punishable under Section 4(1A) of MMDR Act.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
