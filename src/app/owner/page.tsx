'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import './owner-dashboard.css';
import { WhatsAppSimulator } from '../../components/whatsapp/WhatsAppSimulator';
import { GatePassModal } from '../../components/documents/GatePassModal';
import { RawMaterialReceiptModal } from '../../components/documents/RawMaterialReceiptModal';
import { crusherStore } from '../../lib/store/crusher-store';

const OwnerAdminDashboard = dynamic(
  () =>
    import('../../components/dashboards/OwnerAdminDashboard').then(
      (m) => m.OwnerAdminDashboard
    ),
  {
    ssr: false,
    loading: () => (
      <div style={{ minHeight: '100vh', backgroundColor: '#F4F7FC', padding: '40px', color: '#64748B' }}>
        Loading Owner Executive Dashboard...
      </div>
    ),
  }
);

export default function OwnerPage() {
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [activeGatePassId, setActiveGatePassId] = useState<string | null>(null);
  const [activeReceiptId, setActiveReceiptId] = useState<string | null>(null);

  useEffect(() => {
    crusherStore.setRole('OWNER_ADMIN');
  }, []);

  const handleViewDocument = (type: 'GATE_PASS' | 'RECEIPT', id: string) => {
    if (type === 'GATE_PASS') setActiveGatePassId(id);
    else setActiveReceiptId(id);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F4F7FC' }}>
      <OwnerAdminDashboard
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
