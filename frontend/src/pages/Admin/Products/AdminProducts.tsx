import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { productService } from '../../../services/productService';
import { categoryService } from '../../../services/categoryService';
import { adminService } from '../../../services/adminService';
import { Category, Product } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { ConfirmationModal } from '../../../components/ConfirmationModal/ConfirmationModal';
import { Alert } from '../../../components/Alert/Alert';
import './AdminProducts.css';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    stockQuantity: '',
    sku: '',
    imageUrl: '',
    categoryId: '',
  });

  const loadData = () => {
    productService.getProducts(0, 100).then((data) => setProducts(data.content));
    categoryService.getAllCategories().then(setCategories);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      stockQuantity: '',
      sku: '',
      imageUrl: '',
      categoryId: categories[0]?.id?.toString() || '',
    });
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      originalPrice: (p.originalPrice || p.price).toString(),
      stockQuantity: p.stockQuantity.toString(),
      sku: p.sku,
      imageUrl: p.imageUrl,
      categoryId: p.category.id.toString(),
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice || formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        sku: formData.sku,
        imageUrl: formData.imageUrl,
        categoryId: parseInt(formData.categoryId),
      };

      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, payload);
        setFeedback({ type: 'success', msg: 'Product updated successfully' });
      } else {
        await adminService.createProduct(payload);
        setFeedback({ type: 'success', msg: 'Product created successfully' });
      }

      setShowModal(false);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.response?.data?.message || 'Operation failed' });
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await adminService.deleteProduct(deleteId);
        setFeedback({ type: 'success', msg: 'Product deactivated' });
        loadData();
      } catch (err: any) {
        setFeedback({ type: 'error', msg: 'Failed to deactivate' });
      } finally {
        setDeleteId(null);
      }
    }
  };

  return (
    <div className="container admin-mgmt-page">
      <div className="mgmt-header">
        <div>
          <h1>Product Inventory</h1>
          <p>Create, update stock, and curate the marketplace catalogue</p>
        </div>
        <button className="btn-primary-mgmt" onClick={openCreateModal}>
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.msg} onClose={() => setFeedback(null)} />}

      <div className="mgmt-table-card">
        <table className="mgmt-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name & SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <img src={p.imageUrl} alt={p.name} className="table-thumb" />
                </td>
                <td>
                  <strong>{p.name}</strong>
                  <span className="sub-sku">{p.sku}</span>
                </td>
                <td>{p.category?.name}</td>
                <td>{formatCurrency(p.price)}</td>
                <td>
                  <span className={p.stockQuantity <= 0 ? 'stock-zero' : 'stock-ok'}>
                    {p.stockQuantity}
                  </span>
                </td>
                <td>
                  <span className={`status-pill ${p.isActive ? 'pill-completed' : 'pill-failed'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="icon-btn edit-btn" onClick={() => openEditModal(p)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="icon-btn delete-btn" onClick={() => setDeleteId(p.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleFormSubmit} className="mgmt-form">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Deal Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Original M.R.P. (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>SKU Code</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Image CDN URL</label>
                  <input
                    type="url"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteId !== null}
        title="Deactivate Product"
        message="Are you sure you want to deactivate this product? It will no longer appear in the customer catalogue."
        confirmLabel="Deactivate"
        isDangerous
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
