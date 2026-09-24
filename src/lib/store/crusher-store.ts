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
  | 'DISPATCHED'
  | 'COMPLETED';

export interface Trip {
  id: string;
  tripNumber: string;
  customerId: string;
  productId: string;
  orderedQtyMt: number;
  vehicleId?: string;
  driverId?: string;
  destination: string;
  requiredDate?: string;
  status: TripStatus;
  fifoSequence: number;
  tareWeightMt?: number;
  grossWeightMt?: number;
  netWeightMt?: number;
  notes?: string;
  createdAt: string;
  dispatchedAt?: string;
  completedAt?: string;
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
    requiredDate: new Date().toISOString().split('T')[0],
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
    requiredDate: new Date().toISOString().split('T')[0],
    status: 'QUEUED',
    fifoSequence: 2,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    notes: 'Slab casting material',
  },
];

const SEED_RAW_MATERIAL_RECEIPTS: RawMaterialReceipt[] = [
  {
    id: 'da000001-0000-0000-0000-000000000001',
    receiptNumber: 'RM-2026-000001',
    supplierId: 'f0000001-0000-0000-0000-000000000001',
    supplierName: 'Sahyadri Mining Contractors',
    rawMaterialId: 'b0000001-0000-0000-0000-000000000001',
    rawMaterialName: 'Black Basalt Boulder (200-400mm)',
    vehicleNumber: 'MH12XY4455',
    quantityBrass: 15.0,
    ratePerBrass: 3200.0,
    totalAmount: 48000.0,
    inwardTime: new Date(Date.now() - 3600000 * 3).toISOString(),
    receivedBy: 'Suresh Gaikwad',
  },
  {
    id: 'da000002-0000-0000-0000-000000000002',
    receiptNumber: 'RM-2026-000002',
    supplierId: 'f0000002-0000-0000-0000-000000000002',
    supplierName: 'Omkar Excavation & Blasting',
    rawMaterialId: 'b0000002-0000-0000-0000-000000000002',
    rawMaterialName: 'Uncrushed Quarry Run Rock',
    vehicleNumber: 'MH14AA8899',
    quantityBrass: 20.0,
    ratePerBrass: 2100.0,
    totalAmount: 42000.0,
    inwardTime: new Date(Date.now() - 3600000 * 6).toISOString(),
    receivedBy: 'Suresh Gaikwad',
  },
  {
    id: 'da000003-0000-0000-0000-000000000003',
    receiptNumber: 'RM-2026-000003',
    supplierId: 'f0000001-0000-0000-0000-000000000001',
    supplierName: 'Sahyadri Mining Contractors',
    rawMaterialId: 'b0000001-0000-0000-0000-000000000001',
    rawMaterialName: 'Black Basalt Boulder (200-400mm)',
    vehicleNumber: 'MH12PK7788',
    quantityBrass: 18.5,
    ratePerBrass: 3200.0,
    totalAmount: 59200.0,
    inwardTime: new Date(Date.now() - 3600000 * 12).toISOString(),
    receivedBy: 'Suresh Gaikwad',
  },
];

export interface CrusherStoreState {
  currentRole: InternalRole;
  currentStaffName: string;
  simulateWhatsAppFailure: boolean;
  isSyncedWithSupabase?: boolean;
  lastSyncedAt?: string;
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
  deletedMasterIds?: string[];
}

const STORAGE_KEY = 'crusher_erp_state_v2';
const SYNC_CHANNEL_NAME = 'crusher_erp_cross_tab_sync';

type Listener = () => void;

class CrusherStore {
  private state: CrusherStoreState;
  private listeners: Set<Listener> = new Set();
  private tripCounter = 3;
  private weighbridgeCounter = 1;
  private gatePassCounter = 1;
  private rawReceiptCounter = 1;
  private isHydratedFromStorage = false;
  private hasStorageListener = false;
  private isSyncing = false;
  private serverSnapshot: CrusherStoreState | null = null;
  private syncChannel: BroadcastChannel | null = null;

