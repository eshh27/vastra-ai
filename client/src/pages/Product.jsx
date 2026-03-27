import { useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useCart } from "../context/CartContext"

function Product(){

  const location = useLocation()
  const product = location.state
  const navigate = useNavigate()
  const [selectedSize, setSelectedSize] = useState('M')
  const { addToCart } = useCart()

  if(!product){
    return <h2>No Product Selected</h2>
  }

  return(
    <div style={{
      padding:"60px",
      fontFamily:"serif",
      background:"#FAF8F6",
      minHeight:"100vh"
    }}>

      <div style={{
        display:"flex",
        gap:"60px"
      }}>

        <img 
          src={product.image}
          style={{
            width:"420px",
            borderRadius:"20px"
          }}
        />

        <div>

          <h1>{product.name}</h1>
          <h2 style={{color:"#777"}}>₹{product.price}</h2>

          <div style={{marginTop:"30px"}}>
            <p>Select Size</p>
            <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
              {['S','M','L'].map(sz => (
                <button key={sz} onClick={() => setSelectedSize(sz)} style={{
                  padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
                  background: selectedSize === sz ? '#111' : '#fff',
                  color: selectedSize === sz ? '#fff' : '#111',
                  border: '1px solid #111'
                }}>{sz}</button>
              ))}
            </div>
          </div>

          <div style={{marginTop:"30px", display:"flex", gap:"15px"}}>

  <button onClick={() => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
      isCustom: false
    });
    alert('Added to Bag!');
  }} style={{
    padding:"15px 25px",
    borderRadius:"30px",
    background:"white",
    border:"1px solid black",
    cursor:"pointer",
    fontWeight: "bold",
    letterSpacing: "1px"
  }}>
    ADD TO CART
  </button>

  <button style={{
    padding:"15px 30px",
    borderRadius:"30px",
    background:"black",
    color:"white",
    border:"none",
    cursor:"pointer"
  }}>
    BUY NOW
  </button>

</div>

<div style={{marginTop:"20px"}}>

  <button onClick={()=>navigate("/tryon",{state:product})} style={{
    padding:"15px 30px",
    borderRadius:"30px",
    background:"#847c777d",
    border:"none",
    cursor:"pointer"
  }}>
    VIRTUAL TRY-ON
  </button>

</div>

        </div>

      </div>

    </div>
  )
}

export default Product