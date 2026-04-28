import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Shared Virtual Try-On Overlay Studio
 * Provides a manual "Paper Doll" style fitting interface across the site.
 */
export default function TryOnOverlay({ garmentSnapshot, onClose }) {
  const [userImage,   setUserImage]   = useState(null);
  const [userPreview, setUserPreview] = useState(null);
  const [showFull,    setShowFull]    = useState(false);

  // Background removal state
  const [activeGarmentImage, setActiveGarmentImage] = useState(garmentSnapshot);
  const [removingBg, setRemovingBg] = useState(false);

  // Sync active image when prop changes
  useEffect(() => {
    setActiveGarmentImage(garmentSnapshot);
  }, [garmentSnapshot]);

  // Overlay Controls State (Defaults tuned for best fit)
  const [offset, setOffset] = useState({ x: 0, y: -10 });
  const [scale,  setScale]  = useState(2.0);
  const [rotate, setRotate] = useState(0);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUserImage(file);
    setUserPreview(URL.createObjectURL(file));
  };

  const resetAdjustments = () => {
    setOffset({ x: 0, y: -10 });
    setScale(2.0);
    setRotate(0);
  };

  const handleRemoveBg = async () => {
    if (!activeGarmentImage) return;
    setRemovingBg(true);
    try {
      const res = await axios.post('http://localhost:5000/api/remove-bg', { 
        imageUrl: activeGarmentImage 
      });
      if (res.data.success && res.data.result) {
        setActiveGarmentImage(res.data.result);
      }
    } catch (err) {
      console.error('Background removal failed:', err);
      alert('Background removal failed. Is the server running? Check Replicate token.');
    } finally {
      setRemovingBg(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(160deg,#0f0c29 0%,#1a1a2e 60%,#16213e 100%)',
      borderRadius: '20px', padding: '22px', marginTop: '16px',
      border: '1px solid rgba(255,255,255,0.07)',
      boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
      animation: 'tryonSlideIn 0.35s cubic-bezier(0.34,1.4,0.64,1)',
      position: 'relative'
    }}>
      <style>{`
        @keyframes tryonSlideIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        input[type=range] { accent-color: #ec4899; }
        .multiply-mode { mix-blend-mode: multiply; filter: contrast(1.1); }
      `}</style>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' }}>
        <div>
          <p style={{ color:'#fff', fontSize:'13px', fontWeight:800, letterSpacing:'2px', textTransform:'uppercase', margin:0 }}>
            Overlay Studio
          </p>
          <p style={{ color:'#666', fontSize:'10px', margin:'3px 0 0' }}>
            Interactive Design Fitting
          </p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          {activeGarmentImage && !activeGarmentImage.includes('.png') && !activeGarmentImage.startsWith('data:') && (
            <button 
              onClick={handleRemoveBg}
              disabled={removingBg}
              style={{ padding:'6px 14px', borderRadius:'15px', background:'rgba(167,139,250,0.14)', color:'#a78bfa', border:'1px solid rgba(167,139,250,0.3)', pointerEvents: removingBg ? 'none':'auto', opacity: removingBg ? 0.6 : 1, cursor:'pointer', fontSize:'9px', fontWeight:800, letterSpacing:'1px', textTransform:'uppercase', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(167,139,250,0.25)'; e.currentTarget.style.borderColor='rgba(167,139,250,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.14)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)'; }}
            >
              {removingBg ? 'Cleaning...' : 'Clean Transparency'}
            </button>
          )}
          <button onClick={onClose}
            style={{ background:'rgba(255,255,255,0.07)', border:'none', color:'#aaa', borderRadius:'50%', width:'28px', height:'28px', cursor:'pointer', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center' }}
          >✕</button>
        </div>
      </div>

      {/* Interactive Workspace */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        aspectRatio: '3/4', 
        background: 'rgba(255,255,255,0.03)', 
        borderRadius: '12px', 
        overflow: 'hidden', 
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {userPreview ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* User Photo Layer */}
            <img src={userPreview} alt="user" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            
            {/* Garment Overlay Layer */}
            {activeGarmentImage && (
              <div style={{
                position: 'absolute',
                top: `${50 + offset.y}%`,
                left: `${50 + offset.x}%`,
                width: '100%',
                height: '100%',
                transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`,
                pointerEvents: 'none',
                transition: 'transform 0.1s ease-out'
              }}>
                <img 
                  src={activeGarmentImage} 
                  alt="garment" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  className={(activeGarmentImage.includes('.png') || activeGarmentImage.startsWith('data:')) ? '' : 'multiply-mode'}
                />
              </div>
            )}

            {/* Loading Overlay for BG removal */}
            {removingBg && (
              <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:10 }}>
                <div style={{ width:'30px', height:'30px', border:'2px solid rgba(255,255,255,0.1)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite', marginBottom:'12px' }} />
                <p style={{ color:'#fff', fontSize:'10px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase' }}>AI Cleaning...</p>
              </div>
            )}
            
            <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: '20px', fontSize: '9px', color: '#fff', letterSpacing: '1px' }}>
              MANUAL FITTING MODE
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>
            {/* Photo placeholder */}
            <p style={{ fontSize: '11px', margin: 0 }}>Upload a photo to start</p>
          </div>
        )}
      </div>

      {/* Interaction Controls */}
      <div style={{ marginTop: '18px' }}>
        {!userImage ? (
          <label
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', background:'rgba(255,255,255,0.05)', border: '1.5px dashed rgba(255,255,255,0.16)', color: '#aaa', borderRadius:'10px', padding:'14px', cursor:'pointer', fontSize:'12px', width:'100%', transition:'all 0.2s', boxSizing:'border-box' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(167,139,250,0.55)'; e.currentTarget.style.color='#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.color = '#aaa'; }}
          >
            Choose a Full-Body Photo
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display:'none' }} />
          </label>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>↕ Position Y</label>
                <input type="range" min="-50" max="50" value={offset.y} onChange={e => setOffset({ ...offset, y: parseInt(e.target.value) })} style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>↔ Position X</label>
                <input type="range" min="-50" max="50" value={offset.x} onChange={e => setOffset({ ...offset, x: parseInt(e.target.value) })} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>🔍 Size</label>
                <input type="range" min="0.2" max="4.5" step="0.01" value={scale} onChange={e => setScale(parseFloat(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>🔄 Rotate</label>
                <input type="range" min="-30" max="30" value={rotate} onChange={e => setRotate(parseInt(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button onClick={resetAdjustments} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#aaa', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}>RESET FITTING</button>
              <label style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '10px', fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>
                CHANGE PHOTO
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
            </div>
            
            <button onClick={() => setShowFull(true)} style={{ width: '100%', padding: '12px', borderRadius: '30px', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', color: '#fff', border: 'none', fontSize: '11px', fontWeight: 800, letterSpacing: '2px', cursor: 'pointer', marginTop: '14px', boxShadow: '0 8px 24px rgba(124,58,237,0.35)' }}>📸 VIEW FULL LOOK</button>
          </div>
        )}
      </div>

      {/* Full Preview Modal */}
      {showFull && (
        <div style={{ position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.95)', backdropFilter:'blur(10px)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px', boxSizing:'border-box' }}>
          <button onClick={() => setShowFull(false)} style={{ position:'absolute', top:30, right:30, background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', width:'44px', height:'44px', borderRadius:'50%', cursor:'pointer', fontSize:'20px' }}>✕</button>
          
          <div style={{ position:'relative', maxWidth:'100%', maxHeight:'100%', aspectRatio:'3/4', borderRadius:'20px', overflow:'hidden', boxShadow:'0 32px 128px rgba(0,0,0,0.8)' }}>
            <img src={userPreview} alt="full user" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            <div style={{
                position: 'absolute',
                top: `${50 + offset.y}%`,
                left: `${50 + offset.x}%`,
                width: '100%',
                height: '100%',
                transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`,
                pointerEvents: 'none',
              }}>
                <img 
                  src={activeGarmentImage} 
                  alt="full garment" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  className={(activeGarmentImage.includes('.png') || activeGarmentImage.startsWith('data:')) ? '' : 'multiply-mode'}
                />
            </div>
          </div>
          
          <div style={{ position:'absolute', bottom:40, left:'50%', transform:'translateX(-50%)' }}>
            <button onClick={() => setShowFull(false)} style={{ background:'#fff', color:'#000', padding:'14px 40px', borderRadius:'40px', fontWeight:800, fontSize:'14px', cursor:'pointer', border:'none' }}>CLOSE STUDIO</button>
          </div>
        </div>
      )}

      <p style={{ color:'rgba(255,255,255,0.12)', fontSize:'9px', textAlign:'center', marginTop:'12px', letterSpacing:'0.4px' }}>
        Manual Overlay Studio · Local Performance · No AI Credits Used
      </p>
    </div>
  );
}
