import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShieldCheck, Truck, RotateCcw, MapPin, CheckCircle, ArrowLeft } from 'lucide-react';
import { productService } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, calculateDiscount } from '../../utils/formatters';
import { Product } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { Alert } from '../../components/Alert/Alert';
import './ProductDetails.css';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pincode, setPincode] = useState('560103');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    if (id) {
      productService.getProductById(parseInt(id))
        .then(setProduct)
        .catch(() => navigate('/products'))
        .finally(() => setLoading(false));
    }
  }, [id, navigate]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!product) return null;

  const discount = calculateDiscount(product.price, product.originalPrice);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(product.id, quantity);
      setFeedback({ type: 'success', msg: `Added ${quantity} item(s) to your cart!` });
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.response?.data?.message || 'Unable to add to cart' });
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(product.id, quantity);
      navigate('/checkout');
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.response?.data?.message || 'Unable to proceed' });
    }
  };

  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="container product-detail-container">
      <button className="back-bread-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back to results
      </button>

      {feedback && <Alert type={feedback.type} message={feedback.msg} onClose={() => setFeedback(null)} />}

      <div className="product-view-layout">
        {/* Left Column: Product Image Gallery */}
        <div className="gallery-column">
          <div className="main-image-frame">
            <img src={product.imageUrl} alt={product.name} />
          </div>
        </div>

        {/* Center Column: Details, Ratings, Specifications */}
        <div className="center-info-column">
          <span className="brand-category-link">{product.category?.name}</span>
          <h1 className="main-product-title">{product.name}</h1>

          {/* Amazon Rating Line */}
          <div className="rating-strip">
            <div className="star-block">
              <span>{product.rating?.toFixed(1) || '4.8'}</span>
              <Star size={14} fill="#fff" />
            </div>
            <span className="rating-count-text">{product.reviewCount?.toLocaleString() || '3,840'} ratings</span>
            <span className="assured-flag"><CheckCircle size={14} /> Assured</span>
          </div>

          <hr className="detail-separator" />

          {/* Price Stack */}
          <div className="price-detail-box">
            <div className="price-big-line">
              <span className="discount-percent-big">-{discount}%</span>
              <span className="price-number-big">{formatCurrency(product.price)}</span>
            </div>
            <div className="mrp-line">
              <span>M.R.P.:</span>
              <span className="strikethrough-mrp">{formatCurrency(product.originalPrice)}</span>
            </div>
            <p className="taxes-note">Inclusive of all taxes</p>
            <p className="emi-note">EMI starts at ₹{Math.round(product.price / 12).toLocaleString()}/month. No Cost EMI available.</p>
          </div>

          {/* Bank Offers Box (Amazon Style) */}
          <div className="bank-offers-card">
            <h4>Bank Offers & Promotions</h4>
            <ul>
              <li><strong>HDFC Bank:</strong> 10% instant discount up to ₹1,500 on Credit Cards.</li>
              <li><strong>ICICI Bank:</strong> 5% unlimited cashback with Amazon Pay ICICI Card.</li>
            </ul>
          </div>

          <div className="description-section">
            <h3>About this item</h3>
            <p>{product.description}</p>
          </div>
        </div>

        {/* Right Column: Amazon / Flipkart Buy Box */}
        <div className="buybox-column">
          <div className="buybox-card">
            <span className="buybox-price">{formatCurrency(product.price)}</span>

            <div className="delivery-check-box">
              <div className="pincode-header">
                <MapPin size={16} />
                <span>Deliver to: <strong>{pincode}</strong></span>
              </div>
              <p className="delivery-promise">FREE Delivery <strong>Tomorrow, 2 PM</strong></p>
            </div>

            <div className="stock-notice-row">
              {isOutOfStock ? (
                <span className="out-of-stock-alert">Currently Unavailable</span>
              ) : (
                <span className="in-stock-alert">In Stock</span>
              )}
            </div>

            {!isOutOfStock && (
              <>
                <div className="qty-row">
                  <label>Quantity:</label>
                  <select value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))}>
                    {[1, 2, 3, 4, 5].map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                <button className="btn-add-to-cart-yellow" onClick={handleAddToCart}>
                  Add to Cart
                </button>
                <button className="btn-buy-now-orange" onClick={handleBuyNow}>
                  Buy Now
                </button>
              </>
            )}

            <div className="trust-bullets">
              <div className="bullet-row">
                <ShieldCheck size={16} />
                <span>NexStore Delivered</span>
              </div>
              <div className="bullet-row">
                <RotateCcw size={16} />
                <span>7 Days Replacement</span>
              </div>
              <div className="bullet-row">
                <Truck size={16} />
                <span>Free Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
