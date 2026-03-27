import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await axios.post('http://localhost:5000/api/signup', { name, email, password });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'var(--color-bg)' }}>
      <Navbar />
      <div style={{ flex:1, display:'flex' }}>
        
        {/* Left Side: Signup Form */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'80px', background:'#fff', zIndex: 10 }}>
          <div style={{ maxWidth:'400px', width:'100%', margin:'0 auto' }}>
            <h2 style={{ fontSize:'36px', fontFamily:'var(--font-heading)', fontWeight:900, marginBottom:'10px' }}>Join Vastraverse</h2>
            <p style={{ color:'var(--color-text-light)', marginBottom:'40px', fontSize: '15px' }}>Create an account to save your customized bespoke designs.</p>
            
            {error && <div style={{ padding:'14px', background:'#fee', color:'#d32f2f', borderRadius:'8px', marginBottom:'20px', fontSize:'13px', fontWeight:600 }}>{error}</div>}
            
            <form onSubmit={handleSignup} style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
              <div>
                <label style={{ display:'block', fontSize:'12px', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', marginBottom:'8px' }}>Full Name</label>
                <input type="text" required value={name} onChange={e=>setName(e.target.value)}
                  style={{ width:'100%', padding:'16px', border:'1px solid var(--color-border)', borderRadius:'8px', background:'#f9f9f9', fontSize:'15px', outline:'none', transition:'border 0.2s', fontFamily:'var(--font-body)' }} 
                  onFocus={e=>e.target.style.border='1px solid #111'} onBlur={e=>e.target.style.border='1px solid var(--color-border)'}
                />
              </div>

              <div>
                <label style={{ display:'block', fontSize:'12px', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', marginBottom:'8px' }}>Email Address</label>
                <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                  style={{ width:'100%', padding:'16px', border:'1px solid var(--color-border)', borderRadius:'8px', background:'#f9f9f9', fontSize:'15px', outline:'none', transition:'border 0.2s', fontFamily:'var(--font-body)' }} 
                  onFocus={e=>e.target.style.border='1px solid #111'} onBlur={e=>e.target.style.border='1px solid var(--color-border)'}
                />
              </div>
              
              <div>
                <label style={{ display:'block', fontSize:'12px', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', marginBottom:'8px' }}>Password</label>
                <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} minLength="6"
                  style={{ width:'100%', padding:'16px', border:'1px solid var(--color-border)', borderRadius:'8px', background:'#f9f9f9', fontSize:'15px', outline:'none', transition:'border 0.2s', fontFamily:'var(--font-body)' }} 
                  onFocus={e=>e.target.style.border='1px solid #111'} onBlur={e=>e.target.style.border='1px solid var(--color-border)'}
                />
              </div>

              <button type="submit" disabled={loading} style={{
                marginTop:'15px', padding:'18px', background:'#111', color:'#fff', border:'none', borderRadius:'30px', cursor:loading?'not-allowed':'pointer',
                fontWeight:800, letterSpacing:'1px', textTransform:'uppercase', fontSize:'13px', transition:'background 0.2s'
              }} onMouseEnter={e=>{if(!loading)e.target.style.background='#333'}} onMouseLeave={e=>{if(!loading)e.target.style.background='#111'}}>
                {loading ? 'Creating Account...' : 'Continue'}
              </button>
            </form>
            
            <p style={{ marginTop:'30px', textAlign:'center', fontSize:'14px', color:'var(--color-text-light)' }}>
              Already have an account? <Link to="/login" style={{ color:'#111', fontWeight:700, borderBottom:'2px solid #111', paddingBottom:'2px', marginLeft: '5px' }}>Sign in here</Link>
            </p>
          </div>
        </div>

        {/* Right Side: Aesthetic Image */}
        <div style={{ flex:1, display: 'block', position:'relative' }}>
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
            alt="Fashion Signup" 
            style={{ width:'100%', height:'100%', objectFit:'cover', position: 'absolute', inset: 0 }} 
          />
        </div>
      </div>
    </div>
  );
}
