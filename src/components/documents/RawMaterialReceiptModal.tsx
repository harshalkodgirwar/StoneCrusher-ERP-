'use client';

import React from 'react';
import { useCrusherStore } from '../../lib/store/useCrusherStore';
import { X, Printer, CheckCircle, Package } from 'lucide-react';

interface RawMaterialReceiptModalProps {
  receiptId: string | null;
  onClose: () => void;
}

export const RawMaterialReceiptModal: React.FC<RawMaterialReceiptModalProps> = ({
  receiptId,
  onClose,
}) => {
  const store = useCrusherStore();

  if (!receiptId) return null;

  const receipt = store.rawMaterialReceipts.find(
    (r) => r.id === receiptId || r.receiptNumber === receiptId
  );

  if (!receipt) return null;

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
          maxWidth: '640px',
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
        {/* Top Control Bar */}
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
            <span className="badge badge-amber">Raw Material Inward Voucher</span>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{receipt.receiptNumber}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => window.print()}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              <Printer size={14} /> Print Receipt
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

        {/* Printable Body */}
        <div
          style={{
            border: '2px solid #334155',
            borderRadius: '12px',
            padding: '24px',
            backgroundColor: '#0B0F19',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              borderBottom: '2px dashed #334155',
              paddingBottom: '16px',
              marginBottom: '16px',
            }}
          >
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F59E0B' }}>
              SHREE SHIVAJI STONE CRUSHER & MINES
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Quarry Inward Gate & Quality Check Department
            </p>
            <div
              style={{
                display: 'inline-block',
                marginTop: '10px',
                padding: '4px 16px',
                background: '#3B82F6',
                color: '#FFF',
                fontWeight: 700,
                fontSize: '0.8rem',
                borderRadius: '4px',
                letterSpacing: '1px',
              }}
            >
              RAW MATERIAL INWARD RECEIPT
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
              fontSize: '0.85rem',
              marginBottom: '20px',
            }}
          >
            <div>
              <div style={{ color: '#64748B', fontSize: '0.7rem', textTransform: 'uppercase' }}>Receipt No</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{receipt.receiptNumber}</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.7rem', textTransform: 'uppercase' }}>Inward Date</div>
              <div style={{ fontWeight: 600 }}>{new Date(receipt.inwardTime).toLocaleString()}</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.7rem', textTransform: 'uppercase' }}>Supplier / Contractor</div>
              <div style={{ fontWeight: 700, color: '#F59E0B' }}>{receipt.supplierName}</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.7rem', textTransform: 'uppercase' }}>Truck / Dumper No</div>
              <div style={{ fontWeight: 700, color: '#10B981' }}>{receipt.vehicleNumber}</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.7rem', textTransform: 'uppercase' }}>Received By</div>
              <div style={{ fontWeight: 600 }}>{receipt.receivedBy}</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.7rem', textTransform: 'uppercase' }}>Status</div>
              <div style={{ color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} /> Stock Added to Quarry Reserve
              </div>
            </div>
          </div>

          {/* Table */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.85rem',
              marginBottom: '20px',
            }}
          >
            <thead>
              <tr style={{ background: '#1E293B', color: '#94A3B8', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>Material Description</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Quantity</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Rate / Brass</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #1E293B' }}>
                <td style={{ padding: '12px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={16} color="#F59E0B" />
                    {receipt.rawMaterialName}
                  </div>
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#38BDF8' }}>
                  {receipt.quantityBrass} Brass
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>₹{receipt.ratePerBrass.toLocaleString()}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: '#10B981', fontSize: '1rem' }}>
                  ₹{receipt.totalAmount.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Signatures */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              paddingTop: '20px',
              borderTop: '1px solid #1E293B',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Driver / Contractor Signature</div>
              <div style={{ height: '30px' }} />
              <div style={{ borderTop: '1px dashed #475569', width: '160px' }} />
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Authorized Crusher Receiver</div>
              <div style={{ height: '30px', color: '#F59E0B', fontFamily: 'cursive', fontSize: '0.9rem' }}>
                {receipt.receivedBy}
              </div>
              <div style={{ borderTop: '1px dashed #475569', width: '160px', marginLeft: 'auto' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
