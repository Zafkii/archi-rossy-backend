import express, { Request, Response } from "express"
import { getDB } from "../config/db.js"
import { authenticateToken } from "../services/authMiddleware.js"
import { checkPermission } from "../services/permissionMiddleware.js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

// 🔥 FIX para ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Cargar JSON sin import assertion
const queriesFile = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../queries/queriesFile.json"), "utf8")
)

const router = express.Router()

// LISTAR CLIENTES
router.get(
  "/",
  authenticateToken,
  checkPermission("clients", "list"),
  async (_: Request, res: Response) => {
    const { rows } = await getDB().query(queriesFile.queries.clients.selectAll)
    res.json(rows)
  }
)

// CREAR CLIENTE
router.post(
  "/",
  authenticateToken,
  checkPermission("clients", "create"),
  async (req: Request, res: Response) => {
    const { name, email, organization } = req.body
    await getDB().query(queriesFile.queries.clients.insert, [
      name,
      email,
      organization,
    ])
    res.status(201).json({ message: "Client created" })
  }
)

// ACTUALIZAR CLIENTE
router.put(
  "/:id",
  authenticateToken,
  checkPermission("clients", "update"),
  async (req: Request, res: Response) => {
    const { id } = req.params
    const { name, email, organization } = req.body

    await getDB().query(queriesFile.queries.clients.update, [
      name,
      email,
      organization,
      id,
    ])

    res.json({ message: "Client updated" })
  }
)

// BORRAR CLIENTE
router.delete(
  "/:id",
  authenticateToken,
  checkPermission("clients", "delete"),
  async (req: Request, res: Response) => {
    const { id } = req.params
    await getDB().query(queriesFile.queries.clients.delete, [id])
    res.json({ message: "Client deleted" })
  }
)

export default router
