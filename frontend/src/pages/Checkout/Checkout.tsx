import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, ShieldCheck, Plus, Lock } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { addressService } from '../../services/addressService';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import { formatCurrency } from '../../utils/formatters';
import { Address } from '../../types';
import { Alert } from '../../components/Alert/Alert';
import './Checkout.css';

export const Checkout: React.FC = () => {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'UPI' | 'NET_BANKING' | 'CASH_ON_DELIVERY'>('CREDIT_CARD');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    fullName: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    addressService.getUserAddresses().then((data) => {
      setAddresses(data);
      if (data.length > 0) {
        setSelectedAddressId(data[0].id || null);
      } else {
        setShowAddressForm(true);
      }
    });
  }, []);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const saved = await addressService.addAddress(newAddress);
      setAddresses([saved, ...addresses]);
      setSelectedAddressId(saved.id || null);
      setShowAddressForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select or add a delivery address');
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // Server creates order and computes total amount authoritatively
      const order = await orderService.createOrder(selectedAddressId, paymentMethod);

      // Instant digital payment gateway confirmation
      if (paymentMethod !== 'CASH_ON_DELIVERY') {
        await paymentService.simulatePayment(order.orderNumber, true);
      }

      await refreshCart();
      navigate(`/orders/${order.orderNumber}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not complete order');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return <div className="container" style={{ padding: '40px 16px' }}>Your cart is empty.</div>;
  }

  const subtotal = cart.grandTotal;
  const tax = subtotal * 0.05;
  const shipping = subtotal >= 499 ? 0 : 99;
  const total = subtotal + tax + shipping;

  return (
    <div className="container commercial-checkout-page">
      <div className="checkout-top-header">
        <h1>Checkout</h1>
        <div className="checkout-ssl-badge">
          <Lock size={16} /> 256-Bit SSL Encrypted
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="checkout-grid-container">
        <div className="checkout-accordion-column">
          {/* Step 1: Delivery Address */}
          <section className="checkout-step-card">
            <div className="step-header-row">
              <h2>1. Delivery Address</h2>
              {!showAddressForm && (
                <button className="link-add-address" onClick={() => setShowAddressForm(true)}>
                  <Plus size={16} /> Add a new address
                </button>
              )}
            </div>

            {showAddressForm ? (
              <form onSubmit={handleCreateAddress} className="address-entry-form">
                <div className="form-two-col">
                  <div className="form-item">
                    <label>Full Name</label>
                    <input
                      type="text"
                      required
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    />
                  </div>
                  <div className="form-item">
                    <label>Mobile Number (10 Digits)</label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-item">
                  <label>Flat, House no., Building, Company, Apartment</label>
                  <input
                    type="text"
                    required
                    value={newAddress.streetAddress}
                    onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                  />
                </div>

                <div className="form-three-col">
                  <div className="form-item">
                    <label>Town / City</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    />
                  </div>
                  <div className="form-item">
                    <label>State</label>
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    />
                  </div>
                  <div className="form-item">
                    <label>PIN Code</label>
                    <input
                      type="text"
                      required
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="address-form-buttons">
                  {addresses.length > 0 && (
                    <button type="button" className="btn-cancel-addr" onClick={() => setShowAddressForm(false)}>
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="btn-submit-addr">
                    Use this address
                  </button>
                </div>
              </form>
            ) : (
              <div className="addresses-radio-group">
                {addresses.map((a) => (
                  <label key={a.id} className={`address-card-label ${selectedAddressId === a.id ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="selectedAddress"
                      checked={selectedAddressId === a.id}
                      onChange={() => setSelectedAddressId(a.id || null)}
                    />
                    <div className="address-content">
                      <strong>{a.fullName}</strong>
                      <p>{a.streetAddress}, {a.city}, {a.state} - {a.postalCode}</p>
                      <p className="phone-line">Phone number: {a.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Step 2: Payment Method */}
          <section className="checkout-step-card">
            <h2>2. Select a Payment Method</h2>
            <div className="payment-gateways-list">
              <label className={`payment-gateway-option ${paymentMethod === 'CREDIT_CARD' ? 'checked' : ''}`}>
                <input
                  type="radio"
                  name="paymentMode"
                  checked={paymentMethod === 'CREDIT_CARD'}
                  onChange={() => setPaymentMethod('CREDIT_CARD')}
                />
                <CreditCard size={20} />
                <div className="gateway-desc">
                  <strong>Credit or Debit Card</strong>
                  <span>Visa, MasterCard, RuPay, American Express</span>
                </div>
              </label>

              <label className={`payment-gateway-option ${paymentMethod === 'UPI' ? 'checked' : ''}`}>
                <input
                  type="radio"
                  name="paymentMode"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                />
                <CheckCircle size={20} />
                <div className="gateway-desc">
                  <strong>Other UPI Apps / QR Code</strong>
                  <span>Google Pay, PhonePe, Paytm, BHIM UPI</span>
                </div>
              </label>

              <label className={`payment-gateway-option ${paymentMethod === 'NET_BANKING' ? 'checked' : ''}`}>
                <input
                  type="radio"
                  name="paymentMode"
                  checked={paymentMethod === 'NET_BANKING'}
                  onChange={() => setPaymentMethod('NET_BANKING')}
                />
                <CheckCircle size={20} />
                <div className="gateway-desc">
                  <strong>Net Banking</strong>
                  <span>All Indian major banks supported</span>
                </div>
              </label>

              <label className={`payment-gateway-option ${paymentMethod === 'CASH_ON_DELIVERY' ? 'checked' : ''}`}>
                <input
                  type="radio"
                  name="paymentMode"
                  checked={paymentMethod === 'CASH_ON_DELIVERY'}
                  onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                />
                <CheckCircle size={20} />
                <div className="gateway-desc">
                  <strong>Cash on Delivery / Pay on Delivery</strong>
                  <span>Pay by cash or UPI at the doorstep</span>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Right Summary Column */}
        <div className="checkout-summary-column">
          <div className="order-review-card">
            <button
              className="btn-place-order-golden"
              disabled={loading || !selectedAddressId}
              onClick={handlePlaceOrder}
            >
              {loading ? 'Processing Order...' : 'Place Your Order and Pay'}
            </button>
            <p className="legal-agreement-text">
              By placing your order, you agree to NexStore&apos;s privacy notice and conditions of use.
            </p>

            <hr className="detail-separator" />

            <h3>Order Summary</h3>
            <div className="summary-line">
              <span>Items:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="summary-line">
              <span>Delivery:</span>
              <span>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
            </div>
            <div className="summary-line">
              <span>Tax (5% GST):</span>
              <span>{formatCurrency(tax)}</span>
            </div>

            <hr className="detail-separator" />

            <div className="summary-grand-total">
              <span>Order Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
