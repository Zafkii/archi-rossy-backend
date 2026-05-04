import express, { Request, Response } from "express"
import { getDB } from "../config/db.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { authenticateToken } from "../services/authMiddleware.js"
import { checkPermission } from "../services/permissionMiddleware.js"
import { fileURLToPath } from "url"
import path from "path"
import fs from "fs"

// ❤️ FIX para poder usar __dirname en ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Cargar JSON sin usar "assert { type: 'json' }"
const queriesFile = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../queries/queriesFile.json"), "utf8")
)

const router = express.Router()

// REGISTRO PÚBLICO — solo si no existen usuarios
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, username, password, role = "admin" } = req.body

    const result = await getDB().query("SELECT COUNT(*) FROM users")
    const count = parseInt((result.rows as any[])[0].count)

    if (count > 0) {
      res.status(403).json({ error: "Registration closed" })
      return
    }

    const hash = await bcrypt.hash(password, 10)

    await getDB().query(queriesFile.queries.users.insert, [
      name,
      username,
      hash,
      role,
    ])

    res.status(201).json({ message: "Admin registered successfully" })
  } catch (err) {
    console.error("❌ Register error:", err)
    res.status(500).json({ error: "Internal error" })
  }
})

// LOGIN
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    const result = await getDB().query(
      queriesFile.queries.users.selectByUsername,
      [username]
    )

    if (result.rows.length === 0) {
      res.status(401).json({ error: "Invalid credentials" })
      return
    }

    const user = (result.rows as any[])[0]

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" })
      return
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "8h" }
    )

    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role },
    })
  } catch (err) {
    console.error("❌ Login error:", err)
    res.status(500).json({ error: "Internal error" })
  }
})

// LISTAR USUARIOS
router.get(
  "/",
  authenticateToken,
  checkPermission("users", "list"),
  async (_: Request, res: Response) => {
    try {
      const { rows } = await getDB().query(queriesFile.queries.users.selectAll)
      res.json(rows)
    } catch (err) {
      console.error("❌ List users error:", err)
      res.status(500).json({ error: "Internal error" })
    }
  }
)

// CREAR USUARIO
router.post(
  "/",
  authenticateToken,
  checkPermission("users", "create"),
  async (req: Request, res: Response) => {
    try {
      const { name, username, password, role } = req.body
      const hash = await bcrypt.hash(password, 10)

      await getDB().query(queriesFile.queries.users.insert, [
        name,
        username,
        hash,
        role,
      ])

      res.status(201).json({ message: "User created" })
    } catch (err) {
      console.error("❌ Create user error:", err)
      res.status(500).json({ error: "Internal error" })
    }
  }
)

// ACTUALIZAR USUARIO
router.put(
  "/:id",
  authenticateToken,
  checkPermission("users", "update"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { name, username, password, role } = req.body

      const hash = await bcrypt.hash(password, 10)

      await getDB().query(queriesFile.queries.users.update, [
        name,
        username,
        hash,
        role,
        id,
      ])

      res.json({ message: "User updated" })
    } catch (err) {
      console.error("❌ Update user error:", err)
      res.status(500).json({ error: "Internal error" })
    }
  }
)

// ELIMINAR USUARIO
router.delete(
  "/:id",
  authenticateToken,
  checkPermission("users", "delete"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      await getDB().query(queriesFile.queries.users.delete, [id])

      res.json({ message: "User deleted" })
    } catch (err) {
      console.error("❌ Delete user error:", err)
      res.status(500).json({ error: "Internal error" })
    }
  }
)

// SABER SI EXISTEN USUARIOS
router.get("/exists", async (_req: Request, res: Response) => {
  try {
    const result = await getDB().query("SELECT COUNT(*) FROM users")
    const count = parseInt((result.rows as any[])[0].count)

    res.json({ exists: count > 0 })
  } catch (err) {
    console.error("❌ Check users exists error:", err)
    res.status(500).json({ error: "Internal error" })
  }
})

export default router
