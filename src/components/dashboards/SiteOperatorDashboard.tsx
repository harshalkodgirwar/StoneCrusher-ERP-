'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCrusherStore } from '../../lib/store/useCrusherStore';
import { crusherStore, Trip } from '../../lib/store/crusher-store';
import {
  Scale,
  Truck,
  Layers,
  FileCheck,
  Package,
  Wrench,
  Check,
  RefreshCw,
  PlusCircle,
  Clock,
  Send,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  FileText,
  Building2,
  HardHat,
  Cpu,
  CheckCircle,
} from 'lucide-react';

interface SiteOperatorDashboardProps {
  onOpenWhatsAppSimulator: () => void;
  onViewGatePass: (gatePassId: string) => void;
  onViewReceipt: (receiptId: string) => void;
}

type SiteNavTab = 'WEIGHBRIDGE' | 'FIFO_QUEUE' | 'INVENTORY' | 'RAW_MATERIAL' | 'SPARES';

export const SiteOperatorDashboard: React.FC<SiteOperatorDashboardProps> = ({
  onOpenWhatsAppSimulator,
  onViewGatePass,
  onViewReceipt,
}) => {
  const store = useCrusherStore();
  const [activeTab, setActiveTab] = useState<SiteNavTab>('WEIGHBRIDGE');

  // Sorted by Required Delivery Date (earliest delivery date first)
  const queuedTrips = [...store.trips]
    .filter((t) => t.status === 'QUEUED')
    .sort((a, b) => {
      const dateA = a.requiredDate || a.createdAt?.split('T')[0] || '9999-99-99';
      const dateB = b.requiredDate || b.createdAt?.split('T')[0] || '9999-99-99';
      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const allTripsSorted = [...store.trips].sort((a, b) => {
    const dateA = a.requiredDate || a.createdAt?.split('T')[0] || '9999-99-99';
    const dateB = b.requiredDate || b.createdAt?.split('T')[0] || '9999-99-99';
    if (dateA !== dateB) {
      return dateA.localeCompare(dateB);
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const nextTrip: Trip | undefined = queuedTrips[0];
  const [activeTripId, setActiveTripId] = useState<string>(nextTrip?.id || '');

  // Site-level vehicle and driver allocation state
  const [siteVehicleId, setSiteVehicleId] = useState<string>('');
  const [siteDriverId, setSiteDriverId] = useState<string>('');

  useEffect(() => {
    if (!activeTripId && nextTrip?.id) {
      setActiveTripId(nextTrip.id);
    }
  }, [nextTrip, activeTripId]);

  const selectedTrip = store.trips.find((t) => t.id === activeTripId) || nextTrip;

  useEffect(() => {
    if (selectedTrip) {
      const initialVehId = selectedTrip.vehicleId || store.vehicles[0]?.id || '';
      setSiteVehicleId(initialVehId);
      const matchedVeh = store.vehicles.find((v) => v.id === initialVehId);
      setSiteDriverId(selectedTrip.driverId || matchedVeh?.assignedDriverId || store.drivers[0]?.id || '');
    }
  }, [selectedTrip?.id, store.vehicles, store.drivers]);

  const handleSiteVehicleChange = (vId: string) => {
    setSiteVehicleId(vId);
    const veh = store.vehicles.find((v) => v.id === vId);
    if (veh?.assignedDriverId) {
      setSiteDriverId(veh.assignedDriverId);
    }
  };

  const handleCallToScale = (tripId: string) => {
    if (siteVehicleId && siteDriverId) {
      crusherStore.assignVehicleAndDriver(tripId, siteVehicleId, siteDriverId);
    }
    crusherStore.advanceTripToScale(tripId);
  };

  // Scale simulation
  const [digitalScaleWeight, setDigitalScaleWeight] = useState<number>(0);
  const [isScaleFluctuating, setIsScaleFluctuating] = useState<boolean>(false);
  const [manualWeightInput, setManualWeightInput] = useState<string>('');
  const [useManualWeight, setUseManualWeight] = useState<boolean>(false);

  // Raw Material Inward
  const [rawSupplierId, setRawSupplierId] = useState(store.suppliers[0]?.id || '');
  const [rawMaterialId, setRawMaterialId] = useState(store.rawMaterials[0]?.id || '');
  const [rawTruckNo, setRawTruckNo] = useState('MH12XY4455');
  const [rawQtyBrass, setRawQtyBrass] = useState('15');
  const [rawRate, setRawRate] = useState('3200');

  // Spares
  const [sparePartId, setSparePartId] = useState(store.spareParts[0]?.id || '');
  const [spareQty, setSpareQty] = useState('1');
  const [spareReason, setSpareReason] = useState('Routine crusher maintenance & wear plate inspection');
  const [spareSuccessMsg, setSpareSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isScaleFluctuating) return;

    const interval = setInterval(() => {
      let base = 0;
      if (selectedTrip) {
        if (selectedTrip.status === 'QUEUED' && !selectedTrip.tareWeightMt) {
          const vehId = selectedTrip.vehicleId || siteVehicleId;
          const veh = store.vehicles.find((v) => v.id === vehId);
          base = veh?.defaultTareWeightMt || 10.4;
        } else if (selectedTrip.status === 'QUEUED' && selectedTrip.tareWeightMt && !selectedTrip.grossWeightMt) {
          const tare = selectedTrip.tareWeightMt || 10.4;
          base = tare + selectedTrip.orderedQtyMt;
        }
      }

      if (base > 0) {
        const jitter = (Math.random() - 0.5) * 0.08;
        setDigitalScaleWeight(Number((base + jitter).toFixed(2)));
      } else {
        setDigitalScaleWeight((prev) => (prev !== 0 ? 0.0 : prev));
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isScaleFluctuating, selectedTrip, store.vehicles]);

  const getEffectiveWeight = (): number => {
    if (useManualWeight && manualWeightInput) {
      return parseFloat(manualWeightInput) || 0;
    }
    return digitalScaleWeight;
  };

  const handleCaptureTare = (tripId: string) => {
    const weight = getEffectiveWeight();
    if (weight <= 0) {
      alert('Scale weight cannot be zero.');
      return;
    }
    const trip = store.trips.find((t) => t.id === tripId);
    if (!trip?.vehicleId && siteVehicleId) {
      crusherStore.assignVehicleAndDriver(tripId, siteVehicleId, siteDriverId || store.drivers[0]?.id || '');
    }
    crusherStore.recordTareWeight(tripId, weight);
    setIsScaleFluctuating(true);
  };

  const handleCaptureGrossAndDeductInventory = (tripId: string) => {
    const trip = store.trips.find((t) => t.id === tripId);
    if (!trip || !trip.tareWeightMt) {
      alert('Tare weight must be captured first.');
      return;
    }

    const grossWeight = getEffectiveWeight();
    if (grossWeight <= trip.tareWeightMt) {
      alert(`Gross weight (${grossWeight} MT) must exceed Tare (${trip.tareWeightMt} MT).`);
      return;
    }

    crusherStore.recordGrossWeight(tripId, grossWeight);
    setIsScaleFluctuating(true);
  };

  const handleGenerateGatePass = (tripId: string) => {
    const gp = crusherStore.generateGatePass(tripId);
    onViewGatePass(gp.id);
  };

  const handleRawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(rawQtyBrass);
    const rate = parseFloat(rawRate);
    if (!rawSupplierId || !rawMaterialId || isNaN(qty) || qty <= 0) return;

    const receipt = crusherStore.addRawMaterialInward({
      supplierId: rawSupplierId,
      rawMaterialId,
      vehicleNumber: rawTruckNo,
      quantityBrass: qty,
      ratePerBrass: rate,
    });

    onViewReceipt(receipt.id);
  };

  const handleSpareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(spareQty, 10);
    if (isNaN(qty) || qty <= 0) return;
    crusherStore.consumeSparePart(sparePartId, qty, spareReason);
    setSpareSuccessMsg(`Recorded consumption of ${qty} unit(s). Stock updated.`);
    setTimeout(() => setSpareSuccessMsg(null), 5000);
  };

  return (
    <div className="owner-layout">
      {/* 1. Deep Blue Sidebar (Exact match to Owner Dashboard) */}
      <aside className="owner-sidebar">
        <div className="owner-sidebar-logo">
          <div className="owner-logo-icon">
            <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>❖</span>
          </div>
          <div className="owner-logo-text">
            <div className="owner-logo-title">CRUSHER</div>
            <div className="owner-logo-sub">SITE SCALE DECK</div>
          </div>
        </div>

        {/* Role Indicator Pill */}
        <div style={{ padding: '12px 14px 4px' }}>
          <div
            style={{
              backgroundColor: 'rgba(217, 119, 6, 0.15)',
              border: '1px solid rgba(217, 119, 6, 0.35)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#FCD34D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>ROLE: SITE OPERATOR</span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
          </div>
        </div>

        {/* Navigation Menu */}
        <ul className="owner-nav-list">
          <li>
            <a
              onClick={() => setActiveTab('WEIGHBRIDGE')}
              className={`owner-nav-item ${activeTab === 'WEIGHBRIDGE' ? 'active' : ''}`}
            >
              <div className="owner-nav-left">
                <Scale size={16} />
                <span>Weighbridge Terminal</span>
              </div>
              <span
                style={{
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '10px',
                }}
              >
                LIVE
              </span>
            </a>
          </li>

          <li>
            <a
              onClick={() => setActiveTab('FIFO_QUEUE')}
              className={`owner-nav-item ${activeTab === 'FIFO_QUEUE' ? 'active' : ''}`}
            >
              <div className="owner-nav-left">
                <Clock size={16} />
                <span>Delivery Date Queue</span>
              </div>
              <span
                style={{
                  backgroundColor: queuedTrips.length > 0 ? '#D97706' : '#334155',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '10px',
                }}
              >
                {queuedTrips.length}
              </span>
            </a>
          </li>

          <li>
            <a
              onClick={() => setActiveTab('INVENTORY')}
              className={`owner-nav-item ${activeTab === 'INVENTORY' ? 'active' : ''}`}
            >
              <div className="owner-nav-left">
                <Layers size={16} />
                <span>Hoppers & Silos</span>
              </div>
            </a>
          </li>

          <li>
            <a
              onClick={() => setActiveTab('RAW_MATERIAL')}
              className={`owner-nav-item ${activeTab === 'RAW_MATERIAL' ? 'active' : ''}`}
            >
              <div className="owner-nav-left">
                <Package size={16} />
                <span>Quarry Boulder Inward</span>
              </div>
              <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{store.rawMaterialReceipts.length}</span>
            </a>
          </li>

          <li>
            <a
              onClick={() => setActiveTab('SPARES')}
              className={`owner-nav-item ${activeTab === 'SPARES' ? 'active' : ''}`}
            >
              <div className="owner-nav-left">
                <Wrench size={16} />
                <span>Spares & Maintenance</span>
              </div>
            </a>
          </li>

          <li style={{ marginTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
            <a onClick={onOpenWhatsAppSimulator} className="owner-nav-item">
              <div className="owner-nav-left">
                <Send size={16} style={{ color: '#25D366' }} />
                <span style={{ color: '#86EFAC' }}>WhatsApp Simulator</span>
              </div>
              <span
                style={{
                  backgroundColor: '#25D366',
                  color: '#064E3B',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                DISPATCH
              </span>
            </a>
          </li>
        </ul>

        {/* Bottom Role Portals */}
        <div style={{ padding: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '8px' }}>
            SWITCH PORTAL
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Link
              href="/owner"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: '#CBD5E1',
                fontSize: '0.72rem',
                textDecoration: 'none',
              }}
            >
              <span>👑 Owner Dashboard</span>
              <ChevronRight size={12} />
            </Link>
            <Link
              href="/office"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: '#CBD5E1',
                fontSize: '0.72rem',
                textDecoration: 'none',
              }}
            >
              <span>🖥️ Office Operator</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </aside>

      {/* 2. Main Container with Topbar & Content */}
      <main className="owner-main-container">
        {/* Sticky White Topbar */}
        <header className="owner-topbar">
          <div className="owner-topbar-left">
            <div className="owner-breadcrumbs">
              CRUSHER ERP &gt; <strong style={{ color: '#0F172A' }}>Site Weighbridge Scale Deck Terminal</strong>
            </div>
          </div>

          <div className="owner-topbar-right">
            {/* Scale Hardware Connectivity Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
              SCALE SENSOR CONNECTED (COM3 RS-232 9600 BAUD)
            </div>

            <div style={{ fontSize: '1.15rem' }} title="India Region">🇮🇳</div>

            {/* User Avatar */}
            <div className="owner-user-pill">
              <div className="owner-avatar" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>SG</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ lineHeight: 1.1, fontSize: '0.78rem' }}>Suresh Gaikwad</div>
                <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 500 }}>Site Scale Weighmaster</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body Content */}
        <div className="owner-content-body">
          {/* Top 4 Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div className="owner-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Weighbridge Sensor</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16A34A', marginTop: '4px' }}>
                ONLINE & ZEROED
              </div>
              <div className="owner-pill-badge owner-pill-green" style={{ marginTop: '8px' }}>
                Load Cells Calibrated
              </div>
            </div>

            <div className="owner-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Gate Passes Dispatched</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                {store.gatePasses.length} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748B' }}>slips</span>
              </div>
              <div className="owner-pill-badge owner-pill-cyan" style={{ marginTop: '8px' }}>
                QR Invoices Sent
              </div>
            </div>

            <div className="owner-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Trucks in Delivery Queue</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
                {queuedTrips.length} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748B' }}>waiting</span>
              </div>
              <div className="owner-pill-badge owner-pill-cyan" style={{ marginTop: '8px' }}>
                Sorted by Delivery Date
              </div>
            </div>

            <div className="owner-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Quarry Boulder Inwards</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                {store.rawMaterialReceipts.length} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748B' }}>truckloads</span>
              </div>
              <div className="owner-pill-badge owner-pill-green" style={{ marginTop: '8px' }}>
                Primary Crusher Fed
              </div>
            </div>
          </div>

          {/* TAB 1: WEIGHBRIDGE TERMINAL */}
          {activeTab === 'WEIGHBRIDGE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Active / Summoned Truck Stepper Banner */}
              {selectedTrip ? (
                <div
                  className="owner-card"
                  style={{
                    padding: '18px 24px',
                    borderLeft: '5px solid #2563EB',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: '#64748B',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          ACTIVE CALLOUT TO SCALE
                        </span>
                        <strong style={{ fontSize: '1.2rem', color: '#0F172A' }}>{selectedTrip.tripNumber}</strong>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            backgroundColor:
                              selectedTrip.status === 'QUEUED'
                                ? '#FEF3C7'
                                : selectedTrip.status === 'DISPATCHED'
                                ? '#DBEAFE'
                                : '#DCFCE7',
                            color:
                              selectedTrip.status === 'QUEUED'
                                ? '#B45309'
                                : selectedTrip.status === 'DISPATCHED'
                                ? '#1D4ED8'
                                : '#15803D',
                          }}
                        >
                          {selectedTrip.status}
                        </span>
                      </div>

                      {(() => {
                        const cust = store.customers.find((c) => c.id === selectedTrip.customerId);
                        const prod = store.products.find((p) => p.id === selectedTrip.productId);
                        const veh = store.vehicles.find((v) => v.id === (selectedTrip.vehicleId || siteVehicleId));
                        const driver = store.drivers.find((d) => d.id === (selectedTrip.driverId || siteDriverId));

                        return (
                          <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '6px' }}>
                            Contractor: <strong style={{ color: '#0F172A' }}>{cust?.companyName}</strong>
                            {' • '}Product: <strong style={{ color: '#2563EB' }}>{prod?.name}</strong> ({selectedTrip.orderedQtyMt} MT target)
                            {' • '}Truck: {selectedTrip.vehicleId ? (
                              <strong style={{ fontFamily: 'monospace', color: '#0F172A' }}>{veh?.plateNumber}</strong>
                            ) : (
                              <span style={{ color: '#D97706', fontWeight: 700 }}>⚠️ Yard Truck Unassigned</span>
                            )}
                            {' • '}Driver: {selectedTrip.driverId ? (
                              <strong>{driver?.name}</strong>
                            ) : (
                              <span style={{ color: '#D97706', fontWeight: 700 }}>⚠️ Yard Driver Unassigned</span>
                            )}
                            {' • '}Req. Date: <strong style={{ color: '#0F172A' }}>📅 {selectedTrip.requiredDate || 'Immediate'}</strong>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Step Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {selectedTrip.status === 'QUEUED' && !selectedTrip.tareWeightMt && (
                        <button
                          onClick={() => handleCaptureTare(selectedTrip.id)}
                          className="owner-btn-primary"
                          style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                        >
                          <Scale size={16} /> Record Tare Weight ({getEffectiveWeight().toFixed(2)} MT)
                        </button>
                      )}

                      {selectedTrip.status === 'QUEUED' && selectedTrip.tareWeightMt && !selectedTrip.grossWeightMt && (
                        <button
                          onClick={() => handleCaptureGrossAndDeductInventory(selectedTrip.id)}
                          className="owner-btn-primary"
                          style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                        >
                          <Scale size={16} /> Record Gross ({getEffectiveWeight().toFixed(2)} MT) & Deduct Stock
                        </button>
                      )}

                      {selectedTrip.status === 'QUEUED' && selectedTrip.grossWeightMt && (
                        <button
                          onClick={() => handleGenerateGatePass(selectedTrip.id)}
                          className="owner-btn-success"
                          style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                        >
                          <FileCheck size={16} /> Generate QR Gate Pass & Dispatch Truck →
                        </button>
                      )}

                      {selectedTrip.status === 'DISPATCHED' && (
                        <button
                          onClick={() => crusherStore.completeTrip(selectedTrip.id)}
                          className="owner-btn-success"
                          style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                        >
                          <CheckCircle size={16} /> Mark Completed ✓
                        </button>
                      )}

                      {selectedTrip.status === 'COMPLETED' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803D', fontWeight: 700, fontSize: '0.85rem', backgroundColor: '#DCFCE7', padding: '8px 16px', borderRadius: '6px' }}>
                          <CheckCircle size={16} /> Trip Completed & Verified
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Site Operator Yard Vehicle & Driver Selection Bar */}
                  {selectedTrip.status === 'QUEUED' && (
                    <div
                      style={{
                        marginTop: '16px',
                        padding: '12px 16px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Truck size={16} color="#2563EB" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B' }}>
                          Assign Available Yard Truck & Driver:
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Truck:</span>
                          <select
                            className="owner-select"
                            value={siteVehicleId}
                            onChange={(e) => handleSiteVehicleChange(e.target.value)}
                            style={{ fontSize: '0.78rem', padding: '5px 10px', minWidth: '180px' }}
                          >
                            {store.vehicles.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.plateNumber} ({v.vehicleType} • ~{v.defaultTareWeightMt} MT)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Driver:</span>
                          <select
                            className="owner-select"
                            value={siteDriverId}
                            onChange={(e) => setSiteDriverId(e.target.value)}
                            style={{ fontSize: '0.78rem', padding: '5px 10px', minWidth: '160px' }}
                          >
                            {store.drivers.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.phone})
                              </option>
                            ))}
                          </select>
                        </div>

                        {(!selectedTrip.vehicleId || selectedTrip.vehicleId !== siteVehicleId || selectedTrip.driverId !== siteDriverId) && (
                          <button
                            onClick={() => crusherStore.assignVehicleAndDriver(selectedTrip.id, siteVehicleId, siteDriverId)}
                            className="owner-btn-secondary"
                            style={{ fontSize: '0.74rem', padding: '5px 12px', color: '#2563EB', borderColor: '#2563EB', fontWeight: 600 }}
                          >
                            Confirm Yard Assignment
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="owner-card" style={{ padding: '28px', textAlign: 'center', color: '#64748B' }}>
                  <Clock size={36} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>No Trucks Currently in Site Queue</div>
                  <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                    Office operator bookings will appear automatically here.
                  </p>
                </div>
              )}

              {/* 2-Column Grid: Digital Scale Terminal + FIFO Queue List */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '20px', alignItems: 'start' }}>
                {/* Scale Terminal */}
                <div className="owner-card" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                      <h3 className="owner-card-title" style={{ marginBottom: '2px' }}>
                        Heavy Duty Weighbridge Scale Deck (100 MT Capacity)
                      </h3>
                      <p style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        Digitally connected to high-precision Avery Weigh-Tronix load cell sensors.
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#16A34A', fontWeight: 700 }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
                      ONLINE
                    </div>
                  </div>

                  {/* High-Contrast Industrial Digital Display */}
                  <div className="owner-scale-display">
                    <div style={{ position: 'absolute', top: '12px', left: '16px', fontSize: '0.68rem', color: '#64748B', letterSpacing: '0.08em' }}>
                      SCALE DECK #1 — CALIBRATED
                    </div>
                    <div className="owner-scale-metric">
                      {getEffectiveWeight().toFixed(2)}
                    </div>
                    <div className="owner-scale-sub">
                      METRIC TONS (MT) • NET ACCURACY ±0.01 MT
                    </div>
                  </div>

                  {/* Scale Controls Toolbar */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '16px',
                      padding: '10px 14px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isScaleFluctuating ? (
                        <button
                          onClick={() => setIsScaleFluctuating(false)}
                          className="owner-btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                        >
                          Hold Weight
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsScaleFluctuating(true)}
                          className="owner-btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '6px 12px', color: '#2563EB', borderColor: '#2563EB' }}
                        >
                          <RefreshCw size={12} /> Live Sensing
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setDigitalScaleWeight(0);
                          setManualWeightInput('');
                        }}
                        className="owner-btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                      >
                        Zero Scale (Tare Deck)
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                      <label style={{ color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="checkbox"
                          checked={useManualWeight}
                          onChange={(e) => setUseManualWeight(e.target.checked)}
                        />
                        Manual Key-in
                      </label>
                      {useManualWeight && (
                        <input
                          type="number"
                          placeholder="Weight MT"
                          value={manualWeightInput}
                          onChange={(e) => setManualWeightInput(e.target.value)}
                          className="owner-input"
                          style={{ width: '90px', padding: '4px 8px', fontSize: '0.78rem' }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Tare / Gross / Net Calculation Panel */}
                  {selectedTrip && (
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                        Current Trip Weight Calculation:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        <div style={{ backgroundColor: '#F1F5F9', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>TARE WEIGHT</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                            {selectedTrip.tareWeightMt ? `${selectedTrip.tareWeightMt.toFixed(2)} MT` : '--'}
                          </div>
                        </div>

                        <div style={{ backgroundColor: '#F1F5F9', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>GROSS WEIGHT</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                            {selectedTrip.grossWeightMt ? `${selectedTrip.grossWeightMt.toFixed(2)} MT` : '--'}
                          </div>
                        </div>

                        <div style={{ backgroundColor: '#DCFCE7', padding: '12px', borderRadius: '6px', textAlign: 'center', border: '1px solid #86EFAC' }}>
                          <div style={{ fontSize: '0.7rem', color: '#15803D', fontWeight: 700 }}>NET DISPATCHED</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16A34A', marginTop: '4px' }}>
                            {selectedTrip.netWeightMt ? `${selectedTrip.netWeightMt.toFixed(2)} MT` : '--'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delivery Date Queue Picker List */}
                <div className="owner-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                      <h3 className="owner-card-title" style={{ marginBottom: '2px' }}>
                        Delivery Schedule Queue ({queuedTrips.length})
                      </h3>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        Sorted by Required Delivery Date (Earliest First)
                      </div>
                    </div>
                    <span className="owner-pill-badge owner-pill-cyan">Selectable</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '440px', overflowY: 'auto' }}>
                    {queuedTrips.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px', color: '#64748B', fontSize: '0.8rem' }}>
                        No queued trucks.
                      </div>
                    ) : (
                      queuedTrips.map((trip, idx) => {
                        const isSelected = trip.id === (selectedTrip?.id || '');
                        const cust = store.customers.find((c) => c.id === trip.customerId);
                        const prod = store.products.find((p) => p.id === trip.productId);
                        const veh = store.vehicles.find((v) => v.id === trip.vehicleId);

                        return (
                          <div
                            key={trip.id}
                            onClick={() => setActiveTripId(trip.id)}
                            style={{
                              padding: '12px 14px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                              border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 800, color: isSelected ? '#2563EB' : '#64748B', fontSize: '0.85rem' }}>
                                  #{idx + 1}
                                </span>
                                <strong style={{ color: '#0F172A', fontSize: '0.85rem' }}>{trip.tripNumber}</strong>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span
                                  style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: '#FEF3C7',
                                    color: '#92400E',
                                  }}
                                >
                                  📅 {trip.requiredDate || 'Today'}
                                </span>
                                <span
                                  style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: isSelected ? '#DBEAFE' : '#E2E8F0',
                                    color: isSelected ? '#1D4ED8' : '#475569',
                                  }}
                                >
                                  {trip.status}
                                </span>
                              </div>
                            </div>

                            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px' }}>
                              <strong>{cust?.companyName}</strong> • {prod?.name} ({trip.orderedQtyMt} MT)
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                              <span>Truck: <strong style={{ fontFamily: 'monospace' }}>{veh?.plateNumber}</strong></span>
                              {isSelected && <span style={{ color: '#2563EB', fontWeight: 700 }}>Active on Terminal</span>}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DELIVERY DATE SCHEDULE QUEUE FULL VIEW */}
          {activeTab === 'FIFO_QUEUE' && (
            <div className="owner-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 className="owner-card-title" style={{ marginBottom: '2px' }}>
                    Full Delivery Schedule & Dispatched Slips
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    All vehicles sorted by required delivery date (earliest first) for weighment, hopper filling, and dispatch.
                  </p>
                </div>
              </div>

              <table className="owner-table">
                <thead>
                  <tr>
                    <th>Priority #</th>
                    <th>Trip ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Vehicle Plate</th>
                    <th>Req. Delivery Date</th>
                    <th>Tare (MT)</th>
                    <th>Gross (MT)</th>
                    <th>Net (MT)</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allTripsSorted.map((trip, idx) => {
                    const cust = store.customers.find((c) => c.id === trip.customerId);
                    const prod = store.products.find((p) => p.id === trip.productId);
                    const veh = store.vehicles.find((v) => v.id === trip.vehicleId);
                    const gatePass = store.gatePasses.find((g) => g.tripId === trip.id);

                    return (
                      <tr key={trip.id}>
                        <td><strong>#{idx + 1}</strong></td>
                        <td><strong>{trip.tripNumber}</strong></td>
                        <td>
                          <div className="owner-customer-cell">
                            <div className="owner-cust-avatar">
                              {cust?.companyName?.slice(0, 2).toUpperCase() || 'CU'}
                            </div>
                            <span style={{ fontWeight: 600 }}>{cust?.companyName}</span>
                          </div>
                        </td>
                        <td><strong>{prod?.name}</strong></td>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                            {veh?.plateNumber}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                            📅 {trip.requiredDate || 'Immediate'}
                          </span>
                        </td>
                        <td>{trip.tareWeightMt ? `${trip.tareWeightMt.toFixed(2)} MT` : '--'}</td>
                        <td>{trip.grossWeightMt ? `${trip.grossWeightMt.toFixed(2)} MT` : '--'}</td>
                        <td>
                          <strong style={{ color: '#16A34A' }}>
                            {trip.netWeightMt ? `${trip.netWeightMt.toFixed(2)} MT` : '--'}
                          </strong>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              backgroundColor:
                                trip.status === 'QUEUED'
                                  ? '#FEF3C7'
                                  : trip.status === 'DISPATCHED'
                                  ? '#DBEAFE'
                                  : '#DCFCE7',
                              color:
                                trip.status === 'QUEUED'
                                  ? '#B45309'
                                  : trip.status === 'DISPATCHED'
                                  ? '#1D4ED8'
                                  : '#15803D',
                            }}
                          >
                            {trip.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {gatePass && (
                              <button
                                onClick={() => onViewGatePass(gatePass.id)}
                                className="owner-btn-secondary"
                                style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                              >
                                Gate Pass
                              </button>
                            )}
                            {trip.status === 'QUEUED' && (
                              <button
                                onClick={() => {
                                  setActiveTripId(trip.id);
                                  setActiveTab('WEIGHBRIDGE');
                                }}
                                className="owner-btn-primary"
                                style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                              >
                                Weigh →
                              </button>
                            )}
                            {trip.status === 'DISPATCHED' && (
                              <button
                                onClick={() => crusherStore.completeTrip(trip.id)}
                                className="owner-btn-success"
                                style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                              >
                                Complete ✓
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: INVENTORY SILOS */}
          {activeTab === 'INVENTORY' && (
            <div className="owner-card" style={{ padding: '20px' }}>
              <h3 className="owner-card-title" style={{ marginBottom: '4px' }}>
                Finished Aggregate Stock & Silo Capacities
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '16px' }}>
                Stock is automatically deducted in real time as gross weight slips are printed on the weighbridge.
              </p>

              <table className="owner-table">
                <thead>
                  <tr>
                    <th>Aggregate Product</th>
                    <th>Unit</th>
                    <th>Current Stock</th>
                    <th>Min Threshold</th>
                    <th>Stock Gauge</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {store.products.map((p) => {
                    const isLow = p.currentStockMt <= p.minThresholdMt;
                    const maxCapacity = 500;
                    const pct = Math.min(100, Math.round((p.currentStockMt / maxCapacity) * 100));

                    return (
                      <tr key={p.id}>
                        <td><strong>{p.name}</strong></td>
                        <td>{p.unit}</td>
                        <td><strong style={{ fontSize: '0.95rem' }}>{p.currentStockMt.toFixed(1)} MT</strong></td>
                        <td style={{ color: '#64748B' }}>{p.minThresholdMt} MT</td>
                        <td style={{ width: '25%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${pct}%`,
                                  height: '100%',
                                  backgroundColor: isLow ? '#EF4444' : '#10B981',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B' }}>{pct}%</span>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              backgroundColor: isLow ? '#FEE2E2' : '#DCFCE7',
                              color: isLow ? '#DC2626' : '#15803D',
                            }}
                          >
                            {isLow ? 'LOW STOCK ALERT' : 'NORMAL INVENTORY'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: RAW MATERIAL INWARD */}
          {activeTab === 'RAW_MATERIAL' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '20px' }}>
              {/* Form Card */}
              <div className="owner-card" style={{ padding: '22px' }}>
                <h3 className="owner-card-title" style={{ marginBottom: '2px' }}>
                  Log Raw Boulder Inward (Quarry Blast)
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '16px' }}>
                  Receiving uncrushed basalt boulders for primary jaw feeder.
                </p>

                <form onSubmit={handleRawSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="owner-form-group">
                    <label className="owner-form-label">Quarry Supplier *</label>
                    <select
                      className="owner-select"
                      value={rawSupplierId}
                      onChange={(e) => setRawSupplierId(e.target.value)}
                    >
                      {store.suppliers.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.phone})</option>
                      ))}
                    </select>
                  </div>

                  <div className="owner-form-group">
                    <label className="owner-form-label">Raw Material Type *</label>
                    <select
                      className="owner-select"
                      value={rawMaterialId}
                      onChange={(e) => setRawMaterialId(e.target.value)}
                    >
                      {store.rawMaterials.map((rm) => (
                        <option key={rm.id} value={rm.id}>{rm.name} (Current: {rm.currentStockBrass} Brass)</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="owner-form-group">
                      <label className="owner-form-label">Dumper Truck Plate</label>
                      <input
                        type="text"
                        className="owner-input"
                        value={rawTruckNo}
                        onChange={(e) => setRawTruckNo(e.target.value)}
                      />
                    </div>

                    <div className="owner-form-group">
                      <label className="owner-form-label">Quantity (Brass) *</label>
                      <input
                        type="number"
                        step="0.5"
                        className="owner-input"
                        value={rawQtyBrass}
                        onChange={(e) => setRawQtyBrass(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="owner-form-group">
                    <label className="owner-form-label">Contract Rate (₹ / Brass)</label>
                    <input
                      type="number"
                      className="owner-input"
                      value={rawRate}
                      onChange={(e) => setRawRate(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="owner-btn-primary" style={{ marginTop: '6px' }}>
                    <Package size={16} /> Record Inward & Issue WhatsApp Voucher
                  </button>
                </form>
              </div>

              {/* Vouchers Table */}
              <div className="owner-card" style={{ padding: '20px' }}>
                <h3 className="owner-card-title" style={{ marginBottom: '4px' }}>
                  Recent Inward Receipts ({store.rawMaterialReceipts.length})
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '14px' }}>
                  Verified supplier boulder inward vouchers.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {store.rawMaterialReceipts.map((rcpt) => (
                    <div
                      key={rcpt.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '6px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: '#0F172A' }}>{rcpt.receiptNumber}</strong>
                          <span style={{ color: '#2563EB', fontWeight: 600 }}>• {rcpt.supplierName}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '3px' }}>
                          {rcpt.rawMaterialName} ({rcpt.quantityBrass} Brass) • Dumper: <strong style={{ fontFamily: 'monospace' }}>{rcpt.vehicleNumber}</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => onViewReceipt(rcpt.id)}
                        className="owner-btn-secondary"
                        style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                      >
                        <FileText size={12} /> View Voucher
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SPARES & MAINTENANCE */}
          {activeTab === 'SPARES' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '20px' }}>
              {/* Form Card */}
              <div className="owner-card" style={{ padding: '22px' }}>
                <h3 className="owner-card-title" style={{ marginBottom: '2px' }}>
                  Log Spare Part Consumption
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '16px' }}>
                  Record worn plate replacements and crusher maintenance.
                </p>

                {spareSuccessMsg && (
                  <div
                    style={{
                      backgroundColor: '#DCFCE7',
                      color: '#15803D',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      marginBottom: '14px',
                    }}
                  >
                    ✓ {spareSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleSpareSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="owner-form-group">
                    <label className="owner-form-label">Crusher Spare Component *</label>
                    <select
                      className="owner-select"
                      value={sparePartId}
                      onChange={(e) => setSparePartId(e.target.value)}
                    >
                      {store.spareParts.map((sp) => (
                        <option key={sp.id} value={sp.id}>
                          {sp.name} (Part: {sp.partNumber} • Stock: {sp.currentStock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="owner-form-group">
                    <label className="owner-form-label">Quantity Replaced *</label>
                    <input
                      type="number"
                      min="1"
                      className="owner-input"
                      value={spareQty}
                      onChange={(e) => setSpareQty(e.target.value)}
                    />
                  </div>

                  <div className="owner-form-group">
                    <label className="owner-form-label">Maintenance Reason / Notes</label>
                    <input
                      type="text"
                      className="owner-input"
                      value={spareReason}
                      onChange={(e) => setSpareReason(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="owner-btn-secondary" style={{ marginTop: '6px' }}>
                    <Wrench size={14} /> Log Maintenance Consumption
                  </button>
                </form>
              </div>

              {/* Spare Parts Stock Table */}
              <div className="owner-card" style={{ padding: '20px' }}>
                <h3 className="owner-card-title" style={{ marginBottom: '4px' }}>
                  Critical Spares Inventory & Storage Bins
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '14px' }}>
                  Monitored to prevent unplanned crusher downtime.
                </p>

                <table className="owner-table">
                  <thead>
                    <tr>
                      <th>Part Name</th>
                      <th>Equipment / Machine</th>
                      <th>Part #</th>
                      <th>Storage Bin</th>
                      <th>Stock Qty</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.spareParts.map((sp) => {
                      const isLow = sp.currentStock <= sp.minThreshold;
                      return (
                        <tr key={sp.id}>
                          <td><strong>{sp.name}</strong></td>
                          <td style={{ color: '#64748B' }}>{sp.category}</td>
                          <td><code style={{ fontSize: '0.72rem', backgroundColor: '#F1F5F9', padding: '2px 4px', borderRadius: '4px' }}>{sp.partNumber}</code></td>
                          <td>{sp.storageBin}</td>
                          <td><strong style={{ fontSize: '0.9rem' }}>{sp.currentStock}</strong></td>
                          <td>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                backgroundColor: isLow ? '#FEE2E2' : '#DCFCE7',
                                color: isLow ? '#DC2626' : '#15803D',
                              }}
                            >
                              {isLow ? 'CRITICAL LOW' : 'ADEQUATE'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
