'use client';

import React, { useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { OfficeOperatorDashboard } from '../../components/dashboards/OfficeOperatorDashboard';
import { crusherStore } from '../../lib/store/crusher-store';

export default function OfficePage() {
  useEffect(() => {
    crusherStore.setRole('OFFICE_OPERATOR');
  }, []);

  return (
    <DashboardLayout>
      {({ openWhatsApp, viewGatePass }) => (
        <OfficeOperatorDashboard
          onOpenWhatsAppSimulator={openWhatsApp}
          onViewGatePass={viewGatePass}
        />
      )}
    </DashboardLayout>
  );
}
