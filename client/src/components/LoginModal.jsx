import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await axios.post('http://localhost:5000/api/login', { email, password });
      login(res.data.user, res.data.token);
      onClose(); // close the modal on successful login
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '450px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'var(--shadow-md)',
        animation: 'modalSlideIn 0.3s ease-out'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '15px', right: '15px', background: 'transparent',
            border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--color-text-light)',
            width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%', padding: 0
          }}
          onMouseEnter={e => e.target.style.background = '#f0f0f0'}
          onMouseLeave={e => e.target.style.background = 'transparent'}
        >
          &times;
        </button>

        <div style={{ padding: '40px' }}>
          <h2 style={{ fontSize:'28px', fontFamily:'var(--font-heading)', fontWeight:900, marginBottom:'10px', textAlign: 'center' }}>Welcome Back</h2>
          <p style={{ color:'var(--color-text-light)', marginBottom:'30px', fontSize: '14px', textAlign: 'center' }}>Sign in to access your bespoke wardrobe.</p>
          
          {error && <div style={{ padding:'12px', background:'#fee', color:'#d32f2f', borderRadius:'8px', marginBottom:'20px', fontSize:'13px', fontWeight:600 }}>{error}</div>}
          
          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'15px' }}>
            <div>
              <label style={{ display:'block', fontSize:'12px', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', marginBottom:'6px' }}>Email Address</label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                style={{ width:'100%', padding:'14px', border:'1px solid var(--color-border)', borderRadius:'8px', background:'#f9f9f9', fontSize:'14px', outline:'none', transition:'border 0.2s', fontFamily:'var(--font-body)' }} 
                onFocus={e=>e.target.style.border='1px solid #111'} onBlur={e=>e.target.style.border='1px solid var(--color-border)'}
              />
            </div>
            
            <div>
              <label style={{ display:'block', fontSize:'12px', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', marginBottom:'6px' }}>Password</label>
              <input type="password" required value={password} onChange={e=>setPassword(e.target.value)}
                style={{ width:'100%', padding:'14px', border:'1px solid var(--color-border)', borderRadius:'8px', background:'#f9f9f9', fontSize:'14px', outline:'none', transition:'border 0.2s', fontFamily:'var(--font-body)' }} 
                onFocus={e=>e.target.style.border='1px solid #111'} onBlur={e=>e.target.style.border='1px solid var(--color-border)'}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              marginTop:'10px', padding:'16px', background:'#111', color:'#fff', border:'none', borderRadius:'30px', cursor:loading?'not-allowed':'pointer',
              fontWeight:800, letterSpacing:'1px', textTransform:'uppercase', fontSize:'13px', transition:'background 0.2s'
            }} onMouseEnter={e=>{if(!loading)e.target.style.background='#333'}} onMouseLeave={e=>{if(!loading)e.target.style.background='#111'}}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <p style={{ marginTop:'20px', textAlign:'center', fontSize:'13px', color:'var(--color-text-light)' }}>
            Don't have an account? <span onClick={() => { onClose(); navigate('/signup'); }} style={{ color:'#111', fontWeight:700, borderBottom:'2px solid #111', paddingBottom:'2px', marginLeft: '5px', cursor: 'pointer' }}>Create one</span>
          </p>
        </div>
      </div>
      <style>
        {`
          @keyframes modalSlideIn {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}
      </style>
    </div>
  );
}
