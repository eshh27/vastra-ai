import React, { useState, Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const GARMENT_MODELS = [
  { id: 'tshirt', name: 'T-Shirt', file: '/models/tshirt.glb', basePrice: 1499 },
  { id: 'dress', name: 'Dress', file: '/models/dress.glb', basePrice: 2999 },
  { id: 'kurti', name: 'Kurti', file: '/models/kurti.glb', basePrice: 2099 },
  { id: 'hoodie', name: 'Hoodie', file: '/models/hoodie.glb', basePrice: 2499 },
  { id: 'long-dress', name: 'Long Dress', file: '/models/long dress.glb', basePrice: 3499 },
  { id: 'saree', name: 'Saree', file: '/models/saree.glb', basePrice: 3999 },
  { id: 'sharara', name: 'Sharara', file: '/models/sharara.glb', basePrice: 3299 },
  { id: 'short-kurti', name: 'Short Kurti', file: '/models/short-kurti.glb', basePrice: 1899 }
];

const PRINTS = [
  { id: 'none', name: 'Solid Color', file: null },
  { id: 'animal', name: 'Animal Print', file: '/prints/animal.png' },
  { id: 'floral', name: 'Floral Print', file: '/prints/floral.png' },
  { id: 'paisley', name: 'Paisley', file: '/prints/paisley.png' },
  { id: 'plaid', name: 'Plaid', file: '/prints/plaid.png' },
  { id: 'polka', name: 'Polka Dots', file: '/prints/polka.png' },
];

/* ── Garment scene ─────────────────────────────────────────────────── */
function GarmentScene({
  modelUrl, color, textureUrl, rotation = [0, 0, 0]
}) {
  const { scene } = useGLTF(modelUrl);
  const groupRef = useRef();
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

/* ── Main page ──────────────────────────────────────────────────────── */
export default function Customization() {
  const navigate = useNavigate();
  const location = useLocation();
  const preset = location.state?.preset;
  const { addToCart } = useCart();
  
  const [selectedGarment, setSelectedGarment] = useState(
    preset ? (GARMENT_MODELS.find(g => g.id === preset.garmentId) || GARMENT_MODELS[0]) : GARMENT_MODELS[0]
  );
  const [selectedColor, setSelectedColor] = useState(preset?.color || 'original');
  const [selectedPrint, setSelectedPrint] = useState(
    preset ? (PRINTS.find(p => p.id === preset.printId) || PRINTS[0]) : PRINTS[0]
  );
  const [saving, setSaving] = useState(false);

  // strict-mode safe: no useEffect wiping presets!

  let totalPrice = selectedGarment.basePrice;
  if (selectedPrint.id !== 'none') totalPrice += 500;

  const handleSave = async () => {
    setSaving(true);
    try {
      const canvasWrapper = document.getElementById('3d-canvas');
      const canvas = canvasWrapper ? canvasWrapper.querySelector('canvas') : document.querySelector('canvas');
      const snapshot = canvas ? canvas.toDataURL('image/jpeg', 0.8) : null;

      await axios.post('http://localhost:5000/demos', {
        garmentId: selectedGarment.id, garmentName: selectedGarment.name,
        color: selectedColor, printId: selectedPrint.id, printName: selectedPrint.name, price: totalPrice,
        image: snapshot
      });
      alert('Design saved!'); navigate('/demos');
    } catch (error) { 
      if (error.message === 'Network Error') {
        alert('Network Error: Cannot connect to the backend server. Please make sure you have started the server in the `server` folder on port 5000!');
      } else {
        alert('Failed to save design.');
      }
      console.error(error);
    }
    finally { setSaving(false); }
  };

  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:'serif', background:'#FAF8F6', overflow:'hidden' }}>

      <div style={{ flex:1, position:'relative' }}>
        <Canvas id="3d-canvas" gl={{ preserveDrawingBuffer: true }} camera={{ position:[0,0,4.5], fov:45 }}>
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
            <ContactShadows position={[0,-1.2,0]} opacity={0.5} scale={10} blur={2} far={4} />
          </Suspense>
          <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI/1.5} />
        </Canvas>

        <button 
          onClick={() => navigate('/')}
          style={{ position:'absolute', top:30, left:30, zIndex:10, background:'#fff', color:'#000', border:'1px solid #ddd', padding:'10px 18px', borderRadius:'30px', cursor:'pointer', fontWeight:'bold', fontSize:'12px', letterSpacing:'1px', textTransform:'uppercase', display:'flex', alignItems:'center', gap:'8px', boxShadow:'var(--shadow-sm)', transition:'all 0.2s' }}
          onMouseEnter={e => { e.target.style.background = '#111'; e.target.style.color = '#fff' }}
          onMouseLeave={e => { e.target.style.background = '#fff'; e.target.style.color = '#000' }}
        >
          ← Home
        </button>

        <div style={{ position:'absolute', top:85, left:30, background:'rgba(255,255,255,0.65)', backdropFilter:'blur(10px)', padding:'14px 22px', borderRadius:'18px', boxShadow:'0 8px 32px rgba(0,0,0,0.06)', pointerEvents:'none' }}>
          <h1 style={{ margin:0, letterSpacing:'4px', fontSize:'22px', fontWeight:800 }}>3D STUDIO</h1>
          <p style={{ margin:'6px 0 0', color:'#666', fontSize:'11px', letterSpacing:'1px' }}>
            Drag to rotate · Scroll to zoom
          </p>
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ width:'420px', background:'white', padding:'35px', boxShadow:'-10px 0 30px rgba(0,0,0,0.04)', overflowY:'auto', display:'flex', flexDirection:'column' }}>
        <h2 style={{ marginBottom:'35px', fontSize:'28px', fontWeight:800, letterSpacing:'1px' }}>Customize Fit</h2>

        <div style={{ marginBottom:'26px' }}>
          <h3 style={{ fontSize:'13px', textTransform:'uppercase', color:'#888', marginBottom:'10px' }}>1. Select Garment</h3>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            {GARMENT_MODELS.map(g => (
              <button key={g.id} onClick={() => {
                setSelectedGarment(g);
                setSelectedColor('original');
                setSelectedPrint(PRINTS[0]);
              }}
                style={{ padding:'10px 15px', borderRadius:'20px', flex:'1 1 calc(50%-10px)', cursor:'pointer', background:'none',
                  border: selectedGarment.id===g.id ? '2px solid black':'1px solid #ccc',
                  fontWeight: selectedGarment.id===g.id ? 'bold':'normal' }}>
                {g.name} - ₹{g.basePrice}
              </button>
            ))}
          </div>
        </div>

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
              style={{
                padding:'10px 15px', borderRadius:'10px', cursor:'pointer',
                background: selectedColor === 'original' ? '#111' : '#f5f5f5',
                color: selectedColor === 'original' ? '#fff' : '#333',
                border: selectedColor === 'original' ? '2px solid black' : '1px solid #ccc',
                fontWeight: 'bold', fontSize: '12px'
              }}
            >
              Remove Color
            </button>
            <input type="color" value={selectedColor === 'original' ? '#ffffff' : selectedColor} onChange={e=>setSelectedColor(e.target.value)}
              style={{ flex:1, height:'46px', border:'none', borderRadius:'10px', cursor:'pointer' }} />
          </div>
        </div>

        <div style={{ marginBottom:'26px' }}>
          <h3 style={{ fontSize:'13px', textTransform:'uppercase', color:'#888', marginBottom:'10px' }}>3. Fabric Print (+₹500)</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
            {PRINTS.map(p => (
              <div key={p.id} onClick={() => setSelectedPrint(p)}
                style={{ border: selectedPrint.id===p.id ? '2px solid black':'1px solid #eee', borderRadius:'8px', padding:'4px', cursor:'pointer', textAlign:'center', background: selectedPrint.id===p.id ? '#fafafa':'white' }}>
                {p.file
                  ? <img src={p.file} alt={p.name} style={{ width:'100%', aspectRatio:'1', objectFit:'cover', borderRadius:'4px' }} />
                  : <div style={{ width:'100%', aspectRatio:'1', background:'#f5f5f5', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:'11px' }}>None</span></div>
                }
                <p style={{ fontSize:'10px', margin:'4px 0 0', fontWeight:'bold', color:'#333' }}>{p.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop:'auto', borderTop:'2px solid #f5f5f5', paddingTop:'24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'22px' }}>
            <span style={{ fontSize:'13px', color:'#666', textTransform:'uppercase', letterSpacing:'1px' }}>Total Price</span>
            <span style={{ fontSize:'30px', fontWeight:'bold' }}>₹{totalPrice}</span>
          </div>
          <div style={{ display:'flex', gap:'12px', flexDirection:'column' }}>
            <button onClick={handleSave} disabled={saving}
              style={{ width:'100%', padding:'17px', borderRadius:'30px', background:'linear-gradient(135deg,#000,#333)', color:'#fff', border:'none',
                cursor: saving?'not-allowed':'pointer', fontSize:'13px', letterSpacing:'2px', fontWeight:'bold', boxShadow:'0 8px 20px rgba(0,0,0,0.15)' }}>
              {saving ? 'SAVING…':'💾 SAVE TO DEMOS'}
            </button>
            <button onClick={() => {
              addToCart({
                id: `custom-${selectedGarment.id}-${selectedColor.replace('#','')}-${selectedPrint.id}`,
                name: `Custom ${selectedGarment.name}`,
                price: totalPrice,
                image: (document.querySelector('canvas'))?.toDataURL('image/jpeg', 0.5) || '/garments/dress.jpeg', // Snapshot as Cart picture
                size: 'One Size',
                isCustom: true,
                color: selectedColor === 'original' ? null : selectedColor,
                printName: selectedPrint.name
              });
              alert('Custom design added to bag!');
              navigate('/cart');
            }}
              style={{ width:'100%', padding:'15px', borderRadius:'30px', background:'transparent', color:'#000', border:'2px solid black', cursor:'pointer', fontSize:'13px', letterSpacing:'2px', fontWeight:'bold', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.target.style.background = '#111'; e.target.style.color = '#fff' }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#000' }}
            >
              🛒 ADD TO CART
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
