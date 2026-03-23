import {useLocation} from "react-router-dom"
import {useState} from "react"
import axios from "axios"

function TryOn(){

  const location = useLocation()
  const product = location.state || {}
  const [result,setResult] = useState(null)
  const [image,setImage] = useState(null)

  return(
    <div style={{
      padding:"60px",
      fontFamily:"serif",
      background:"#FAF8F6",
      minHeight:"100vh"
    }}>

      <h1>AI Virtual Try-On</h1>

     <img 
  src={product.image || "/garments/demo.png"}
  style={{width:"300px", borderRadius:"20px"}}
/>

      <div style={{marginTop:"30px"}}>

        <input 
          type="file"
          onChange={(e)=>setImage(e.target.files[0])}
        />

      </div>
    <button
onClick={async()=>{
   console.log("BUTTON CLICKED")

  if(!image){
    alert("Please upload image first")
    return
  }

const formData = new FormData();
formData.append("user_image", image);
formData.append("product_image", product.image); // send selected garment

  try{

  console.log("Sending request...")

  const res = await axios.post(
    "http://localhost:5000/tryon",
    formData
  )

  console.log("RESPONSE:", res.data)

  if(res.data.success){
    setResult(res.data.result)
  }else{
    alert("AI returned failure")
  }

}catch(err){
  console.log("AXIOS ERROR:", err)
  alert("AI failed")
}
}}
style={{
  marginTop:"20px",
  padding:"15px 30px",
  borderRadius:"30px",
  background:"black",
  color:"white",
  border:"none",
  cursor:"pointer"
}}
>
GENERATE TRY-ON
</button>

{result && (
  <img
    src={result}
    style={{marginTop:"30px", width:"300px"}}
  />
)}

    </div>
  )
}

export default TryOn