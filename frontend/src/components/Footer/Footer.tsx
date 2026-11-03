import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, CreditCard, ChevronUp } from 'lucide-react';
import './Footer.css';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="commercial-footer">
      {/* Back to top button */}
      <button className="back-to-top-btn" onClick={scrollToTop}>
        Back to top <ChevronUp size={16} />
      </button>

      {/* Trust Badges Bar */}
      <div className="footer-trust-strip">
        <div className="container trust-container">
          <div className="trust-item">
            <Truck size={24} />
            <div>
              <strong>Free & Fast Delivery</strong>
              <span>On millions of eligible items</span>
            </div>
          </div>
          <div className="trust-item">
            <RotateCcw size={24} />
            <div>
              <strong>Easy 7-Day Returns</strong>
              <span>Hassle-free refunds & doorstep pickup</span>
            </div>
          </div>
          <div className="trust-item">
            <ShieldCheck size={24} />
            <div>
              <strong>100% Purchase Protection</strong>
              <span>Genuine products & secured packaging</span>
            </div>
          </div>
          <div className="trust-item">
            <CreditCard size={24} />
            <div>
              <strong>Secure Payment Methods</strong>
              <span>UPI, Cards, Net Banking & COD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-column Navigation */}
      <div className="container footer-columns-wrapper">
        <div className="footer-nav-col">
          <h3>Get to Know Us</h3>
          <ul>
            <li><Link to="/products">About NexStore</Link></li>
            <li><Link to="/products">Careers</Link></li>
            <li><Link to="/products">Press Releases</Link></li>
            <li><Link to="/products">NexStore Science</Link></li>
          </ul>
        </div>

        <div className="footer-nav-col">
          <h3>Connect with Us</h3>
          <ul>
            <li><a href="#facebook" target="_blank" rel="noreferrer">Facebook</a></li>
            <li><a href="#twitter" target="_blank" rel="noreferrer">Twitter</a></li>
            <li><a href="#instagram" target="_blank" rel="noreferrer">Instagram</a></li>
          </ul>
        </div>

        <div className="footer-nav-col">
          <h3>Make Money with Us</h3>
          <ul>
            <li><Link to="/products">Sell on NexStore</Link></li>
            <li><Link to="/products">Protect and Build Your Brand</Link></li>
            <li><Link to="/products">Fulfillment by NexStore</Link></li>
            <li><Link to="/products">Advertise Your Products</Link></li>
          </ul>
        </div>

        <div className="footer-nav-col">
          <h3>Let Us Help You</h3>
          <ul>
            <li><Link to="/profile">Your Account</Link></li>
            <li><Link to="/orders">Returns Centre</Link></li>
            <li><Link to="/orders">100% Purchase Protection</Link></li>
            <li><Link to="/orders">Help & Customer Support</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal & Payment Icons */}
      <div className="footer-bottom-bar">
        <div className="container bottom-content">
          <div className="footer-brand-center">
            <span className="brand-logo">Nex<span className="yellow-dot">Store</span></span>
            <div className="payment-badges">
              <span>VISA</span>
              <span>Mastercard</span>
              <span>RuPay</span>
              <span>UPI</span>
              <span>NetBanking</span>
            </div>
          </div>
          <p className="copyright-line">
            © {new Date().getFullYear()}, NexStore.in, Inc. or its affiliates. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
