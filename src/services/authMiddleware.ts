import { Request, Response, NextFunction, RequestHandler } from "express"
import jwt from "jsonwebtoken"
import { ROLE_HIERARCHY, RoleName } from "./roles.js"

export interface JwtPayload {
  id: number
  usuario: string
  role: RoleName
}

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload
  }
}

// 🧩 1️⃣ Verificar token y adjuntar usuario
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
      process.env.JWT_SECRET || "supersecret"
    ) as JwtPayload

    req.user = decoded
    next()
  } catch {
    res.status(401).json({ error: "Invalid or expired token" })
  }
}

// 🧩 2️⃣ (Opcional) Filtro jerárquico — aún útil para cosas muy globales
export const authorizeAction =
  (minRole: RoleName) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user
    if (!user) {
      res.status(401).json({ error: "Token faltante o inválido" })
      return
    }

    const userLevel = ROLE_HIERARCHY[user.role]
    const requiredLevel = ROLE_HIERARCHY[minRole]

    if (userLevel < requiredLevel) {
      res.status(403).json({ error: "Permiso denegado" })
      return
    }

    next()
  }
