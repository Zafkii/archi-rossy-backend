# Project Context

## scripts/copyQueries.js

```js
// scripts/copyQueries.js
import fs from "fs"
import path from "path"

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

copyRecursive("src/queries", "dist/queries")
console.log("📁 Copied queries → dist/queries")

```

## scripts/copyPublic.js

```js
// scripts/copyPublic.js
import fs from "fs"
import path from "path"

// Copiar carpeta recursivamente
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

const src = "public"
const dest = "dist/public"

copyRecursive(src, dest)
console.log("📁 Copied public → dist/public")

```

## public/index.html

```
<!doctype html>

<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Admin</title>
    <link rel="icon" href="/logo.ico" />
  </head>
  <body>
    <h2>Login</h2>

    <input id="username" placeholder="Usuario" />
    <input id="password" type="password" placeholder="Password" />

    <br /><br />

    <button onclick="login()">Login</button>

    <!-- 🔥 REGISTRO (solo aparece si no hay usuarios) -->
    <div id="register-section" style="display: none; margin-top: 30px">
      <h3>Crear Admin</h3>

      <input id="reg-name" placeholder="Nombre" />
      <input id="reg-username" placeholder="Usuario" />
      <input id="reg-password" type="password" placeholder="Password" />

      <br /><br />

      <button onclick="register()">Registrar</button>
    </div>

    <script>
      // 🔐 LOGIN
      async function login() {
        const username = document.getElementById("username").value
        const password = document.getElementById("password").value

        try {
          const res = await fetch("/users/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          })

          const data = await res.json()

          if (!res.ok) {
            alert(data.error)
            return
          }

          localStorage.setItem("token", data.token)
          window.location.href = "/admin.html"
        } catch (err) {
          alert("Error de conexión")
        }
      }

      // 🆕 REGISTRO
      async function register() {
        const name = document.getElementById("reg-name").value
        const username = document.getElementById("reg-username").value
        const password = document.getElementById("reg-password").value

        try {
          const res = await fetch("/users/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, username, password }),
          })

          const data = await res.json()

          if (!res.ok) {
            alert(data.error)
            return
          }

          alert("Admin creado, ahora inicia sesión")
          location.reload()
        } catch (err) {
          alert("Error de conexión")
        }
      }

      // 🔍 VERIFICAR USUARIOS
      async function checkUsers() {
        try {
          const res = await fetch("/users/exists")
          const data = await res.json()

          if (!data.exists) {
            document.getElementById("register-section").style.display = "block"
          }
        } catch (err) {
          console.error("Error:", err)
        }
      }

      // 🚀 INIT
      checkUsers()
    </script>
  </body>
</html>

```

## public/admin.html

```
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Admin</title>
  </head>
  <body>
    <h2>Panel Admin</h2>

    <button onclick="goWebsite()">Ir a la web</button>
    <button onclick="logout()">Cerrar sesión</button>

    <script>
      const token = localStorage.getItem("token")

      if (!token) {
        window.location.href = "/"
      }

      function logout() {
        localStorage.removeItem("token")
        window.location.href = "/"
      }

      // 🔥 NUEVO
      function goWebsite() {
        const WEBSITE_URL =
          "https://archi-rossy-frontend-production.up.railway.app" // 👈 cambia esto
        window.open(WEBSITE_URL, "_blank")
      }
    </script>
  </body>
</html>

```

## src/config/db.ts

```ts
import pkg from "pg"
const { Pool } = pkg

export const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: false,
})

```

## src/config/project.schema.ts

```ts
import { z } from "zod"

export const projectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  cover_image: z.string().url(),

  background_image: z.string().url().optional(),

  primary_color: z.string(),
  secondary_color: z.string(),

  blocks: z.array(
    z.object({
      type: z.enum(["image", "text", "subtitle", "spacer"]),
      url: z.string().optional(),
      content: z.string().optional(),
      size: z.number().optional(),
    }),
  ),
})

```

## src/queries/queriesFile.json

```json
{
  "queries": {
    "users": {
      "selectAll": "SELECT id, name, username FROM public.users ORDER BY name",
      "insert": "INSERT INTO public.users (id, name, username, password_hash, role) VALUES ($1, $2, $3, $4, $5)",
      "update": "UPDATE public.users SET name = $1, username = $2, password_hash = $3, role = $4 WHERE id = $5",
      "delete": "DELETE FROM public.users WHERE id = $1",
      "selectByUsername": "SELECT * FROM public.users WHERE username = $1"
    }
  },
  "siteContent": {
    "selectBySection": "SELECT key, value FROM public.site_content WHERE section = $1",

    "upsert": "INSERT INTO public.site_content (id, section, key, value) VALUES ($1, $2, $3, $4) ON CONFLICT (section, key) DO UPDATE SET value = EXCLUDED.value",

    "delete": "DELETE FROM public.site_content WHERE section = $1 AND key = $2"
  },
  "projects": {
    "selectAll": "SELECT * FROM public.projects ORDER BY title",

    "selectById": "SELECT * FROM public.projects WHERE id = $1",

    "insert": "INSERT INTO public.projects (id, title, description, cover_image, background_image, primary_color, secondary_color, blocks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",

    "update": "UPDATE public.projects SET title = $1, description = $2, cover_image = $3, background_image = $4, primary_color = $5, secondary_color = $6, blocks = $7 WHERE id = $8",

    "delete": "DELETE FROM public.projects WHERE id = $1"
  }
}

```

