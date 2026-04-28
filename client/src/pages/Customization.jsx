import React, { useState, Suspense, useEffect, useMemo, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import TryOnOverlay from '../components/TryOnOverlay';

const GARMENT_MODELS = [
  { id: 'tshirt',      name: 'T-Shirt',      file: '/models/tshirt.glb',        basePrice: 1499 },
  { id: 'dress',       name: 'Dress',         file: '/models/dress.glb',         basePrice: 2999 },
  { id: 'kurti',       name: 'Kurti',         file: '/models/kurti.glb',         basePrice: 2099 },
  { id: 'hoodie',      name: 'Hoodie',        file: '/models/hoodie.glb',        basePrice: 2499 },
  { id: 'long-dress',  name: 'Long Dress',    file: '/models/long dress.glb',    basePrice: 3499 },
  { id: 'saree',       name: 'Saree',         file: '/models/saree.glb',         basePrice: 3999 },
  { id: 'sharara',     name: 'Sharara',       file: '/models/sharara.glb',       basePrice: 3299 },
  { id: 'short-kurti', name: 'Short Kurti',   file: '/models/short-kurti.glb',   basePrice: 1899 },
];

const PRINTS = [
  { id: 'none',    name: 'Solid Color',  file: null },
  { id: 'animal',  name: 'Animal Print', file: '/prints/animal.png' },
  { id: 'floral',  name: 'Floral Print', file: '/prints/floral.png' },
  { id: 'paisley', name: 'Paisley',      file: '/prints/paisley.png' },
  { id: 'plaid',   name: 'Plaid',        file: '/prints/plaid.png' },
  { id: 'polka',   name: 'Polka Dots',   file: '/prints/polka.png' },
];

/* ── Garment Scene ─────────────────────────────────────────────────── */
function GarmentScene({ modelUrl, color, textureUrl, rotation = [0, 0, 0] }) {
  const { scene } = useGLTF(modelUrl);
  const [printTex, setPrintTex] = useState(null);

  useEffect(() => {
    let alive = true;
    if (textureUrl) {
      new THREE.TextureLoader().load(textureUrl, (t) => {
        if (!alive) return;
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(4, 4);
        t.colorSpace = THREE.SRGBColorSpace;
        setPrintTex(t);
      });
    } else setPrintTex(null);
    return () => { alive = false; };
  }, [textureUrl]);

  const baseScene = useMemo(() => {
    const c = scene.clone(true);
    c.traverse(ch => {
      if (ch.isMesh && color !== 'original') {
        ch.material = ch.material.clone();
        ch.material.color = new THREE.Color(color);
      }
    });
    return c;
  }, [scene, color]);

  const printScene = useMemo(() => {
    if (!printTex) return null;
    const c = scene.clone(true);
    c.traverse(ch => {
      if (ch.isMesh) {
        ch.material = ch.material.clone();
        ch.material.map = printTex;
        ch.material.color = new THREE.Color('#fff');
        ch.material.transparent = true;
        ch.material.polygonOffset = true;
        ch.material.polygonOffsetFactor = -1;
        ch.material.polygonOffsetUnits = -1;
      }
    });
    return c;
  }, [scene, printTex]);

  return (
    <group position={[0, -0.2, 0]} scale={1.8} rotation={rotation}>
      <primitive object={baseScene} />
      {printScene && <primitive object={printScene} />}
    </group>
  );
}

/* ── Virtual Try-On Panel — Gemini AI ─────────────────────────────── */

/* ── Main Customization Page ────────────────────────────────────────── */
export default function Customization() {
  const navigate      = useNavigate();
  const location      = useLocation();
  const preset        = location.state?.preset;
  const { addToCart } = useCart();

  const [selectedGarment, setSelectedGarment] = useState(
    preset ? (GARMENT_MODELS.find(g => g.id === preset.garmentId) || GARMENT_MODELS[0]) : GARMENT_MODELS[0]
  );
  const [selectedColor, setSelectedColor] = useState(preset?.color || 'original');
  const [selectedPrint, setSelectedPrint] = useState(
    preset ? (PRINTS.find(p => p.id === preset.printId) || PRINTS[0]) : PRINTS[0]
  );
  const [saving, setSaving] = useState(false);

  // Try-On state
  const [tryOnOpen,       setTryOnOpen]       = useState(false);
  const [garmentSnapshot, setGarmentSnapshot] = useState(null);
  const [isCapturing,     setIsCapturing]     = useState(false);

  const handleOpenTryOn = useCallback(() => {
    setIsCapturing(true);
    // Short timeout to allow R3F to render a frame without the white background
    setTimeout(() => {
      const canvasEl = document.querySelector('#vastra-3d canvas');
      if (canvasEl) {
        try {
          // By not filling with white and using PNG, we get transparency
          const off = document.createElement('canvas');
          off.width  = canvasEl.width;
          off.height = canvasEl.height;
          const ctx  = off.getContext('2d');
          ctx.drawImage(canvasEl, 0, 0);
          setGarmentSnapshot(off.toDataURL('image/png'));
        } catch (e) {
          console.warn('Snapshot failed', e);
          setGarmentSnapshot(null);
        }
      }
      setIsCapturing(false);
      setTryOnOpen(true);
    }, 50);
  }, []);

  let totalPrice = selectedGarment.basePrice;
  if (selectedPrint.id !== 'none') totalPrice += 500;

  const handleSave = async () => {
    setSaving(true);
    try {
      const canvasEl = document.querySelector('#vastra-3d canvas');
      const snapshot = canvasEl ? canvasEl.toDataURL('image/jpeg', 0.8) : null;
      await axios.post('http://localhost:5000/demos', {
        garmentId: selectedGarment.id,   garmentName: selectedGarment.name,
        color:     selectedColor,        printId:     selectedPrint.id,
        printName: selectedPrint.name,   price:       totalPrice,
        image:     snapshot,
      });
      alert('Design saved!');
      navigate('/demos');
    } catch (error) {
      alert(error.message === 'Network Error'
        ? 'Cannot connect to backend. Make sure the server is running on port 5000.'
        : 'Failed to save design.'
      );
      console.error(error);
    } finally { setSaving(false); }
  };

  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:'serif', background:'#FAF8F6', overflow:'hidden' }}>
      <style>{`
        @keyframes tryonBadgePulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        .tryon-btn:hover { transform:translateY(-1px); }
      `}</style>

      {/* ── 3D Canvas ── */}
      <div style={{ flex:1, position:'relative' }}>
        <div id="vastra-3d" style={{ width:'100%', height:'100%' }}>
          <Canvas gl={{ preserveDrawingBuffer: true, alpha: true }} camera={{ position:[0,0,4.5], fov:45 }}>
            {!isCapturing && <color attach="background" args={['#ffffff']} />}
            <ambientLight intensity={0.6} />
            <spotLight position={[10,10,10]} angle={0.2} penumbra={1} intensity={1.5} castShadow />
            <Environment preset="city" />
            <Suspense fallback={null}>
              <GarmentScene
                modelUrl={selectedGarment.file}
                color={selectedColor}
                textureUrl={selectedPrint.file}
                rotation={[0, -Math.PI / 2, 0]}
              />
              {!isCapturing && <ContactShadows position={[0,-1.2,0]} opacity={0.5} scale={10} blur={2} far={4} />}
            </Suspense>
            <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI/1.5} />
          </Canvas>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          style={{ position:'absolute', top:30, left:30, zIndex:10, background:'#fff', color:'#000', border:'1px solid #ddd', padding:'10px 18px', borderRadius:'30px', cursor:'pointer', fontWeight:'bold', fontSize:'12px', letterSpacing:'1px', textTransform:'uppercase', display:'flex', alignItems:'center', gap:'8px', transition:'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background='#111'; e.currentTarget.style.color='#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.color='#000'; }}
        >
          ← Home
        </button>

        {/* Studio label */}
        <div style={{ position:'absolute', top:85, left:30, background:'rgba(255,255,255,0.65)', backdropFilter:'blur(10px)', padding:'14px 22px', borderRadius:'18px', boxShadow:'0 8px 32px rgba(0,0,0,0.06)', pointerEvents:'none' }}>
          <h1 style={{ margin:0, letterSpacing:'4px', fontSize:'22px', fontWeight:800 }}>3D STUDIO</h1>
          <p style={{ margin:'6px 0 0', color:'#666', fontSize:'11px', letterSpacing:'1px' }}>Drag to rotate · Scroll to zoom</p>
        </div>

        {/* Try-On active badge */}
        {tryOnOpen && (
          <div style={{ position:'absolute', bottom:30, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg,#7c3aed,#ec4899)', color:'#fff', padding:'8px 22px', borderRadius:'30px', fontSize:'11px', letterSpacing:'2px', fontWeight:700, pointerEvents:'none', boxShadow:'0 8px 24px rgba(124,58,237,0.4)', animation:'tryonBadgePulse 2s ease-in-out infinite' }}>
            DESIGN CAPTURED — GEMINI READY
          </div>
        )}
      </div>

      {/* ── Sidebar ── */}
      <div style={{ width:'420px', background:'white', padding:'35px', boxShadow:'-10px 0 30px rgba(0,0,0,0.04)', overflowY:'auto', display:'flex', flexDirection:'column' }}>
        <h2 style={{ marginBottom:'35px', fontSize:'28px', fontWeight:800, letterSpacing:'1px' }}>Customize Fit</h2>

        {/* Step 1 — Garment */}
        <div style={{ marginBottom:'26px' }}>
          <h3 style={{ fontSize:'13px', textTransform:'uppercase', color:'#888', marginBottom:'10px' }}>1. Select Garment</h3>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            {GARMENT_MODELS.map(g => (
              <button key={g.id}
                onClick={() => { setSelectedGarment(g); setSelectedColor('original'); setSelectedPrint(PRINTS[0]); setTryOnOpen(false); setGarmentSnapshot(null); }}
                style={{ padding:'10px 15px', borderRadius:'20px', flex:'1 1 calc(50% - 10px)', cursor:'pointer', background:'none', border: selectedGarment.id===g.id ? '2px solid black' : '1px solid #ccc', fontWeight: selectedGarment.id===g.id ? 'bold' : 'normal' }}
              >
                {g.name} — ₹{g.basePrice}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — Color */}
        <div style={{ marginBottom:'26px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
            <h3 style={{ fontSize:'13px', textTransform:'uppercase', color:'#888', margin:0 }}>2. Base Color</h3>
            <span style={{ fontSize:'11px', color:'#333', background:'#f5f5f5', padding:'3px 8px', borderRadius:'8px' }}>
              {selectedColor === 'original' ? 'ORIGINAL' : selectedColor.toUpperCase()}
            </span>
          </div>
          <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
            <button
              onClick={() => setSelectedColor('original')}
              style={{ padding:'10px 15px', borderRadius:'10px', cursor:'pointer', background: selectedColor==='original' ? '#111' : '#f5f5f5', color: selectedColor==='original' ? '#fff' : '#333', border: selectedColor==='original' ? '2px solid black' : '1px solid #ccc', fontWeight:'bold', fontSize:'12px' }}
            >
              Remove Color
            </button>
            <input type="color" value={selectedColor==='original' ? '#ffffff' : selectedColor}
              onChange={e => setSelectedColor(e.target.value)}
              style={{ flex:1, height:'46px', border:'none', borderRadius:'10px', cursor:'pointer' }} />
          </div>
        </div>

        {/* Step 3 — Print */}
        <div style={{ marginBottom:'26px' }}>
          <h3 style={{ fontSize:'13px', textTransform:'uppercase', color:'#888', marginBottom:'10px' }}>3. Fabric Print (+₹500)</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
            {PRINTS.map(p => (
              <div key={p.id} onClick={() => setSelectedPrint(p)}
                style={{ border: selectedPrint.id===p.id ? '2px solid black' : '1px solid #eee', borderRadius:'8px', padding:'4px', cursor:'pointer', textAlign:'center', background: selectedPrint.id===p.id ? '#fafafa' : 'white' }}
              >
                {p.file
                  ? <img src={p.file} alt={p.name} style={{ width:'100%', aspectRatio:'1', objectFit:'cover', borderRadius:'4px' }} />
                  : <div style={{ width:'100%', aspectRatio:'1', background:'#f5f5f5', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:'11px' }}>None</span></div>
                }
                <p style={{ fontSize:'10px', margin:'4px 0 0', fontWeight:'bold', color:'#333' }}>{p.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 4 — Virtual Try-On */}
        <div style={{ marginBottom:'26px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
            <h3 style={{ fontSize:'13px', textTransform:'uppercase', color:'#888', margin:0 }}>4. Virtual Try-On</h3>
            <span style={{ fontSize:'9px', background:'linear-gradient(135deg,#7c3aed,#ec4899)', color:'#fff', padding:'2px 8px', borderRadius:'20px', letterSpacing:'1px', fontWeight:700 }}>GEMINI AI</span>
          </div>

          <button
            className="tryon-btn"
            onClick={tryOnOpen ? () => setTryOnOpen(false) : handleOpenTryOn}
            style={{
              width:'100%', padding:'15px', borderRadius:'30px', cursor:'pointer',
              background: tryOnOpen ? 'linear-gradient(135deg,#0f0c29,#1a1a2e)' : 'transparent',
              color: tryOnOpen ? '#fff' : '#000',
              border: tryOnOpen ? '1.5px solid rgba(124,58,237,0.45)' : '2px solid black',
              fontSize:'13px', letterSpacing:'2px', fontWeight:800,
              transition:'all 0.3s',
              boxShadow: tryOnOpen ? '0 4px 20px rgba(124,58,237,0.28)' : 'none',
            }}
          >
            {tryOnOpen ? '✕ CLOSE TRY-ON' : 'TRY IT ON YOURSELF'}
          </button>

          {tryOnOpen && (
            <TryOnOverlay
              garmentSnapshot={garmentSnapshot}
              onClose={() => setTryOnOpen(false)}
            />
          )}
        </div>

        {/* Price + Actions */}
        <div style={{ marginTop:'auto', borderTop:'2px solid #f5f5f5', paddingTop:'24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'22px' }}>
            <span style={{ fontSize:'13px', color:'#666', textTransform:'uppercase', letterSpacing:'1px' }}>Total Price</span>
            <span style={{ fontSize:'30px', fontWeight:'bold' }}>₹{totalPrice}</span>
          </div>
          <div style={{ display:'flex', gap:'12px', flexDirection:'column' }}>
            <button onClick={handleSave} disabled={saving}
              style={{ width:'100%', padding:'17px', borderRadius:'30px', background:'linear-gradient(135deg,#000,#333)', color:'#fff', border:'none', cursor: saving?'not-allowed':'pointer', fontSize:'13px', letterSpacing:'2px', fontWeight:'bold', boxShadow:'0 8px 20px rgba(0,0,0,0.15)' }}
            >
              {saving ? 'SAVING…' : 'SAVE TO DEMOS'}
            </button>
            <button
              onClick={() => {
                addToCart({
                  id: `custom-${selectedGarment.id}-${selectedColor.replace('#','')}-${selectedPrint.id}`,
                  name: `Custom ${selectedGarment.name}`,
                  price: totalPrice,
                  image: document.querySelector('#vastra-3d canvas')?.toDataURL('image/jpeg', 0.5) || '/garments/dress.jpeg',
                  size: 'One Size',
                  isCustom: true,
                  color: selectedColor==='original' ? null : selectedColor,
                  printName: selectedPrint.name,
                });
                alert('Custom design added to bag!');
                navigate('/cart');
              }}
              style={{ width:'100%', padding:'15px', borderRadius:'30px', background:'transparent', color:'#000', border:'2px solid black', cursor:'pointer', fontSize:'13px', letterSpacing:'2px', fontWeight:'bold', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background='#111'; e.currentTarget.style.color='#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#000'; }}
            >
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
