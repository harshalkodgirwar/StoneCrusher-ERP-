'use client';

import React, { useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { OwnerAdminDashboard } from '../../components/dashboards/OwnerAdminDashboard';
import { crusherStore } from '../../lib/store/crusher-store';

export default function OwnerPage() {
  useEffect(() => {
    crusherStore.setRole('OWNER_ADMIN');
  }, []);

  return (
    <DashboardLayout>
      {({ openWhatsApp, viewGatePass, viewReceipt }) => (
        <OwnerAdminDashboard
          onOpenWhatsAppSimulator={openWhatsApp}
          onViewGatePass={viewGatePass}
          onViewReceipt={viewReceipt}
        />
      )}
    </DashboardLayout>
  );
}