## src/routes/projects.ts

```ts
import { Router } from "express"
import { pool } from "../config/db.js"
import { projectSchema } from "../config/project.schema.js"
import { authenticateToken } from "../services/authMiddleware.js"

const router = Router()

// 🔓 LISTAR TODOS (público)
router.get("/", async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM projects ORDER BY id DESC")
  res.json(rows)
})

// 🔓 OBTENER UNO (público)
router.get("/:id", async (req, res) => {
  const { id } = req.params

  const { rows } = await pool.query("SELECT * FROM projects WHERE id = $1", [
    id,
  ])

  if (rows.length === 0) {
    res.status(404).json({ error: "Project not found" })
    return
  }

  res.json(rows[0])
})

// 🔒 CREAR
router.post("/", authenticateToken, async (req, res) => {
  try {
    const parsed = projectSchema.parse(req.body)

    await pool.query(
      `INSERT INTO projects 
      (id, title, description, cover_image, background_image, primary_color, secondary_color, blocks)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        parsed.id,
        parsed.title,
        parsed.description,
        parsed.cover_image,
        parsed.background_image,
        parsed.primary_color,
        parsed.secondary_color,
        JSON.stringify(parsed.blocks),
      ],
    )

    res.status(201).json({ success: true })
  } catch (err: any) {
    console.error("❌ Create project error:", err)

    if (err.name === "ZodError") {
      res.status(400).json({
        error: "Validation error",
        details: err.errors,
      })
      return
    }

    res.status(500).json({ error: "Server error" })
  }
})

// 🔒 ACTUALIZAR
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const parsed = projectSchema.parse(req.body)

    await pool.query(
      `UPDATE projects SET
        title = $1,
        description = $2,
        cover_image = $3,
        background_image = $4,
        primary_color = $5,
        secondary_color = $6,
        blocks = $7
      WHERE id = $8`,
      [
        parsed.title,
        parsed.description,
        parsed.cover_image,
        parsed.background_image,
        parsed.primary_color,
        parsed.secondary_color,
        JSON.stringify(parsed.blocks),
        id,
      ],
    )

    res.json({ success: true })
  } catch (err: any) {
    console.error("❌ Update project error:", err)

    if (err.name === "ZodError") {
      res.status(400).json({
        error: "Validation error",
        details: err.errors,
      })
      return
    }

    res.status(500).json({ error: "Server error" })
  }
})

// 🔒 ELIMINAR
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    await pool.query("DELETE FROM projects WHERE id = $1", [id])

    res.json({ success: true })
  } catch (err) {
    console.error("❌ Delete project error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

export default router

```

## src/routes/users.ts

```ts
import { Router } from "express"
import { pool } from "../config/db.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { authenticateToken } from "../services/authMiddleware.js"
import queriesFile from "../queries/queriesFile.json" with { type: "json" }
import { randomUUID } from "crypto" // 🔥 IMPORTANTE

const router = Router()

// 🔓 REGISTRO (solo una vez)
router.post("/register", async (req, res) => {
  try {
    const { name, username, password } = req.body

    const result = await pool.query("SELECT COUNT(*) FROM users")
    const count = parseInt(result.rows[0].count)

    if (count > 0) {
      res.status(403).json({ error: "Registration closed" })
      return
    }

    const hash = await bcrypt.hash(password, 10)
    const id = randomUUID() // 🔥 GENERAR ID

    await pool.query(queriesFile.queries.users.insert, [
      id,
      name,
      username,
      hash,
      "admin",
    ])

    res.status(201).json({ message: "Admin registered successfully" })
  } catch (err) {
    console.error("❌ Register error:", err)
    res.status(500).json({ error: "Internal error" })
  }
})

// 🔓 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    const result = await pool.query(
      queriesFile.queries.users.selectByUsername,
      [username],
    )

    if (result.rows.length === 0) {
      res.status(401).json({ error: "Invalid credentials" })
      return
    }

    const user = result.rows[0]

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" })
      return
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "8h" },
    )

    res.json({
      token,
      user: { id: user.id, username: user.username },
    })
  } catch (err) {
    console.error("❌ Login error:", err)
    res.status(500).json({ error: "Internal error" })
  }
})

