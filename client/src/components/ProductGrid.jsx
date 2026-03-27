import React from 'react';
import { useNavigate } from 'react-router-dom';

const products = [
  {id:1, name:"Luxury Dress", price:2999, image:"/public/garments/dress.jpeg"},
  {id:2, name:"Organza Saree", price:2699, image:"/public/garments/saree.jpeg"},
  {id:3, name:"Aesthetic Skirt", price:2199, image:"/public/garments/skirt.jpeg"},
  {id:4, name:"Korean Top", price:1999, image:"/public/garments/top.jpeg"},
  {id:5, name:"Denim Jacket", price:2599, image:"/public/garments/jacket.jpeg"},
  {id:6, name:"Cozy Sweater", price:2799, image:"/public/garments/sweater.jpeg"},
  {id:7, name:"Black Hoodie", price:2299, image:"/public/garments/hoodie.jpeg"},
  {id:8, name:"White Shirt", price:1899, image:"/public/garments/shirt.jpeg"},
  {id:9, name:"Wide Pants", price:2399, image:"/public/garments/pants.jpeg"},
  {id:10, name:"Soft Kurti", price:2099, image:"/public/garments/kurti.jpeg"},
  {id:11, name:"Co-ord Set", price:3999, image:"/public/garments/coordset.jpeg"},
  {id:12, name:"Beige Blazer", price:3499, image:"/public/garments/blazer.jpeg"},
];

export default function ProductGrid() {
  const navigate = useNavigate();

  return (
    <section style={{ padding: '100px 50px', maxWidth: '1400px', margin: '0 auto', background: 'var(--color-bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
        <div>
          <h2 style={{ fontSize: '42px', fontWeight: 800, margin: '0 0 10px 0', fontFamily: 'var(--font-heading)' }}>Trending Now</h2>
          <p style={{ color: 'var(--color-text-light)', fontSize: '18px', fontWeight: 400 }}>Handpicked selections from our latest arrivals.</p>
        </div>
        <button style={{ 
          background: 'none', border: 'none', borderBottom: '2px solid #000', 
          paddingBottom: '4px', fontWeight: '700', cursor: 'pointer', fontSize: '13px',
          textTransform: 'uppercase', letterSpacing: '1px', transition: 'opacity 0.2s',
          fontFamily: 'var(--font-heading)'
        }}
        onMouseEnter={e => e.target.style.opacity = '0.7'}
        onMouseLeave={e => e.target.style.opacity = '1'}
        >
          View All Models
        </button>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '40px'
      }}>
        {products.map(p => (
          <div 
            key={p.id}
            onClick={() => navigate("/product", {state:p})}
            className="hover-scale"
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', marginBottom: '20px', backgroundColor: '#e8e8e8', aspectRatio: '3/4', boxShadow: 'var(--shadow-sm)' }}>
              <img 
                src={p.image.replace('/public', '')} // Handling old /public/ path issues standard in Create React App/Vite
                alt={p.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop'; }}
              />
              <div 
                style={{
                  position: 'absolute', bottom: '20px', left: '20px', right: '20px',
                  background: 'rgba(255,255,255,0.95)', padding: '14px', borderRadius: '10px', 
                  textAlign: 'center', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px',
                  opacity: 0.9, transition: 'all 0.3s ease', boxShadow: 'var(--shadow-md)'
                }}
                onMouseEnter={e => { e.target.style.background = '#000'; e.target.style.color = '#fff'; }}
                onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.95)'; e.target.style.color = '#000'; }}
              >
                AI Try On
              </div>
            </div>
            <div style={{ padding: '0 5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', fontFamily: 'var(--font-heading)' }}>{p.name}</h3>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>₹{p.price}</span>
              </div>
              <p style={{ color: 'var(--color-text-light)', fontSize: '14px', fontWeight: 400 }}>Luxury Collection</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
