export interface TemplateVariables {
  customerName?: string;
  tripId?: string;
  vehicleNumber?: string;
  driverName?: string;
  productName?: string;
  quantity?: string;
  destination?: string;
  gatePassNumber?: string;
  date?: string;
  receiptNumber?: string;
  supplierName?: string;
  materialName?: string;
  stockBefore?: string;
  stockAfter?: string;
  currentStock?: string;
  minThreshold?: string;
  amount?: string;
  dueDate?: string;
  [key: string]: string | undefined;
}

export const WHATSAPP_TEMPLATES = {
  CUSTOMER_TRIP_CREATED: {
    name: 'CUSTOMER_TRIP_CREATED',
    title: 'Customer Order Booked',
    body: `Your order has been booked.

Trip ID: {{tripId}}
Product: {{productName}}
Quantity: {{quantity}}
Vehicle: {{vehicleNumber}}
Required Delivery: {{requiredDate}}
Status: Queued

You will receive another notification when your material is dispatched.`,
  },

  CUSTOMER_DISPATCHED: {
    name: 'CUSTOMER_DISPATCHED',
    title: 'Customer Material Dispatched',
    body: `Your material has been dispatched.

Trip ID: {{tripId}}
Vehicle: {{vehicleNumber}}
Driver: {{driverName}}
Product: {{productName}}
Quantity: {{quantity}}
Destination: {{destination}}

Gate Pass: {{gatePassNumber}}

Your gate pass is attached.`,
  },

  DRIVER_TRIP_ASSIGNED: {
    name: 'DRIVER_TRIP_ASSIGNED',
    title: 'Driver Trip Assigned',
    body: `New Trip Assigned

Trip ID: {{tripId}}
Customer: {{customerName}}
Product: {{productName}}
Quantity: {{quantity}}
Destination: {{destination}}

Vehicle: {{vehicleNumber}}

Please report to the crusher site for loading.`,
  },

  DRIVER_GATE_PASS: {
    name: 'DRIVER_GATE_PASS',
    title: 'Driver Gate Pass Issued',
    body: `Gate Pass Generated

Trip: {{tripId}}
Gate Pass: {{gatePassNumber}}
Vehicle: {{vehicleNumber}}
Product: {{productName}}
Quantity: {{quantity}}

Please keep the attached gate pass for dispatch.`,
  },

  SUPPLIER_RECEIPT: {
    name: 'SUPPLIER_RECEIPT',
    title: 'Raw Material Receipt',
    body: `Raw Material Receipt

Receipt No: {{receiptNumber}}

Supplier: {{supplierName}}
Vehicle: {{vehicleNumber}}
Material: {{materialName}}
Quantity: {{quantity}}
Date: {{date}}

Receipt attached.`,
  },

  PAYMENT_CONFIRMATION: {
    name: 'PAYMENT_CONFIRMATION',
    title: 'Payment Confirmation',
    body: `Hello {{customerName}},

We have received your payment of INR {{amount}} for order/trip {{tripId}}.

Thank you for your business!
StoneCrusher Mining & Aggregates`,
  },

  PAYMENT_REMINDER: {
    name: 'PAYMENT_REMINDER',
    title: 'Payment Due Reminder',
    body: `Hello {{customerName}},

This is a gentle reminder regarding outstanding balance of INR {{amount}} due on {{dueDate}}.

Kindly clear the dues to ensure uninterrupted dispatches.
StoneCrusher Finance Team`,
  },

  OWNER_DISPATCH_ALERT: {
    name: 'OWNER_DISPATCH_ALERT',
    title: 'Owner Dispatch Completed',
    body: `Dispatch Completed

Trip: {{tripId}}
Customer: {{customerName}}
Vehicle: {{vehicleNumber}}
Product: {{productName}}
Quantity: {{quantity}}

Gate Pass: {{gatePassNumber}}

Inventory Updated:
Before: {{stockBefore}} MT
After: {{stockAfter}} MT`,
  },

  OWNER_LOW_STOCK_ALERT: {
    name: 'OWNER_LOW_STOCK_ALERT',
    title: 'Owner Low Inventory Alert',
    body: `⚠️ LOW INVENTORY ALERT

Product: {{productName}}
Current Stock: {{currentStock}} MT
Min Threshold: {{minThreshold}} MT

Please schedule raw boulder feeding or review dispatch commitments.`,
  },

  OWNER_RAW_MATERIAL_ALERT: {
    name: 'OWNER_RAW_MATERIAL_ALERT',
    title: 'Owner Raw Material Inward',
    body: `Raw Material Inward Logged

Receipt No: {{receiptNumber}}
Supplier: {{supplierName}}
Material: {{materialName}}
Quantity: {{quantity}}
Vehicle: {{vehicleNumber}}
Date: {{date}}`,
  },
} as const;

export type TemplateKey = keyof typeof WHATSAPP_TEMPLATES;

/**
 * Interpolates a template string replacing {{variable}} with provided values.
 */
export function renderTemplate(templateKey: TemplateKey, variables: TemplateVariables): string {
  const template = WHATSAPP_TEMPLATES[templateKey];
  if (!template) {
    throw new Error(`WhatsApp template "${templateKey}" not found`);
  }

  let rendered: string = template.body;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    rendered = rendered.replace(regex, value ?? '');
  }

  return rendered;
}
