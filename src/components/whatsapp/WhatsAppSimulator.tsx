'use client';

import React, { useState } from 'react';
import { useCrusherStore } from '../../lib/store/useCrusherStore';
import { crusherStore } from '../../lib/store/crusher-store';
import { WhatsAppRecipientType, WhatsAppMessage } from '../../lib/notifications/types';
import {
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  FileText,
  RotateCw,
  X,
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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="crusher-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '86vh',
          maxHeight: '760px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0F172A',
          border: '1px solid #334155',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        {/* Simple WhatsApp Header */}
        <div
          style={{
            backgroundColor: '#075E54',
            color: '#FFFFFF',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              WhatsApp Notification Channel
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Recipient Channel Switcher */}
        <div
          style={{
            backgroundColor: '#0B0F17',
            padding: '8px',
            display: 'flex',
            gap: '4px',
            borderBottom: '1px solid #1F2937',
            overflowX: 'auto',
          }}
        >
          {(
            [
              { type: 'CUSTOMER', label: 'Customer' },
              { type: 'DRIVER', label: 'Driver' },
              { type: 'SUPPLIER', label: 'Supplier' },
              { type: 'OWNER', label: 'Owner' },
            ] as const
          ).map((tab) => {
            const isActive = selectedRecipient === tab.type;
            const count = store.whatsappMessages.filter((m) => m.recipientType === tab.type).length;
            return (
              <button
                key={tab.type}
                onClick={() => setSelectedRecipient(tab.type)}
                style={{
                  background: isActive ? '#1F2937' : 'transparent',
                  color: isActive ? '#FFF' : '#9CA3AF',
                  border: isActive ? '1px solid #374151' : 'none',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Testing mode switch */}
        <div
          style={{
            backgroundColor: store.simulateWhatsAppFailure ? '#2A1318' : '#111827',
            padding: '6px 12px',
            fontSize: '0.7rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #1F2937',
            color: store.simulateWhatsAppFailure ? '#F87171' : '#9CA3AF',
          }}
        >
          <span>{store.simulateWhatsAppFailure ? 'Simulating Delivery Failure' : 'Simulator Active'}</span>
          <button
            onClick={() => crusherStore.setSimulateWhatsAppFailure(!store.simulateWhatsAppFailure)}
            style={{
              background: 'transparent',
              border: '1px solid #374151',
              color: '#D1D5DB',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '0.68rem',
              cursor: 'pointer',
            }}
          >
            {store.simulateWhatsAppFailure ? 'Disable Error' : 'Test Failure'}
          </button>
        </div>

        {/* Message Stream */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#0B141A',
            overflowY: 'auto',
            padding: '14px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {filteredMessages.length === 0 ? (
            <div style={{ margin: 'auto', color: '#6B7280', fontSize: '0.78rem', textAlign: 'center' }}>
              No messages sent to this recipient yet.
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

  return (
    <div style={{ maxWidth: '92%', width: '100%', alignSelf: 'flex-start' }}>
      <div
        style={{
          backgroundColor: isFailed ? '#2A1318' : '#005C4B',
          color: '#E9EDEF',
          borderRadius: '6px',
          padding: '8px 10px',
          fontSize: '0.8rem',
          border: isFailed ? '1px solid #7F1D1D' : 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.68rem',
            color: isFailed ? '#FCA5A5' : '#86EFAC',
            marginBottom: '4px',
          }}
        >
          <span>{message.templateName}</span>
          <span>{message.recipientPhone}</span>
        </div>

        {message.messageType === 'DOCUMENT' && (
          <div
            style={{
              backgroundColor: 'rgba(0,0,0,0.2)',
              padding: '6px 8px',
              borderRadius: '4px',
              marginBottom: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
              <FileText size={14} color="#F87171" />
              <span>{message.documentFileName || 'Document.pdf'}</span>
            </div>

            {onViewDocument && (
              <button
                onClick={() => {
                  if (message.relatedEntity === 'GATE_PASS') onViewDocument('GATE_PASS', message.relatedEntityId);
                  if (message.relatedEntity === 'RAW_RECEIPT') onViewDocument('RECEIPT', message.relatedEntityId);
                }}
                style={{
                  background: '#2563EB',
                  border: 'none',
                  color: '#FFF',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '0.68rem',
                  cursor: 'pointer',
                }}
              >
                View
              </button>
            )}
          </div>
        )}

        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{message.body}</div>

        {isFailed && (
          <div
            style={{
              marginTop: '6px',
              paddingTop: '6px',
              borderTop: '1px solid #7F1D1D',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.68rem', color: '#F87171' }}>{message.failureReason || 'Failed'}</span>
            <button
              onClick={onRetry}
              style={{
                background: '#DC2626',
                border: 'none',
                color: '#FFF',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '0.68rem',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.65rem',
            color: '#8696A0',
            marginTop: '4px',
          }}
        >
          <span>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
      return <Clock size={12} color="#94A3B8" />;
    case 'SENT':
      return <Check size={12} color="#94A3B8" />;
    case 'DELIVERED':
      return <CheckCheck size={12} color="#94A3B8" />;
    case 'READ':
      return <CheckCheck size={12} color="#38BDF8" />;
    case 'FAILED':
      return <AlertCircle size={12} color="#EF4444" />;
  }
}
