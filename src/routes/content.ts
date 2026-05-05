import express from "express"
import crypto from "crypto"
import { pool } from "../config/db.js"
import queries from "../queries/queriesFile.json" with { type: "json" }

const router = express.Router()

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

router.put("/", async (req, res) => {
  try {
    const { section, key, value } = req.body

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
