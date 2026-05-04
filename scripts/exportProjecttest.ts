import fs from "fs"
import path from "path"

const ROOT = process.cwd()
const CONFIG_PATH = path.join(ROOT, "files-to-exporttest.json")
const OUTPUT_PATH = path.join(ROOT, "project-contexttest.md")

//const CONFIG_PATH = path.join(ROOT, "files-to-export.json")
//const OUTPUT_PATH = path.join(ROOT, "project-context.md")

//const CONFIG_PATH = path.join(ROOT, "secondfiles-to-export.json")
//const OUTPUT_PATH = path.join(ROOT, "sproject-context.md")

function getLanguage(ext: string) {
  switch (ext) {
    case ".ts":
      return "ts"
    case ".js":
      return "js"
    case ".json":
      return "json"
    case ".env":
      return "env"
    default:
      return ""
  }
}

function main() {
  const configRaw = fs.readFileSync(CONFIG_PATH, "utf-8")
  const config = JSON.parse(configRaw)

  const files: string[] = config.files

  let output = `# Project Context\n\n`

  for (const file of files) {
    const fullPath = path.join(ROOT, file)

    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ Archivo no encontrado: ${file}`)
      continue
    }

    const content = fs.readFileSync(fullPath, "utf-8")
    const ext = path.extname(file)
    const lang = getLanguage(ext)

    output += `## ${file}\n\n`
    output += "```" + lang + "\n"
    output += content + "\n"
    output += "```\n\n"
  }

  fs.writeFileSync(OUTPUT_PATH, output)

  console.log("✅ Archivo project-context.md actualizado")
}

main()
