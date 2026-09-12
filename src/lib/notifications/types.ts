export type WhatsAppRecipientType = 'CUSTOMER' | 'DRIVER' | 'SUPPLIER' | 'OWNER';

export type WhatsAppMessageStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export type WhatsAppMessageType = 'TEXT' | 'DOCUMENT';

export type WhatsAppEvent =
  // Customer events
  | 'ORDER_CREATED'
  | 'TRIP_CREATED'
  | 'TRIP_QUEUED'
  | 'TRIP_LOADING'
  | 'TRIP_DISPATCHED'
  | 'GATE_PASS_GENERATED'
  | 'TRIP_COMPLETED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_DUE'
  // Driver events
  | 'TRIP_ASSIGNED'
  | 'TRIP_READY'
  | 'DRIVER_GATE_PASS_READY'
  // Supplier / Labour events
  | 'RAW_MATERIAL_RECEIVED'
  | 'RAW_MATERIAL_RECEIPT_GENERATED'
  // Owner events
  | 'OWNER_DISPATCH_ALERT'
  | 'OWNER_LOW_STOCK_ALERT'
  | 'OWNER_RAW_MATERIAL_ALERT'
  | 'OWNER_SYSTEM_ALERT';

export interface WhatsAppMessage {
  id: string;
  recipientPhone: string;
  recipientType: WhatsAppRecipientType;
  recipientName: string;
  messageType: WhatsAppMessageType;
  templateName: string;
  body: string;
  documentUrl?: string;
  documentFileName?: string;
  relatedEntity: 'TRIP' | 'GATE_PASS' | 'RAW_RECEIPT' | 'PRODUCT' | 'PAYMENT' | 'SYSTEM';
  relatedEntityId: string;
  status: WhatsAppMessageStatus;
  providerMessageId?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failureReason?: string;
  createdAt: string;
  retryCount: number;
}

export interface SendResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
  timestamp: string;
}

export interface WhatsAppProvider {
  sendTextMessage(phoneNumber: string, message: string): Promise<SendResult>;
  sendDocument(
    phoneNumber: string,
    documentUrl: string,
    fileName: string,
    caption?: string
  ): Promise<SendResult>;
}
