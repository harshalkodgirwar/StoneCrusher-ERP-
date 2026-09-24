'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import '../owner/owner-dashboard.css';
import { WhatsAppSimulator } from '../../components/whatsapp/WhatsAppSimulator';
import { GatePassModal } from '../../components/documents/GatePassModal';
import { crusherStore } from '../../lib/store/crusher-store';

const OfficeOperatorDashboard = dynamic(
  () =>
    import('../../components/dashboards/OfficeOperatorDashboard').then(
      (m) => m.OfficeOperatorDashboard
    ),
  {
    ssr: false,
    loading: () => (
      <div style={{ minHeight: '100vh', backgroundColor: '#F4F7FC', padding: '40px', color: '#64748B' }}>
        Loading Office Operations & Order Booking Desk...
      </div>
    ),
  }
);

export default function OfficePage() {
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [activeGatePassId, setActiveGatePassId] = useState<string | null>(null);

  useEffect(() => {
    crusherStore.setRole('OFFICE_OPERATOR');
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F4F7FC' }}>
      <OfficeOperatorDashboard
        onOpenWhatsAppSimulator={() => setIsWhatsAppOpen(true)}
        onViewGatePass={(id) => setActiveGatePassId(id)}
      />

      {/* WhatsApp Virtual Simulator Modal */}
      <WhatsAppSimulator
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        onViewDocument={(type, id) => {
          if (type === 'GATE_PASS') setActiveGatePassId(id);
        }}
      />

      {/* Gate Pass Printable Modal */}
      <GatePassModal
        gatePassId={activeGatePassId}
        onClose={() => setActiveGatePassId(null)}
      />
    </div>
  );
}
