import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login.js"
import Register from "./pages/Register.js"
import Admin from "./pages/Admin.js"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
