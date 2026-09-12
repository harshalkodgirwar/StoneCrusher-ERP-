'use client';

import React, { useState } from 'react';
import { useCrusherStore } from '../../lib/store/useCrusherStore';
import { crusherStore } from '../../lib/store/crusher-store';
import { WhatsAppRecipientType, WhatsAppMessage } from '../../lib/notifications/types';
import {
  Smartphone,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  FileText,
  RotateCw,
  X,
  Send,
  Zap,
  ShieldCheck,
  Download,
} from 'lucide-react';

interface WhatsAppSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onViewDocument?: (docType: 'GATE_PASS' | 'RECEIPT', docId: string) => void;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({
  isOpen,
  onClose,
  onViewDocument,
}) => {
  const store = useCrusherStore();
  const [selectedRecipient, setSelectedRecipient] = useState<WhatsAppRecipientType>('CUSTOMER');

  if (!isOpen) return null;

  const filteredMessages = store.whatsappMessages.filter(
    (m) => m.recipientType === selectedRecipient
  );

  const failedCount = store.whatsappMessages.filter((m) => m.status === 'FAILED').length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 15, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="crusher-card animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '92vh',
          maxHeight: '840px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0F1626',
          border: '2px solid #28395A',
          borderRadius: '32px',
          boxShadow: '0 25px 60px -10px rgba(0,0,0,0.8), 0 0 30px rgba(37, 211, 102, 0.2)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Smartphone Speaker / Camera Notch */}
        <div
          style={{
            height: '24px',
            backgroundColor: '#0A0E18',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #1A2438',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '4px',
              backgroundColor: '#33466D',
              borderRadius: '2px',
            }}
          />
        </div>

        {/* Header - WhatsApp Green */}
        <div
          style={{
            backgroundColor: '#075E54',
            color: '#FFFFFF',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#128C7E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: '1.5px solid rgba(255,255,255,0.3)',
              }}
            >
              SC
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                StoneCrusher Official
                <ShieldCheck size={14} color="#25D366" />
              </div>
              <div style={{ fontSize: '0.7rem', color: '#B3E5FC', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#25D366' }} />
                WhatsApp Business API Verified
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#FFF',
                cursor: 'pointer',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Recipient Channel Switcher (Simulating external phones) */}
        <div
          style={{
            backgroundColor: '#0B101D',
            padding: '8px 12px',
            display: 'flex',
            gap: '6px',
            borderBottom: '1px solid #1E293B',
            overflowX: 'auto',
          }}
        >
          {(
            [
              { type: 'CUSTOMER', label: 'Customer Phone', icon: '👤' },
              { type: 'DRIVER', label: 'Driver Phone', icon: '🚚' },
              { type: 'SUPPLIER', label: 'Supplier Phone', icon: '⛏️' },
              { type: 'OWNER', label: 'Owner Phone', icon: '🏢' },
            ] as const
          ).map((tab) => {
            const isActive = selectedRecipient === tab.type;
            const count = store.whatsappMessages.filter((m) => m.recipientType === tab.type).length;
            return (
              <button
                key={tab.type}
                onClick={() => setSelectedRecipient(tab.type)}
                style={{
                  background: isActive ? '#25D366' : '#141E33',
                  color: isActive ? '#000000' : '#94A3B8',
                  border: isActive ? 'none' : '1px solid #28395A',
                  padding: '5px 10px',
                  borderRadius: '16px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  style={{
                    backgroundColor: isActive ? 'rgba(0,0,0,0.2)' : '#1E293B',
                    padding: '1px 5px',
                    borderRadius: '8px',
                    fontSize: '0.65rem',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Failure Simulation Banner / Control */}
        <div
          style={{
            backgroundColor: store.simulateWhatsAppFailure ? 'rgba(239, 68, 68, 0.15)' : '#0E1726',
            borderBottom: '1px solid #1F2E4A',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={13} color={store.simulateWhatsAppFailure ? '#EF4444' : '#F59E0B'} />
            <span style={{ color: store.simulateWhatsAppFailure ? '#FCA5A5' : '#94A3B8' }}>
              {store.simulateWhatsAppFailure ? 'Simulating API Gateway Failure' : 'WhatsApp Delivery Simulator'}
            </span>
          </div>
          <button
            onClick={() => crusherStore.setSimulateWhatsAppFailure(!store.simulateWhatsAppFailure)}
            style={{
              background: store.simulateWhatsAppFailure ? '#EF4444' : '#1E293B',
              color: '#FFF',
              border: 'none',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '0.65rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {store.simulateWhatsAppFailure ? 'Turn Off Errors' : 'Test Failure Mode'}
          </button>
        </div>

        {/* Message Stream Area - Styled like WhatsApp Background */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#0B141A',
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            overflowY: 'auto',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {filteredMessages.length === 0 ? (
            <div
              style={{
                margin: 'auto',
                textAlign: 'center',
                color: '#64748B',
                fontSize: '0.8rem',
                padding: '20px',
              }}
            >
              <Smartphone size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <p>No WhatsApp notifications sent to this recipient yet.</p>
              <p style={{ fontSize: '0.7rem', marginTop: '4px', color: '#475569' }}>
                Perform actions in the Office or Site dashboard to trigger automated WhatsApp events.
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onRetry={() => crusherStore.retryWhatsAppMessage(msg.id)}
                onViewDocument={onViewDocument}
              />
            ))
          )}
        </div>

        {/* WhatsApp Footer Info */}
        <div
          style={{
            backgroundColor: '#111B21',
            padding: '10px 14px',
            borderTop: '1px solid #1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.7rem',
            color: '#64748B',
          }}
        >
          <div>
            🔒 Messages end-to-end encrypted • ERP is source of truth
          </div>
          {failedCount > 0 && (
            <div style={{ color: '#F87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={12} /> {failedCount} Failed
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  message: WhatsAppMessage;
  onRetry: () => void;
  onViewDocument?: (docType: 'GATE_PASS' | 'RECEIPT', docId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onRetry, onViewDocument }) => {
  const isFailed = message.status === 'FAILED';
  const isPending = message.status === 'PENDING';

  return (
    <div
      style={{
        alignSelf: 'flex-start',
        maxWidth: '92%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      <div
        style={{
          backgroundColor: isFailed ? '#2A1318' : '#005C4B',
          color: '#E9EDEF',
          borderRadius: '8px',
          borderTopLeftRadius: '2px',
          padding: '10px 12px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
          border: isFailed ? '1px solid #7F1D1D' : 'none',
          position: 'relative',
        }}
      >
        {/* Recipient tag & Template header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
            fontSize: '0.68rem',
            color: isFailed ? '#FCA5A5' : '#73DAC1',
            fontWeight: 600,
          }}
        >
          <span>{message.templateName}</span>
          <span style={{ opacity: 0.8 }}>{message.recipientPhone}</span>
        </div>

        {/* Document attachment preview if present */}
        {message.messageType === 'DOCUMENT' && (
          <div
            style={{
              backgroundColor: 'rgba(0,0,0,0.25)',
              borderRadius: '6px',
              padding: '8px 10px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  backgroundColor: '#E11D48',
                  color: '#FFF',
                  borderRadius: '4px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FFF' }}>
                  {message.documentFileName || 'Document.pdf'}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Official Verified PDF Slip</div>
              </div>
            </div>

            {onViewDocument && message.relatedEntity === 'GATE_PASS' && (
              <button
                onClick={() => onViewDocument('GATE_PASS', message.relatedEntityId)}
                style={{
                  background: '#25D366',
                  color: '#000',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Download size={11} /> View Slip
              </button>
            )}

            {onViewDocument && message.relatedEntity === 'RAW_RECEIPT' && (
              <button
                onClick={() => onViewDocument('RECEIPT', message.relatedEntityId)}
                style={{
                  background: '#F59E0B',
                  color: '#000',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Download size={11} /> View Receipt
              </button>
            )}
          </div>
        )}

        {/* Message Body with clean white space formatting */}
        <div
          style={{
            fontSize: '0.82rem',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.45,
            color: '#F1F5F9',
          }}
        >
          {message.body}
        </div>

        {/* Failure reason & Retry button if failed */}
        {isFailed && (
          <div
            style={{
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px solid #7F1D1D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#F87171' }}>
              ⚠️ {message.failureReason || 'Delivery Failed'}
            </div>
            <button
              onClick={onRetry}
              style={{
                background: '#EF4444',
                color: '#FFF',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <RotateCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* Status icon & Timestamp */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '4px',
            marginTop: '4px',
            fontSize: '0.65rem',
            color: '#8696A0',
          }}
        >
          <span>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {getStatusIcon(message.status)}
        </div>
      </div>
    </div>
  );
};

function getStatusIcon(status: WhatsAppMessage['status']) {
  switch (status) {
    case 'PENDING':
      return <Clock size={13} color="#94A3B8" />;
    case 'SENT':
      return <Check size={13} color="#94A3B8" />;
    case 'DELIVERED':
      return <CheckCheck size={13} color="#94A3B8" />;
    case 'READ':
      return <CheckCheck size={13} color="#53BDEB" />;
    case 'FAILED':
      return <AlertCircle size={13} color="#EF4444" />;
  }
}
