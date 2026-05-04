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
