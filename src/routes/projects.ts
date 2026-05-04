import { Router } from "express"
import { pool } from "../config/db.js"

const router = Router()

router.get("/", async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM projects")
  res.json(rows)
})

router.get("/:id", async (req, res) => {
  const { id } = req.params
  const { rows } = await pool.query("SELECT * FROM projects WHERE id = $1", [
    id,
  ])
  res.json(rows[0])
})

export default router
