import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      background: '#0d0d0d', color: '#fff', padding: '90px 50px 40px', fontFamily: 'var(--font-body)'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '60px' }}>
        
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '4px', marginBottom: '25px', fontFamily: 'var(--font-heading)' }}>VASTRAVERSE</h2>
          <p style={{ color: '#888', fontSize: '15px', lineHeight: 1.7, marginBottom: '30px', fontWeight: 400 }}>
            Redefining the online shopping experience. Step into the future of fashion with our AI virtual try-ons and real-time 3D interactive studio.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            {['Instagram', 'Twitter', 'Pinterest'].map(platform => (
              <div key={platform} style={{ 
                padding: '8px 16px', borderRadius: '30px', background: '#1a1a1a', border: '1px solid #333',
                fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '1px'
              }}
              onMouseEnter={e => { e.target.style.background = '#fff'; e.target.style.color = '#000'; }}
              onMouseLeave={e => { e.target.style.background = '#1a1a1a'; e.target.style.color = '#fff'; }}
              >
                {platform}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '2px', color: '#fff' }}>Collections</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#888', fontSize: '15px', display: 'flex', flexDirection: 'column', gap: '15px', fontWeight: 400 }}>
            {['New Arrivals', 'Women\'s Fashion', 'Men\'s Collection', 'Virtual 3D Studio', 'Sale - 50% Off'].map(item => (
              <li key={item} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='#fff'} onMouseLeave={e => e.target.style.color='#888'}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '2px', color: '#fff' }}>Support</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#888', fontSize: '15px', display: 'flex', flexDirection: 'column', gap: '15px', fontWeight: 400 }}>
            {['Track Order', 'Returns & Exchanges', 'Shipping Info', 'Size Guide', 'Contact Us'].map(item => (
              <li key={item} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='#fff'} onMouseLeave={e => e.target.style.color='#888'}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '2px', color: '#fff' }}>Newsletter</h4>
          <p style={{ color: '#888', fontSize: '15px', marginBottom: '20px', lineHeight: 1.6 }}>Subscribe to get 10% off your first order and exclusive updates.</p>
          <div style={{ display: 'flex' }}>
            <input type="email" placeholder="Email address" style={{ 
              padding: '16px 20px', border: '1px solid #333', outline: 'none', background: '#0a0a0a', 
              color: '#fff', borderRadius: '8px 0 0 8px', width: '100%', fontSize: '14px', fontFamily: 'inherit' 
            }} />
            <button style={{ 
              padding: '16px 25px', background: '#fff', color: '#000', border: 'none', fontWeight: 'bold', 
              cursor: 'pointer', borderRadius: '0 8px 8px 0', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px' 
            }}>Join</button>
          </div>
        </div>

      </div>
      <div style={{ borderTop: '1px solid #222', marginTop: '80px', paddingTop: '30px', color: '#666', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p>© 2026 Vastraverse. Built with ❤️ for the future of fashion.</p>
        <div style={{ display: 'flex', gap: '30px' }}>
          <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
          <span style={{ cursor: 'pointer' }}>Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}
