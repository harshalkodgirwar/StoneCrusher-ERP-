'use client';

import React from 'react';
import { useCrusherStore } from '../../lib/store/useCrusherStore';
import { X, Printer, ShieldCheck, QrCode } from 'lucide-react';

interface GatePassModalProps {
  gatePassId: string | null;
  onClose: () => void;
}

export const GatePassModal: React.FC<GatePassModalProps> = ({ gatePassId, onClose }) => {
  const store = useCrusherStore();

  if (!gatePassId) return null;

  const gatePass = store.gatePasses.find(
    (g) => g.id === gatePassId || g.gatePassNumber === gatePassId
  );
  const trip = gatePass ? store.trips.find((t) => t.id === gatePass.tripId) : null;
  const wb = trip ? store.weighbridgeTransactions.find((w) => w.tripId === trip.id) : null;

  if (!gatePass) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.85)',
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
        className="crusher-card printable-document animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#0F172A',
          border: '2px solid #334155',
          borderRadius: '16px',
          padding: '24px',
          color: '#F8FAFC',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
          maxHeight: '94vh',
          overflowY: 'auto',
        }}
      >
        {/* Top Control Bar (Hidden when printing) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: '1px solid #1E293B',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-emerald">Verified Exit Gate Pass</span>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{gatePass.gatePassNumber}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => window.print()}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              <Printer size={14} /> Print Document
            </button>
            <button
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Printable Pass Body */}
        <div
          style={{
            border: '2px solid #334155',
            borderRadius: '12px',
            padding: '24px',
            backgroundColor: '#0B0F19',
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: 'center',
              borderBottom: '2px dashed #334155',
              paddingBottom: '16px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.05em', color: '#F59E0B' }}>
                SHREE SHIVAJI STONE CRUSHER & MINES
              </h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>
              Survey No. 84/2, Saswad-Pune Road, Tal: Purandar, Dist: Pune - 412301
            </p>
            <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
              GSTIN: 27AABCS8899K1Z5 • Weighbridge License: WB/PUN/2024/098
            </p>
            <div
              style={{
                display: 'inline-block',
                marginTop: '10px',
                padding: '4px 16px',
                background: '#F59E0B',
                color: '#000',
                fontWeight: 800,
                fontSize: '0.85rem',
                borderRadius: '4px',
                letterSpacing: '1px',
              }}
            >
              DISPATCH GATE PASS
            </div>
          </div>

          {/* Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              fontSize: '0.85rem',
              marginBottom: '20px',
            }}
          >
            <div>
              <div style={{ color: '#64748B', fontSize: '0.72rem', textTransform: 'uppercase' }}>Gate Pass No.</div>
              <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '1rem' }}>{gatePass.gatePassNumber}</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.72rem', textTransform: 'uppercase' }}>Trip Reference</div>
              <div style={{ fontWeight: 700, color: '#60A5FA' }}>{trip?.tripNumber || 'N/A'}</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.72rem', textTransform: 'uppercase' }}>Issue Date & Time</div>
              <div style={{ fontWeight: 600 }}>{new Date(gatePass.issuedAt).toLocaleString()}</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.72rem', textTransform: 'uppercase' }}>Issued By</div>
              <div style={{ fontWeight: 600 }}>{gatePass.issuedBy}</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.72rem', textTransform: 'uppercase' }}>Customer / Consignee</div>
              <div style={{ fontWeight: 700, color: '#F59E0B' }}>{gatePass.customerName}</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.72rem', textTransform: 'uppercase' }}>Delivery Destination</div>
              <div style={{ fontWeight: 600 }}>{gatePass.destination}</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.72rem', textTransform: 'uppercase' }}>Vehicle Plate Number</div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#10B981' }}>{gatePass.vehiclePlate}</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.72rem', textTransform: 'uppercase' }}>Assigned Driver</div>
              <div style={{ fontWeight: 600 }}>{gatePass.driverName}</div>
            </div>
          </div>

          {/* Weighbridge Verification Box */}
          <div
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1F2937',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#10B981',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ShieldCheck size={16} /> Certified Weighbridge Measurement
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                textAlign: 'center',
              }}
            >
              <div style={{ background: '#1F2937', padding: '8px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>MATERIAL</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#F3F4F6', marginTop: '4px' }}>
                  {gatePass.productName}
                </div>
              </div>

              <div style={{ background: '#1F2937', padding: '8px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>GROSS WT</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#60A5FA', marginTop: '4px' }}>
                  {trip?.grossWeightMt ? `${trip.grossWeightMt} MT` : 'N/A'}
                </div>
              </div>

              <div style={{ background: '#1F2937', padding: '8px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>TARE WT</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#F87171', marginTop: '4px' }}>
                  {trip?.tareWeightMt ? `${trip.tareWeightMt} MT` : 'N/A'}
                </div>
              </div>

              <div style={{ background: '#064E3B', padding: '8px', borderRadius: '6px', border: '1px solid #059669' }}>
                <div style={{ fontSize: '0.7rem', color: '#A7F3D0' }}>NET WT DISPATCHED</div>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#34D399', marginTop: '2px' }}>
                  {gatePass.netWeightMt} MT
                </div>
              </div>
            </div>
          </div>

          {/* Verification Footnotes & Signatures */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              paddingTop: '16px',
              borderTop: '1px solid #1F2937',
            }}
          >
            {/* Simulated QR Code */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#FFF',
                  color: '#000',
                  borderRadius: '6px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <QrCode size={56} />
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', maxWidth: '140px' }}>
                Scan to verify authenticity on government mineral transit portal
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8' }}>Authorized Signatory</div>
              <div
                style={{
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  fontFamily: 'cursive',
                  color: '#F59E0B',
                  fontSize: '1rem',
                }}
              >
                {gatePass.issuedBy}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Weighbridge & Security Officer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
