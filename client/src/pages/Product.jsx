import { useLocation } from "react-router-dom"
import {useNavigate} from "react-router-dom"

function Product(){

  const location = useLocation()
  const product = location.state
  const navigate = useNavigate()

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
            <button>S</button>
            <button>M</button>
            <button>L</button>
          </div>

          <div style={{marginTop:"30px", display:"flex", gap:"15px"}}>

  <button style={{
    padding:"15px 25px",
    borderRadius:"30px",
    background:"white",
    border:"1px solid black",
    cursor:"pointer"
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