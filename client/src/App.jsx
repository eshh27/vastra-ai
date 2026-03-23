import {BrowserRouter, Routes, Route} from "react-router-dom"
import Home from "./pages/Home"
import Product from "./pages/Product"
import TryOn from "./pages/TryOn"

function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/Product" element={<Product/>}/>
        <Route path="/tryon" element={<TryOn/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App