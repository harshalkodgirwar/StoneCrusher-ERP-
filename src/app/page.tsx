'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  Briefcase,
  Truck,
  Scale,
  ArrowRight,
  ShieldCheck,
  Send,
} from 'lucide-react';

export default function HomePage() {
  return (
    <DashboardLayout>
      {({ openWhatsApp }) => (
        <div style={{ maxWidth: '1000px', margin: '30px auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header text */}
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F9FAFB' }}>
              StoneCrusher Internal ERP
            </h1>
            <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginTop: '6px' }}>
              Select an internal dashboard to begin. External entities communicate via WhatsApp.
            </p>
          </div>

          {/* 3 Dashboard Selection Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
            }}
          >
            {/* Card 1: Owner / Admin */}
            <div
              className="crusher-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    backgroundColor: '#1E293B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#60A5FA',
                    marginBottom: '14px',
                  }}
                >
                  <Briefcase size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#F9FAFB' }}>
                  Owner / Admin
                </h3>
                <p style={{ color: '#9CA3AF', fontSize: '0.8rem', marginTop: '6px', lineHeight: 1.45 }}>
                  Full ERP access: executive overview, sales & revenue metrics, aggregate inventory stock, and WhatsApp message delivery tracking.
                </p>
              </div>

              <div style={{ marginTop: '20px' }}>
                <Link
                  href="/owner"
                  className="btn-primary"
                  style={{ width: '100%', textDecoration: 'none' }}
                >
                  Enter Owner Portal <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Card 2: Office Operator */}
            <div
              className="crusher-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    backgroundColor: '#1E293B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FBBF24',
                    marginBottom: '14px',
                  }}
                >
                  <Truck size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#F9FAFB' }}>
                  Office Operator
                </h3>
                <p style={{ color: '#9CA3AF', fontSize: '0.8rem', marginTop: '6px', lineHeight: 1.45 }}>
                  Book customer orders, assign vehicles & drivers, and automatically push trips into the Site Operator's FIFO dispatch queue.
                </p>
              </div>

              <div style={{ marginTop: '20px' }}>
                <Link
                  href="/office"
                  className="btn-primary"
                  style={{ width: '100%', textDecoration: 'none' }}
                >
                  Enter Office Portal <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Card 3: Site Operator */}
            <div
              className="crusher-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    backgroundColor: '#1E293B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34D399',
                    marginBottom: '14px',
                  }}
                >
                  <Scale size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#F9FAFB' }}>
                  Site Operator
                </h3>
                <p style={{ color: '#9CA3AF', fontSize: '0.8rem', marginTop: '6px', lineHeight: 1.45 }}>
                  Day-to-day crusher site flow: FIFO queue, digital weighbridge tare & gross, automatic inventory deduction, and gate passes.
                </p>
              </div>

              <div style={{ marginTop: '20px' }}>
                <Link
                  href="/site"
                  className="btn-primary"
                  style={{ width: '100%', textDecoration: 'none' }}
                >
                  Enter Site Portal <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* External communication callout */}
          <div
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1F2937',
              borderRadius: '8px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8125rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Send size={16} color="#10B981" />
              <span style={{ color: '#D1D5DB' }}>
                External entities (<strong>Customers</strong>, <strong>Drivers</strong>, <strong>Suppliers</strong>) have NO dashboards and receive gate passes and receipts via WhatsApp.
              </span>
            </div>

            <button
              onClick={openWhatsApp}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '5px 10px' }}
            >
              Test WhatsApp Simulator
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
