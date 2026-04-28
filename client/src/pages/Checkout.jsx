import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

/* ──────────────────────────────────────────────
   Tiny helpers
────────────────────────────────────────────── */
const field = (label, id, type = 'text', placeholder = '', maxLen) => ({ label, id, type, placeholder, maxLen });

const SHIPPING_FIELDS = [
  field('Full Name', 'name', 'text', 'Aria Sharma'),
  field('Email Address', 'email', 'email', 'aria@example.com'),
  field('Phone Number', 'phone', 'tel', '+91 98765 43210'),
  field('Street Address', 'address', 'text', '42 MG Road, Bandra West'),
  field('City', 'city', 'text', 'Mumbai'),
  field('PIN Code', 'pin', 'text', '400050', 6),
];

function formatCardNumber(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(val) {
  const clean = val.replace(/\D/g, '').slice(0, 4);
  return clean.length > 2 ? clean.slice(0, 2) + '/' + clean.slice(2) : clean;
}

/* ──────────────────────────────────────────────
   Styled sub-components (inline styles only)
────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8f6f3 0%, #ede9e4 100%)',
    fontFamily: 'var(--font-body)',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '60px 24px 80px',
    display: 'flex',
    gap: '40px',
    alignItems: 'flex-start',
  },
  left: { flex: 1, minWidth: 0 },
  right: {
    width: '320px',
    flexShrink: 0,
    background: '#fff',
    borderRadius: '20px',
    padding: '28px',
    boxShadow: 'var(--shadow-md)',
    position: 'sticky',
    top: '100px',
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: 'var(--shadow-md)',
    marginBottom: '24px',
  },
  stepBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
    marginBottom: '40px',
    background: '#fff',
    borderRadius: '16px',
    padding: '16px 24px',
    boxShadow: 'var(--shadow-sm)',
  },
  input: {
    width: '100%',
    padding: '13px 16px',
    borderRadius: '10px',
    border: '1.5px solid #e0dbd4',
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
    background: '#faf9f7',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    color: '#1a1a1a',
    letterSpacing: '0.3px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: '#888',
    marginBottom: '7px',
  },
  primaryBtn: {
    width: '100%',
    padding: '16px',
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: '40px',
    fontWeight: 700,
    fontSize: '14px',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
    boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
    marginTop: '8px',
  },
  ghostBtn: {
    width: '100%',
    padding: '14px',
    background: 'transparent',
    color: '#555',
    border: '1.5px solid #ddd',
    borderRadius: '40px',
    fontWeight: 600,
    fontSize: '13px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    marginTop: '12px',
    transition: 'background 0.2s',
  },
};

/* ──────────────────────────────────────────────
   Step indicator
────────────────────────────────────────────── */
function StepIndicator({ step }) {
  const steps = ['Shipping', 'Payment', 'Confirm'];
  return (
    <div style={styles.stepBar}>
      {steps.map((s, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: done ? '#4caf50' : active ? '#111' : '#e0dbd4',
                color: done || active ? '#fff' : '#aaa',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 800, transition: 'background 0.3s',
                flexShrink: 0,
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: '13px', fontWeight: active ? 700 : 500,
                color: active ? '#111' : done ? '#4caf50' : '#aaa',
                letterSpacing: '0.3px',
              }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: '2px', background: done ? '#4caf50' : '#e0dbd4', margin: '0 12px', transition: 'background 0.3s' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Order Summary sidebar
────────────────────────────────────────────── */
function OrderSummary({ cartItems, totalPrice }) {
  const tax = Math.floor(totalPrice * 0.05);
  return (
    <div style={styles.right}>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 800, marginBottom: '22px', color: '#111' }}>
        Order Summary
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
        {cartItems.map(item => (
          <div key={item.cartId} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px', height: '54px', borderRadius: '8px', background: '#f5f5f5',
              flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {item.image
                ? <img src={item.image.replace('/public', '')} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ fontSize: '11px', color: '#ccc' }}>No Image</div>
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>Qty {item.quantity} · {item.size}</div>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', flexShrink: 0 }}>₹{item.price * item.quantity}</div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1.5px solid #f0ece7', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[['Subtotal', `₹${totalPrice}`], ['Shipping', 'Free', '#4caf50'], ['Tax (5%)', `₹${tax}`]].map(([k, v, c]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666' }}>
            <span>{k}</span><span style={{ fontWeight: 600, color: c || '#111' }}>{v}</span>
          </div>
        ))}
        <div style={{ borderTop: '1.5px solid #f0ece7', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '17px' }}>
          <span>Total</span><span>₹{totalPrice + tax}</span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Step 1 — Shipping
────────────────────────────────────────────── */
function ShippingStep({ data, setData, onNext }) {
  const [focused, setFocused] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.name?.trim()) e.name = 'Required';
    if (!data.email?.includes('@')) e.email = 'Valid email required';
    if (!data.phone?.trim()) e.phone = 'Required';
    if (!data.address?.trim()) e.address = 'Required';
    if (!data.city?.trim()) e.city = 'Required';
    if (!data.pin || data.pin.length < 6) e.pin = '6-digit PIN required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div style={styles.card}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 800, marginBottom: '28px', color: '#111' }}>
        Shipping Details
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
        {SHIPPING_FIELDS.map(f => (
          <div key={f.id} style={{ gridColumn: ['address', 'name', 'email'].includes(f.id) ? 'span 2' : 'span 1' }}>
            <label style={styles.label}>{f.label}</label>
            <input
              id={`ship-${f.id}`}
              type={f.type}
              placeholder={f.placeholder}
              maxLength={f.maxLen}
              value={data[f.id] || ''}
              onChange={e => setData(d => ({ ...d, [f.id]: e.target.value }))}
              onFocus={() => setFocused(f.id)}
              onBlur={() => setFocused('')}
              style={{
                ...styles.input,
                borderColor: errors[f.id] ? '#e53935' : focused === f.id ? '#111' : '#e0dbd4',
                boxShadow: focused === f.id ? '0 0 0 3px rgba(0,0,0,0.07)' : 'none',
              }}
            />
            {errors[f.id] && <p style={{ color: '#e53935', fontSize: '11px', marginTop: '4px' }}>{errors[f.id]}</p>}
          </div>
        ))}
      </div>
      <button
        style={styles.primaryBtn}
        onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 10px 28px rgba(0,0,0,0.22)'; }}
        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.18)'; }}
        onClick={() => { if (validate()) onNext(); }}
      >
        Continue to Payment →
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Step 2 — Payment
────────────────────────────────────────────── */
const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: '' },
  { id: 'upi', label: 'UPI / Wallet', icon: '' },
  { id: 'cod', label: 'Cash on Delivery', icon: '' },
];

function CardForm({ card, setCard }) {
  const [focused, setFocused] = useState('');
  const fields = [
    { id: 'number', label: 'Card Number', placeholder: '4242 4242 4242 4242', span: 2 },
    { id: 'expiry', label: 'Expiry (MM/YY)', placeholder: '12/28', span: 1 },
    { id: 'cvv', label: 'CVV', placeholder: '•••', span: 1, type: 'password' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
      {fields.map(f => (
        <div key={f.id} style={{ gridColumn: f.span === 2 ? 'span 2' : 'span 1' }}>
          <label style={styles.label}>{f.label}</label>
          <input
            id={`card-${f.id}`}
            type={f.type || 'text'}
            placeholder={f.placeholder}
            value={card[f.id] || ''}
            maxLength={f.id === 'cvv' ? 4 : undefined}
            onChange={e => {
              let v = e.target.value;
              if (f.id === 'number') v = formatCardNumber(v);
              if (f.id === 'expiry') v = formatExpiry(v);
              setCard(c => ({ ...c, [f.id]: v }));
            }}
            onFocus={() => setFocused(f.id)}
            onBlur={() => setFocused('')}
            style={{
              ...styles.input,
              letterSpacing: f.id === 'number' ? '2px' : f.id === 'cvv' ? '4px' : '0.3px',
              borderColor: focused === f.id ? '#111' : '#e0dbd4',
              boxShadow: focused === f.id ? '0 0 0 3px rgba(0,0,0,0.07)' : 'none',
            }}
          />
        </div>
      ))}
    </div>
  );
}

function UpiForm({ upi, setUpi }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginTop: '16px' }}>
      <label style={styles.label}>UPI ID</label>
      <input
        id="upi-id"
        type="text"
        placeholder="yourname@upi"
        value={upi}
        onChange={e => setUpi(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...styles.input,
          borderColor: focused ? '#111' : '#e0dbd4',
          boxShadow: focused ? '0 0 0 3px rgba(0,0,0,0.07)' : 'none',
        }}
      />
      <p style={{ fontSize: '12px', color: '#aaa', marginTop: '8px' }}>e.g. name@okaxis, name@ybl</p>
    </div>
  );
}

function PaymentStep({ totalPrice, onNext, onBack }) {
  const [method, setMethod] = useState('card');
  const [card, setCard] = useState({});
  const [upi, setUpi] = useState('');
  const tax = Math.floor(totalPrice * 0.05);
  const grand = totalPrice + tax;

  const validate = () => {
    if (method === 'card') {
      const num = (card.number || '').replace(/\s/g, '');
      if (num.length < 16) return alert('Please enter a valid 16-digit card number.');
      if (!(card.expiry || '').includes('/')) return alert('Enter expiry as MM/YY.');
      if ((card.cvv || '').length < 3) return alert('CVV must be 3-4 digits.');
    }
    if (method === 'upi' && !(upi || '').includes('@')) {
      return alert('Enter a valid UPI ID (e.g. name@upi).');
    }
    onNext({ method, card, upi });
  };

  return (
    <div style={styles.card}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 800, marginBottom: '24px', color: '#111' }}>
        💳 Payment
      </h2>

      {/* Method selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '8px' }}>
        {PAYMENT_METHODS.map(pm => (
          <label key={pm.id} style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '14px 18px', borderRadius: '12px', cursor: 'pointer',
            border: `1.5px solid ${method === pm.id ? '#111' : '#e0dbd4'}`,
            background: method === pm.id ? '#f5f5f5' : '#faf9f7',
            transition: 'all 0.15s',
          }}>
            <input
              type="radio" name="pm" value={pm.id} checked={method === pm.id}
              onChange={() => setMethod(pm.id)}
              style={{ accentColor: '#111', width: '16px', height: '16px' }}
            />
            <span style={{ fontSize: '18px' }}>{pm.icon}</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#222' }}>{pm.label}</span>
            {pm.id === 'card' && method === 'card' && (
              <span style={{
                marginLeft: 'auto', fontSize: '11px', padding: '3px 8px',
                background: '#111', color: '#fff', borderRadius: '20px', fontWeight: 700,
              }}>Recommended</span>
            )}
          </label>
        ))}
      </div>

      {/* Dynamic form */}
      {method === 'card' && <CardForm card={card} setCard={setCard} />}
      {method === 'upi' && <UpiForm upi={upi} setUpi={setUpi} />}
      {method === 'cod' && (
        <div style={{
          marginTop: '16px', padding: '18px', background: '#fffde7', borderRadius: '12px',
          border: '1.5px solid #ffe082', fontSize: '13px', color: '#555', lineHeight: '1.7',
        }}>
          You'll pay <strong>₹{grand}</strong> in cash when your order is delivered. A ₹30 COD fee may apply.
        </div>
      )}

      {/* SSL badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px', marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', color: '#aaa', letterSpacing: '0.3px' }}>
          256-bit SSL encryption · Your payment info is never stored
        </span>
      </div>

      <button
        style={styles.primaryBtn}
        onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 10px 28px rgba(0,0,0,0.22)'; }}
        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.18)'; }}
        onClick={validate}
      >
        {method === 'cod' ? 'Place Order →' : `Pay ₹${grand} →`}
      </button>
      <button style={styles.ghostBtn} onClick={onBack}
        onMouseEnter={e => e.target.style.background = '#f5f5f5'}
        onMouseLeave={e => e.target.style.background = 'transparent'}
      >← Back to Shipping</button>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Step 3 — Processing → Confirmation
────────────────────────────────────────────── */
function ConfirmStep({ shipping, payment, totalPrice, onDone }) {
  const [processing, setProcessing] = useState(true);
  const [orderId] = useState('VV-' + Date.now().toString(36).toUpperCase().slice(-8));
  const tax = Math.floor(totalPrice * 0.05);

  useEffect(() => {
    const t = setTimeout(() => setProcessing(false), 2400);
    return () => clearTimeout(t);
  }, []);

  if (processing) return (
    <div style={{ ...styles.card, textAlign: 'center', padding: '80px 40px' }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%', border: '4px solid #e0dbd4',
        borderTopColor: '#111', animation: 'spin 0.8s linear infinite',
        margin: '0 auto 28px',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', marginBottom: '10px' }}>Processing your payment…</h3>
      <p style={{ color: '#999', fontSize: '14px' }}>Please don't close this window.</p>
    </div>
  );

  return (
    <div style={{ ...styles.card, textAlign: 'center' }}>
      {/* Animated checkmark */}
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%', background: '#e8f5e9',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px', fontSize: '38px',
        animation: 'popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
      }}>
        ✓
      </div>
      <style>{`@keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 900, marginBottom: '10px', color: '#111' }}>
        Order Confirmed!
      </h2>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '28px' }}>
        Thank you, <strong>{shipping.name}</strong>! Your order is on its way.
      </p>

      {/* Order details box */}
      <div style={{
        background: '#faf9f7', borderRadius: '14px', padding: '22px 24px',
        textAlign: 'left', marginBottom: '28px', border: '1.5px solid #f0ece7',
      }}>
        {[
          ['Order ID', orderId],
          ['Email', shipping.email],
          ['Ship to', `${shipping.address}, ${shipping.city} – ${shipping.pin}`],
          ['Payment', payment.method === 'card' ? `Card ending ····${(payment.card?.number || '').replace(/\s/g, '').slice(-4)}` : payment.method === 'upi' ? `UPI · ${payment.upi}` : 'Cash on Delivery'],
          ['Total Paid', `₹${totalPrice + tax}`],
          ['Estimated Delivery', '3–5 business days'],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #ede9e4', fontSize: '13px' }}>
            <span style={{ color: '#888', fontWeight: 500 }}>{k}</span>
            <span style={{ fontWeight: 700, color: '#111', maxWidth: '55%', textAlign: 'right' }}>{v}</span>
          </div>
        ))}
      </div>

      <button
        style={{ ...styles.primaryBtn, width: 'auto', padding: '14px 40px', margin: '0 auto' }}
        onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 10px 28px rgba(0,0,0,0.22)'; }}
        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.18)'; }}
        onClick={onDone}
      >
        Continue Shopping
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main Checkout page
────────────────────────────────────────────── */
export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, totalPrice, clearCart } = useCart();

  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState({});
  const [payment, setPayment] = useState({});

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && step < 2) navigate('/cart');
  }, [cartItems]);

  const handleDone = () => {
    if (clearCart) clearCart();
    navigate('/');
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.left}>
          <StepIndicator step={step} />

          {step === 0 && (
            <ShippingStep
              data={shipping}
              setData={setShipping}
              onNext={() => setStep(1)}
            />
          )}
          {step === 1 && (
            <PaymentStep
              totalPrice={totalPrice}
              onNext={(pd) => { setPayment(pd); setStep(2); }}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <ConfirmStep
              shipping={shipping}
              payment={payment}
              totalPrice={totalPrice}
              onDone={handleDone}
            />
          )}
        </div>

        {step < 2 && (
          <OrderSummary cartItems={cartItems} totalPrice={totalPrice} />
        )}
      </div>
    </div>
  );
}
