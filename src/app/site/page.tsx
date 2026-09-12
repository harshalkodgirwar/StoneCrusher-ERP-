'use client';

import React, { useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SiteOperatorDashboard } from '../../components/dashboards/SiteOperatorDashboard';
import { crusherStore } from '../../lib/store/crusher-store';

export default function SitePage() {
  useEffect(() => {
    crusherStore.setRole('SITE_OPERATOR');
  }, []);

  return (
    <DashboardLayout>
      {({ openWhatsApp, viewGatePass, viewReceipt }) => (
        <SiteOperatorDashboard
          onOpenWhatsAppSimulator={openWhatsApp}
          onViewGatePass={viewGatePass}
          onViewReceipt={viewReceipt}
        />
      )}
    </DashboardLayout>
  );
}
