import { useState } from "react"
import { apiRequest } from "../api.js"

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    try {
      const data = await apiRequest("/users/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      })

      localStorage.setItem("token", data.token)

      window.location.href = "/admin"
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div>
      <h2>Login</h2>

      <input
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  )
}
