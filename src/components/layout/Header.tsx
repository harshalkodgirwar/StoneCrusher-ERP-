'use client';

import React from 'react';
import { useCrusherStore } from '../../lib/store/useCrusherStore';
import { crusherStore, InternalRole } from '../../lib/store/crusher-store';
import {
  Layers,
  Smartphone,
  CheckCircle,
  AlertCircle,
  User,
} from 'lucide-react';

interface HeaderProps {
  onOpenWhatsAppSimulator: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWhatsAppSimulator }) => {
  const store = useCrusherStore();

  const failedCount = store.whatsappMessages.filter((m) => m.status === 'FAILED').length;
  const queuedCount = store.trips.filter((t) => t.status === 'QUEUED').length;

  return (
    <header
      style={{
        backgroundColor: '#111827',
        borderBottom: '1px solid #1F2937',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
          }}
        >
          <Layers size={18} />
        </div>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#F9FAFB', lineHeight: 1.2 }}>
            StoneCrusher <span style={{ color: '#60A5FA', fontWeight: 500 }}>ERP</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Internal Operations System</div>
        </div>
      </div>

      {/* Role Navigation (Segmented Switcher) */}
      <div
        style={{
          display: 'flex',
          backgroundColor: '#0B0F17',
          padding: '3px',
          borderRadius: '6px',
          border: '1px solid #1F2937',
          gap: '2px',
        }}
      >
        <RoleTab
          active={store.currentRole === 'OWNER_ADMIN'}
          label="Owner / Admin"
          onClick={() => crusherStore.setRole('OWNER_ADMIN')}
        />
        <RoleTab
          active={store.currentRole === 'OFFICE_OPERATOR'}
          label="Office Operator"
          badge={queuedCount > 0 ? `${queuedCount}` : undefined}
          onClick={() => crusherStore.setRole('OFFICE_OPERATOR')}
        />
        <RoleTab
          active={store.currentRole === 'SITE_OPERATOR'}
          label="Site Operator"
          onClick={() => crusherStore.setRole('SITE_OPERATOR')}
        />
      </div>

      {/* User & WhatsApp Preview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            color: '#D1D5DB',
            backgroundColor: '#1F2937',
            padding: '5px 10px',
            borderRadius: '6px',
          }}
        >
          <User size={13} color="#9CA3AF" />
          <span>{store.currentStaffName}</span>
        </div>

        <button
          onClick={onOpenWhatsAppSimulator}
          className="btn-secondary"
          style={{
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderColor: failedCount > 0 ? '#EF4444' : '#374151',
          }}
        >
          <Smartphone size={14} color="#10B981" />
          <span>WhatsApp Simulator</span>
          {failedCount > 0 ? (
            <span style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.72rem' }}>
              ({failedCount} failed)
            </span>
          ) : (
            <span style={{ color: '#9CA3AF', fontSize: '0.72rem' }}>
              ({store.whatsappMessages.length})
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

const RoleTab: React.FC<{
  active: boolean;
  label: string;
  badge?: string;
  onClick: () => void;
}> = ({ active, label, badge, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '5px 12px',
      fontSize: '0.78rem',
      fontWeight: active ? 600 : 400,
      borderRadius: '4px',
      border: 'none',
      backgroundColor: active ? '#2563EB' : 'transparent',
      color: active ? '#FFFFFF' : '#9CA3AF',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.15s ease',
    }}
  >
    <span>{label}</span>
    {badge && (
      <span
        style={{
          fontSize: '0.68rem',
          backgroundColor: active ? 'rgba(255,255,255,0.25)' : '#1F2937',
          color: active ? '#FFFFFF' : '#D1D5DB',
          padding: '0 5px',
          borderRadius: '3px',
          fontWeight: 600,
        }}
      >
        {badge}
      </span>
    )}
  </button>
);
