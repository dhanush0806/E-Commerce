import React from 'react';
import { Link } from 'react-router-dom';
import { Star, CheckCircle } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency, calculateDiscount } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  onAddToCartSuccess?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCartSuccess }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [adding, setAdding] = React.useState(false);

  const discount = calculateDiscount(product.price, product.originalPrice);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    try {
      setAdding(true);
      await addToCart(product.id, 1);
      if (onAddToCartSuccess) onAddToCartSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setAdding(false);
    }
  };

  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="commercial-product-card">
      <Link to={`/products/${product.id}`} className="card-thumb-wrap">
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        {product.isBestSeller && <span className="bestseller-ribbon">Best Seller</span>}
      </Link>

      <div className="card-content">
        <span className="card-category-name">{product.category?.name}</span>

        <h3 className="card-product-title" title={product.name}>
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>

        {/* Ratings block like Amazon/Flipkart */}
        <div className="rating-row">
          <div className="star-pill">
            <span>{product.rating?.toFixed(1) || '4.5'}</span>
            <Star size={12} fill="#fff" />
          </div>
          <span className="review-count">({product.reviewCount?.toLocaleString() || '1,240'})</span>
          <span className="assured-badge">
            <CheckCircle size={12} /> Assured
          </span>
        </div>

        {/* Price & Deal Strikethrough */}
        <div className="price-stack">
          <div className="main-price-row">
            <span className="sale-price">{formatCurrency(product.price)}</span>
            {discount > 0 && (
              <>
                <span className="mrp-price">{formatCurrency(product.originalPrice)}</span>
                <span className="discount-tag">{discount}% off</span>
              </>
            )}
          </div>
          <span className="delivery-tag">FREE Delivery by <strong>Tomorrow, 2 PM</strong></span>
        </div>

        {/* Actions */}
        <div className="card-actions">
          <button
            className="btn-card-buy"
            disabled={isOutOfStock || adding}
            onClick={handleAdd}
          >
            {isOutOfStock ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};
