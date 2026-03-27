import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();
  return (
    <div style={{
      position: 'relative',
      height: '88vh',
      width: '100%',
      // High-end minimalist luxury fashion image
      backgroundImage: 'url("https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop")',
      backgroundSize: 'cover',
      backgroundPosition: 'center 30%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      {/* Dark Overlay for text readability */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.15) 100%)'
      }} />

      {/* Hero Content */}
      <div style={{
        position: 'relative', zIndex: 10, textAlign: 'center', color: '#fff',
        padding: '0 20px', maxWidth: '850px',
        animation: 'fadeInUp 1s ease-out forwards'
      }}>
        <p style={{ fontSize: '14px', letterSpacing: '5px', textTransform: 'uppercase', marginBottom: '20px', fontWeight: 600 }}>
          The Summer Edit 2026
        </p>
        <h1 style={{ fontSize: '84px', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1.05, marginBottom: '35px', fontFamily: 'var(--font-heading)' }}>
          Future of Fashion.
        </h1>
        <p style={{ fontSize: '18px', lineHeight: 1.6, color: '#f0f0f0', marginBottom: '40px', fontWeight: 400, maxWidth: '600px', margin: '0 auto 40px' }}>
          Experience our AI-powered dressing room. Try on luxury styles in real-time or customize garments in our 3D interactive studio.
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button style={{
            padding: '18px 45px', background: '#fff', color: '#000', border: 'none', borderRadius: '30px',
            fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => { e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)' }}
          onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)' }}
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            Explore Collection
          </button>
          <button onClick={() => navigate('/customization')} style={{
            padding: '18px 45px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)',
            borderRadius: '30px', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.25)'; e.target.style.transform = 'translateY(-3px)'; border = '1px solid rgba(255,255,255,0.8)' }}
          onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.transform = 'translateY(0)'; border = '1px solid rgba(255,255,255,0.4)' }}
          >
            Try Virtual Room
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
