'use client';

import { WhatsAppMessage, WhatsAppMessageStatus, WhatsAppRecipientType } from '../notifications/types';
import { WHATSAPP_TEMPLATES, renderTemplate, TemplateKey } from '../notifications/templates';
import { activeWhatsAppProvider } from '../notifications/whatsapp-provider';

export type InternalRole = 'OWNER_ADMIN' | 'OFFICE_OPERATOR' | 'SITE_OPERATOR';

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email?: string;
  gstNumber?: string;
  billingAddress: string;
  currentBalance: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  vehicleType: string;
  defaultTareWeightMt: number;
  maxCapacityMt: number;
  assignedDriverId?: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  unit: string;
  currentStockMt: number;
  minThresholdMt: number;
  unitPriceInr: number;
  description?: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  code: string;
  unit: string;
  currentStockBrass: number;
  minThresholdBrass: number;
  unitRateInr: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  supplierType: string;
  balancePayable: number;
}

export interface SparePart {
  id: string;
  name: string;
  partNumber: string;
  category: string;
  currentStock: number;
  minThreshold: number;
  unitCostInr: number;
  storageBin: string;
  lastReplacedAt?: string;
}

export type TripStatus =
  | 'QUEUED'
  | 'CALLED_TO_SCALE'
  | 'TARE_WEIGHED'
  | 'LOADING'
  | 'GROSS_WEIGHED'
  | 'GATE_PASS_ISSUED'
  | 'DISPATCHED'
  | 'CANCELLED';

export interface Trip {
  id: string;
  tripNumber: string;
  customerId: string;
  productId: string;
  orderedQtyMt: number;
  vehicleId: string;
  driverId: string;
  destination: string;
  status: TripStatus;
  fifoSequence: number;
  tareWeightMt?: number;
  grossWeightMt?: number;
  netWeightMt?: number;
  notes?: string;
  createdAt: string;
  dispatchedAt?: string;
}

export interface WeighbridgeTransaction {
  id: string;
  slipNumber: string;
  tripId: string;
  vehiclePlate: string;
  tareWeightMt: number;
  tareTimestamp: string;
  grossWeightMt?: number;
  grossTimestamp?: string;
  netWeightMt?: number;
  operatorName: string;
  isVerified: boolean;
  inventoryDeducted: boolean;
  createdAt: string;
}

export interface GatePass {
  id: string;
  gatePassNumber: string;
  tripId: string;
  weighbridgeId?: string;
  customerName: string;
  vehiclePlate: string;
  driverName: string;
  productName: string;
  netWeightMt: number;
  destination: string;
  qrCodePayload: string;
  issuedAt: string;
  issuedBy: string;
}

export interface RawMaterialReceipt {
  id: string;
  receiptNumber: string;
  supplierId: string;
  supplierName: string;
  rawMaterialId: string;
  rawMaterialName: string;
  vehicleNumber: string;
  quantityBrass: number;
  ratePerBrass: number;
  totalAmount: number;
  inwardTime: string;
  receivedBy: string;
}

export interface AuditLog {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  createdAt: string;
}

// Initial default seed states
const SEED_CUSTOMERS: Customer[] = [
  {
    id: 'c001',
    name: 'Rajesh Kulkarni',
    companyName: 'ABC Construction Infra Ltd',
    phone: '+919890111222',
    email: 'kulkarni@abc-infra.in',
    gstNumber: '27AABCA1234F1Z8',
    billingAddress: 'Plot 42, MIDC Hinjawadi Phase 2, Pune',
    currentBalance: 45000,
  },
  {
    id: 'c002',
    name: 'Mahesh Deshmukh',
    companyName: 'Deshmukh Developers & Builders',
    phone: '+919890333444',
    email: 'projects@deshmukhdev.com',
    gstNumber: '27BBCDE5678G2Z1',
    billingAddress: 'Sector 18, Kharadi Bypass, Pune',
    currentBalance: 125000,
  },
  {
    id: 'c003',
    name: 'Anand Rao',
    companyName: 'Highway Roadways Pvt Ltd',
    phone: '+919890555666',
    email: 'procurement@highwayroadways.co.in',
    gstNumber: '27CCDEF9012H3Z4',
    billingAddress: 'Survey 104, Pune-Bangalore Expressway',
    currentBalance: 0,
  },
];

const SEED_DRIVERS: Driver[] = [
  {
    id: 'd001',
    name: 'Raj Kumar',
    phone: '+919765112233',
    licenseNumber: 'MH12-2018-0098231',
  },
  {
    id: 'd002',
    name: 'Sunil Jadhav',
    phone: '+919765223344',
    licenseNumber: 'MH14-2015-0044198',
  },
  {
    id: 'd003',
    name: 'Pappu Yadav',
    phone: '+919765334455',
    licenseNumber: 'MH12-2020-0012876',
  },
];

