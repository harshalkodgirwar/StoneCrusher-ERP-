'use client';

import React, { useState } from 'react';
import { useCrusherStore } from '../lib/store/useCrusherStore';
import { Header } from '../components/layout/Header';
import { OwnerAdminDashboard } from '../components/dashboards/OwnerAdminDashboard';
import { OfficeOperatorDashboard } from '../components/dashboards/OfficeOperatorDashboard';
import { SiteOperatorDashboard } from '../components/dashboards/SiteOperatorDashboard';
import { WhatsAppSimulator } from '../components/whatsapp/WhatsAppSimulator';
import { GatePassModal } from '../components/documents/GatePassModal';
import { RawMaterialReceiptModal } from '../components/documents/RawMaterialReceiptModal';
import { Smartphone } from 'lucide-react';

export default function Home() {
  const store = useCrusherStore();

  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState<boolean>(false);
  const [activeGatePassId, setActiveGatePassId] = useState<string | null>(null);
  const [activeReceiptId, setActiveReceiptId] = useState<string | null>(null);

  const handleViewDocumentFromWhatsApp = (
    docType: 'GATE_PASS' | 'RECEIPT',
    docId: string
  ) => {
    if (docType === 'GATE_PASS') {
      setActiveGatePassId(docId);
    } else {
      setActiveReceiptId(docId);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <Header onOpenWhatsAppSimulator={() => setIsWhatsAppOpen(true)} />

      {/* Main Container */}
      <main style={{ flex: 1, padding: '16px 20px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        {store.currentRole === 'OWNER_ADMIN' && (
          <OwnerAdminDashboard
            onOpenWhatsAppSimulator={() => setIsWhatsAppOpen(true)}
            onViewGatePass={(gpId) => setActiveGatePassId(gpId)}
            onViewReceipt={(rId) => setActiveReceiptId(rId)}
          />
        )}

        {store.currentRole === 'OFFICE_OPERATOR' && (
          <OfficeOperatorDashboard
            onOpenWhatsAppSimulator={() => setIsWhatsAppOpen(true)}
            onViewGatePass={(gpId) => setActiveGatePassId(gpId)}
          />
        )}

        {store.currentRole === 'SITE_OPERATOR' && (
          <SiteOperatorDashboard
            onOpenWhatsAppSimulator={() => setIsWhatsAppOpen(true)}
            onViewGatePass={(gpId) => setActiveGatePassId(gpId)}
            onViewReceipt={(rId) => setActiveReceiptId(rId)}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer
        style={{
          borderTop: '1px solid #1F2937',
          padding: '12px 20px',
          textAlign: 'center',
          fontSize: '0.72rem',
          color: '#6B7280',
        }}
      >
        StoneCrusher ERP • Internal Dashboards Only • External Communication via WhatsApp
      </footer>

      {/* Discreet Floating Button */}
      <button
        onClick={() => setIsWhatsAppOpen(true)}
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 900,
          backgroundColor: '#1F2937',
          color: '#D1D5DB',
          border: '1px solid #374151',
          borderRadius: '20px',
          padding: '6px 12px',
          fontSize: '0.75rem',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
        }}
      >
        <Smartphone size={13} color="#10B981" />
        <span>WhatsApp ({store.whatsappMessages.length})</span>
      </button>

      {/* Modals */}
      <WhatsAppSimulator
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        onViewDocument={handleViewDocumentFromWhatsApp}
      />

      <GatePassModal
        gatePassId={activeGatePassId}
        onClose={() => setActiveGatePassId(null)}
      />

      <RawMaterialReceiptModal
        receiptId={activeReceiptId}
        onClose={() => setActiveReceiptId(null)}
      />
    </div>
  );
}
