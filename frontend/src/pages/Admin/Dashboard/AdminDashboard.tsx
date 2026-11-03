import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingCart, Package, AlertTriangle, Users } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { AdminStats } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!stats) return null;

  return (
    <div className="container admin-dashboard">
      <div className="admin-header">
        <h1>Administrative Command Center</h1>
        <p>Real-time analytics and store management operations</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-revenue"><DollarSign size={24} /></div>
          <div className="stat-data">
            <span>Total Sales Revenue</span>
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-orders"><ShoppingCart size={24} /></div>
          <div className="stat-data">
            <span>Total Orders Placed</span>
            <h3>{stats.totalOrders}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-products"><Package size={24} /></div>
          <div className="stat-data">
            <span>Catalog Products</span>
            <h3>{stats.totalProducts}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-stock"><AlertTriangle size={24} /></div>
          <div className="stat-data">
            <span>Out of Stock Items</span>
            <h3 className={stats.outOfStockProducts > 0 ? 'color-danger' : ''}>
              {stats.outOfStockProducts}
            </h3>
          </div>
        </div>
      </div>

      <div className="admin-quick-actions">
        <h2>Management Consoles</h2>
        <div className="quick-action-cards">
          <Link to="/admin/products" className="qa-card">
            <h3>Manage Products</h3>
            <p>Add new products, edit pricing, adjust SKU and stock numbers.</p>
          </Link>

          <Link to="/admin/categories" className="qa-card">
            <h3>Manage Categories</h3>
            <p>Organize product taxonomy, create departments and slugs.</p>
          </Link>

          <Link to="/admin/orders" className="qa-card">
            <h3>Manage Orders</h3>
            <p>Review customer orders, update tracking status to processing, shipped, or delivered.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};
