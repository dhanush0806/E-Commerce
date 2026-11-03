import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import './Cart.css';

export const Cart: React.FC = () => {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  if (loading && !cart) return <LoadingSpinner fullScreen />;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container empty-cart-container">
        <div className="empty-cart-white-card">
          <h2>Your NexStore Cart is empty</h2>
          <p>Your shopping cart is waiting for great items. Browse today&apos;s featured deals and bestselling hardware.</p>
          <Link to="/products" className="btn-shop-today">
            Shop Today&apos;s Deals
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart.grandTotal;
  const isFreeDelivery = subtotal >= 499;

  return (
    <div className="container cart-page-wrapper">
      <div className="cart-grid-layout">
        {/* Left Column: Cart Items */}
        <div className="cart-products-card">
          <div className="cart-card-header">
            <h1>Shopping Cart</h1>
            <span className="price-header-label">Price</span>
          </div>

          {/* Free Delivery Bar like Amazon */}
          <div className="free-delivery-progress">
            <CheckCircle size={18} className="green-check" />
            <span>
              {isFreeDelivery
                ? 'Your order qualifies for FREE Delivery!'
                : `Add ${formatCurrency(499 - subtotal)} more of eligible items to get FREE Delivery.`}
            </span>
          </div>

          <div className="cart-items-stack">
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item-row">
                <img src={item.imageUrl} alt={item.productName} className="cart-row-img" />

                <div className="cart-row-meta">
                  <h3>
                    <Link to={`/products/${item.productId}`}>{item.productName}</Link>
                  </h3>
                  <span className="in-stock-label">In Stock</span>
                  <span className="eligible-free-ship">Eligible for FREE Shipping</span>

                  <div className="cart-row-actions">
                    <div className="qty-pill">
                      <label>Qty:</label>
                      <select
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                    <span className="action-pipe">|</span>
                    <button className="text-action-btn" onClick={() => removeItem(item.id)}>
                      Delete
                    </button>
                    <span className="action-pipe">|</span>
                    <button className="text-action-btn">Save for later</button>
                  </div>
                </div>

                <div className="cart-row-price">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-card-footer">
            <span>Subtotal ({cart.totalItems} items): <strong>{formatCurrency(subtotal)}</strong></span>
          </div>
        </div>

        {/* Right Column: Order Checkout Box */}
        <div className="cart-sidebar-card">
          <div className="subtotal-box">
            <p className="subtotal-line">
              Subtotal ({cart.totalItems} items): <br />
              <strong className="subtotal-amount">{formatCurrency(subtotal)}</strong>
            </p>

            <button className="btn-proceed-to-buy" onClick={() => navigate('/checkout')}>
              Proceed to Buy
            </button>
          </div>

          <div className="security-assure-box">
            <ShieldCheck size={20} />
            <span>100% Safe and Secure Checkout with End-to-End Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};
