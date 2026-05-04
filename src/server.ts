import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import projectsRoutes from "./routes/projects.js"
import usersRoutes from "./routes/users.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

app.use("/projects", projectsRoutes)
app.use("/users", usersRoutes)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)
})
