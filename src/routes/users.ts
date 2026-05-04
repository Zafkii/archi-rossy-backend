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
