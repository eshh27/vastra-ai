import React from 'react';

export default function Promotions() {
  return (
    <div style={{
      background: '#111',
      color: '#fff',
      padding: '10px 20px',
      textAlign: 'center',
      fontSize: '11px',
      fontWeight: '600',
      letterSpacing: '1.5px',
      textTransform: 'uppercase',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '20px'
    }}>
      <span>✦ END OF REASON SALE</span>
      <span style={{opacity: 0.5}}>|</span>
      <span>FLAT 50% OFF ON PREMIUM GARMENTS</span>
      <span style={{opacity: 0.5}}>|</span>
      <span>FREE SHIPPING ON ALL ORDERS ✦</span>
    </div>
  );
}
