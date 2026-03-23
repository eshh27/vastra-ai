import {useNavigate} from "react-router-dom"

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
  
]

function Home(){

  const navigate = useNavigate()

  return (
    <div style={{
      background:"#FAF8F6",
      minHeight:"100vh",
      padding:"40px",
      fontFamily:"serif"
    }}>

      {/* NAVBAR */}
      <div style={{
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        marginBottom:"30px"
      }}>
       
      <div>
        <h1 style={{
          letterSpacing:"6px",
          marginBottom:"6px"
        }}>
        VASTRA  AI
        </h1>

        <p style={{
          marginTop:20,
          color:"#888",
          fontSize:"20px"
        }}>
        Luxury AI Try-On Fashion
        </p>
      </div>

      <input 
  placeholder="Search garments..."
  style={{
    padding:"12px 22px",
    borderRadius:"30px",
    border:"1px solid #ddd",
    width:"560px",
    fontSize:"14px",
    outline:"none"
  }}
/>
</div>

      {/* PRODUCT GRID */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(3,1fr)",
        gap:"30px"
      }}>
        {products.map(p=>(
          <div 
            key={p.id}
            onClick={()=>navigate("/product", {state:p})}
            style={{
              background:"white",
              padding:"15px",
              borderRadius:"20px",
              boxShadow:"0 10px 25px rgba(0,0,0,0.06)",
              cursor:"pointer"
            }}
          >
            <img 
              src={p.image}
              style={{
                width:"100%",
                borderRadius:"15px"
              }}
            />
            <h3>{p.name}</h3>
            <p style={{color:"#777"}}>₹{p.price}</p>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Home