  constructor() {
    this.state = {
      currentRole: 'OWNER_ADMIN',
      currentStaffName: 'Vikramaditya Shinde (Owner)',
      simulateWhatsAppFailure: false,
      isSyncedWithSupabase: false,
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
      rawMaterialReceipts: SEED_RAW_MATERIAL_RECEIPTS,
      whatsappMessages: [],
      deletedMasterIds: [],
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

    this.serverSnapshot = { ...this.state };
  }

  getServerSnapshot(): CrusherStoreState {
    if (!this.serverSnapshot) {
      this.serverSnapshot = { ...this.state };
    }
    return this.serverSnapshot;
  }

  hydrateFromStorage() {
    if (typeof window === 'undefined' || this.isHydratedFromStorage) return;
    this.isHydratedFromStorage = true;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          this.state = {
            ...this.state,
            trips: Array.isArray(parsed.trips) && parsed.trips.length > 0 ? parsed.trips : this.state.trips,
            weighbridgeTransactions: Array.isArray(parsed.weighbridgeTransactions) ? parsed.weighbridgeTransactions : this.state.weighbridgeTransactions,
            gatePasses: Array.isArray(parsed.gatePasses) ? parsed.gatePasses : this.state.gatePasses,
            rawMaterialReceipts: Array.isArray(parsed.rawMaterialReceipts) ? parsed.rawMaterialReceipts : this.state.rawMaterialReceipts,
            customers: Array.isArray(parsed.customers) && parsed.customers.length > 0 ? parsed.customers : this.state.customers,
            products: Array.isArray(parsed.products) && parsed.products.length > 0 ? parsed.products : this.state.products,
            vehicles: Array.isArray(parsed.vehicles) && parsed.vehicles.length > 0 ? parsed.vehicles : this.state.vehicles,
            drivers: Array.isArray(parsed.drivers) && parsed.drivers.length > 0 ? parsed.drivers : this.state.drivers,
            auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : this.state.auditLogs,
            whatsappMessages: Array.isArray(parsed.whatsappMessages) ? parsed.whatsappMessages : this.state.whatsappMessages,
            deletedMasterIds: Array.isArray(parsed.deletedMasterIds) ? parsed.deletedMasterIds : (this.state.deletedMasterIds || []),
          };
          this.notify();
        }
      }
    } catch (e) {
      console.warn('LocalStorage hydration notice:', e);
    }

    // Initialize cross-tab BroadcastChannel
    if ('BroadcastChannel' in window && !this.syncChannel) {
      try {
        this.syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        this.syncChannel.onmessage = (event: MessageEvent) => {
          if (event.data?.type === 'SYNC_STATE' && event.data?.payload) {
            this.state = {
              ...this.state,
              ...event.data.payload,
            };
            this.notify();
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    // Fallback cross-window storage event listener (deduplicated)
    if (!this.hasStorageListener) {
      this.hasStorageListener = true;
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const payload = JSON.parse(e.newValue);
            this.state = {
              ...this.state,
              ...payload,
            };
            this.notify();
          } catch {}
        }
      });
    }
  }

  private persistAndBroadcast() {
    if (typeof window === 'undefined') return;
    try {
      const payload = {
        trips: this.state.trips,
        weighbridgeTransactions: this.state.weighbridgeTransactions,
        gatePasses: this.state.gatePasses,
        rawMaterialReceipts: this.state.rawMaterialReceipts,
        products: this.state.products,
        customers: this.state.customers,
        vehicles: this.state.vehicles,
        drivers: this.state.drivers,
        auditLogs: this.state.auditLogs,
        whatsappMessages: this.state.whatsappMessages,
        deletedMasterIds: this.state.deletedMasterIds || [],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      if (this.syncChannel) {
        this.syncChannel.postMessage({ type: 'SYNC_STATE', payload });
      }
    } catch (err) {
      console.warn('LocalStorage / Broadcast notice:', err);
    }
  }

  async syncWithSupabase(): Promise<boolean> {
    if (typeof window === 'undefined' || this.isSyncing) return false;
    this.isSyncing = true;
    try {
      const res = await fetch('/api/database/sync', {
        signal: AbortSignal.timeout(3500),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (!data.success || data.connected === false) return false;

      // Smart merge trips: Preserve locally created trips so they are never lost on page load!
      const dbTrips: Trip[] = data.trips || [];
      const dbTripNumberMap = new Map(dbTrips.map((t: Trip) => [t.tripNumber, t]));
      const dbTripIdMap = new Map(dbTrips.map((t: Trip) => [t.id, t]));

      const localUnsynced = this.state.trips.filter(
        (lt) => !dbTripNumberMap.has(lt.tripNumber) && !dbTripIdMap.has(lt.id)
      );

      const statusRank: Record<string, number> = {
        QUEUED: 1,
        DISPATCHED: 2,
        COMPLETED: 3,
      };

      const mergedTrips = [
        ...dbTrips.map((dt) => {
          const local = this.state.trips.find(
            (lt) => lt.tripNumber === dt.tripNumber || lt.id === dt.id
          );
          if (!local) return dt;
          return (statusRank[local.status] || 0) > (statusRank[dt.status] || 0) ? local : dt;
        }),
        ...localUnsynced,
      ];

      // Auto-upload any local unsynced trips to Supabase in background (only when Supabase confirmed healthy)
      if (localUnsynced.length > 0 && data.connected !== false) {
        localUnsynced.forEach((lt) => {
          fetch('/api/database/trips', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lt),
            signal: AbortSignal.timeout(3000),
          }).catch(() => {});
        });
      }

      // Smart merge for customers: never discard locally added or unsynced customers, and exclude deleted items
      const deletedIds = new Set(this.state.deletedMasterIds || []);
      const dbCustomers: Customer[] = (data.customers || []).filter((c: Customer) => !deletedIds.has(c.id));
      const dbPhoneMap = new Map(dbCustomers.map((c) => [c.phone, c]));
      const dbIdMap = new Map(dbCustomers.map((c) => [c.id, c]));
      const dbNameMap = new Map(dbCustomers.map((c) => [(c.companyName || c.name || '').toLowerCase().trim(), c]));

      const localUnsyncedCustomers = this.state.customers.filter(
        (lc) =>
          !deletedIds.has(lc.id) &&
          !dbIdMap.has(lc.id) &&
          !dbPhoneMap.has(lc.phone) &&
          !dbNameMap.has((lc.companyName || lc.name || '').toLowerCase().trim())
      );

      const mergedCustomers = [...dbCustomers, ...localUnsyncedCustomers];

      // Auto-upload any local unsynced customers to Supabase in background
      if (localUnsyncedCustomers.length > 0 && data.connected !== false) {
        localUnsyncedCustomers.forEach((lc) => {
          fetch('/api/database/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lc),
            signal: AbortSignal.timeout(3000),
          }).catch(() => {});
        });
      }

      // Smart merge for vehicles
      const dbVehicles: Vehicle[] = (data.vehicles || []).filter((v: Vehicle) => !deletedIds.has(v.id));
      const dbPlateMap = new Map(dbVehicles.map((v) => [(v.plateNumber || '').toUpperCase().trim(), v]));
      const dbVehIdMap = new Map(dbVehicles.map((v) => [v.id, v]));
      const localUnsyncedVehicles = this.state.vehicles.filter(
        (lv) => !deletedIds.has(lv.id) && !dbVehIdMap.has(lv.id) && !dbPlateMap.has((lv.plateNumber || '').toUpperCase().trim())
      );
      const mergedVehicles = [...dbVehicles, ...localUnsyncedVehicles];
      if (localUnsyncedVehicles.length > 0 && data.connected !== false) {
        localUnsyncedVehicles.forEach((lv) => {
          fetch('/api/database/vehicles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lv),
            signal: AbortSignal.timeout(3000),
          }).catch(() => {});
        });
      }

      // Smart merge for drivers
      const dbDrivers: Driver[] = (data.drivers || []).filter((d: Driver) => !deletedIds.has(d.id));
      const dbDriverPhoneMap = new Map(dbDrivers.map((d) => [d.phone, d]));
      const dbDriverIdMap = new Map(dbDrivers.map((d) => [d.id, d]));
      const localUnsyncedDrivers = this.state.drivers.filter(
        (ld) => !deletedIds.has(ld.id) && !dbDriverIdMap.has(ld.id) && !dbDriverPhoneMap.has(ld.phone)
      );
      const mergedDrivers = [...dbDrivers, ...localUnsyncedDrivers];
      if (localUnsyncedDrivers.length > 0 && data.connected !== false) {
        localUnsyncedDrivers.forEach((ld) => {
          fetch('/api/database/drivers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ld),
            signal: AbortSignal.timeout(3000),
          }).catch(() => {});
        });
      }

      // Smart merge for products
      const dbProducts: Product[] = (data.products || []).filter((p: Product) => !deletedIds.has(p.id));
      const dbProductCodeMap = new Map(dbProducts.map((p) => [(p.code || '').toUpperCase().trim(), p]));
      const dbProductIdMap = new Map(dbProducts.map((p) => [p.id, p]));
      const localUnsyncedProducts = this.state.products.filter(
        (lp) => !deletedIds.has(lp.id) && !dbProductIdMap.has(lp.id) && !dbProductCodeMap.has((lp.code || '').toUpperCase().trim())
      );
      const mergedProducts = [...dbProducts, ...localUnsyncedProducts];
      if (localUnsyncedProducts.length > 0 && data.connected !== false) {
        localUnsyncedProducts.forEach((lp) => {
          fetch('/api/database/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lp),
            signal: AbortSignal.timeout(3000),
          }).catch(() => {});
        });
      }

      this.state = {
        ...this.state,
        customers: mergedCustomers.length > 0 ? mergedCustomers : this.state.customers,
        products: mergedProducts.length > 0 ? mergedProducts : this.state.products,
        vehicles: mergedVehicles.length > 0 ? mergedVehicles : this.state.vehicles,
        drivers: mergedDrivers.length > 0 ? mergedDrivers : this.state.drivers,
        trips: mergedTrips.length > 0 ? mergedTrips : this.state.trips,
        weighbridgeTransactions: data.weighbridgeTransactions && data.weighbridgeTransactions.length > 0 ? data.weighbridgeTransactions : this.state.weighbridgeTransactions,
        gatePasses: data.gatePasses && data.gatePasses.length > 0 ? data.gatePasses : this.state.gatePasses,
        rawMaterials: data.rawMaterials && data.rawMaterials.length > 0 ? data.rawMaterials : this.state.rawMaterials,
        suppliers: data.suppliers && data.suppliers.length > 0 ? data.suppliers : this.state.suppliers,
        spareParts: data.spareParts && data.spareParts.length > 0 ? data.spareParts : this.state.spareParts,
        auditLogs: data.auditLogs && data.auditLogs.length > 0 ? data.auditLogs : this.state.auditLogs,
        whatsappMessages: data.whatsappMessages && data.whatsappMessages.length > 0 ? data.whatsappMessages : this.state.whatsappMessages,
        rawMaterialReceipts: data.rawMaterialReceipts && data.rawMaterialReceipts.length > 0 ? data.rawMaterialReceipts : this.state.rawMaterialReceipts,
        isSyncedWithSupabase: true,
        lastSyncedAt: new Date().toLocaleTimeString(),
      };

      this.persistAndBroadcast();
      this.notify();
      return true;
    } catch (err) {
      console.warn('Failed to sync with Supabase:', err);
      return false;
    } finally {
      this.isSyncing = false;
    }
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
    destination: string;
    requiredDate?: string;
    vehicleId?: string;
    driverId?: string;
    notes?: string;
  }): Trip {
    const formattedNum = String(this.tripCounter++).padStart(6, '0');
    const tripNumber = `TRP-2026-${formattedNum}`;
    const nextSequence =
      this.state.trips.filter((t) => t.status === 'QUEUED').length + 1;

    const tripId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `trip-${Date.now()}`;

    const todayDate = new Date().toISOString().split('T')[0];
    const newTrip: Trip = {
      id: tripId,
      tripNumber,
      customerId: params.customerId,
      productId: params.productId,
      orderedQtyMt: params.orderedQtyMt,
      vehicleId: params.vehicleId,
      driverId: params.driverId,
      destination: params.destination,
      requiredDate: params.requiredDate || todayDate,
      status: 'QUEUED',
      fifoSequence: nextSequence,
      notes: params.notes,
      createdAt: new Date().toISOString(),
    };

    // 1. Core ERP Transaction (Always succeeds)
    this.state.trips = [...this.state.trips, newTrip];
    this.addAuditLog('CREATE_TRIP', 'TRIP', tripNumber, `Created Trip ${tripNumber} for ${params.orderedQtyMt} MT (Req: ${newTrip.requiredDate})`);
    this.persistAndBroadcast();
    this.notify();

    // 2. Background sync to Supabase database
    if (typeof window !== 'undefined') {
      fetch('/api/database/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrip),
        signal: AbortSignal.timeout(3000),
      }).catch((err) => console.warn('Supabase trips background insert warning:', err));
    }

    // 2. Trigger WhatsApp Notifications (Decoupled)
    const customer = this.state.customers.find((c) => c.id === params.customerId);
    const driver = this.state.drivers.find((d) => d.id === params.driverId);
    const vehicle = this.state.vehicles.find((v) => v.id === params.vehicleId);
    const product = this.state.products.find((p) => p.id === params.productId);

    if (customer && product) {
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
          vehicleNumber: vehicle?.plateNumber || 'To be assigned at scale',
          requiredDate: newTrip.requiredDate,
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
  // SITE OPERATOR: ASSIGN TRUCK/DRIVER & WEIGHBRIDGE WORKFLOW
  // ----------------------------------------------------------------------------
  assignVehicleAndDriver(tripId: string, vehicleId: string, driverId: string) {
    const trip = this.state.trips.find((t) => t.id === tripId);
    if (!trip) return;

    const vehicle = this.state.vehicles.find((v) => v.id === vehicleId);
    const driver = this.state.drivers.find((d) => d.id === driverId);
    const product = this.state.products.find((p) => p.id === trip.productId);
    const customer = this.state.customers.find((c) => c.id === trip.customerId);

    this.state.trips = this.state.trips.map((t) =>
      t.id === tripId
        ? {
            ...t,
            vehicleId,
            driverId,
          }
        : t
    );

    this.addAuditLog(
      'ASSIGN_VEHICLE',
      'TRIP',
      trip.tripNumber,
      `Assigned Truck ${vehicle?.plateNumber || vehicleId} & Driver ${driver?.name || driverId} by Site Scale`
    );

    // Trigger Driver WhatsApp assignment alert now that driver is assigned
    if (driver && product && vehicle && customer) {
      this.queueWhatsAppMessage({
        recipientPhone: driver.phone,
        recipientType: 'DRIVER',
        recipientName: `${driver.name} (Driver)`,
        messageType: 'TEXT',
        templateName: 'DRIVER_TRIP_ASSIGNED',
        body: renderTemplate('DRIVER_TRIP_ASSIGNED', {
          tripId: trip.tripNumber,
          customerName: customer.companyName,
          productName: product.name,
          quantity: `${trip.orderedQtyMt} MT`,
          destination: trip.destination,
          vehicleNumber: vehicle.plateNumber,
        }),
        relatedEntity: 'TRIP',
        relatedEntityId: trip.tripNumber,
      });
    }

    this.persistAndBroadcast();
    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/database/trips', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: trip.id, tripNumber: trip.tripNumber, vehicleId, driverId }),
        signal: AbortSignal.timeout(3000),
      }).catch(() => {});
    }
  }

  advanceTripToScale(tripId: string) {
    // Retained for compatibility - trips remain QUEUED until dispatched
    this.updateTripStatus(tripId, 'QUEUED');
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
          }
        : t
    );

    this.addAuditLog('TARE_WEIGHED', 'WEIGHBRIDGE', wb.slipNumber, `Tare recorded: ${tareWeightMt} MT for ${trip.tripNumber}`);
    this.persistAndBroadcast();
    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/database/trips', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tripId, tareWeightMt }),
        signal: AbortSignal.timeout(3000),
      }).catch(() => {});
    }
  }

  startLoading(tripId: string) {
    // Retained for compatibility
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

    this.persistAndBroadcast();
    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/database/trips', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tripId, grossWeightMt, netWeightMt }),
        signal: AbortSignal.timeout(3000),
      }).catch(() => {});
    }
  }


  completeTrip(tripId: string) {
    const now = new Date().toISOString();
    this.state.trips = this.state.trips.map((t) =>
      t.id === tripId ? { ...t, status: 'COMPLETED' as TripStatus, completedAt: now } : t
    );
    this.persistAndBroadcast();
    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/database/trips', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tripId, status: 'COMPLETED', completedAt: now }),
        signal: AbortSignal.timeout(3000),
      }).catch(() => {});
    }
    this.addAuditLog('COMPLETED', 'TRIP', tripId, 'Trip delivered and completed successfully');
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
    this.persistAndBroadcast();
    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/database/trips', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tripId, status: 'DISPATCHED', dispatchedAt: now }),
      }).catch(() => {});
    }

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

  updateTripStatus(tripId: string, status: TripStatus) {
    this.state.trips = this.state.trips.map((t) => (t.id === tripId ? { ...t, status } : t));
    this.persistAndBroadcast();
    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/database/trips', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tripId, status }),
      }).catch(() => {});
    }
  }

  addCustomer(customer: {
    name: string;
    companyName: string;
    phone: string;
    email?: string;
    gstNumber?: string;
    billingAddress?: string;
    currentBalance?: number;
  }): Customer {
    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
    const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '';
    const id = isUuid(generatedId) ? generatedId : 'c_' + Date.now();

    const newCustomer: Customer = {
      id,
      name: customer.name,
      companyName: customer.companyName,
      phone: customer.phone,
      email: customer.email || '',
      gstNumber: customer.gstNumber || '',
      billingAddress: customer.billingAddress || 'Pune, Maharashtra',
      currentBalance: customer.currentBalance || 0,
    };
    this.state.customers = [newCustomer, ...this.state.customers];
    this.persistAndBroadcast();
    this.notify();

    // Persist to Supabase in background
    if (typeof window !== 'undefined') {
      fetch('/api/database/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      }).catch((err) => {
        console.warn('Customer background DB sync notice:', err);
      });
    }

    return newCustomer;
  }

  addVehicle(vehicle: {
    plateNumber: string;
    vehicleType?: string;
    defaultTareWeightMt?: number;
    maxCapacityMt?: number;
    assignedDriverId?: string;
  }): Vehicle {
    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
    const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '';
    const id = isUuid(generatedId) ? generatedId : 'v_' + Date.now();

    const newVehicle: Vehicle = {
      id,
      plateNumber: vehicle.plateNumber.trim().toUpperCase(),
      vehicleType: vehicle.vehicleType || 'Tipper 10-Wheeler',
      defaultTareWeightMt: vehicle.defaultTareWeightMt ? Number(vehicle.defaultTareWeightMt) : 10.5,
      maxCapacityMt: vehicle.maxCapacityMt ? Number(vehicle.maxCapacityMt) : 25.0,
      assignedDriverId: vehicle.assignedDriverId || undefined,
    };
    this.state.vehicles = [newVehicle, ...this.state.vehicles];
    this.persistAndBroadcast();
    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/database/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehicle),
      }).catch((err) => console.warn('Vehicle background DB sync notice:', err));
    }

    return newVehicle;
  }

  addDriver(driver: {
    name: string;
    phone: string;
    licenseNumber: string;
  }): Driver {
    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
    const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '';
    const id = isUuid(generatedId) ? generatedId : 'd_' + Date.now();

    const newDriver: Driver = {
      id,
      name: driver.name.trim(),
      phone: driver.phone.trim(),
      licenseNumber: driver.licenseNumber.trim(),
    };
    this.state.drivers = [newDriver, ...this.state.drivers];
    this.persistAndBroadcast();
    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/database/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDriver),
      }).catch((err) => console.warn('Driver background DB sync notice:', err));
    }

    return newDriver;
  }

  addProduct(product: {
    name: string;
    code: string;
    unit?: string;
    currentStockMt?: number;
    minThresholdMt?: number;
    unitPriceInr: number;
    description?: string;
  }): Product {
    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
    const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '';
    const id = isUuid(generatedId) ? generatedId : 'p_' + Date.now();

    const newProduct: Product = {
      id,
      name: product.name.trim(),
      code: product.code.trim().toUpperCase(),
      unit: product.unit || 'MT',
      currentStockMt: product.currentStockMt !== undefined ? Number(product.currentStockMt) : 500,
      minThresholdMt: product.minThresholdMt !== undefined ? Number(product.minThresholdMt) : 100,
      unitPriceInr: Number(product.unitPriceInr) || 650,
      description: product.description || '',
    };
    this.state.products = [newProduct, ...this.state.products];
    this.persistAndBroadcast();
    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/database/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      }).catch((err) => console.warn('Product background DB sync notice:', err));
    }

    return newProduct;
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    let updated: Customer | null = null;
    this.state.customers = this.state.customers.map((c) => {
      if (c.id === id) {
        updated = { ...c, ...updates };
        return updated;
      }
      return c;
    });

    if (updated) {
      this.persistAndBroadcast();
      this.notify();
      if (typeof window !== 'undefined') {
        fetch('/api/database/customers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...updates }),
        }).catch((err) => console.warn('Customer PATCH error:', err));
      }
    }
    return updated;
  }

  deleteCustomer(id: string): void {
    this.state.customers = this.state.customers.filter((c) => c.id !== id);
    this.state.deletedMasterIds = [...(this.state.deletedMasterIds || []), id];
    this.persistAndBroadcast();
    this.notify();
    if (typeof window !== 'undefined') {
      fetch(`/api/database/customers?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }).catch((err) => console.warn('Customer DELETE error:', err));
    }
  }

  updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle | null {
    let updated: Vehicle | null = null;
    this.state.vehicles = this.state.vehicles.map((v) => {
      if (v.id === id) {
        updated = {
          ...v,
          ...updates,
          plateNumber: updates.plateNumber ? updates.plateNumber.trim().toUpperCase() : v.plateNumber,
        };
        return updated;
      }
      return v;
    });

    if (updated) {
      this.persistAndBroadcast();
      this.notify();
      if (typeof window !== 'undefined') {
        fetch('/api/database/vehicles', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...updates }),
        }).catch((err) => console.warn('Vehicle PATCH error:', err));
      }
    }
    return updated;
  }

  deleteVehicle(id: string): void {
    this.state.vehicles = this.state.vehicles.filter((v) => v.id !== id);
    this.state.deletedMasterIds = [...(this.state.deletedMasterIds || []), id];
    this.persistAndBroadcast();
    this.notify();
    if (typeof window !== 'undefined') {
      fetch(`/api/database/vehicles?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }).catch((err) => console.warn('Vehicle DELETE error:', err));
    }
  }

  updateDriver(id: string, updates: Partial<Driver>): Driver | null {
    let updated: Driver | null = null;
    this.state.drivers = this.state.drivers.map((d) => {
      if (d.id === id) {
        updated = { ...d, ...updates };
        return updated;
      }
      return d;
    });

    if (updated) {
      this.persistAndBroadcast();
      this.notify();
      if (typeof window !== 'undefined') {
        fetch('/api/database/drivers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...updates }),
        }).catch((err) => console.warn('Driver PATCH error:', err));
      }
    }
    return updated;
  }

  deleteDriver(id: string): void {
    this.state.drivers = this.state.drivers.filter((d) => d.id !== id);
    this.state.deletedMasterIds = [...(this.state.deletedMasterIds || []), id];
    this.persistAndBroadcast();
    this.notify();
    if (typeof window !== 'undefined') {
      fetch(`/api/database/drivers?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }).catch((err) => console.warn('Driver DELETE error:', err));
    }
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    let updated: Product | null = null;
    this.state.products = this.state.products.map((p) => {
      if (p.id === id) {
        updated = {
          ...p,
          ...updates,
          code: updates.code ? updates.code.trim().toUpperCase() : p.code,
        };
        return updated;
      }
      return p;
    });

    if (updated) {
      this.persistAndBroadcast();
      this.notify();
      if (typeof window !== 'undefined') {
        fetch('/api/database/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...updates }),
        }).catch((err) => console.warn('Product PATCH error:', err));
      }
    }
    return updated;
  }

  deleteProduct(id: string): void {
    this.state.products = this.state.products.filter((p) => p.id !== id);
    this.state.deletedMasterIds = [...(this.state.deletedMasterIds || []), id];
    this.persistAndBroadcast();
    this.notify();
    if (typeof window !== 'undefined') {
      fetch(`/api/database/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }).catch((err) => console.warn('Product DELETE error:', err));
    }
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

    this.persistAndBroadcast();
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
