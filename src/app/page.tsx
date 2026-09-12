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
import { Smartphone, Layers } from 'lucide-react';

export default function Home() {
  const store = useCrusherStore();

  // WhatsApp Virtual Simulator State
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState<boolean>(false);

  // Modal documents state
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
      {/* Top Header with Role Switcher & Live Indicators */}
      <Header onOpenWhatsAppSimulator={() => setIsWhatsAppOpen(true)} />

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
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

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #1E293B',
          padding: '16px 24px',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#64748B',
          backgroundColor: '#070A12',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <span>StoneCrusher Industrial ERP System • Next.js & Supabase Engine</span>
          <span>•</span>
          <span style={{ color: '#25D366' }}>External Portals Disabled (WhatsApp Notification Architecture V1)</span>
        </div>
      </footer>

      {/* Floating WhatsApp Quick Launcher Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999,
        }}
      >
        <button
          onClick={() => setIsWhatsAppOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.85rem',
            padding: '12px 18px',
            borderRadius: '9999px',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 10px 25px -3px rgba(37, 211, 102, 0.5)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Smartphone size={20} />
          <span>WhatsApp Live Phone</span>
          <span
            style={{
              backgroundColor: '#075E54',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.72rem',
            }}
          >
            {store.whatsappMessages.length}
          </span>
        </button>
      </div>

      {/* WhatsApp Virtual Simulator Modal */}
      <WhatsAppSimulator
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        onViewDocument={handleViewDocumentFromWhatsApp}
      />

      {/* Printable / Viewable Gate Pass Modal */}
      <GatePassModal
        gatePassId={activeGatePassId}
        onClose={() => setActiveGatePassId(null)}
      />

      {/* Printable / Viewable Raw Material Receipt Modal */}
      <RawMaterialReceiptModal
        receiptId={activeReceiptId}
        onClose={() => setActiveReceiptId(null)}
      />
    </div>
  );
}
