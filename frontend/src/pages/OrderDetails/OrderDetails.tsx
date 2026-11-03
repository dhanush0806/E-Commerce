import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, CheckCircle2, PackageCheck, Printer } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import './OrderDetails.css';

export const OrderDetails: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      orderService.getOrderByNumber(orderNumber)
        .then(setOrder)
        .finally(() => setLoading(false));
    }
  }, [orderNumber]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!order) return <div className="container">Order not found.</div>;

  const steps = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentStepIndex = steps.indexOf(order.status) !== -1 ? steps.indexOf(order.status) : 1;

  return (
    <div className="container order-detail-page">
      <div className="order-page-top">
        <div>
          <h1>Order Details</h1>
          <p className="order-id-line">Ordered on {formatDate(order.createdAt)} | Order # {order.orderNumber}</p>
        </div>
        <button className="btn-print-invoice" onClick={() => window.print()}>
          <Printer size={16} /> Print Official Invoice
        </button>
      </div>

      {/* Amazon Package Progress Step Bar */}
      <div className="tracking-progress-card">
        <h2>Shipment Tracking</h2>
        <div className="progress-timeline">
          {steps.map((st, idx) => {
            const isCompleted = idx <= currentStepIndex;
            return (
              <div key={st} className={`timeline-node ${isCompleted ? 'done' : ''}`}>
                <div className="node-circle">
                  {isCompleted ? <Check size={14} /> : idx + 1}
                </div>
                <span className="node-title">
                  {st === 'CONFIRMED' ? 'Order Placed' : st === 'PROCESSING' ? 'Packed' : st === 'SHIPPED' ? 'In Transit' : 'Delivered'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="order-summary-layout">
        {/* Shipping & Payment Box */}
        <div className="info-summary-box">
          <div className="info-col">
            <h4>Shipping Address</h4>
            <p>{order.shippingAddressText}</p>
          </div>
          <div className="info-col">
            <h4>Payment Method</h4>
            <p>{order.paymentMethod}</p>
            <span className="paid-status-badge">Status: {order.paymentStatus}</span>
          </div>
          <div className="info-col">
            <h4>Order Summary</h4>
            <div className="cost-breakdown">
              <div><span>Item(s) Subtotal:</span> <span>{formatCurrency(order.subtotal)}</span></div>
              <div><span>Shipping:</span> <span>{order.shippingFee === 0 ? 'FREE' : formatCurrency(order.shippingFee)}</span></div>
              <div><span>Tax (5% GST):</span> <span>{formatCurrency(order.tax)}</span></div>
              <div className="grand-total-row"><span>Grand Total:</span> <strong>{formatCurrency(order.totalAmount)}</strong></div>
            </div>
          </div>
        </div>

        {/* Item List */}
        <div className="order-items-box">
          {order.items.map((item) => (
            <div key={item.id} className="purchased-item-row">
              <img src={item.productImageUrl} alt={item.productName} />
              <div className="purchased-meta">
                <h3>
                  <Link to={`/products/${item.productId}`}>{item.productName}</Link>
                </h3>
                <span className="sku-code">SKU: {item.productSku}</span>
                <span className="price-tag">{formatCurrency(item.unitPrice)}</span>
                <span className="qty-tag">Quantity: {item.quantity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
