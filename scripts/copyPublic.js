// scripts/copyPublic.js
import fs from "fs"
import path from "path"

// Copiar carpeta recursivamente
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

const src = "public"
const dest = "dist/public"

copyRecursive(src, dest)
console.log("📁 Copied public → dist/public")
