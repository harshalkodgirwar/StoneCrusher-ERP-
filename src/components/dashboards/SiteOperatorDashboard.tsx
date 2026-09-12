'use client';

import React, { useState, useEffect } from 'react';
import { useCrusherStore } from '../../lib/store/useCrusherStore';
import { crusherStore, Trip } from '../../lib/store/crusher-store';
import {
  Scale,
  Truck,
  Layers,
  FileCheck,
  Package,
  Wrench,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  Sparkles,
  Send,
  PlusCircle,
  AlertTriangle,
} from 'lucide-react';

interface SiteOperatorDashboardProps {
  onOpenWhatsAppSimulator: () => void;
  onViewGatePass: (gatePassId: string) => void;
  onViewReceipt: (receiptId: string) => void;
}

export const SiteOperatorDashboard: React.FC<SiteOperatorDashboardProps> = ({
  onOpenWhatsAppSimulator,
  onViewGatePass,
  onViewReceipt,
}) => {
  const store = useCrusherStore();

  // Active section tabs following the physical operational pipeline:
  // NEXT TRIP -> DISPATCH QUEUE -> WEIGHBRIDGE -> INVENTORY -> GATE PASS -> SITE OPERATIONS
  type SiteTab = 'PIPELINE' | 'WEIGHBRIDGE' | 'INVENTORY' | 'RAW_MATERIAL' | 'SPARE_PARTS';
  const [activeTab, setActiveTab] = useState<SiteTab>('PIPELINE');

  // Currently focused trip for scale operations
  const queuedTrips = store.trips.filter((t) => t.status !== 'DISPATCHED' && t.status !== 'CANCELLED');
  const nextTrip: Trip | undefined = queuedTrips[0];

  const [activeTripId, setActiveTripId] = useState<string>(nextTrip?.id || '');

  // Keep activeTripId updated if nextTrip changes and nothing is selected
  useEffect(() => {
    if (!activeTripId && nextTrip?.id) {
      setActiveTripId(nextTrip.id);
    }
  }, [nextTrip, activeTripId]);

  const selectedTrip = store.trips.find((t) => t.id === activeTripId) || nextTrip;

  // Digital Weighbridge Simulation State
  const [digitalScaleWeight, setDigitalScaleWeight] = useState<number>(0);
  const [isScaleFluctuating, setIsScaleFluctuating] = useState<boolean>(true);
  const [manualWeightInput, setManualWeightInput] = useState<string>('');
  const [useManualWeight, setUseManualWeight] = useState<boolean>(false);

  // Raw Material Inward Form State
  const [rawSupplierId, setRawSupplierId] = useState(store.suppliers[0]?.id || '');
  const [rawMaterialId, setRawMaterialId] = useState(store.rawMaterials[0]?.id || '');
  const [rawTruckNo, setRawTruckNo] = useState('MH12XY4455');
  const [rawQtyBrass, setRawQtyBrass] = useState('15');
  const [rawRate, setRawRate] = useState('3200');
  const [inwardSuccess, setInwardSuccess] = useState<string | null>(null);

  // Spare Parts Usage State
  const [sparePartId, setSparePartId] = useState(store.spareParts[0]?.id || '');
  const [spareQty, setSpareQty] = useState('1');
  const [spareReason, setSpareReason] = useState('Routine 250-hour crusher jaw inspection & replacement');

  // Weight simulation fluctuation effect
  useEffect(() => {
    if (!isScaleFluctuating) return;

    const interval = setInterval(() => {
      // Simulate weight based on whether the truck is empty (tare ~10-12 MT) or loaded (~28-32 MT)
      let base = 0;
      if (selectedTrip) {
        if (selectedTrip.status === 'CALLED_TO_SCALE' || selectedTrip.status === 'QUEUED') {
          // Empty truck entering
          const veh = store.vehicles.find((v) => v.id === selectedTrip.vehicleId);
          base = veh?.defaultTareWeightMt || 10.4;
        } else if (selectedTrip.status === 'LOADING' || selectedTrip.status === 'TARE_WEIGHED') {
          // Loaded truck ready for gross scale
          const tare = selectedTrip.tareWeightMt || 10.4;
          base = tare + selectedTrip.orderedQtyMt;
        }
      }

      if (base > 0) {
        // Subtle digital vibration +/- 0.04 MT
        const jitter = (Math.random() - 0.5) * 0.08;
        setDigitalScaleWeight(Number((base + jitter).toFixed(2)));
      } else {
        setDigitalScaleWeight(0.0);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [isScaleFluctuating, selectedTrip, store.vehicles]);

  // Actions
  const handleLockWeight = () => {
    setIsScaleFluctuating(false);
  };

  const handleUnlockWeight = () => {
    setIsScaleFluctuating(true);
  };

  const getEffectiveWeight = (): number => {
    if (useManualWeight && manualWeightInput) {
      return parseFloat(manualWeightInput) || 0;
    }
    return digitalScaleWeight;
  };

  const handleCaptureTare = (tripId: string) => {
    const weight = getEffectiveWeight();
    if (weight <= 0) {
      alert('Scale reading is zero. Please ensure truck is stationary on platform.');
      return;
    }
    crusherStore.recordTareWeight(tripId, weight);
    setIsScaleFluctuating(true);
  };

  const handleStartLoading = (tripId: string) => {
    crusherStore.startLoading(tripId);
  };

  const handleCaptureGrossAndDeductInventory = (tripId: string) => {
    const trip = store.trips.find((t) => t.id === tripId);
    if (!trip || !trip.tareWeightMt) {
      alert('Tare weight must be captured first.');
      return;
    }

    const grossWeight = getEffectiveWeight();
    if (grossWeight <= trip.tareWeightMt) {
      alert(`Gross weight (${grossWeight} MT) must be greater than Tare weight (${trip.tareWeightMt} MT).`);
      return;
    }

    // Records gross weight, calculates net weight, and AUTOMATICALLY deducts product inventory!
    crusherStore.recordGrossWeight(tripId, grossWeight);
    setIsScaleFluctuating(true);
  };

  const handleGenerateGatePass = (tripId: string) => {
    const gp = crusherStore.generateGatePass(tripId);
    onViewGatePass(gp.id);
  };

  const handleRawMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(rawQtyBrass);
    const rate = parseFloat(rawRate);
    if (!rawSupplierId || !rawMaterialId || isNaN(qty) || qty <= 0) {
      alert('Please fill valid raw material inward entries');
      return;
    }

    const receipt = crusherStore.addRawMaterialInward({
      supplierId: rawSupplierId,
      rawMaterialId,
      vehicleNumber: rawTruckNo,
      quantityBrass: qty,
      ratePerBrass: rate,
    });

    setInwardSuccess(receipt.receiptNumber);
    setTimeout(() => setInwardSuccess(null), 6000);
  };

  const handleConsumeSparePart = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(spareQty, 10);
    if (isNaN(qty) || qty <= 0) return;
    crusherStore.consumeSparePart(sparePartId, qty, spareReason);
    alert('Spare part maintenance log recorded successfully');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Sequence Header Navigation */}
      <div
        className="crusher-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderLeft: '4px solid #10B981',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Site Operator Command Terminal</h2>
            <span className="badge badge-emerald">Weighbridge & Quarry Floor</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: '#94A3B8',
              marginTop: '4px',
              fontFamily: 'monospace',
            }}
          >
            <span style={{ color: '#F59E0B' }}>NEXT TRIP</span> →
            <span style={{ color: '#60A5FA' }}>DISPATCH QUEUE</span> →
            <span style={{ color: '#34D399' }}>WEIGHBRIDGE</span> →
            <span style={{ color: '#F472B6' }}>INVENTORY DEDUCTION</span> →
            <span style={{ color: '#A78BFA' }}>GATE PASS</span> →
            <span style={{ color: '#E2E8F0' }}>SITE OPERATIONS</span>
          </div>
        </div>

        {/* View Tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setActiveTab('PIPELINE')}
            className={activeTab === 'PIPELINE' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            <Truck size={14} /> Dispatch Pipeline ({queuedTrips.length})
          </button>
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={activeTab === 'INVENTORY' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            <Layers size={14} /> Aggregate Stock
          </button>
          <button
            onClick={() => setActiveTab('RAW_MATERIAL')}
            className={activeTab === 'RAW_MATERIAL' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            <Package size={14} /> Raw Inward (Boulder)
          </button>
          <button
            onClick={() => setActiveTab('SPARE_PARTS')}
            className={activeTab === 'SPARE_PARTS' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            <Wrench size={14} /> Crusher Spares
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OPERATIONAL PIPELINE (NEXT TRIP -> QUEUE -> WEIGHBRIDGE -> PASS) */}
      {/* ========================================================================= */}
      {activeTab === 'PIPELINE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 1. NEXT TRIP PRIORITY CALLOUT */}
          {selectedTrip ? (
            <div
              className="crusher-card animate-slide-up"
              style={{
                backgroundColor: '#111C33',
                border: '2px solid #29406B',
                padding: '20px 24px',
                borderRadius: '16px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        backgroundColor: '#F59E0B',
                        color: '#000',
                        fontWeight: 900,
                        fontSize: '0.75rem',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        letterSpacing: '1px',
                      }}
                    >
                      NEXT TRIP IN QUEUE
                    </span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>
                      {selectedTrip.tripNumber}
                    </span>
                    <span className="badge badge-amber">{selectedTrip.status}</span>
                  </div>

                  {(() => {
                    const cust = store.customers.find((c) => c.id === selectedTrip.customerId);
                    const prod = store.products.find((p) => p.id === selectedTrip.productId);
                    const veh = store.vehicles.find((v) => v.id === selectedTrip.vehicleId);
                    const drv = store.drivers.find((d) => d.id === selectedTrip.driverId);

                    return (
                      <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#CBD5E1' }}>
                        <div>
                          <strong style={{ color: '#FBBF24', fontSize: '1rem' }}>{cust?.companyName}</strong>
                          {' • '}
                          <span style={{ color: '#38BDF8', fontWeight: 700 }}>
                            {prod?.name} ({selectedTrip.orderedQtyMt} MT)
                          </span>
                        </div>
                        <div style={{ color: '#94A3B8', marginTop: '2px', fontSize: '0.78rem' }}>
                          Truck: <strong style={{ color: '#34D399' }}>{veh?.plateNumber}</strong> ({veh?.vehicleType})
                          {' • '}Driver: {drv?.name} ({drv?.phone})
                          {' • '}Destination: {selectedTrip.destination}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Quick Action Progression Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {selectedTrip.status === 'QUEUED' && (
                    <button
                      onClick={() => crusherStore.advanceTripToScale(selectedTrip.id)}
                      className="btn-primary"
                    >
                      Call Vehicle to Weighbridge →
                    </button>
                  )}

                  {selectedTrip.status === 'CALLED_TO_SCALE' && (
                    <button
                      onClick={() => handleCaptureTare(selectedTrip.id)}
                      className="btn-primary"
                    >
                      <Scale size={16} /> Capture Empty Tare Weight ({getEffectiveWeight()} MT)
                    </button>
                  )}

                  {selectedTrip.status === 'TARE_WEIGHED' && (
                    <button
                      onClick={() => handleStartLoading(selectedTrip.id)}
                      className="btn-success"
                    >
                      Advance to Crusher Hopper Loading →
                    </button>
                  )}

                  {selectedTrip.status === 'LOADING' && (
                    <button
                      onClick={() => handleCaptureGrossAndDeductInventory(selectedTrip.id)}
                      className="btn-primary"
                    >
                      <Scale size={16} /> Capture Loaded Gross & Verify Net
                    </button>
                  )}

                  {selectedTrip.status === 'GROSS_WEIGHED' && (
                    <button
                      onClick={() => handleGenerateGatePass(selectedTrip.id)}
                      className="btn-success"
                      style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                    >
                      <FileCheck size={16} /> Issue Gate Pass & Dispatch via WhatsApp
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="crusher-card"
              style={{
                padding: '32px',
                textAlign: 'center',
                color: '#64748B',
                fontSize: '0.9rem',
              }}
            >
              No trips in site queue. Waiting for Office Operator to create customer orders.
            </div>
          )}

          {/* 2. WEIGHBRIDGE STATION & LIVE FIFO QUEUE GRID */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* WEIGHBRIDGE TERMINAL */}
            <div className="crusher-card" style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #1E293B',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Scale size={20} color="#10B981" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Weighbridge Digital Terminal</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="pulse-dot online" />
                  <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>
                    LOAD CELLS CALIBRATED
                  </span>
                </div>
              </div>

              {/* Digital Scale Readout Display */}
              <div className="digital-scale-display" style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '12px',
                    fontSize: '0.65rem',
                    color: '#4ADE80',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
                  LIVE METTLER TOLEDO 60T DECK
                </div>

                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '12px',
                    fontSize: '0.65rem',
                    color: isScaleFluctuating ? '#FACC15' : '#4ADE80',
                    fontWeight: 700,
                  }}
                >
                  {isScaleFluctuating ? '• LIVE MEASURING' : '• READING LOCKED'}
                </div>

                <div className="scale-readout">{getEffectiveWeight().toFixed(2)}</div>
                <div className="scale-unit">Metric Tons (MT)</div>
              </div>

              {/* Scale Controls: Lock / Zero / Manual */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', gap: '6px' }}>
                  {isScaleFluctuating ? (
                    <button
                      onClick={handleLockWeight}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: '#F59E0B', color: '#FBBF24' }}
                    >
                      Lock Reading
                    </button>
                  ) : (
                    <button
                      onClick={handleUnlockWeight}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: '#10B981', color: '#34D399' }}
                    >
                      <RefreshCw size={12} /> Unlock Live Sensor
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setDigitalScaleWeight(0.0);
                      setManualWeightInput('');
                    }}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    Zero Scale
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', color: '#94A3B8', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={useManualWeight}
                      onChange={(e) => setUseManualWeight(e.target.checked)}
                      style={{ marginRight: '6px' }}
                    />
                    Manual Override
                  </label>

                  {useManualWeight && (
                    <input
                      type="number"
                      step="0.01"
                      placeholder="MT"
                      value={manualWeightInput}
                      onChange={(e) => setManualWeightInput(e.target.value)}
                      className="input-field"
                      style={{ width: '80px', padding: '4px 8px', fontSize: '0.78rem' }}
                    />
                  )}
                </div>
              </div>

              {/* Active Weighment Slip Summary for Selected Trip */}
              {selectedTrip && (
                <div
                  style={{
                    backgroundColor: '#0F1626',
                    borderRadius: '10px',
                    border: '1px solid #1F2E4A',
                    padding: '16px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#94A3B8',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>WEIGHMENT SLIP STATUS: {selectedTrip.tripNumber}</span>
                    <span className="badge badge-slate">{selectedTrip.status}</span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '10px',
                      textAlign: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    <div style={{ background: '#141E33', padding: '8px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>TARE WT (EMPTY)</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#F87171', marginTop: '2px' }}>
                        {selectedTrip.tareWeightMt ? `${selectedTrip.tareWeightMt} MT` : '--'}
                      </div>
                    </div>

                    <div style={{ background: '#141E33', padding: '8px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>GROSS WT (LOADED)</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#60A5FA', marginTop: '2px' }}>
                        {selectedTrip.grossWeightMt ? `${selectedTrip.grossWeightMt} MT` : '--'}
                      </div>
                    </div>

                    <div
                      style={{
                        background: selectedTrip.netWeightMt ? '#064E3B' : '#141E33',
                        padding: '8px',
                        borderRadius: '6px',
                        border: selectedTrip.netWeightMt ? '1px solid #10B981' : 'none',
                      }}
                    >
                      <div style={{ fontSize: '0.68rem', color: selectedTrip.netWeightMt ? '#A7F3D0' : '#94A3B8' }}>
                        NET DISPATCH
                      </div>
                      <div
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          color: selectedTrip.netWeightMt ? '#34D399' : '#CBD5E1',
                          marginTop: '2px',
                        }}
                      >
                        {selectedTrip.netWeightMt ? `${selectedTrip.netWeightMt} MT` : '--'}
                      </div>
                    </div>
                  </div>

                  {/* Operational Action Buttons per stage */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedTrip.status === 'CALLED_TO_SCALE' && (
                      <button
                        onClick={() => handleCaptureTare(selectedTrip.id)}
                        className="btn-primary"
                        style={{ width: '100%', padding: '10px' }}
                      >
                        Capture Tare Weight: {getEffectiveWeight().toFixed(2)} MT
                      </button>
                    )}

                    {selectedTrip.status === 'TARE_WEIGHED' && (
                      <button
                        onClick={() => handleStartLoading(selectedTrip.id)}
                        className="btn-success"
                        style={{ width: '100%', padding: '10px' }}
                      >
                        Truck Entering Plant → Start Aggregate Loading
                      </button>
                    )}

                    {selectedTrip.status === 'LOADING' && (
                      <button
                        onClick={() => handleCaptureGrossAndDeductInventory(selectedTrip.id)}
                        className="btn-primary"
                        style={{ width: '100%', padding: '10px' }}
                      >
                        Capture Gross Weight & Deduct Inventory Automatically ({getEffectiveWeight().toFixed(2)} MT)
                      </button>
                    )}

                    {selectedTrip.status === 'GROSS_WEIGHED' && (
                      <button
                        onClick={() => handleGenerateGatePass(selectedTrip.id)}
                        className="btn-success"
                        style={{ width: '100%', padding: '10px' }}
                      >
                        <ShieldCheck size={16} /> Generate Gate Pass & Dispatch via WhatsApp
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* FIFO DISPATCH QUEUE LIST */}
            <div className="crusher-card" style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #1E293B',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={18} color="#F59E0B" /> FIFO Dispatch Queue
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                    Sequential site processing list
                  </p>
                </div>
                <span className="badge badge-amber">{queuedTrips.length} Active</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', overflowY: 'auto' }}>
                {queuedTrips.map((trip, idx) => {
                  const isSelected = trip.id === activeTripId;
                  const cust = store.customers.find((c) => c.id === trip.customerId);
                  const prod = store.products.find((p) => p.id === trip.productId);
                  const veh = store.vehicles.find((v) => v.id === trip.vehicleId);

                  return (
                    <div
                      key={trip.id}
                      onClick={() => setActiveTripId(trip.id)}
                      style={{
                        backgroundColor: isSelected ? '#1A294A' : '#0F1626',
                        border: isSelected ? '2px solid #F59E0B' : '1px solid #1E2A44',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              backgroundColor: isSelected ? '#F59E0B' : '#334155',
                              color: isSelected ? '#000' : '#FFF',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              width: '24px',
                              height: '24px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            #{idx + 1}
                          </span>
                          <span style={{ fontWeight: 700, color: '#FFF' }}>{trip.tripNumber}</span>
                        </div>
                        <span className="badge badge-slate" style={{ fontSize: '0.62rem' }}>
                          {trip.status}
                        </span>
                      </div>

                      <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#CBD5E1' }}>
                        <strong style={{ color: '#F59E0B' }}>{cust?.companyName}</strong>
                        <span style={{ color: '#94A3B8' }}> • {prod?.name} ({trip.orderedQtyMt} MT)</span>
                      </div>

                      <div
                        style={{
                          marginTop: '4px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.7rem',
                          color: '#64748B',
                        }}
                      >
                        <span>Truck: {veh?.plateNumber}</span>
                        <span>
                          {trip.netWeightMt ? (
                            <strong style={{ color: '#10B981' }}>Net: {trip.netWeightMt} MT</strong>
                          ) : (
                            <span>Ord: {trip.orderedQtyMt} MT</span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AGGREGATE INVENTORY (Live stock after automatic weighbridge deduction) */}
      {/* ========================================================================= */}
      {activeTab === 'INVENTORY' && (
        <div className="crusher-card" style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={20} color="#F59E0B" /> Finished Products Inventory Stock
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>
                Stock is deducted <strong style={{ color: '#10B981' }}>automatically</strong> upon verified gross weighbridge transaction.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {store.products.map((p) => {
              const isLowStock = p.currentStockMt <= p.minThresholdMt;
              const percentRemaining = Math.min(100, Math.round((p.currentStockMt / 600) * 100));

              return (
                <div
                  key={p.id}
                  style={{
                    backgroundColor: '#0F1626',
                    border: isLowStock ? '1px solid #EF4444' : '1px solid #1E2D4A',
                    borderRadius: '12px',
                    padding: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {isLowStock && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: '#EF4444',
                        color: '#FFF',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderBottomLeftRadius: '6px',
                      }}
                    >
                      LOW STOCK ALERT
                    </div>
                  )}

                  <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>{p.code}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF', marginTop: '2px' }}>
                    {p.name}
                  </div>

                  <div style={{ margin: '14px 0 8px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        color: isLowStock ? '#EF4444' : '#10B981',
                      }}
                    >
                      {p.currentStockMt.toFixed(1)}
                    </span>
                    <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>MT in Stock</span>
                  </div>

                  {/* Stock Bar */}
                  <div style={{ height: '6px', backgroundColor: '#1E293B', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${percentRemaining}%`,
                        backgroundColor: isLowStock ? '#EF4444' : '#10B981',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '8px',
                      fontSize: '0.72rem',
                      color: '#94A3B8',
                    }}
                  >
                    <span>Min Safety Threshold: {p.minThresholdMt} MT</span>
                    <span>Rate: ₹{p.unitPriceInr}/MT</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RAW MATERIAL INWARD (Supplier/Labour receipt & WhatsApp trigger) */}
      {/* ========================================================================= */}
      {activeTab === 'RAW_MATERIAL' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(340px, 1fr) 1.25fr',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* Form */}
          <div className="crusher-card" style={{ padding: '24px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #1E293B',
              }}
            >
              <Package size={20} color="#3B82F6" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Log Raw Material Inward (Boulder)</h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '16px' }}>
              Submitting generates an official Inward Receipt and automatically sends the PDF receipt to the{' '}
              <strong style={{ color: '#38BDF8' }}>Supplier via WhatsApp</strong>.
            </p>

            <form onSubmit={handleRawMaterialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '4px' }}>
                  Supplier / Labour Contractor *
                </label>
                <select
                  className="input-field"
                  value={rawSupplierId}
                  onChange={(e) => setRawSupplierId(e.target.value)}
                  required
                >
                  {store.suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '4px' }}>
                  Raw Material Type *
                </label>
                <select
                  className="input-field"
                  value={rawMaterialId}
                  onChange={(e) => setRawMaterialId(e.target.value)}
                  required
                >
                  {store.rawMaterials.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      {rm.name} (Reserve: {rm.currentStockBrass} Brass)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '4px' }}>
                    Truck / Dumper No *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={rawTruckNo}
                    onChange={(e) => setRawTruckNo(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '4px' }}>
                    Quantity (Brass) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    className="input-field"
                    value={rawQtyBrass}
                    onChange={(e) => setRawQtyBrass(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '4px' }}>
                  Contract Rate (₹ / Brass)
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={rawRate}
                  onChange={(e) => setRawRate(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '10px', marginTop: '6px' }}>
                <PlusCircle size={16} /> Record Inward & Send WhatsApp Receipt
              </button>
            </form>
          </div>

          {/* Receipts Archive */}
          <div className="crusher-card" style={{ padding: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #1E293B',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Inward Material Vouchers</h3>
              <span className="badge badge-blue">{store.rawMaterialReceipts.length} Logged</span>
            </div>

            {store.rawMaterialReceipts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#64748B', fontSize: '0.85rem' }}>
                No inward receipts recorded yet today. Submit the form on the left to receive boulder rocks.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {store.rawMaterialReceipts.map((rcpt) => (
                  <div
                    key={rcpt.id}
                    style={{
                      backgroundColor: '#0F1626',
                      border: '1px solid #1E2B48',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: '#38BDF8' }}>{rcpt.receiptNumber}</strong>
                        <span className="badge badge-slate" style={{ fontSize: '0.65rem' }}>
                          {rcpt.vehicleNumber}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginTop: '2px' }}>
                        {rcpt.supplierName} • {rcpt.rawMaterialName} (
                        <strong style={{ color: '#F59E0B' }}>{rcpt.quantityBrass} Brass</strong>)
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                        Total Value: ₹{rcpt.totalAmount.toLocaleString()} • Time:{' '}
                        {new Date(rcpt.inwardTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <button
                      onClick={() => onViewReceipt(rcpt.id)}
                      className="btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.72rem' }}
                    >
                      View Receipt PDF
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CRUSHER SPARE PARTS & MAINTENANCE */}
      {/* ========================================================================= */}
      {activeTab === 'SPARE_PARTS' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1fr) 1.25fr',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* Quick Consumption Form */}
          <div className="crusher-card" style={{ padding: '24px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #1E293B',
              }}
            >
              <Wrench size={20} color="#F59E0B" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Log Spare Part Consumption</h3>
            </div>

            <form onSubmit={handleConsumeSparePart} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '4px' }}>
                  Select Spare Part *
                </label>
                <select
                  className="input-field"
                  value={sparePartId}
                  onChange={(e) => setSparePartId(e.target.value)}
                  required
                >
                  {store.spareParts.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name} (Stock: {sp.currentStock} in {sp.storageBin})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '4px' }}>
                  Quantity Replaced / Consumed *
                </label>
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  value={spareQty}
                  onChange={(e) => setSpareQty(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '4px' }}>
                  Maintenance Reason / Equipment
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={spareReason}
                  onChange={(e) => setSpareReason(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-secondary" style={{ padding: '10px', marginTop: '6px' }}>
                <Wrench size={14} /> Record Spare Replacement
              </button>
            </form>
          </div>

          {/* Spare Parts Grid */}
          <div className="crusher-card" style={{ padding: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #1E293B',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Crusher Spare Parts Inventory</h3>
              <span className="badge badge-amber">{store.spareParts.length} Tracked</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {store.spareParts.map((sp) => {
                const isLow = sp.currentStock <= sp.minThreshold;

                return (
                  <div
                    key={sp.id}
                    style={{
                      backgroundColor: '#0F1626',
                      border: isLow ? '1px solid #EF4444' : '1px solid #1E2B48',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#FFF' }}>{sp.name}</span>
                        {isLow && <span className="badge badge-crimson">LOW SPARES</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                        Part No: {sp.partNumber} • Category: {sp.category} • Location: {sp.storageBin}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isLow ? '#EF4444' : '#10B981' }}>
                        {sp.currentStock} <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>units</span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                        Min Threshold: {sp.minThreshold}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
