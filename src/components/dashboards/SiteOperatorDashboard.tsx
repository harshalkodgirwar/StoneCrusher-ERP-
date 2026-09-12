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
  Check,
  RefreshCw,
  PlusCircle,
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

  type SiteTab = 'SCALE' | 'INVENTORY' | 'RAW_MATERIAL' | 'SPARES';
  const [activeTab, setActiveTab] = useState<SiteTab>('SCALE');

  const queuedTrips = store.trips.filter((t) => t.status !== 'DISPATCHED' && t.status !== 'CANCELLED');
  const nextTrip: Trip | undefined = queuedTrips[0];
  const [activeTripId, setActiveTripId] = useState<string>(nextTrip?.id || '');

  useEffect(() => {
    if (!activeTripId && nextTrip?.id) {
      setActiveTripId(nextTrip.id);
    }
  }, [nextTrip, activeTripId]);

  const selectedTrip = store.trips.find((t) => t.id === activeTripId) || nextTrip;

  // Scale simulation
  const [digitalScaleWeight, setDigitalScaleWeight] = useState<number>(0);
  const [isScaleFluctuating, setIsScaleFluctuating] = useState<boolean>(true);
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
  const [spareReason, setSpareReason] = useState('Routine crusher maintenance');

  useEffect(() => {
    if (!isScaleFluctuating) return;

    const interval = setInterval(() => {
      let base = 0;
      if (selectedTrip) {
        if (selectedTrip.status === 'CALLED_TO_SCALE' || selectedTrip.status === 'QUEUED') {
          const veh = store.vehicles.find((v) => v.id === selectedTrip.vehicleId);
          base = veh?.defaultTareWeightMt || 10.4;
        } else if (selectedTrip.status === 'LOADING' || selectedTrip.status === 'TARE_WEIGHED') {
          const tare = selectedTrip.tareWeightMt || 10.4;
          base = tare + selectedTrip.orderedQtyMt;
        }
      }

      if (base > 0) {
        const jitter = (Math.random() - 0.5) * 0.08;
        setDigitalScaleWeight(Number((base + jitter).toFixed(2)));
      } else {
        setDigitalScaleWeight(0.0);
      }
    }, 500);

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
    alert('Recorded spare part consumption.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Bar with Pipeline Steps */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid #1F2937',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Site Operations & Weighbridge</h2>
          <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '2px' }}>
            Pipeline: Next Trip → Queue → Weighbridge → Inventory Deduction → Gate Pass → Operations
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setActiveTab('SCALE')}
            className={activeTab === 'SCALE' ? 'btn-primary' : 'btn-secondary'}
          >
            <Scale size={14} /> Weighbridge ({queuedTrips.length})
          </button>
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={activeTab === 'INVENTORY' ? 'btn-primary' : 'btn-secondary'}
          >
            <Layers size={14} /> Inventory
          </button>
          <button
            onClick={() => setActiveTab('RAW_MATERIAL')}
            className={activeTab === 'RAW_MATERIAL' ? 'btn-primary' : 'btn-secondary'}
          >
            <Package size={14} /> Raw Inward
          </button>
          <button
            onClick={() => setActiveTab('SPARES')}
            className={activeTab === 'SPARES' ? 'btn-primary' : 'btn-secondary'}
          >
            <Wrench size={14} /> Spares
          </button>
        </div>
      </div>

      {/* SCALE & DISPATCH PIPELINE */}
      {activeTab === 'SCALE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Active / Next Trip Action Card */}
          {selectedTrip ? (
            <div
              className="crusher-card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px',
                borderLeft: '3px solid #2563EB',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase' }}>
                    Next Trip
                  </span>
                  <strong style={{ fontSize: '1.1rem', color: '#F9FAFB' }}>{selectedTrip.tripNumber}</strong>
                  <span className="badge badge-amber">{selectedTrip.status}</span>
                </div>

                {(() => {
                  const cust = store.customers.find((c) => c.id === selectedTrip.customerId);
                  const prod = store.products.find((p) => p.id === selectedTrip.productId);
                  const veh = store.vehicles.find((v) => v.id === selectedTrip.vehicleId);

                  return (
                    <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '4px' }}>
                      <strong style={{ color: '#E5E7EB' }}>{cust?.companyName}</strong> • {prod?.name} ({selectedTrip.orderedQtyMt} MT)
                      {' • '}Vehicle: <strong style={{ color: '#E5E7EB' }}>{veh?.plateNumber}</strong>
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedTrip.status === 'QUEUED' && (
                  <button
                    onClick={() => crusherStore.advanceTripToScale(selectedTrip.id)}
                    className="btn-primary"
                  >
                    Call to Scale →
                  </button>
                )}

                {selectedTrip.status === 'CALLED_TO_SCALE' && (
                  <button
                    onClick={() => handleCaptureTare(selectedTrip.id)}
                    className="btn-primary"
                  >
                    Record Tare ({getEffectiveWeight()} MT)
                  </button>
                )}

                {selectedTrip.status === 'TARE_WEIGHED' && (
                  <button
                    onClick={() => crusherStore.startLoading(selectedTrip.id)}
                    className="btn-success"
                  >
                    Send to Loading Hopper →
                  </button>
                )}

                {selectedTrip.status === 'LOADING' && (
                  <button
                    onClick={() => handleCaptureGrossAndDeductInventory(selectedTrip.id)}
                    className="btn-primary"
                  >
                    Record Gross & Deduct Inventory
                  </button>
                )}

                {selectedTrip.status === 'GROSS_WEIGHED' && (
                  <button
                    onClick={() => handleGenerateGatePass(selectedTrip.id)}
                    className="btn-success"
                  >
                    <FileCheck size={14} /> Issue Gate Pass (WhatsApp)
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="crusher-card" style={{ padding: '24px', textAlign: 'center', color: '#6B7280', fontSize: '0.85rem' }}>
              No trips currently waiting in the site queue.
            </div>
          )}

          {/* Grid: Weighbridge Terminal + Queue */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '16px',
              alignItems: 'start',
            }}
          >
            {/* Terminal */}
            <div className="crusher-card" style={{ padding: '18px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Weighbridge Scale Deck</div>
                <div style={{ fontSize: '0.72rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="status-dot online" /> Connected
                </div>
              </div>

              {/* Digital Display */}
              <div className="digital-scale-display">
                <div className="scale-readout">{getEffectiveWeight().toFixed(2)}</div>
                <div className="scale-unit">Metric Tons</div>
              </div>

              {/* Controls */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '12px',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', gap: '6px' }}>
                  {isScaleFluctuating ? (
                    <button
                      onClick={() => setIsScaleFluctuating(false)}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      Hold
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsScaleFluctuating(true)}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      <RefreshCw size={11} /> Live
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setDigitalScaleWeight(0);
                      setManualWeightInput('');
                    }}
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    Zero
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label style={{ color: '#9CA3AF', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={useManualWeight}
                      onChange={(e) => setUseManualWeight(e.target.checked)}
                      style={{ marginRight: '4px' }}
                    />
                    Manual
                  </label>
                  {useManualWeight && (
                    <input
                      type="number"
                      placeholder="MT"
                      value={manualWeightInput}
                      onChange={(e) => setManualWeightInput(e.target.value)}
                      className="input-field"
                      style={{ width: '70px', padding: '3px 6px', fontSize: '0.75rem' }}
                    />
                  )}
                </div>
              </div>

              {/* Trip Slip Metrics */}
              {selectedTrip && (
                <div
                  style={{
                    backgroundColor: '#0D1424',
                    border: '1px solid #1F2937',
                    borderRadius: '6px',
                    padding: '12px',
                    marginTop: '14px',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '8px',
                      textAlign: 'center',
                      fontSize: '0.75rem',
                    }}
                  >
                    <div style={{ background: '#161F30', padding: '6px', borderRadius: '4px' }}>
                      <div style={{ color: '#9CA3AF' }}>Tare</div>
                      <div style={{ fontWeight: 700, marginTop: '2px' }}>
                        {selectedTrip.tareWeightMt ? `${selectedTrip.tareWeightMt} MT` : '--'}
                      </div>
                    </div>
                    <div style={{ background: '#161F30', padding: '6px', borderRadius: '4px' }}>
                      <div style={{ color: '#9CA3AF' }}>Gross</div>
                      <div style={{ fontWeight: 700, marginTop: '2px' }}>
                        {selectedTrip.grossWeightMt ? `${selectedTrip.grossWeightMt} MT` : '--'}
                      </div>
                    </div>
                    <div style={{ background: '#161F30', padding: '6px', borderRadius: '4px' }}>
                      <div style={{ color: '#34D399' }}>Net Dispatched</div>
                      <div style={{ fontWeight: 700, color: '#34D399', marginTop: '2px' }}>
                        {selectedTrip.netWeightMt ? `${selectedTrip.netWeightMt} MT` : '--'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Queue */}
            <div className="crusher-card" style={{ padding: '18px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Site FIFO Queue</div>
                <span className="badge badge-amber">{queuedTrips.length} Total</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
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
                        backgroundColor: isSelected ? '#1E293B' : '#0D1424',
                        border: isSelected ? '1px solid #2563EB' : '1px solid #1F2937',
                        borderRadius: '6px',
                        padding: '10px 12px',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: '#F3F4F6' }}>#{idx + 1} {trip.tripNumber}</strong>
                          <span style={{ color: '#9CA3AF' }}> • {cust?.companyName}</span>
                        </div>
                        <span className="badge badge-slate">{trip.status}</span>
                      </div>
                      <div style={{ color: '#9CA3AF', marginTop: '3px', fontSize: '0.72rem' }}>
                        {prod?.name} ({trip.orderedQtyMt} MT) • Truck: {veh?.plateNumber}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVENTORY TAB */}
      {activeTab === 'INVENTORY' && (
        <div className="crusher-card" style={{ padding: '18px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>
            Finished Aggregate Inventory (Auto-deducted upon gross weighment)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#9CA3AF', borderBottom: '1px solid #1F2937' }}>
                <th style={{ padding: '8px' }}>Product</th>
                <th style={{ padding: '8px' }}>Unit</th>
                <th style={{ padding: '8px' }}>Stock Available</th>
                <th style={{ padding: '8px' }}>Min Threshold</th>
                <th style={{ padding: '8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {store.products.map((p) => {
                const isLow = p.currentStockMt <= p.minThresholdMt;
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #1F2937' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 500 }}>{p.name}</td>
                    <td style={{ padding: '10px 8px', color: '#9CA3AF' }}>{p.unit}</td>
                    <td style={{ padding: '10px 8px', fontWeight: 600 }}>{p.currentStockMt.toFixed(1)} MT</td>
                    <td style={{ padding: '10px 8px', color: '#9CA3AF' }}>{p.minThresholdMt} MT</td>
                    <td style={{ padding: '10px 8px' }}>
                      {isLow ? (
                        <span className="badge badge-crimson">Low Stock</span>
                      ) : (
                        <span className="badge badge-emerald">OK</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* RAW MATERIAL INWARD TAB */}
      {activeTab === 'RAW_MATERIAL' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px' }}>
          <div className="crusher-card" style={{ padding: '18px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>
              Log Raw Boulder Inward
            </h3>
            <form onSubmit={handleRawSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Supplier *</label>
                <select
                  className="input-field"
                  value={rawSupplierId}
                  onChange={(e) => setRawSupplierId(e.target.value)}
                >
                  {store.suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Material *</label>
                <select
                  className="input-field"
                  value={rawMaterialId}
                  onChange={(e) => setRawMaterialId(e.target.value)}
                >
                  {store.rawMaterials.map((rm) => (
                    <option key={rm.id} value={rm.id}>{rm.name} ({rm.currentStockBrass} Brass)</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Truck Plate</label>
                  <input
                    type="text"
                    className="input-field"
                    value={rawTruckNo}
                    onChange={(e) => setRawTruckNo(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Quantity (Brass)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="input-field"
                    value={rawQtyBrass}
                    onChange={(e) => setRawQtyBrass(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Rate (₹/Brass)</label>
                <input
                  type="number"
                  className="input-field"
                  value={rawRate}
                  onChange={(e) => setRawRate(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '4px' }}>
                Record Inward & Send WhatsApp Receipt
              </button>
            </form>
          </div>

          {/* Inward Vouchers */}
          <div className="crusher-card" style={{ padding: '18px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>
              Recent Inward Receipts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {store.rawMaterialReceipts.map((rcpt) => (
                <div
                  key={rcpt.id}
                  style={{
                    backgroundColor: '#0D1424',
                    border: '1px solid #1F2937',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.78rem',
                  }}
                >
                  <div>
                    <strong>{rcpt.receiptNumber}</strong> • {rcpt.supplierName}
                    <div style={{ color: '#9CA3AF', fontSize: '0.72rem' }}>
                      {rcpt.rawMaterialName} ({rcpt.quantityBrass} Brass) • Truck: {rcpt.vehicleNumber}
                    </div>
                  </div>
                  <button
                    onClick={() => onViewReceipt(rcpt.id)}
                    className="btn-secondary"
                    style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                  >
                    View PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SPARES TAB */}
      {activeTab === 'SPARES' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px' }}>
          <div className="crusher-card" style={{ padding: '18px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>
              Log Spare Part Consumption
            </h3>
            <form onSubmit={handleSpareSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Spare Part</label>
                <select
                  className="input-field"
                  value={sparePartId}
                  onChange={(e) => setSparePartId(e.target.value)}
                >
                  {store.spareParts.map((sp) => (
                    <option key={sp.id} value={sp.id}>{sp.name} (Qty: {sp.currentStock})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Quantity Replaced</label>
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  value={spareQty}
                  onChange={(e) => setSpareQty(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Reason / Notes</label>
                <input
                  type="text"
                  className="input-field"
                  value={spareReason}
                  onChange={(e) => setSpareReason(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-secondary" style={{ marginTop: '4px' }}>
                Log Replacement
              </button>
            </form>
          </div>

          <div className="crusher-card" style={{ padding: '18px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>
              Spare Parts Inventory
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {store.spareParts.map((sp) => (
                <div
                  key={sp.id}
                  style={{
                    backgroundColor: '#0D1424',
                    border: '1px solid #1F2937',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.78rem',
                  }}
                >
                  <div>
                    <strong>{sp.name}</strong>
                    <div style={{ color: '#9CA3AF', fontSize: '0.72rem' }}>
                      Part: {sp.partNumber} • Bin: {sp.storageBin}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600 }}>{sp.currentStock} in stock</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
