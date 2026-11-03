import React from 'react';
import { Navbar } from './components/Navbar/Navbar';
import { Footer } from './components/Footer/Footer';
import { AppRoutes } from './routes/AppRoutes';

const App: React.FC = () => {
  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="main-content">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
};

export default App;
