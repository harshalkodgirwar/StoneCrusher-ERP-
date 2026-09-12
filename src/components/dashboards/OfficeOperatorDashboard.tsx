'use client';

import React, { useState } from 'react';
import { useCrusherStore } from '../../lib/store/useCrusherStore';
import { crusherStore } from '../../lib/store/crusher-store';
import {
  PlusCircle,
  Truck,
  CheckCircle2,
  Clock,
  Send,
  Users,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  Package,
} from 'lucide-react';

interface OfficeOperatorDashboardProps {
  onOpenWhatsAppSimulator: () => void;
  onViewGatePass?: (gatePassId: string) => void;
}

export const OfficeOperatorDashboard: React.FC<OfficeOperatorDashboardProps> = ({
  onOpenWhatsAppSimulator,
  onViewGatePass,
}) => {
  const store = useCrusherStore();

  // Form state for creating a trip / order
  const [customerId, setCustomerId] = useState(store.customers[0]?.id || '');
  const [productId, setProductId] = useState(store.products[0]?.id || '');
  const [orderedQtyMt, setOrderedQtyMt] = useState('20');
  const [vehicleId, setVehicleId] = useState(store.vehicles[0]?.id || '');
  const [driverId, setDriverId] = useState(store.drivers[0]?.id || '');
  const [destination, setDestination] = useState('Plot 42, MIDC Hinjawadi Phase 2, Pune');
  const [notes, setNotes] = useState('');
  const [orderCreatedSuccess, setOrderCreatedSuccess] = useState<string | null>(null);

  // Quick Customer Add Modal State
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustCompany, setNewCustCompany] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('+91');
  const [newCustAddress, setNewCustAddress] = useState('');

  // Handle vehicle change to auto-select its assigned driver
  const handleVehicleChange = (vId: string) => {
    setVehicleId(vId);
    const veh = store.vehicles.find((v) => v.id === vId);
    if (veh?.assignedDriverId) {
      setDriverId(veh.assignedDriverId);
    }
  };

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !productId || !orderedQtyMt || !vehicleId || !driverId) {
      alert('Please fill all required trip fields');
      return;
    }

    const qty = parseFloat(orderedQtyMt);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity in Metric Tons');
      return;
    }

    const newTrip = crusherStore.createTrip({
      customerId,
      productId,
      orderedQtyMt: qty,
      vehicleId,
      driverId,
      destination,
      notes,
    });

    setOrderCreatedSuccess(newTrip.tripNumber);
    setNotes('');

    // Reset success banner after 6s
    setTimeout(() => {
      setOrderCreatedSuccess(null);
    }, 6000);
  };

  const selectedProduct = store.products.find((p) => p.id === productId);
  const totalAmountEst = selectedProduct
    ? (parseFloat(orderedQtyMt) || 0) * selectedProduct.unitPriceInr
    : 0;

  const queuedTrips = store.trips.filter((t) => t.status === 'QUEUED');
  const activeDispatchedTrips = store.trips.filter((t) => t.status !== 'QUEUED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner & Context */}
      <div
        className="crusher-card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          borderLeft: '4px solid #F59E0B',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Office Operator Portal</h2>
            <span className="badge badge-amber">Customer Order Booking & Dispatch Routing</span>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '4px' }}>
            Creating an order automatically books the trip and pushes it directly to the{' '}
            <strong style={{ color: '#FBBF24' }}>Site Operator FIFO Dispatch Queue</strong>. WhatsApp
            confirmations are dispatched simultaneously.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowAddCustomer(true)}
            className="btn-secondary"
            style={{ fontSize: '0.8rem' }}
          >
            <Users size={15} /> Add New Customer
          </button>

          <button
            onClick={onOpenWhatsAppSimulator}
            className="btn-success"
            style={{ fontSize: '0.8rem' }}
          >
            <Send size={15} /> Inspect WhatsApp Delivery
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {orderCreatedSuccess && (
        <div
          className="animate-slide-up"
          style={{
            backgroundColor: '#064E3B',
            border: '1px solid #10B981',
            borderRadius: '10px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={24} color="#34D399" />
            <div>
              <div style={{ fontWeight: 700, color: '#FFF' }}>
                Trip {orderCreatedSuccess} Created & Enqueued into Site FIFO!
              </div>
              <div style={{ fontSize: '0.8rem', color: '#A7F3D0' }}>
                WhatsApp booking notification sent to Customer • Trip assignment sent to Driver.
              </div>
            </div>
          </div>
          <button
            onClick={onOpenWhatsAppSimulator}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#022C22', borderColor: '#10B981' }}
          >
            View Customer WhatsApp →
          </button>
        </div>
      )}

      {/* Main Grid: Left = Create Trip Form, Right = Live FIFO Queue Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(360px, 1fr) 1.25fr',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* CREATE TRIP FORM */}
        <div className="crusher-card" style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid #1E293B',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={20} color="#F59E0B" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Book Customer Trip</h3>
            </div>
            <span className="badge badge-slate">Trip Form</span>
          </div>

          <form onSubmit={handleCreateTrip} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Customer Select */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '6px' }}>
                Customer (Consignee) *
              </label>
              <select
                className="input-field"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                {store.customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName} ({c.name} - {c.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Product & Quantity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '6px' }}>
                  Finished Aggregate *
                </label>
                <select
                  className="input-field"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                >
                  {store.products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.currentStockMt} MT)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '6px' }}>
                  Order Qty (MT) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="50"
                  className="input-field"
                  value={orderedQtyMt}
                  onChange={(e) => setOrderedQtyMt(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Price Estimator Pill */}
            {selectedProduct && (
              <div
                style={{
                  backgroundColor: '#111A2E',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  border: '1px solid #1E2D4A',
                }}
              >
                <span style={{ color: '#94A3B8' }}>
                  Rate: ₹{selectedProduct.unitPriceInr} / MT
                </span>
                <span style={{ fontWeight: 700, color: '#10B981' }}>
                  Est. Value: ₹{totalAmountEst.toLocaleString()}
                </span>
              </div>
            )}

            {/* Vehicle & Driver */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '6px' }}>
                  Assign Vehicle *
                </label>
                <select
                  className="input-field"
                  value={vehicleId}
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  required
                >
                  {store.vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} ({v.vehicleType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '6px' }}>
                  Assign Driver *
                </label>
                <select
                  className="input-field"
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  required
                >
                  {store.drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Destination */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '6px' }}>
                Delivery Destination *
              </label>
              <input
                type="text"
                className="input-field"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>

            {/* Dispatch Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '6px' }}>
                Order / Delivery Remarks
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Concrete mix design 20mm batch pour, call on arrival"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '12px', marginTop: '8px' }}>
              <PlusCircle size={18} /> Confirm Order & Enqueue Trip
            </button>
          </form>
        </div>

        {/* RIGHT SIDE: DISPATCH QUEUE MONITOR & CUSTOMER HISTORY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* FIFO Queue at Site Monitor */}
          <div className="crusher-card" style={{ padding: '24px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} color="#F59E0B" /> Site FIFO Dispatch Queue
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                  Trips booked by Office Operator awaiting scale entry at crusher
                </p>
              </div>
              <span className="badge badge-amber">{queuedTrips.length} Queued</span>
            </div>

            {queuedTrips.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '32px 16px',
                  color: '#64748B',
                  fontSize: '0.85rem',
                }}
              >
                No pending trips in queue. Book a customer trip on the left to start.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {queuedTrips.map((trip, idx) => {
                  const cust = store.customers.find((c) => c.id === trip.customerId);
                  const prod = store.products.find((p) => p.id === trip.productId);
                  const veh = store.vehicles.find((v) => v.id === trip.vehicleId);
                  const drv = store.drivers.find((d) => d.id === trip.driverId);

                  return (
                    <div
                      key={trip.id}
                      style={{
                        backgroundColor: '#0F1626',
                        border: '1px solid #1E2A44',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: '#F59E0B',
                            color: '#000',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem',
                          }}
                        >
                          #{idx + 1}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 700, color: '#F8FAFC' }}>{trip.tripNumber}</span>
                            <span className="badge badge-slate" style={{ fontSize: '0.65rem' }}>
                              {trip.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>
                            <strong style={{ color: '#F59E0B' }}>{cust?.companyName}</strong> • {prod?.name} ({trip.orderedQtyMt} MT)
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            Truck: {veh?.plateNumber} • Driver: {drv?.name} • To: {trip.destination}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Enqueued</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                          {new Date(trip.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active / Dispatched Trips Tracker */}
          <div className="crusher-card" style={{ padding: '24px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} color="#10B981" /> Dispatched Trips & Slips
              </h3>
              <span className="badge badge-emerald">{activeDispatchedTrips.length} Dispatched</span>
            </div>

            {activeDispatchedTrips.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#64748B', fontSize: '0.85rem' }}>
                No completed dispatches yet today. Switch to the Site Operator view to weigh and dispatch queued trips.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeDispatchedTrips.map((trip) => {
                  const cust = store.customers.find((c) => c.id === trip.customerId);
                  const prod = store.products.find((p) => p.id === trip.productId);
                  const veh = store.vehicles.find((v) => v.id === trip.vehicleId);
                  const gatePass = store.gatePasses.find((g) => g.tripId === trip.id);

                  return (
                    <div
                      key={trip.id}
                      style={{
                        backgroundColor: '#0B1220',
                        border: '1px solid #1A2840',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: '#38BDF8' }}>{trip.tripNumber}</span>
                          <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                            {trip.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>
                          {cust?.companyName} • {prod?.name} (Net: <strong>{trip.netWeightMt || trip.orderedQtyMt} MT</strong>)
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                          Vehicle: {veh?.plateNumber} • Dest: {trip.destination}
                        </div>
                      </div>

                      {gatePass && onViewGatePass && (
                        <button
                          onClick={() => onViewGatePass(gatePass.id)}
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.72rem' }}
                        >
                          View Gate Pass ({gatePass.gatePassNumber})
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      {showAddCustomer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            className="crusher-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#0F172A',
              padding: '24px',
              borderRadius: '16px',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
              Add New Customer (External Directory)
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '16px' }}>
              Note: Customers do NOT have ERP logins. Their mobile phone will be used for automated WhatsApp notifications.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Company Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Larsen & Mega Infra"
                  value={newCustCompany}
                  onChange={(e) => setNewCustCompany(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Contact Person Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Ramesh Patil"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94A3B8' }}>WhatsApp Phone Number *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="+9198XXXXXXXX"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Site / Billing Address *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Sector 12, Pimpri Chinchwad, Pune"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setShowAddCustomer(false)}
                className="btn-secondary"
                style={{ fontSize: '0.8rem' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newCustCompany || !newCustName || !newCustPhone) {
                    alert('Please enter required details');
                    return;
                  }
                  const newCustId = `c${Date.now()}`;
                  store.customers.push({
                    id: newCustId,
                    name: newCustName,
                    companyName: newCustCompany,
                    phone: newCustPhone,
                    billingAddress: newCustAddress || 'Pune',
                    currentBalance: 0,
                  });
                  setCustomerId(newCustId);
                  setShowAddCustomer(false);
                  setNewCustCompany('');
                  setNewCustName('');
                }}
                className="btn-primary"
                style={{ fontSize: '0.8rem' }}
              >
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
