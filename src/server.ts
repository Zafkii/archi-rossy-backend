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

// 🔥 Detectar entorno
const isProd = process.env.NODE_ENV === "production"

const publicPath = isProd
  ? path.join(__dirname, "../public") // producción
  : path.join(process.cwd(), "public") // desarrollo

// =========================
// 🔥 API (PRIMERO SIEMPRE)
// =========================
app.use("/projects", projectsRoutes)
app.use("/users", usersRoutes)
app.use("/content", contentRoutes)

// 🔥 Health check (opcional pero útil)
app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

// =========================
// 🔥 Archivos estáticos
// =========================
app.use(express.static(publicPath))

// =========================
// 🔥 SPA fallback (AL FINAL)
// =========================
app.get("*", (_req, res) => {
  res.sendFile(path.join(publicPath, "index.html"))
})

// =========================
// 🔥 404 API (opcional)
// =========================
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})
