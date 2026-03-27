import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
      <Navbar />
      
      <main style={{ flex: 1, padding: '60px 50px', maxWidth: '1300px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: '38px', fontWeight: 900, fontFamily: 'var(--font-heading)', marginBottom: '40px', letterSpacing: '1px' }}>Your Shopping Bag</h1>
        
        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', background: '#fff', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px', fontFamily: 'var(--font-heading)' }}>Your bag is empty</h2>
            <button onClick={() => navigate('/')} style={{
              padding: '16px 40px', background: '#111', color: '#fff', border: 'none', borderRadius: '30px', cursor: 'pointer',
              fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', transition: 'all 0.2s', fontSize: '13px'
            }}
            onMouseEnter={e => e.target.style.background = '#333'}
            onMouseLeave={e => e.target.style.background = '#111'}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '50px', alignItems: 'flex-start' }}>
            
            {/* Cart Items */}
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '25px' }}>
              {cartItems.map(item => (
                <div key={item.cartId} style={{ 
                  display: 'flex', gap: '30px', background: '#fff', padding: '25px', borderRadius: '20px', 
                  boxShadow: 'var(--shadow-sm)', alignItems: 'center', position: 'relative'
                }}>
                  <div style={{ width: '140px', height: '180px', background: '#f5f5f5', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                    {item.image ? (
                      <img src={item.image.replace('/public', '')} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>👕</div>
                    )}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{item.name}</h3>
                      <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>₹{item.price}</h3>
                    </div>
                    
                    <div style={{ color: 'var(--color-text-light)', fontSize: '14px', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {item.isCustom && <span style={{ color: '#c5a880', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Custom Design</span>}
                      <span>Size: <strong>{item.size}</strong></span>
                      {item.isCustom && item.printName && <span>Print: <strong>{item.printName}</strong></span>}
                      {item.isCustom && item.color && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                          Color: 
                          <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: item.color, border: '1px solid #ccc' }} />
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '25px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#f5f5f5', padding: '5px 10px', borderRadius: '20px' }}>
                        <button onClick={() => updateQuantity(item.cartId, -1)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '0 10px', color: '#555' }}>-</button>
                        <span style={{ fontWeight: 600, fontSize: '16px', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartId, 1)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '0 10px', color: '#555' }}>+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.cartId)} style={{ 
                        background: 'none', border: 'none', color: '#d32f2f', textDecoration: 'underline', 
                        cursor: 'pointer', fontSize: '13px', fontWeight: 600 
                      }}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Sidebar */}
            <div style={{ flex: 1, background: '#fff', padding: '35px', borderRadius: '20px', position: 'sticky', top: '120px', boxShadow: 'var(--shadow-md)' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-heading)', margin: '0 0 25px 0' }}>Order Summary</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#555', fontSize: '15px' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: '#111' }}>₹{totalPrice}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#555', fontSize: '15px' }}>
                <span>Shipping</span>
                <span style={{ fontWeight: 600, color: '#4caf50' }}>Free</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', color: '#555', fontSize: '15px' }}>
                <span>Estimated Tax</span>
                <span style={{ fontWeight: 600, color: '#111' }}>₹{Math.floor(totalPrice * 0.05)}</span>
              </div>
              
              <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '20px', fontWeight: 800 }}>
                <span>Total</span>
                <span>₹{totalPrice + Math.floor(totalPrice * 0.05)}</span>
              </div>
              
              <button style={{
                width: '100%', padding: '18px', background: '#000', color: '#fff', border: 'none', borderRadius: '30px', cursor: 'pointer',
                fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.2s', fontSize: '14px',
                boxShadow: '0 10px 20px rgba(0,0,0,0.15)'
              }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)' }}
              onClick={() => { alert('Proceeding to checkout sequence...'); navigate('/'); }}>
                Proceed to Checkout
              </button>
            </div>
            
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
