'use client';

import React, { useState } from 'react';
import { useCrusherStore } from '../../lib/store/useCrusherStore';
import { Header } from './Header';
import { WhatsAppSimulator } from '../whatsapp/WhatsAppSimulator';
import { GatePassModal } from '../documents/GatePassModal';
import { RawMaterialReceiptModal } from '../documents/RawMaterialReceiptModal';
import { Smartphone } from 'lucide-react';

interface DashboardLayoutProps {
  children: (helpers: {
    openWhatsApp: () => void;
    viewGatePass: (id: string) => void;
    viewReceipt: (id: string) => void;
  }) => React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const store = useCrusherStore();

  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [activeGatePassId, setActiveGatePassId] = useState<string | null>(null);
  const [activeReceiptId, setActiveReceiptId] = useState<string | null>(null);

  const handleViewDocument = (type: 'GATE_PASS' | 'RECEIPT', id: string) => {
    if (type === 'GATE_PASS') setActiveGatePassId(id);
    else setActiveReceiptId(id);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onOpenWhatsAppSimulator={() => setIsWhatsAppOpen(true)} />

      <main style={{ flex: 1, padding: '16px 20px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        {children({
          openWhatsApp: () => setIsWhatsAppOpen(true),
          viewGatePass: (id) => setActiveGatePassId(id),
          viewReceipt: (id) => setActiveReceiptId(id),
        })}
      </main>

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

      {/* Discreet floating button */}
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
        onViewDocument={handleViewDocument}
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
};
