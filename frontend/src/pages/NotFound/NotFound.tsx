import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import './NotFound.css';

export const NotFound: React.FC = () => {
  return (
    <div className="container not-found-page">
      <div className="not-found-card">
        <h1>404</h1>
        <h2>Looking for something?</h2>
        <p>We&apos;re sorry. The Web address you entered is not a functioning page on our site.</p>
        <Link to="/" className="btn-primary">
          <Home size={18} /> Go to NexStore&apos;s Home Page
        </Link>
      </div>
    </div>
  );
};