const SEED_VEHICLES: Vehicle[] = [
  {
    id: 'v001',
    plateNumber: 'MH12AB1234',
    vehicleType: 'Tipper 10-Wheeler',
    defaultTareWeightMt: 10.4,
    maxCapacityMt: 22.0,
    assignedDriverId: 'd001',
  },
  {
    id: 'v002',
    plateNumber: 'MH14CD5678',
    vehicleType: 'Tipper 12-Wheeler',
    defaultTareWeightMt: 12.8,
    maxCapacityMt: 30.0,
    assignedDriverId: 'd002',
  },
  {
    id: 'v003',
    plateNumber: 'MH12XY9988',
    vehicleType: 'Tipper 6-Wheeler',
    defaultTareWeightMt: 6.2,
    maxCapacityMt: 14.0,
    assignedDriverId: 'd003',
  },
];

const SEED_PRODUCTS: Product[] = [
  {
    id: 'p001',
    name: '20mm Aggregate',
    code: 'AGG-20MM',
    unit: 'MT',
    currentStockMt: 480.0,
    minThresholdMt: 100.0,
    unitPriceInr: 680.0,
    description: 'Blue basalt crushed aggregate 20mm for concrete mix',
  },
  {
    id: 'p002',
    name: '10mm Aggregate',
    code: 'AGG-10MM',
    unit: 'MT',
    currentStockMt: 320.0,
    minThresholdMt: 80.0,
    unitPriceInr: 720.0,
    description: 'Clean 10mm aggregate for RCC roofing and columns',
  },
  {
    id: 'p003',
    name: '40mm Aggregate',
    code: 'AGG-40MM',
    unit: 'MT',
    currentStockMt: 210.0,
    minThresholdMt: 60.0,
    unitPriceInr: 610.0,
    description: 'Sub-base stone aggregate 40mm',
  },
  {
    id: 'p004',
    name: 'GSB (Granular Sub Base)',
    code: 'GSB-MIX',
    unit: 'MT',
    currentStockMt: 650.0,
    minThresholdMt: 120.0,
    unitPriceInr: 480.0,
    description: 'Granular sub-base road construction mix',
  },
  {
    id: 'p005',
    name: 'Crusher Dust',
    code: 'CR-DUST',
    unit: 'MT',
    currentStockMt: 410.0,
    minThresholdMt: 90.0,
    unitPriceInr: 390.0,
    description: 'Fine quarry dust 0-4mm for paver blocks and backfilling',
  },
  {
    id: 'p006',
    name: 'M-Sand (Manufactured)',
    code: 'M-SAND',
    unit: 'MT',
    currentStockMt: 75.0, // Triggers low stock alert
    minThresholdMt: 100.0,
    unitPriceInr: 850.0,
    description: 'Washed artificial sand for plastering (LOW STOCK)',
  },
];

const SEED_RAW_MATERIALS: RawMaterial[] = [
  {
    id: 'rm001',
    name: 'Black Basalt Boulder',
    code: 'RM-BOULDER',
    unit: 'Brass',
    currentStockBrass: 185.0,
    minThresholdBrass: 40.0,
    unitRateInr: 3200.0,
  },
  {
    id: 'rm002',
    name: 'Quarry Run Overburden',
    code: 'RM-QRUN',
    unit: 'Brass',
    currentStockBrass: 92.0,
    minThresholdBrass: 30.0,
    unitRateInr: 2100.0,
  },
];

const SEED_SUPPLIERS: Supplier[] = [
  {
    id: 's001',
    name: 'Sahyadri Mining Contractors',
    contactPerson: 'Dattatray Shinde',
    phone: '+919922887766',
    supplierType: 'Raw Material Boulder Supplier',
    balancePayable: 84000,
  },
  {
    id: 's002',
    name: 'Omkar Excavation & Blasting',
    contactPerson: 'Omkar More',
    phone: '+919922445566',
    supplierType: 'Labour & Quarry Contractor',
    balancePayable: 32000,
  },
];

const SEED_SPARE_PARTS: SparePart[] = [
  {
    id: 'sp001',
    name: 'Manganese Jaw Plate 36x24 Stationary',
    partNumber: 'JP-3624-MN',
    category: 'Jaw Crusher',
    currentStock: 2,
    minThreshold: 1,
    unitCostInr: 48000,
    storageBin: 'Rack A-1',
  },
  {
    id: 'sp002',
    name: 'Manganese Jaw Plate 36x24 Movable',
    partNumber: 'JP-3624-MN-MOV',
    category: 'Jaw Crusher',
    currentStock: 1,
    minThreshold: 1,
    unitCostInr: 52000,
    storageBin: 'Rack A-2',
  },
  {
    id: 'sp003',
    name: 'Heavy Duty V-Belt C-144',
    partNumber: 'VB-C144-HD',
    category: 'Belt Drives',
    currentStock: 8,
    minThreshold: 4,
    unitCostInr: 1850,
    storageBin: 'Rack C-4',
  },
  {
    id: 'sp004',
    name: 'Spherical Roller Bearing 22320 CC/W33',
    partNumber: 'BRG-22320',
    category: 'Crusher Bearings',
    currentStock: 3,
    minThreshold: 2,
    unitCostInr: 28000,
    storageBin: 'Secure Cabinet B',
  },
];

