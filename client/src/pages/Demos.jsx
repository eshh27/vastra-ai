import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

export default function Demos() {
  const [demos, setDemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchDemos();
  }, []);

  const fetchDemos = async () => {
    try {
      const res = await axios.get('http://localhost:5000/demos');
      setDemos(res.data.reverse());
    } catch (error) {
      console.error('Failed to fetch demos:', error);
      if (error.message === 'Network Error') {
        alert('Network Error: The community gallery requires the backend Node.js server to be running on port 5000. It is currently offline.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
      <Navbar />
      
      <main style={{ flex: 1, padding: '80px 50px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: 900, fontFamily: 'var(--font-heading)', margin: '0 0 10px 0', letterSpacing: '1px' }}>Community Gallery</h1>
            <p style={{ color: 'var(--color-text-light)', fontSize: '18px', fontWeight: 400 }}>Discover bespoke styles created by our users.</p>
          </div>
          <button 
            onClick={() => navigate('/customization')}
            style={{ padding: '16px 35px', background: '#000', color: '#fff', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.target.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
          >
            Open 3D Studio
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '100px 0', textAlign: 'center', color: '#888', fontFamily: 'var(--font-heading)', fontSize: '20px' }}>Loading the archives...</div>
        ) : demos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', background: '#fff', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '26px', color: '#333', marginBottom: '15px', fontFamily: 'var(--font-heading)' }}>The gallery is currently empty</h2>
            <p style={{ color: '#888', fontSize: '16px' }}>Be the pioneer. Craft the first bespoke garment.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '40px' }}>
            {demos.map((demo) => (
              <div key={demo.id} style={{ position: 'relative' }}>
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', marginBottom: '20px', backgroundColor: '#e8e8e8', aspectRatio: '3/4', boxShadow: 'var(--shadow-sm)' }}>
                  {demo.image ? (
                    <img src={demo.image} alt={demo.garmentName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: demo.color !== 'original' && demo.color ? demo.color : '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {demo.printId !== 'none' && <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2px)', backgroundSize: '15px 15px' }} />}
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: 15, left: 15, background: 'rgba(255,255,255,0.9)', padding: '8px 16px', borderRadius: '30px', backdropFilter: 'blur(5px)', fontSize: '12px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', zIndex: 5, boxShadow: 'var(--shadow-sm)' }}>
                    Bespoke {demo.garmentName}
                  </div>
                  {demo.color !== 'original' && demo.color && (
                    <div style={{ position: 'absolute', bottom: 15, left: 15, width: '28px', height: '28px', borderRadius: '50%', background: demo.color, border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 5 }} title={`Color: ${demo.color}`} />
                  )}
                </div>
                
                <div style={{ padding: '0 5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', fontFamily: 'var(--font-heading)' }}>
                      {demo.printName !== 'Solid Color' ? demo.printName : `${demo.garmentName} Design`}
                    </h3>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>₹{demo.price}</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button 
                      onClick={() => navigate('/customization', { state: { preset: demo } })}
                      style={{ flex: 1, padding: '12px', background: '#f5f5f5', color: '#111', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.target.style.background = '#e0e0e0'}
                      onMouseLeave={e => e.target.style.background = '#f5f5f5'}
                    >
                      Remix Design
                    </button>
                    <button 
                      onClick={() => {
                        addToCart({
                          id: `community-${demo.id}`,
                          name: `Community ${demo.garmentName}`,
                          price: demo.price,
                          image: demo.image || null,
                          size: 'One Size',
                          isCustom: true,
                          color: demo.color === 'original' ? null : demo.color,
                          printName: demo.printName
                        });
                        alert('Added community design to bag!');
                      }}
                      style={{ flex: 1, padding: '12px', background: '#111', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.target.style.background = '#333'}
                      onMouseLeave={e => e.target.style.background = '#111'}
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
