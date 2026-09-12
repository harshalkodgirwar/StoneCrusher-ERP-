'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCrusherStore } from '../../lib/store/useCrusherStore';
import { crusherStore, InternalRole } from '../../lib/store/crusher-store';
import {
  Layers,
  Smartphone,
  User,
} from 'lucide-react';

interface HeaderProps {
  onOpenWhatsAppSimulator: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWhatsAppSimulator }) => {
  const store = useCrusherStore();
  const pathname = usePathname();

  const failedCount = store.whatsappMessages.filter((m) => m.status === 'FAILED').length;
  const queuedCount = store.trips.filter((t) => t.status === 'QUEUED').length;

  const handleRoleClick = (role: InternalRole) => {
    crusherStore.setRole(role);
  };

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
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
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
      </Link>

      {/* Role Navigation (Direct Links to Separate Pages) */}
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
        <RoleLink
          href="/owner"
          active={pathname === '/owner' || (pathname === '/' && store.currentRole === 'OWNER_ADMIN')}
          label="Owner / Admin"
          onClick={() => handleRoleClick('OWNER_ADMIN')}
        />
        <RoleLink
          href="/office"
          active={pathname === '/office' || (pathname === '/' && store.currentRole === 'OFFICE_OPERATOR')}
          label="Office Operator"
          badge={queuedCount > 0 ? `${queuedCount}` : undefined}
          onClick={() => handleRoleClick('OFFICE_OPERATOR')}
        />
        <RoleLink
          href="/site"
          active={pathname === '/site' || (pathname === '/' && store.currentRole === 'SITE_OPERATOR')}
          label="Site Operator"
          onClick={() => handleRoleClick('SITE_OPERATOR')}
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

const RoleLink: React.FC<{
  href: string;
  active: boolean;
  label: string;
  badge?: string;
  onClick: () => void;
}> = ({ href, active, label, badge, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    style={{
      padding: '5px 12px',
      fontSize: '0.78rem',
      fontWeight: active ? 600 : 400,
      borderRadius: '4px',
      backgroundColor: active ? '#2563EB' : 'transparent',
      color: active ? '#FFFFFF' : '#9CA3AF',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      textDecoration: 'none',
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
  </Link>
);
