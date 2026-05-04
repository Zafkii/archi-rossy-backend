// scripts/copyQueries.js
import fs from "fs"
import path from "path"

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

copyRecursive("src/queries", "dist/queries")
console.log("📁 Copied queries → dist/queries")