const SEED_TRIPS: Trip[] = [
  {
    id: 't001',
    tripNumber: 'TRP-2026-000001',
    customerId: 'c001',
    productId: 'p001',
    orderedQtyMt: 20.0,
    vehicleId: 'v001',
    driverId: 'd001',
    destination: 'Plot 42, MIDC Hinjawadi Phase 2, Pune',
    status: 'QUEUED',
    fifoSequence: 1,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    notes: 'Priority concrete batching plant pour at 5 PM',
  },
  {
    id: 't002',
    tripNumber: 'TRP-2026-000002',
    customerId: 'c002',
    productId: 'p002',
    orderedQtyMt: 15.0,
    vehicleId: 'v002',
    driverId: 'd002',
    destination: 'Sector 18, Kharadi Bypass, Pune',
    status: 'QUEUED',
    fifoSequence: 2,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    notes: 'Slab casting material',
  },
];

export interface CrusherStoreState {
  currentRole: InternalRole;
  currentStaffName: string;
  simulateWhatsAppFailure: boolean;
  customers: Customer[];
  drivers: Driver[];
  vehicles: Vehicle[];
  products: Product[];
  rawMaterials: RawMaterial[];
  suppliers: Supplier[];
  spareParts: SparePart[];
  trips: Trip[];
  weighbridgeTransactions: WeighbridgeTransaction[];
  gatePasses: GatePass[];
  rawMaterialReceipts: RawMaterialReceipt[];
  whatsappMessages: WhatsAppMessage[];
  auditLogs: AuditLog[];
}

type Listener = () => void;

class CrusherStore {
  private state: CrusherStoreState;
  private listeners: Set<Listener> = new Set();
  private tripCounter = 3;
  private weighbridgeCounter = 1;
  private gatePassCounter = 1;
  private rawReceiptCounter = 1;

