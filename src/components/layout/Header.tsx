'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCrusherStore } from '../../lib/store/useCrusherStore';
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

  const getPageInfo = () => {
    if (pathname === '/owner') return { title: 'Owner & Admin', badge: 'Full Access' };
    if (pathname === '/office') return { title: 'Office Operator', badge: 'Order Booking' };
    if (pathname === '/site') return { title: 'Site Operator', badge: 'Weighbridge & Plant' };
    return { title: 'ERP Portal', badge: 'Internal' };
  };

  const pageInfo = getPageInfo();

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
      {/* Brand & Current Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
            <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Quarry Operations System</div>
          </div>
        </Link>

        {/* Current Active Section Badge (Read-only, no switcher) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingLeft: '14px',
            borderLeft: '1px solid #1F2937',
          }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F3F4F6' }}>
            {pageInfo.title}
          </span>
          <span className="badge badge-slate" style={{ fontSize: '0.68rem' }}>
            {pageInfo.badge}
          </span>
        </div>
      </div>

      {/* User Information & WhatsApp Simulator (No role/user switcher) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Read-only Staff User Info */}
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

        {/* WhatsApp Simulator Trigger */}
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
