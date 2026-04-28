import React, { useState, useEffect } from 'react';
import Promotions from '../components/Promotions';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user, loading } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);

  useEffect(() => {
    // Show pop up if user is not authenticated and hasn't seen it yet
    if (!loading && !user) {
      const hasSeenPopup = sessionStorage.getItem('hasSeenLoginPopup');
      if (!hasSeenPopup) {
        // Small delay to make it feel less jarring
        const timer = setTimeout(() => {
          setShowSignInModal(true);
          sessionStorage.setItem('hasSeenLoginPopup', 'true');
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, loading]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
      <Promotions />
      <Navbar />
      <main style={{ flex: 1 }}>
        <Hero />
        <ProductGrid />
      </main>
      <Footer />
      <LoginModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} />
    </div>
  );
}

export default Home;