import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={scrolled ? 'glass' : ''} style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 50px',
      transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
    }}>
      {/* Logo */}
      <div 
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
      >
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 900, letterSpacing: '5px' }}>VASTRAVERSE</h1>
      </div>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
        {['New Arrivals', 'Women', 'Men', 'Beauty'].map(item => (
          <a key={item} style={{
            fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px',
            color: '#111', cursor: 'pointer', borderBottom: '2px solid transparent', transition: '0.2s', paddingBottom: '4px'
          }}
          onMouseEnter={(e) => e.target.style.borderBottom = '2px solid #111'}
          onMouseLeave={(e) => e.target.style.borderBottom = '2px solid transparent'}
          >
            {item}
          </a>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginRight: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Hey, {user.name.split(' ')[0]}</span>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#000'} onMouseLeave={e=>e.target.style.color='#666'}>Logout</button>
          </div>
        ) : (
          <button onClick={() => navigate('/login')} style={{
            padding: '10px 20px', background: 'transparent', color: '#111', border: 'none',
            fontWeight: '800', fontSize: '13px', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase',
            transition: 'opacity 0.2s', marginRight: '5px'
          }}
          onMouseEnter={e => e.target.style.opacity = '0.6'}
          onMouseLeave={e => e.target.style.opacity = '1'}
          >
            Sign In
          </button>
        )}
        
        <button onClick={() => navigate('/customization')} style={{
          padding: '12px 24px', background: '#000', color: '#fff', border: 'none', borderRadius: '30px',
          fontWeight: '700', fontSize: '12px', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase',
          boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s'
        }}
        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        >
          ✨ 3D STUDIO
        </button>
        <button onClick={() => navigate('/demos')} style={{
          padding: '10px 20px', background: 'transparent', color: '#000', border: '2px solid #111', borderRadius: '30px',
          fontWeight: '700', fontSize: '12px', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase',
          transition: 'all 0.2s'
        }}
        onMouseEnter={e => { e.target.style.background = '#111'; e.target.style.color = '#fff'; }}
        onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#111'; }}
        >
          Community
        </button>
        <button onClick={() => navigate('/cart')} style={{
          padding: '10px 20px', background: '#fff', color: '#000', border: '2px solid transparent', borderRadius: '30px',
          fontWeight: '700', fontSize: '13px', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase',
          boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
        }}
        onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { e.target.style.transform = 'translateY(0)' }}
        >
          🛍️ Bag ({totalItems})
        </button>
      </div>
    </nav>
  );
}
