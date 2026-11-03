import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3 } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { Order } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { Pagination } from '../../../components/Pagination/Pagination';
import { Alert } from '../../../components/Alert/Alert';
import './AdminOrders.css';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const loadOrders = () => {
    adminService.getAllOrders(currentPage, 10).then((data) => {
      setOrders(data.content);
      setTotalPages(data.totalPages);
    });
  };

  useEffect(() => {
    loadOrders();
  }, [currentPage]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      await adminService.updateOrderStatus(selectedOrder.id, newStatus);
      setFeedback({ type: 'success', msg: `Order #${selectedOrder.orderNumber} status changed to ${newStatus}` });
      setSelectedOrder(null);
      loadOrders();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: 'Failed to update order status' });
    }
  };

  return (
    <div className="container admin-mgmt-page">
      <div className="mgmt-header">
        <div>
          <h1>Order Fulfillment Console</h1>
          <p>Review customer purchases, adjust package delivery and shipment tracking status</p>
        </div>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.msg} onClose={() => setFeedback(null)} />}

      <div className="mgmt-table-card">
        <table className="mgmt-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Fulfillment Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td><strong>{o.orderNumber}</strong></td>
                <td>
                  <div>{o.customerName}</div>
                  <span className="sub-sku">{o.customerEmail}</span>
                </td>
                <td>{formatDate(o.createdAt)}</td>
                <td><strong>{formatCurrency(o.totalAmount)}</strong></td>
                <td>
                  <span className={`status-pill pill-${o.status.toLowerCase()}`}>{o.status}</span>
                </td>
                <td>
                  <span className={`status-pill pill-${o.paymentStatus.toLowerCase()}`}>{o.paymentStatus}</span>
                </td>
                <td>
                  <div className="action-btns">
                    <button
                      className="icon-btn edit-btn"
                      onClick={() => {
                        setSelectedOrder(o);
                        setNewStatus(o.status);
                      }}
                      title="Update Status"
                    >
                      <Edit3 size={16} />
                    </button>
                    <Link to={`/orders/${o.orderNumber}`} className="icon-btn" title="View Details">
                      <Eye size={16} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h2>Update Order #{selectedOrder.orderNumber}</h2>
            <form onSubmit={handleStatusUpdate} className="mgmt-form">
              <div className="form-group">
                <label>Fulfillment Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="CONFIRMED">CONFIRMED (Order Placed)</option>
                  <option value="PROCESSING">PROCESSING (Packed)</option>
                  <option value="SHIPPED">SHIPPED (In Transit)</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setSelectedOrder(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Update Status</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