// 🔒 LISTAR
router.get("/", authenticateToken, async (_req, res) => {
  try {
    const { rows } = await pool.query(queriesFile.queries.users.selectAll)
    res.json(rows)
  } catch (err) {
    console.error("❌ List users error:", err)
    res.status(500).json({ error: "Internal error" })
  }
})

// 🔒 CREAR
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, username, password } = req.body
    const hash = await bcrypt.hash(password, 10)
    const id = randomUUID() // 🔥 TAMBIÉN AQUÍ

    await pool.query(queriesFile.queries.users.insert, [
      id,
      name,
      username,
      hash,
      "admin",
    ])

    res.status(201).json({ message: "User created" })
  } catch (err) {
    console.error("❌ Create user error:", err)
    res.status(500).json({ error: "Internal error" })
  }
})

// 🔒 UPDATE
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { name, username, password } = req.body

    const hash = await bcrypt.hash(password, 10)

    await pool.query(queriesFile.queries.users.update, [
      name,
      username,
      hash,
      "admin",
      id,
    ])

    res.json({ message: "User updated" })
  } catch (err) {
    console.error("❌ Update user error:", err)
    res.status(500).json({ error: "Internal error" })
  }
})

// 🔒 DELETE
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    await pool.query(queriesFile.queries.users.delete, [id])

    res.json({ message: "User deleted" })
  } catch (err) {
    console.error("❌ Delete user error:", err)
    res.status(500).json({ error: "Internal error" })
  }
})

// 🔓 EXISTS
router.get("/exists", async (_req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM users")
    const count = parseInt(result.rows[0].count)

    res.json({ exists: count > 0 })
  } catch (err) {
    console.error("❌ Check users exists error:", err)
    res.status(500).json({ error: "Internal error" })
  }
})

export default router

```

## src/routes/content.ts

```ts
import express from "express"
import crypto from "crypto"
import { pool } from "../config/db.js"
import { authenticateToken } from "../services/authMiddleware.js"
import queries from "../queries/queriesFile.json" with { type: "json" }

const router = express.Router()

// 🔓 público (leer)
router.get("/:section", async (req, res) => {
  try {
    const { section } = req.params

    const { rows } = await pool.query(queries.siteContent.selectBySection, [
      section,
    ])

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error fetching content" })
  }
})

// 🔒 protegido (editar)
router.put("/", authenticateToken, async (req, res) => {
  try {
    const { section, key, value } = req.body

    if (!section || !key) {
      return res.status(400).json({ error: "Missing data" })
    }

    await pool.query(queries.siteContent.upsert, [
      crypto.randomUUID(),
      section,
      key,
      value,
    ])

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error updating content" })
  }
})

export default router

```

## src/services/authMiddleware.ts

```ts
import { Request, Response, NextFunction, RequestHandler } from "express"
import jwt from "jsonwebtoken"

// 🔹 Payload simple
export interface JwtPayload {
  id: number
  username: string
}

// 🔹 Extender Request
declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload
  }
}

// 🔹 Verificar token
export const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    res.status(401).json({ error: "Missing token" })
    return
  }

  try {
    const token = authHeader.split(" ")[1]

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecret",
    ) as JwtPayload

    req.user = decoded
    next()
  } catch {
    res.status(401).json({ error: "Invalid or expired token" })
  }
}

```

## src/services/logs.ts

```ts
import { Request, Response, Router } from "express"
import os from "os"

interface DeviceInfo {
  ip: string
  device: string
  platform: string
  usuario?: string
  nombre?: string
  connectedAt: string
}

const connectedDevices: DeviceInfo[] = []

// 🔹 Registrar conexión
export function logConnection(
  ip: string,
  device: string,
  platform: string,
  usuario?: string,
  nombre?: string
) {
  const exists = connectedDevices.some((d) => d.ip === ip)

  if (!exists) {
    connectedDevices.push({
      ip,
      device,
      platform,
      usuario,
      nombre,
      connectedAt: new Date().toISOString(),
    })
  }

  if (usuario && nombre) {
    console.log(
      `✅ Usuario autenticado: ${nombre} (${usuario}) desde ${device} (${ip})`
    )
  } else {
    console.log(`🟢 ${device} conectado desde ${ip} (${platform})`)
  }
}

// 🔹 Registrar desconexión
export function logDisconnection(
  ip: string,
  device: string,
  usuario?: string,
  nombre?: string
) {
  const index = connectedDevices.findIndex((d) => d.ip === ip)
  if (index !== -1) connectedDevices.splice(index, 1)

  if (usuario && nombre) {
    console.log(
      `❌ Usuario desconectado: ${nombre} (${usuario}) desde ${device} (${ip})`
    )
  } else {
    console.log(`🔴 ${device} desconectado (${ip})`)
  }
}

