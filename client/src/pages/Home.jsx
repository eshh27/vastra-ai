import React from 'react';
import Promotions from '../components/Promotions';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import Footer from '../components/Footer';

function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
      <Promotions />
      <Navbar />
      <main style={{ flex: 1 }}>
        <Hero />
        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
}

export default Home;