import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

import projectsRoutes from "./routes/projects.js"
import usersRoutes from "./routes/users.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// 🔥 Middleware base
app.use(
  cors(),
  // ACA PON LA WEBSITE DE TU FRONTEND EN PRODUCCIÓN, POR EJEMPLO:
  //{origin: ["https://tu-dominio.com"]}
)
app.use(express.json())

// 🔥 Detectar entorno (dev vs build)
const isProd = process.env.NODE_ENV === "production"

const publicPath = isProd
  ? path.join(__dirname, "../public") // dist/public
  : path.join(process.cwd(), "public") // raíz del proyecto

// 🔥 Archivos estáticos
app.use(express.static(publicPath))

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

// 🔥 404 opcional (útil para debug)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})
