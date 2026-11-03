import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { categoryService } from '../../../services/categoryService';
import { adminService } from '../../../services/adminService';
import { Category } from '../../../types';
import { ConfirmationModal } from '../../../components/ConfirmationModal/ConfirmationModal';
import { Alert } from '../../../components/Alert/Alert';
import './AdminCategories.css';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
  });

  const loadData = () => {
    categoryService.getAllCategories().then(setCategories);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', imageUrl: '' });
    setShowModal(true);
  };

  const openEditModal = (c: Category) => {
    setEditingCategory(c);
    setFormData({
      name: c.name,
      description: c.description || '',
      imageUrl: c.imageUrl || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, formData);
        setFeedback({ type: 'success', msg: 'Category updated' });
      } else {
        await adminService.createCategory(formData);
        setFeedback({ type: 'success', msg: 'Category created' });
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
        await adminService.deleteCategory(deleteId);
        setFeedback({ type: 'success', msg: 'Category deleted' });
        loadData();
      } catch (err: any) {
        setFeedback({ type: 'error', msg: err.response?.data?.message || 'Cannot delete category with associated products' });
      } finally {
        setDeleteId(null);
      }
    }
  };

  return (
    <div className="container admin-mgmt-page">
      <div className="mgmt-header">
        <div>
          <h1>Store Categories</h1>
          <p>Organize store taxonomy and promotional category landing pages</p>
        </div>
        <button className="btn-primary-mgmt" onClick={openCreateModal}>
          <Plus size={18} /> Add Category
        </button>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.msg} onClose={() => setFeedback(null)} />}

      <div className="mgmt-table-card">
        <table className="mgmt-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>
                  <img src={c.imageUrl} alt={c.name} className="table-thumb" />
                </td>
                <td><strong>{c.name}</strong></td>
                <td><code>{c.slug}</code></td>
                <td>{c.description}</td>
                <td>
                  <div className="action-btns">
                    <button className="icon-btn edit-btn" onClick={() => openEditModal(c)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="icon-btn delete-btn" onClick={() => setDeleteId(c.id)} title="Delete">
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
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCategory ? 'Edit Category' : 'Create Category'}</h2>
            <form onSubmit={handleSubmit} className="mgmt-form">
              <div className="form-group">
                <label>Category Name</label>
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
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteId !== null}
        title="Delete Category"
        message="Are you sure you want to delete this category? Make sure no products are attached."
        confirmLabel="Delete"
        isDangerous
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
