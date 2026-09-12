'use client';

import React from 'react';
import { useCrusherStore } from '../../lib/store/useCrusherStore';
import { crusherStore, InternalRole } from '../../lib/store/crusher-store';
import {
  ShieldAlert,
  Smartphone,
  Truck,
  Scale,
  Briefcase,
  Layers,
  Radio,
  Clock,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

interface HeaderProps {
  onOpenWhatsAppSimulator: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWhatsAppSimulator }) => {
  const store = useCrusherStore();

  const failedMessagesCount = store.whatsappMessages.filter(
    (m) => m.status === 'FAILED'
  ).length;

  const queuedTripsCount = store.trips.filter((t) => t.status === 'QUEUED').length;

  return (
    <header
      style={{
        backgroundColor: '#0A0F1D',
        borderBottom: '1px solid #1E293B',
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Brand & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              fontWeight: 900,
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.35)',
            }}
          >
            <Layers size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFF' }}>
                STONECRUSHER <span style={{ color: '#F59E0B' }}>ERP</span>
              </h1>
              <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                V1 INTERNAL
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
              Quarry Production • Automated Weighbridge • WhatsApp Dispatch
            </p>
          </div>
        </div>

        {/* Internal Role Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#111827',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid #1F2937',
            gap: '4px',
          }}
        >
          <div
            style={{
              padding: '0 8px',
              fontSize: '0.7rem',
              color: '#64748B',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            ACTIVE DASHBOARD:
          </div>

          <RoleButton
            role="OWNER_ADMIN"
            label="Owner / Admin"
            icon={<Briefcase size={14} />}
            current={store.currentRole}
            onClick={() => crusherStore.setRole('OWNER_ADMIN')}
          />

          <RoleButton
            role="OFFICE_OPERATOR"
            label="Office Operator"
            icon={<Truck size={14} />}
            current={store.currentRole}
            badge={queuedTripsCount > 0 ? `${queuedTripsCount}` : undefined}
            onClick={() => crusherStore.setRole('OFFICE_OPERATOR')}
          />

          <RoleButton
            role="SITE_OPERATOR"
            label="Site Operator"
            icon={<Scale size={14} />}
            current={store.currentRole}
            badge="WEIGH"
            onClick={() => crusherStore.setRole('SITE_OPERATOR')}
          />
        </div>

        {/* Right Utility Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Active Operator Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#131B2E',
              border: '1px solid #28395A',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.75rem',
            }}
          >
            <UserCheck size={14} color="#10B981" />
            <span style={{ color: '#E2E8F0', fontWeight: 600 }}>{store.currentStaffName}</span>
          </div>

          {/* WhatsApp Phone Simulator Launcher Button */}
          <button
            onClick={onOpenWhatsAppSimulator}
            className="btn-success"
            style={{
              padding: '8px 14px',
              fontSize: '0.78rem',
              backgroundColor: '#075E54',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #25D366',
              position: 'relative',
            }}
          >
            <Smartphone size={16} color="#25D366" />
            <span>WhatsApp Simulator</span>
            {failedMessagesCount > 0 ? (
              <span
                style={{
                  backgroundColor: '#EF4444',
                  color: '#FFF',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <AlertTriangle size={10} /> {failedMessagesCount} Failed
              </span>
            ) : (
              <span
                style={{
                  backgroundColor: '#25D366',
                  color: '#000',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                }}
              >
                {store.whatsappMessages.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

interface RoleButtonProps {
  role: InternalRole;
  label: string;
  icon: React.ReactNode;
  current: InternalRole;
  badge?: string;
  onClick: () => void;
}

const RoleButton: React.FC<RoleButtonProps> = ({ role, label, icon, current, badge, onClick }) => {
  const isActive = current === role;

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '7px',
        fontSize: '0.8rem',
        fontWeight: isActive ? 700 : 500,
        background: isActive
          ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
          : 'transparent',
        color: isActive ? '#000' : '#94A3B8',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span
          style={{
            backgroundColor: isActive ? 'rgba(0,0,0,0.25)' : '#334155',
            color: isActive ? '#000' : '#CBD5E1',
            padding: '1px 5px',
            borderRadius: '4px',
            fontSize: '0.65rem',
            fontWeight: 800,
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
};