  constructor() {
    this.state = {
      currentRole: 'OWNER_ADMIN',
      currentStaffName: 'Vikramaditya Shinde (Owner)',
      simulateWhatsAppFailure: false,
      customers: SEED_CUSTOMERS,
      drivers: SEED_DRIVERS,
      vehicles: SEED_VEHICLES,
      products: SEED_PRODUCTS,
      rawMaterials: SEED_RAW_MATERIALS,
      suppliers: SEED_SUPPLIERS,
      spareParts: SEED_SPARE_PARTS,
      trips: SEED_TRIPS,
      weighbridgeTransactions: [],
      gatePasses: [],
      rawMaterialReceipts: [],
      whatsappMessages: [],
      auditLogs: [
        {
          id: 'log-001',
          userName: 'System Boot',
          userRole: 'SYSTEM',
          action: 'INITIALIZE',
          entity: 'SYSTEM',
          entityId: 'SYS',
          details: 'StoneCrusher ERP Operational & WhatsApp Gateway Active',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    // Pre-populate initial welcome WhatsApp messages for demo
    this.queueWhatsAppMessage({
      recipientPhone: '+919890111222',
      recipientType: 'CUSTOMER',
      recipientName: 'Rajesh Kulkarni (ABC Construction)',
      messageType: 'TEXT',
      templateName: 'CUSTOMER_TRIP_CREATED',
      body: renderTemplate('CUSTOMER_TRIP_CREATED', {
        tripId: 'TRP-2026-000001',
        productName: '20mm Aggregate',
        quantity: '20 MT',
        vehicleNumber: 'MH12AB1234',
      }),
      relatedEntity: 'TRIP',
      relatedEntityId: 'TRP-2026-000001',
    });

    this.queueWhatsAppMessage({
      recipientPhone: '+919765112233',
      recipientType: 'DRIVER',
      recipientName: 'Raj Kumar (Driver)',
      messageType: 'TEXT',
      templateName: 'DRIVER_TRIP_ASSIGNED',
      body: renderTemplate('DRIVER_TRIP_ASSIGNED', {
        tripId: 'TRP-2026-000001',
        customerName: 'ABC Construction Infra Ltd',
        productName: '20mm Aggregate',
        quantity: '20 MT',
        destination: 'Plot 42, MIDC Hinjawadi Phase 2, Pune',
        vehicleNumber: 'MH12AB1234',
      }),
      relatedEntity: 'TRIP',
      relatedEntityId: 'TRP-2026-000001',
    });
  }

  getState(): CrusherStoreState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  setRole(role: InternalRole) {
    let name = 'Vikramaditya Shinde (Owner)';
    if (role === 'OFFICE_OPERATOR') name = 'Amit Patil (Office)';
    if (role === 'SITE_OPERATOR') name = 'Suresh Gaikwad (Site Scale)';

    this.state = {
      ...this.state,
      currentRole: role,
      currentStaffName: name,
    };
    this.addAuditLog('ROLE_SWITCH', 'USER', role, `Switched view to ${role}`);
    this.notify();
  }

  setSimulateWhatsAppFailure(fail: boolean) {
    this.state = {
      ...this.state,
      simulateWhatsAppFailure: fail,
    };
    this.notify();
  }

  addAuditLog(action: string, entity: string, entityId: string, details: string) {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userName: this.state.currentStaffName,
      userRole: this.state.currentRole,
      action,
      entity,
      entityId,
      details,
      createdAt: new Date().toISOString(),
    };
    this.state.auditLogs = [newLog, ...this.state.auditLogs];
  }

  // ----------------------------------------------------------------------------
  // WHATSAPP NOTIFICATION DISPATCHER (Decoupled from core ERP database transactions)
  // ----------------------------------------------------------------------------
  async queueWhatsAppMessage(params: {
    recipientPhone: string;
    recipientType: WhatsAppRecipientType;
    recipientName: string;
    messageType: 'TEXT' | 'DOCUMENT';
    templateName: string;
    body: string;
    documentUrl?: string;
    documentFileName?: string;
    relatedEntity: 'TRIP' | 'GATE_PASS' | 'RAW_RECEIPT' | 'PRODUCT' | 'PAYMENT' | 'SYSTEM';
    relatedEntityId: string;
  }): Promise<string> {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const initialMessage: WhatsAppMessage = {
      id: messageId,
      recipientPhone: params.recipientPhone,
      recipientType: params.recipientType,
      recipientName: params.recipientName,
      messageType: params.messageType,
      templateName: params.templateName,
      body: params.body,
      documentUrl: params.documentUrl,
      documentFileName: params.documentFileName,
      relatedEntity: params.relatedEntity,
      relatedEntityId: params.relatedEntityId,
      status: 'PENDING',
      createdAt: now,
      retryCount: 0,
    };

    // Store in message log immediately (PENDING)
    this.state.whatsappMessages = [initialMessage, ...this.state.whatsappMessages];
    this.notify();

    // Asynchronous dispatch via WhatsApp Provider
    setTimeout(async () => {
      await this.deliverMessage(messageId);
    }, 100);

    return messageId;
  }

  private async deliverMessage(messageId: string) {
    const msg = this.state.whatsappMessages.find((m) => m.id === messageId);
    if (!msg) return;

    if (this.state.simulateWhatsAppFailure) {
      // Simulate network or gateway failure
      this.updateMessageStatus(messageId, 'FAILED', {
        failureReason: 'WhatsApp Gateway Error: Rate Limit Exceeded or Provider Timeout',
      });
      return;
    }

    try {
      let result;
      if (msg.messageType === 'DOCUMENT' && msg.documentUrl) {
        result = await activeWhatsAppProvider.sendDocument(
          msg.recipientPhone,
          msg.documentUrl,
          msg.documentFileName || 'Document.pdf',
          msg.body
        );
      } else {
        result = await activeWhatsAppProvider.sendTextMessage(msg.recipientPhone, msg.body);
      }

      if (result.success) {
        this.updateMessageStatus(messageId, 'SENT', {
          providerMessageId: result.providerMessageId,
          sentAt: new Date().toISOString(),
        });

        // Simulate realistic double-tick delivery after 1.2s
        setTimeout(() => {
          this.updateMessageStatus(messageId, 'DELIVERED', {
            deliveredAt: new Date().toISOString(),
          });
        }, 1200);

        // Simulate customer read blue tick after 3.5s
        setTimeout(() => {
          this.updateMessageStatus(messageId, 'READ', {
            readAt: new Date().toISOString(),
          });
        }, 3500);
      } else {
        this.updateMessageStatus(messageId, 'FAILED', {
          failureReason: result.error || 'Unknown WhatsApp API error',
        });
      }
    } catch (err: any) {
      this.updateMessageStatus(messageId, 'FAILED', {
        failureReason: err.message || 'WhatsApp network timeout',
      });
    }
  }

  private updateMessageStatus(
    messageId: string,
    status: WhatsAppMessageStatus,
    patch: Partial<WhatsAppMessage>
  ) {
    this.state.whatsappMessages = this.state.whatsappMessages.map((m) => {
      if (m.id === messageId) {
        return {
          ...m,
          ...patch,
          status,
        };
      }
      return m;
    });
    this.notify();
  }

  async retryWhatsAppMessage(messageId: string) {
    const msg = this.state.whatsappMessages.find((m) => m.id === messageId);
    if (!msg) return;

    this.updateMessageStatus(messageId, 'PENDING', {
      retryCount: (msg.retryCount || 0) + 1,
      failureReason: undefined,
    });

    this.addAuditLog(
      'WHATSAPP_RETRY',
      'WHATSAPP_MESSAGE',
      messageId,
      `Retried message to ${msg.recipientPhone} (${msg.recipientName})`
    );

    await this.deliverMessage(messageId);
  }

  // ----------------------------------------------------------------------------
  // OFFICE OPERATOR: CREATE TRIP & ORDER
  // ----------------------------------------------------------------------------
  createTrip(params: {
    customerId: string;
    productId: string;
    orderedQtyMt: number;
    vehicleId: string;
    driverId: string;
    destination: string;
    notes?: string;
  }): Trip {
    const formattedNum = String(this.tripCounter++).padStart(6, '0');
    const tripNumber = `TRP-2026-${formattedNum}`;
    const nextSequence =
      this.state.trips.filter((t) => t.status === 'QUEUED').length + 1;

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      tripNumber,
      customerId: params.customerId,
      productId: params.productId,
      orderedQtyMt: params.orderedQtyMt,
      vehicleId: params.vehicleId,
      driverId: params.driverId,
      destination: params.destination,
      status: 'QUEUED',
      fifoSequence: nextSequence,
      notes: params.notes,
      createdAt: new Date().toISOString(),
    };

    // 1. Core ERP Transaction (Always succeeds)
    this.state.trips = [...this.state.trips, newTrip];
    this.addAuditLog('CREATE_TRIP', 'TRIP', tripNumber, `Created Trip ${tripNumber} for ${params.orderedQtyMt} MT`);
    this.notify();

    // 2. Trigger WhatsApp Notifications (Decoupled)
    const customer = this.state.customers.find((c) => c.id === params.customerId);
    const driver = this.state.drivers.find((d) => d.id === params.driverId);
    const vehicle = this.state.vehicles.find((v) => v.id === params.vehicleId);
    const product = this.state.products.find((p) => p.id === params.productId);

    if (customer && product && vehicle) {
      // Customer booking confirmation
      this.queueWhatsAppMessage({
        recipientPhone: customer.phone,
        recipientType: 'CUSTOMER',
        recipientName: `${customer.name} (${customer.companyName})`,
        messageType: 'TEXT',
        templateName: 'CUSTOMER_TRIP_CREATED',
        body: renderTemplate('CUSTOMER_TRIP_CREATED', {
          tripId: tripNumber,
          productName: product.name,
          quantity: `${params.orderedQtyMt} MT`,
          vehicleNumber: vehicle.plateNumber,
        }),
        relatedEntity: 'TRIP',
        relatedEntityId: tripNumber,
      });
    }

    if (driver && product && vehicle && customer) {
      // Driver assignment alert
      this.queueWhatsAppMessage({
        recipientPhone: driver.phone,
        recipientType: 'DRIVER',
        recipientName: `${driver.name} (Driver)`,
        messageType: 'TEXT',
        templateName: 'DRIVER_TRIP_ASSIGNED',
        body: renderTemplate('DRIVER_TRIP_ASSIGNED', {
          tripId: tripNumber,
          customerName: customer.companyName,
          productName: product.name,
          quantity: `${params.orderedQtyMt} MT`,
          destination: params.destination,
          vehicleNumber: vehicle.plateNumber,
        }),
        relatedEntity: 'TRIP',
        relatedEntityId: tripNumber,
      });
    }

    // Owner notification of new trip creation
    this.queueWhatsAppMessage({
      recipientPhone: '+919822011223',
      recipientType: 'OWNER',
      recipientName: 'Vikramaditya Shinde (Owner)',
      messageType: 'TEXT',
      templateName: 'OWNER_DISPATCH_ALERT',
      body: `New Trip Booked\n\nTrip: ${tripNumber}\nCustomer: ${customer?.companyName}\nProduct: ${product?.name}\nQty: ${params.orderedQtyMt} MT\nVehicle: ${vehicle?.plateNumber}`,
      relatedEntity: 'TRIP',
      relatedEntityId: tripNumber,
    });

    return newTrip;
  }

  // ----------------------------------------------------------------------------
  // SITE OPERATOR: FIFO QUEUE & WEIGHBRIDGE WORKFLOW
  // Sequence: NEXT TRIP -> DISPATCH QUEUE -> WEIGHBRIDGE -> INVENTORY -> GATE PASS
  // ----------------------------------------------------------------------------
  advanceTripToScale(tripId: string) {
    this.updateTripStatus(tripId, 'CALLED_TO_SCALE');
  }

  recordTareWeight(tripId: string, tareWeightMt: number) {
    const trip = this.state.trips.find((t) => t.id === tripId);
    if (!trip) return;

    const vehicle = this.state.vehicles.find((v) => v.id === trip.vehicleId);

    // Check if weighbridge record exists
    let wb = this.state.weighbridgeTransactions.find((w) => w.tripId === tripId);
    if (!wb) {
      const formattedSlip = String(this.weighbridgeCounter++).padStart(6, '0');
      wb = {
        id: `wb-${Date.now()}`,
        slipNumber: `WB-2026-${formattedSlip}`,
        tripId,
        vehiclePlate: vehicle?.plateNumber || 'UNKNOWN',
        tareWeightMt,
        tareTimestamp: new Date().toISOString(),
        operatorName: this.state.currentStaffName,
        isVerified: false,
        inventoryDeducted: false,
        createdAt: new Date().toISOString(),
      };
      this.state.weighbridgeTransactions = [wb, ...this.state.weighbridgeTransactions];
    } else {
      wb.tareWeightMt = tareWeightMt;
      wb.tareTimestamp = new Date().toISOString();
    }

    this.state.trips = this.state.trips.map((t) =>
      t.id === tripId
        ? {
            ...t,
            tareWeightMt,
            status: 'TARE_WEIGHED' as TripStatus,
          }
        : t
    );

    this.addAuditLog('TARE_WEIGHED', 'WEIGHBRIDGE', wb.slipNumber, `Tare recorded: ${tareWeightMt} MT for ${trip.tripNumber}`);
    this.notify();
  }

  startLoading(tripId: string) {
    this.updateTripStatus(tripId, 'LOADING');
  }

  recordGrossWeight(tripId: string, grossWeightMt: number) {
    const trip = this.state.trips.find((t) => t.id === tripId);
    if (!trip || !trip.tareWeightMt) return;

    const netWeightMt = Number((grossWeightMt - trip.tareWeightMt).toFixed(2));

    // Update weighbridge record
    const wb = this.state.weighbridgeTransactions.find((w) => w.tripId === tripId);
    if (wb) {
      wb.grossWeightMt = grossWeightMt;
      wb.grossTimestamp = new Date().toISOString();
      wb.netWeightMt = netWeightMt;
      wb.isVerified = true;
    }

    this.state.trips = this.state.trips.map((t) =>
      t.id === tripId
        ? {
            ...t,
            grossWeightMt,
            netWeightMt,
            status: 'GROSS_WEIGHED' as TripStatus,
          }
        : t
    );

    // CRITICAL REQUIREMENT: Automatic inventory deduction upon verified weighbridge transaction
    this.deductInventory(trip.productId, netWeightMt);
    if (wb) wb.inventoryDeducted = true;

    this.addAuditLog(
      'GROSS_WEIGHED',
      'WEIGHBRIDGE',
      wb?.slipNumber || trip.tripNumber,
      `Gross: ${grossWeightMt} MT | Net: ${netWeightMt} MT. Inventory deducted: ${netWeightMt} MT`
    );

    this.notify();
  }

  private deductInventory(productId: string, netWeightMt: number) {
    let beforeStock = 0;
    let afterStock = 0;
    let prodName = '';
    let minThreshold = 0;

    this.state.products = this.state.products.map((p) => {
      if (p.id === productId) {
        beforeStock = p.currentStockMt;
        afterStock = Math.max(0, Number((p.currentStockMt - netWeightMt).toFixed(2)));
        prodName = p.name;
        minThreshold = p.minThresholdMt;
        return {
          ...p,
          currentStockMt: afterStock,
        };
      }
      return p;
    });

    // Low stock check -> Trigger Owner WhatsApp Alert if below threshold
    if (afterStock <= minThreshold) {
      this.queueWhatsAppMessage({
        recipientPhone: '+919822011223',
        recipientType: 'OWNER',
        recipientName: 'Vikramaditya Shinde (Owner)',
        messageType: 'TEXT',
        templateName: 'OWNER_LOW_STOCK_ALERT',
        body: renderTemplate('OWNER_LOW_STOCK_ALERT', {
          productName: prodName,
          currentStock: `${afterStock}`,
          minThreshold: `${minThreshold}`,
        }),
        relatedEntity: 'PRODUCT',
        relatedEntityId: productId,
      });
    }

    return { beforeStock, afterStock };
  }

  generateGatePass(tripId: string): GatePass {
    const trip = this.state.trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Trip not found');

    const customer = this.state.customers.find((c) => c.id === trip.customerId);
    const driver = this.state.drivers.find((d) => d.id === trip.driverId);
    const vehicle = this.state.vehicles.find((v) => v.id === trip.vehicleId);
    const product = this.state.products.find((p) => p.id === trip.productId);
    const wb = this.state.weighbridgeTransactions.find((w) => w.tripId === tripId);

    const formattedNum = String(this.gatePassCounter++).padStart(6, '0');
    const gatePassNumber = `GP-2026-${formattedNum}`;
    const now = new Date().toISOString();

    const gatePass: GatePass = {
      id: `gp-${Date.now()}`,
      gatePassNumber,
      tripId,
      weighbridgeId: wb?.id,
      customerName: customer?.companyName || 'Unknown Customer',
      vehiclePlate: vehicle?.plateNumber || 'MH12AB0000',
      driverName: driver?.name || 'Assigned Driver',
      productName: product?.name || 'Aggregate',
      netWeightMt: trip.netWeightMt || trip.orderedQtyMt,
      destination: trip.destination,
      qrCodePayload: `CRUSHER_GATEPASS|${gatePassNumber}|${trip.tripNumber}|${vehicle?.plateNumber}|${trip.netWeightMt}MT|VERIFIED`,
      issuedAt: now,
      issuedBy: this.state.currentStaffName,
    };

    // 1. Core ERP Transaction
    this.state.gatePasses = [gatePass, ...this.state.gatePasses];
    this.state.trips = this.state.trips.map((t) =>
      t.id === tripId
        ? {
            ...t,
            status: 'DISPATCHED' as TripStatus,
            dispatchedAt: now,
          }
        : t
    );

    this.addAuditLog('ISSUE_GATE_PASS', 'GATE_PASS', gatePassNumber, `Gate Pass issued for ${trip.tripNumber}`);
    this.notify();

    // 2. Trigger WhatsApp Notifications with Gate Pass PDF attached
    const simulatedPdfUrl = `https://stonecrusher-erp.internal/gatepass/${gatePassNumber}.pdf`;

    if (customer && vehicle && driver && product) {
      // Customer: Material Dispatched + Gate Pass attached
      this.queueWhatsAppMessage({
        recipientPhone: customer.phone,
        recipientType: 'CUSTOMER',
        recipientName: `${customer.name} (${customer.companyName})`,
        messageType: 'DOCUMENT',
        templateName: 'CUSTOMER_DISPATCHED',
        body: renderTemplate('CUSTOMER_DISPATCHED', {
          tripId: trip.tripNumber,
          vehicleNumber: vehicle.plateNumber,
          driverName: driver.name,
          productName: product.name,
          quantity: `${trip.netWeightMt} MT`,
          destination: trip.destination,
          gatePassNumber,
        }),
        documentUrl: simulatedPdfUrl,
        documentFileName: `${gatePassNumber}.pdf`,
        relatedEntity: 'GATE_PASS',
        relatedEntityId: gatePassNumber,
      });
    }

    if (driver && vehicle && product) {
      // Driver: Gate Pass Generated
      this.queueWhatsAppMessage({
        recipientPhone: driver.phone,
        recipientType: 'DRIVER',
        recipientName: `${driver.name} (Driver)`,
        messageType: 'DOCUMENT',
        templateName: 'DRIVER_GATE_PASS',
        body: renderTemplate('DRIVER_GATE_PASS', {
          tripId: trip.tripNumber,
          gatePassNumber,
          vehicleNumber: vehicle.plateNumber,
          productName: product.name,
          quantity: `${trip.netWeightMt} MT`,
        }),
        documentUrl: simulatedPdfUrl,
        documentFileName: `${gatePassNumber}.pdf`,
        relatedEntity: 'GATE_PASS',
        relatedEntityId: gatePassNumber,
      });
    }

    // Owner: Dispatch Completed alert
    if (customer && vehicle && product) {
      this.queueWhatsAppMessage({
        recipientPhone: '+919822011223',
        recipientType: 'OWNER',
        recipientName: 'Vikramaditya Shinde (Owner)',
        messageType: 'TEXT',
        templateName: 'OWNER_DISPATCH_ALERT',
        body: renderTemplate('OWNER_DISPATCH_ALERT', {
          tripId: trip.tripNumber,
          customerName: customer.companyName,
          vehicleNumber: vehicle.plateNumber,
          productName: product.name,
          quantity: `${trip.netWeightMt} MT`,
          gatePassNumber,
          stockBefore: `${product.currentStockMt + (trip.netWeightMt || 0)}`,
          stockAfter: `${product.currentStockMt}`,
        }),
        relatedEntity: 'GATE_PASS',
        relatedEntityId: gatePassNumber,
      });
    }

    return gatePass;
  }

  private updateTripStatus(tripId: string, status: TripStatus) {
    this.state.trips = this.state.trips.map((t) => (t.id === tripId ? { ...t, status } : t));
    this.notify();
  }

  // ----------------------------------------------------------------------------
  // SITE OPERATOR: RAW MATERIAL INWARD & RECEIPTS (Supplier / Labour)
  // ----------------------------------------------------------------------------
  addRawMaterialInward(params: {
    supplierId: string;
    rawMaterialId: string;
    vehicleNumber: string;
    quantityBrass: number;
    ratePerBrass: number;
  }): RawMaterialReceipt {
    const supplier = this.state.suppliers.find((s) => s.id === params.supplierId);
    const rawMaterial = this.state.rawMaterials.find((r) => r.id === params.rawMaterialId);

    const formattedNum = String(this.rawReceiptCounter++).padStart(6, '0');
    const receiptNumber = `RM-2026-${formattedNum}`;
    const totalAmount = Number((params.quantityBrass * params.ratePerBrass).toFixed(2));
    const now = new Date().toISOString();

    const receipt: RawMaterialReceipt = {
      id: `rmr-${Date.now()}`,
      receiptNumber,
      supplierId: params.supplierId,
      supplierName: supplier?.name || 'Supplier',
      rawMaterialId: params.rawMaterialId,
      rawMaterialName: rawMaterial?.name || 'Raw Material',
      vehicleNumber: params.vehicleNumber,
      quantityBrass: params.quantityBrass,
      ratePerBrass: params.ratePerBrass,
      totalAmount,
      inwardTime: now,
      receivedBy: this.state.currentStaffName,
    };

    // 1. Core ERP Transaction (Update stock & record receipt)
    this.state.rawMaterialReceipts = [receipt, ...this.state.rawMaterialReceipts];
    this.state.rawMaterials = this.state.rawMaterials.map((rm) =>
      rm.id === params.rawMaterialId
        ? {
            ...rm,
            currentStockBrass: Number((rm.currentStockBrass + params.quantityBrass).toFixed(2)),
          }
        : rm
    );

    // Update supplier balance payable
    if (supplier) {
      supplier.balancePayable += totalAmount;
    }

    this.addAuditLog(
      'RAW_MATERIAL_INWARD',
      'RAW_RECEIPT',
      receiptNumber,
      `Received ${params.quantityBrass} Brass of ${rawMaterial?.name} from ${supplier?.name}`
    );
    this.notify();

    // 2. WhatsApp Notification: send receipt to Supplier
    const simulatedReceiptUrl = `https://stonecrusher-erp.internal/receipt/${receiptNumber}.pdf`;

    if (supplier) {
      this.queueWhatsAppMessage({
        recipientPhone: supplier.phone,
        recipientType: 'SUPPLIER',
        recipientName: `${supplier.name} (Supplier)`,
        messageType: 'DOCUMENT',
        templateName: 'SUPPLIER_RECEIPT',
        body: renderTemplate('SUPPLIER_RECEIPT', {
          receiptNumber,
          supplierName: supplier.name,
          vehicleNumber: params.vehicleNumber,
          materialName: rawMaterial?.name || 'Boulder Stone',
          quantity: `${params.quantityBrass} Brass`,
          date: new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        }),
        documentUrl: simulatedReceiptUrl,
        documentFileName: `${receiptNumber}.pdf`,
        relatedEntity: 'RAW_RECEIPT',
        relatedEntityId: receiptNumber,
      });
    }

    // Owner notification for raw material inward
    this.queueWhatsAppMessage({
      recipientPhone: '+919822011223',
      recipientType: 'OWNER',
      recipientName: 'Vikramaditya Shinde (Owner)',
      messageType: 'TEXT',
      templateName: 'OWNER_RAW_MATERIAL_ALERT',
      body: renderTemplate('OWNER_RAW_MATERIAL_ALERT', {
        receiptNumber,
        supplierName: supplier?.name,
        materialName: rawMaterial?.name,
        quantity: `${params.quantityBrass} Brass`,
        vehicleNumber: params.vehicleNumber,
        date: new Date().toLocaleDateString('en-IN'),
      }),
      relatedEntity: 'RAW_RECEIPT',
      relatedEntityId: receiptNumber,
    });

    return receipt;
  }

  // Quick maintenance log / spare part consumption
  consumeSparePart(partId: string, quantity: number, notes: string) {
    this.state.spareParts = this.state.spareParts.map((sp) => {
      if (sp.id === partId) {
        return {
          ...sp,
          currentStock: Math.max(0, sp.currentStock - quantity),
          lastReplacedAt: new Date().toISOString(),
        };
      }
      return sp;
    });

    const part = this.state.spareParts.find((s) => s.id === partId);
    this.addAuditLog(
      'SPARE_PART_USED',
      'SPARE_PARTS',
      part?.partNumber || partId,
      `Consumed ${quantity} unit(s) of ${part?.name}. Reason: ${notes}`
    );
    this.notify();
  }
}

// Global singleton instance for the browser session
export const crusherStore = new CrusherStore();
