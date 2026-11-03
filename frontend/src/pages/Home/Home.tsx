import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Tag, ChevronRight } from 'lucide-react';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Category, Product } from '../../types';
import './Home.css';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getProducts(0, 8),
      categoryService.getAllCategories(),
    ])
      .then(([prodData, catData]) => {
        setFeaturedProducts(prodData.content);
        setCategories(catData);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="commercial-home">
      {/* Top Promotional Announcement Bar */}
      <div className="promo-ticker">
        <div className="container ticker-container">
          <span>⚡ <strong>Mega Electronics & Fashion Sale</strong> is LIVE! Up to 50% Off | Instant 10% Bank Discount on HDFC & ICICI Cards</span>
        </div>
      </div>

      {/* Amazon / Flipkart Style Carousel Banner */}
      <section className="marketplace-hero">
        <div className="container hero-card-banner">
          <div className="banner-left-content">
            <span className="deal-badge"><Zap size={14} fill="#fff" /> Blockbuster Deals</span>
            <h1 className="banner-title">Flagship Audio, Tech Gear & Sneakers</h1>
            <p className="banner-desc">
              Upgrade your lifestyle with verified authentic products. Enjoy Free Next-Day Delivery and hassle-free 7-day replacements.
            </p>
            <div className="banner-btn-row">
              <Link to="/products" className="btn-shop-deals">
                Shop The Sale <ArrowRight size={18} />
              </Link>
              <Link to="/products?category=1" className="btn-explore-cat">
                View Electronics
              </Link>
            </div>
          </div>
          <div className="banner-right-visual">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
              alt="Sony WH-1000XM5 Headphones"
              className="featured-hero-img"
            />
          </div>
        </div>
      </section>

      {/* Quick Category Rail (Flipkart Style Icons/Cards) */}
      <section className="container category-rail-section">
        <div className="category-rail">
          {categories.map((c) => (
            <Link key={c.id} to={`/products?category=${c.id}`} className="cat-rail-item">
              <div className="cat-thumb">
                <img src={c.imageUrl} alt={c.name} />
              </div>
              <span className="cat-rail-title">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Today's Deals Block */}
      <section className="container section-deals">
        <div className="deals-card-panel">
          <div className="deals-panel-header">
            <div className="header-left">
              <h2>Today&apos;s Featured Deals</h2>
              <span className="deal-clock">Limited Time Offers</span>
            </div>
            <Link to="/products" className="see-all-link">
              See all deals <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching offers..." />
          ) : (
            <div className="deals-product-grid">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promotional Value Props */}
      <section className="container value-props-section">
        <div className="props-grid">
          <div className="prop-box">
            <Shield className="prop-icon" />
            <div>
              <h4>100% Genuine Guarantee</h4>
              <p>Every product is sourced directly from brand-authorized distributors.</p>
            </div>
          </div>
          <div className="prop-box">
            <Zap className="prop-icon" />
            <div>
              <h4>Ultra Fast Dispatch</h4>
              <p>Orders are packed and handed over to logistics partners within hours.</p>
            </div>
          </div>
          <div className="prop-box">
            <Tag className="prop-icon" />
            <div>
              <h4>Best Price Price-Match</h4>
              <p>Direct consumer pricing with automated discounts and bank cashbacks.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
