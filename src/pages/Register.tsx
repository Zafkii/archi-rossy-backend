import { useState } from "react"
import { register } from "../api.js"

export default function Register() {
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleRegister = async () => {
    try {
      await register(name, username, password)
      alert("Admin creado")
      window.location.href = "/login"
    } catch {
      alert("No se pudo registrar")
    }
  }

  return (
    <div>
      <h2>Registro inicial</h2>
      <input placeholder="Nombre" onChange={(e) => setName(e.target.value)} />
      <input
        placeholder="Usuario"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister}>Crear admin</button>
    </div>
  )
}