// 🔹 Obtener IP local del servidor
function getLocalIP(): string {
  const nets = os.networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]!) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address
      }
    }
  }
  return "desconocida"
}

// 🔹 Endpoint Express
export const logsRouter = Router()

logsRouter.get("/dispositivos", (_: Request, res: Response) => {
  res.json({
    total: connectedDevices.length,
    servidor: getLocalIP(),
    dispositivos: connectedDevices,
  })
})

```

## src/server.ts

```ts
import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

import projectsRoutes from "./routes/projects.js"
import usersRoutes from "./routes/users.js"
import contentRoutes from "./routes/content.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// 🔥 Middleware base
app.use(cors())
app.use(express.json())

// 🔥 Detectar entorno (dev vs build)
const isProd = process.env.NODE_ENV === "production"

const publicPath = isProd
  ? path.join(__dirname, "../public") // dist/public
  : path.join(process.cwd(), "public") // raíz del proyecto

// 🔥 Archivos estáticos
app.use(express.static(publicPath))

app.get("*", (_req, res) => {
  res.sendFile(path.join(publicPath, "index.html"))
})

// 🔥 Ruta principal (login)
app.get("/", (_req, res) => {
  res.sendFile(path.join(publicPath, "index.html"))
})

// 🔥 Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

// 🔥 API
app.use("/projects", projectsRoutes)
app.use("/users", usersRoutes)
app.use("/content", contentRoutes)

// 🔥 404 opcional (útil para debug)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})

```

## src/App.tsx

```
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

```

## src/api.ts

```ts
const BASE_URL = "http://localhost:3000"

export async function login(username: string, password: string) {
  const res = await fetch(`${BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) throw new Error("Login failed")

  return res.json()
}

export async function register(
  name: string,
  username: string,
  password: string,
) {
  const res = await fetch(`${BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, username, password }),
  })

  if (!res.ok) throw new Error("Register failed")

  return res.json()
}

export async function checkUsersExist() {
  const res = await fetch(`${BASE_URL}/users/exists`)
  return res.json()
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token")

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Request error")
  }

  return res.json()
}

```

## src/pages/Admin.tsx

```
export default function Admin() {
  const token = localStorage.getItem("token")

  if (!token) {
    window.location.href = "/login"
    return null
  }

  return (
    <div>
      <h2>Panel Admin</h2>

      <a
        href="https://archi-rossy-frontend-production.up.railway.app"
        target="_blank"
      >
        Ir a la web
      </a>

      <br />
      <br />

      <button
        onClick={() => {
          localStorage.removeItem("token")
          window.location.href = "/login"
        }}
      >
        Cerrar sesión
      </button>
    </div>
  )
}

```

## src/pages/Login.tsx

```
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

```

## src/pages/Register.tsx

```
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

```

## .env

```
#################################
###### DATABASE #####

DATABASE_URL=postgresql://postgres:TU_PASSWORD@switchyard.proxy.rlwy.net:TU_PORT/railway

PGHOST=switchyard.proxy.rlwy.net
PGPORT=42436
PGUSER=postgres
PGPASSWORD=gfmJWYUWsYardvTJOVfZpyWviGyJhirW
PGDATABASE=railway

#################################
###### BACKEND #####

JWT_SECRET=weasecretkey
LICENSE_SECRET=supersecurekey

PORT=3000
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "nodenext",
    "jsx": "react-jsx",
    "moduleResolution": "nodenext",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "strict": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": [
    "src/server.ts",
    "src/routes",
    "src/services",
    "src/config",
    "src/queries/queriesFile.json"
  ]
}

```

## package.json

```json
{
  "name": "archi_rossy_backend",
  "version": "0.0.1",
  "description": "Rossy's architecture projects  backend + React UI",
  "author": "Zafkii",
  "license": "MIT",
  "type": "module",
  "main": "dist/server.js",
  "engines": {
    "node": "20.x"
  },
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc && node scripts/copyQueries.js && node scripts/copyPublic.js",
    "start": "node dist/server.js",
    "c": "tsx scripts/exportProject.ts",
    "ctest": "tsx scripts/exportProjecttest.ts"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.16.3",
    "zod": "^3.25.28"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.2",
    "@types/cors": "^2.8.18",
    "@types/express": "^4.17.25",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^22.15.21",
    "@types/pg": "^8.15.6",
    "@types/react": "^19.2.2",
    "@types/react-dom": "^19.2.2",
    "@types/react-router-dom": "^5.3.3",
    "@types/useragent": "^2.3.4",
    "@types/ws": "^8.18.1",
    "cross-env": "^10.1.0",
    "esbuild": "^0.27.0",
    "pkg": "^5.8.1",
    "tsx": "^4.20.6",
    "typescript": "^5.9.3"
  }
}

```

