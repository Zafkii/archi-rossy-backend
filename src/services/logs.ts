import { Request, Response, Router } from "express"
import os from "os"

interface DeviceInfo {
  ip: string
  device: string
  platform: string
  usuario?: string
  nombre?: string
  connectedAt: string
}

const connectedDevices: DeviceInfo[] = []

// 🔹 Registrar conexión
export function logConnection(
  ip: string,
  device: string,
  platform: string,
  usuario?: string,
  nombre?: string
) {
  const exists = connectedDevices.some((d) => d.ip === ip)

  if (!exists) {
    connectedDevices.push({
      ip,
      device,
      platform,
      usuario,
      nombre,
      connectedAt: new Date().toISOString(),
    })
  }

  if (usuario && nombre) {
    console.log(
      `✅ Usuario autenticado: ${nombre} (${usuario}) desde ${device} (${ip})`
    )
  } else {
    console.log(`🟢 ${device} conectado desde ${ip} (${platform})`)
  }
}

// 🔹 Registrar desconexión
export function logDisconnection(
  ip: string,
  device: string,
  usuario?: string,
  nombre?: string
) {
  const index = connectedDevices.findIndex((d) => d.ip === ip)
  if (index !== -1) connectedDevices.splice(index, 1)

  if (usuario && nombre) {
    console.log(
      `❌ Usuario desconectado: ${nombre} (${usuario}) desde ${device} (${ip})`
    )
  } else {
    console.log(`🔴 ${device} desconectado (${ip})`)
  }
}

// 🔹 Obtener IP local del servidor
function getLocalIP(): string {
  const nets = os.networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]!) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address
      }
    }
  }
  return "desconocida"
}

// 🔹 Endpoint Express
export const logsRouter = Router()

logsRouter.get("/dispositivos", (_: Request, res: Response) => {
  res.json({
    total: connectedDevices.length,
    servidor: getLocalIP(),
    dispositivos: connectedDevices,
  })
})
