'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import '../owner/owner-dashboard.css';
import { WhatsAppSimulator } from '../../components/whatsapp/WhatsAppSimulator';
import { GatePassModal } from '../../components/documents/GatePassModal';
import { RawMaterialReceiptModal } from '../../components/documents/RawMaterialReceiptModal';
import { crusherStore } from '../../lib/store/crusher-store';

const SiteOperatorDashboard = dynamic(
  () =>
    import('../../components/dashboards/SiteOperatorDashboard').then(
      (m) => m.SiteOperatorDashboard
    ),
  {
    ssr: false,
    loading: () => (
      <div style={{ minHeight: '100vh', backgroundColor: '#F4F7FC', padding: '40px', color: '#64748B' }}>
        Loading Site Weighbridge Terminal...
      </div>
    ),
  }
);

export default function SitePage() {
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [activeGatePassId, setActiveGatePassId] = useState<string | null>(null);
  const [activeReceiptId, setActiveReceiptId] = useState<string | null>(null);

  useEffect(() => {
    crusherStore.setRole('SITE_OPERATOR');
  }, []);

  const handleViewDocument = (type: 'GATE_PASS' | 'RECEIPT', id: string) => {
    if (type === 'GATE_PASS') setActiveGatePassId(id);
    else setActiveReceiptId(id);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F4F7FC' }}>
      <SiteOperatorDashboard
        onOpenWhatsAppSimulator={() => setIsWhatsAppOpen(true)}
        onViewGatePass={(id) => setActiveGatePassId(id)}
        onViewReceipt={(id) => setActiveReceiptId(id)}
      />

      {/* WhatsApp Virtual Simulator Modal */}
      <WhatsAppSimulator
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        onViewDocument={handleViewDocument}
      />

      {/* Gate Pass Printable Modal */}
      <GatePassModal
        gatePassId={activeGatePassId}
        onClose={() => setActiveGatePassId(null)}
      />

      {/* Raw Material Inward Receipt Printable Modal */}
      <RawMaterialReceiptModal
        receiptId={activeReceiptId}
        onClose={() => setActiveReceiptId(null)}
      />
    </div>
  );
}
