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

  // Form state
  const [customerId, setCustomerId] = useState(store.customers[0]?.id || '');
  const [productId, setProductId] = useState(store.products[0]?.id || '');
  const [orderedQtyMt, setOrderedQtyMt] = useState('20');
  const [vehicleId, setVehicleId] = useState(store.vehicles[0]?.id || '');
  const [driverId, setDriverId] = useState(store.drivers[0]?.id || '');
  const [destination, setDestination] = useState('Plot 42, MIDC Hinjawadi Phase 2, Pune');
  const [notes, setNotes] = useState('');
  const [orderCreatedSuccess, setOrderCreatedSuccess] = useState<string | null>(null);

  // Add customer modal
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustCompany, setNewCustCompany] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('+91');
  const [newCustAddress, setNewCustAddress] = useState('');

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
      alert('Please fill all required fields');
      return;
    }

    const qty = parseFloat(orderedQtyMt);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity in MT');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header */}
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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Office Operations</h2>
          <p style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
            Create customer orders. Booked trips appear automatically in the Site Operator's FIFO queue.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowAddCustomer(true)}
            className="btn-secondary"
          >
            <Users size={14} /> Add Customer
          </button>
          <button
            onClick={onOpenWhatsAppSimulator}
            className="btn-secondary"
          >
            <Send size={14} /> WhatsApp Status
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {orderCreatedSuccess && (
        <div
          style={{
            backgroundColor: '#064E3B',
            border: '1px solid #059669',
            borderRadius: '6px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8125rem',
            color: '#ECFDF5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="#34D399" />
            <span>
              Trip <strong>{orderCreatedSuccess}</strong> created and queued. WhatsApp alerts sent to Customer and Driver.
            </span>
          </div>
          <button
            onClick={onOpenWhatsAppSimulator}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#34D399',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '0.78rem',
            }}
          >
            View WhatsApp →
          </button>
        </div>
      )}

      {/* 2 Column Layout: Order Form & Queues */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        {/* Order Form */}
        <div className="crusher-card" style={{ padding: '18px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '14px' }}>
            New Trip Order
          </h3>

          <form onSubmit={handleCreateTrip} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '4px' }}>
                Customer *
              </label>
              <select
                className="input-field"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                {store.customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '4px' }}>
                  Aggregate Product *
                </label>
                <select
                  className="input-field"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                >
                  {store.products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.currentStockMt} MT left)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '4px' }}>
                  Quantity (MT) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  className="input-field"
                  value={orderedQtyMt}
                  onChange={(e) => setOrderedQtyMt(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '4px' }}>
                  Vehicle *
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
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '4px' }}>
                  Driver *
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

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '4px' }}>
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

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '4px' }}>
                Notes / Instructions
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Optional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '6px',
              }}
            >
              <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>
                Est. Total: <strong>₹{totalAmountEst.toLocaleString()}</strong>
              </span>

              <button type="submit" className="btn-primary">
                <PlusCircle size={14} /> Create Trip & Push to Queue
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Queues */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Site FIFO Queue */}
          <div className="crusher-card" style={{ padding: '18px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                Site FIFO Dispatch Queue
              </div>
              <span className="badge badge-amber">{queuedTrips.length} Queued</span>
            </div>

            {queuedTrips.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#6B7280', fontSize: '0.8rem' }}>
                Queue is empty.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {queuedTrips.map((trip, idx) => {
                  const cust = store.customers.find((c) => c.id === trip.customerId);
                  const prod = store.products.find((p) => p.id === trip.productId);
                  const veh = store.vehicles.find((v) => v.id === trip.vehicleId);

                  return (
                    <div
                      key={trip.id}
                      style={{
                        backgroundColor: '#0D1424',
                        border: '1px solid #1F2937',
                        borderRadius: '6px',
                        padding: '10px 12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.8rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#9CA3AF', fontWeight: 600 }}>#{idx + 1}</span>
                          <strong style={{ color: '#F3F4F6' }}>{trip.tripNumber}</strong>
                          <span style={{ color: '#60A5FA' }}>• {cust?.companyName}</span>
                        </div>
                        <div style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '2px' }}>
                          {prod?.name} ({trip.orderedQtyMt} MT) • Truck: {veh?.plateNumber}
                        </div>
                      </div>

                      <span className="badge badge-slate">{trip.status}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed Trips */}
          <div className="crusher-card" style={{ padding: '18px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                Recent Dispatches
              </div>
              <span className="badge badge-emerald">{activeDispatchedTrips.length} Dispatched</span>
            </div>

            {activeDispatchedTrips.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px', color: '#6B7280', fontSize: '0.8rem' }}>
                No dispatches completed yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeDispatchedTrips.map((trip) => {
                  const cust = store.customers.find((c) => c.id === trip.customerId);
                  const prod = store.products.find((p) => p.id === trip.productId);
                  const gatePass = store.gatePasses.find((g) => g.tripId === trip.id);

                  return (
                    <div
                      key={trip.id}
                      style={{
                        backgroundColor: '#0D1424',
                        border: '1px solid #1F2937',
                        borderRadius: '6px',
                        padding: '10px 12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.8rem',
                      }}
                    >
                      <div>
                        <strong>{trip.tripNumber}</strong> • {cust?.companyName}
                        <div style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                          {prod?.name} (Net: <strong>{trip.netWeightMt || trip.orderedQtyMt} MT</strong>)
                        </div>
                      </div>

                      {gatePass && onViewGatePass && (
                        <button
                          onClick={() => onViewGatePass(gatePass.id)}
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                        >
                          Gate Pass
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

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
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
              maxWidth: '420px',
              padding: '20px',
              backgroundColor: '#111827',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>
              Add Customer
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Company Name *</label>
                <input
                  type="text"
                  className="input-field"
                  value={newCustCompany}
                  onChange={(e) => setNewCustCompany(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Contact Person *</label>
                <input
                  type="text"
                  className="input-field"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>WhatsApp Phone *</label>
                <input
                  type="text"
                  className="input-field"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Billing / Site Address</label>
                <input
                  type="text"
                  className="input-field"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button onClick={() => setShowAddCustomer(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newCustCompany || !newCustName || !newCustPhone) {
                    alert('Please enter required details');
                    return;
                  }
                  const newId = `c${Date.now()}`;
                  store.customers.push({
                    id: newId,
                    name: newCustName,
                    companyName: newCustCompany,
                    phone: newCustPhone,
                    billingAddress: newCustAddress || 'Pune',
                    currentBalance: 0,
                  });
                  setCustomerId(newId);
                  setShowAddCustomer(false);
                }}
                className="btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
