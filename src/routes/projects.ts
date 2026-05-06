import { Router } from "express"
import { pool } from "../config/db.js"
import { projectSchema } from "../config/project.schema.js"
import { authenticateToken } from "../services/authMiddleware.js"
import crypto from "crypto"
import queries from "../queries/queriesFile.json" with { type: "json" }

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
    const {
      title,
      description,
      cover_image,
      background_image,
      primary_color,
      secondary_color,
      blocks,
    } = req.body

    const id = crypto.randomUUID()

    await pool.query(queries.projects.insert, [
      id,
      title,
      description || "",
      cover_image || "",
      background_image || "",
      primary_color || "#000000",
      secondary_color || "#ffffff",
      JSON.stringify(blocks || []),
    ])

    res.json({ ok: true, id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error creating project" })
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
