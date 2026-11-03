import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { Pagination } from '../../components/Pagination/Pagination';
import './OrderHistory.css';

export const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    orderService.getUserOrders(currentPage, 10)
      .then((data) => {
        setOrders(data.content);
        setTotalPages(data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [currentPage]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="container your-orders-page">
      <h1 className="orders-title">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="no-orders-box">
          <h2>No orders placed yet</h2>
          <p>Looking for a previous purchase? Browse our catalogue to place an order.</p>
          <Link to="/products" className="btn-start-shopping">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-cards-list">
          {orders.map((o) => (
            <div key={o.id} className="amazon-order-card">
              <div className="order-card-header">
                <div className="meta-cell">
                  <span>ORDER PLACED</span>
                  <strong>{formatDate(o.createdAt)}</strong>
                </div>
                <div className="meta-cell">
                  <span>TOTAL</span>
                  <strong>{formatCurrency(o.totalAmount)}</strong>
                </div>
                <div className="meta-cell">
                  <span>SHIP TO</span>
                  <span className="customer-name-link">{o.customerName}</span>
                </div>
                <div className="meta-cell order-id-cell">
                  <span>ORDER # {o.orderNumber}</span>
                  <Link to={`/orders/${o.orderNumber}`}>View order details</Link>
                </div>
              </div>

              <div className="order-card-body">
                <div className="order-status-banner">
                  <h3 className="status-heading">
                    {o.status === 'DELIVERED' ? 'Delivered' : `Arriving by ${o.estimatedDelivery || 'Tomorrow'}`}
                  </h3>
                  <span className="sub-status-note">Package has been dispatched via NexStore Logistics</span>
                </div>

                <div className="order-items-grid">
                  {o.items.map((i) => (
                    <div key={i.id} className="order-item-visual-row">
                      <img src={i.productImageUrl} alt={i.productName} />
                      <div className="item-info">
                        <h4>
                          <Link to={`/products/${i.productId}`}>{i.productName}</Link>
                        </h4>
                        <span className="qty-tag">Qty: {i.quantity}</span>
                        <div className="btn-actions-row">
                          <Link to={`/products/${i.productId}`} className="btn-buy-again">
                            Buy it again
                          </Link>
                          <Link to={`/orders/${o.orderNumber}`} className="btn-track-item">
                            Track package
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};
