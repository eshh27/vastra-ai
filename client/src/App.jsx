import {BrowserRouter, Routes, Route} from "react-router-dom"
import Home from "./pages/Home"
import Product from "./pages/Product"
import TryOn from "./pages/TryOn"

import Customization from "./pages/Customization"
import Demos from "./pages/Demos"
import Cart from "./pages/Cart"
import Login from "./pages/Login"
import Signup from "./pages/Signup"

function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/Product" element={<Product/>}/>
        <Route path="/tryon" element={<TryOn/>}/>
        <Route path="/customization" element={<Customization/>}/>
        <Route path="/demos" element={<Demos/>}/>
        <Route path="/cart" element={<Cart/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App