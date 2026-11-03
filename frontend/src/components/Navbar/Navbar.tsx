import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Search, ShoppingCart, User, ShieldCheck, Menu, X, ChevronDown, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="commercial-navbar">
      {/* Top Primary Bar */}
      <div className="nav-top-bar">
        <div className="container nav-top-container">
          {/* Logo */}
          <Link to="/" className="nav-brand">
            <span className="brand-prime">Nex<span className="brand-dot">Store</span></span>
            <span className="brand-badge">.in</span>
          </Link>

          {/* Location Delivery Selector (Amazon / Flipkart standard) */}
          <div className="delivery-location-widget">
            <MapPin size={18} className="loc-pin" />
            <div className="loc-text">
              <span className="loc-sub">Deliver to Rahul</span>
              <span className="loc-main">Bengaluru 560103</span>
            </div>
          </div>

          {/* Mega Search Bar with Category Dropdown */}
          <form className="nav-search-bar" onSubmit={handleSearch}>
            <div className="search-cat-dropdown">
              <span>{categoryFilter}</span>
              <ChevronDown size={14} />
            </div>
            <input
              type="text"
              placeholder="Search for products, brands and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-submit-btn" aria-label="Search">
              <Search size={20} />
            </button>
          </form>

          {/* User Nav Actions */}
          <div className="nav-actions">
            {isAdmin && (
              <Link to="/admin" className="nav-admin-link">
                <ShieldCheck size={18} />
                <span>Admin Console</span>
              </Link>
            )}

            {isAuthenticated ? (
              <div className="user-account-nav">
                <Link to="/profile" className="account-link">
                  <span className="acc-greeting">Hello, {user?.firstName}</span>
                  <span className="acc-bold">Account & Lists</span>
                </Link>
              </div>
            ) : (
              <Link to="/login" className="account-link">
                <span className="acc-greeting">Hello, sign in</span>
                <span className="acc-bold">Account & Lists</span>
              </Link>
            )}

            <Link to="/orders" className="returns-orders-link">
              <span className="returns-sub">Returns</span>
              <span className="orders-main">& Orders</span>
            </Link>

            {/* Shopping Cart Button */}
            <Link to="/cart" className="commercial-cart-btn">
              <div className="cart-icon-wrapper">
                <ShoppingCart size={28} />
                <span className="cart-counter">{cartCount}</span>
              </div>
              <span className="cart-label">Cart</span>
            </Link>
          </div>

          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Sub Navigation Bar (Category Deals Ribbon) */}
      <div className="nav-sub-bar">
        <div className="container sub-bar-container">
          <Link to="/products" className="sub-link all-btn">
            <Menu size={16} /> All Categories
          </Link>
          <Link to="/products?category=1" className="sub-link">Electronics</Link>
          <Link to="/products?category=2" className="sub-link">Footwear</Link>
          <Link to="/products?category=3" className="sub-link">Smart Watches</Link>
          <Link to="/products?category=4" className="sub-link">Accessories</Link>
          <Link to="/products" className="sub-link deal-link">⚡ Today&apos;s Super Deals</Link>
          <Link to="/orders" className="sub-link">Customer Service</Link>

          {isAuthenticated && (
            <button className="sub-logout-btn" onClick={logout}>
              Sign Out
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
