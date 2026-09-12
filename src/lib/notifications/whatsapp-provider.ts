import { WhatsAppProvider, SendResult } from './types';

/**
 * Mock / In-Memory WhatsApp Provider
 * Simulates WhatsApp API delivery, tracking message IDs, delivery callbacks, and controlled testing errors.
 */
export class MockWhatsAppProvider implements WhatsAppProvider {
  private simulateFailures = false;

  setSimulateFailures(fail: boolean) {
    this.simulateFailures = fail;
  }

  async sendTextMessage(phoneNumber: string, message: string): Promise<SendResult> {
    // Artificial small network latency for realism
    await new Promise((r) => setTimeout(r, 200));

    if (this.simulateFailures) {
      return {
        success: false,
        error: 'WhatsApp Gateway Timeout: 504 Gateway Unavailable',
        timestamp: new Date().toISOString(),
      };
    }

    const providerMessageId = `wam_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      providerMessageId,
      timestamp: new Date().toISOString(),
    };
  }

  async sendDocument(
    phoneNumber: string,
    documentUrl: string,
    fileName: string,
    caption?: string
  ): Promise<SendResult> {
    await new Promise((r) => setTimeout(r, 250));

    if (this.simulateFailures) {
      return {
        success: false,
        error: 'WhatsApp Media Service Error: Failed to upload PDF document',
        timestamp: new Date().toISOString(),
      };
    }

    const providerMessageId = `wam_doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      providerMessageId,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Meta Cloud WhatsApp API Provider
 * Standard integration with Meta Graph API for WhatsApp Business accounts.
 */
export class MetaCloudWhatsAppProvider implements WhatsAppProvider {
  private apiToken: string;
  private phoneNumberId: string;

  constructor(apiToken?: string, phoneNumberId?: string) {
    this.apiToken = apiToken || process.env.WHATSAPP_API_TOKEN || '';
    this.phoneNumberId = phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  }

  async sendTextMessage(phoneNumber: string, message: string): Promise<SendResult> {
    if (!this.apiToken || !this.phoneNumberId) {
      // Fall back safely if credentials are not provided
      return new MockWhatsAppProvider().sendTextMessage(phoneNumber, message);
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v20.0/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: phoneNumber.replace(/[^0-9]/g, ''),
            type: 'text',
            text: { body: message },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Failed to dispatch Meta WhatsApp message',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        providerMessageId: data.messages?.[0]?.id || `meta_${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network exception connecting to WhatsApp API',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async sendDocument(
    phoneNumber: string,
    documentUrl: string,
    fileName: string,
    caption?: string
  ): Promise<SendResult> {
    if (!this.apiToken || !this.phoneNumberId) {
      return new MockWhatsAppProvider().sendDocument(phoneNumber, documentUrl, fileName, caption);
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v20.0/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: phoneNumber.replace(/[^0-9]/g, ''),
            type: 'document',
            document: {
              link: documentUrl,
              filename: fileName,
              caption: caption || fileName,
            },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Failed to dispatch Meta WhatsApp document',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        providerMessageId: data.messages?.[0]?.id || `meta_doc_${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network exception connecting to WhatsApp API',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Global active provider singleton - easily swappable
export const activeWhatsAppProvider: WhatsAppProvider =
  process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
    ? new MetaCloudWhatsAppProvider()
    : new MockWhatsAppProvider();
