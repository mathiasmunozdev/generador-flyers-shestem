import { CANVAS_SIZE } from "@/config/templates"
import { ensureFonts } from "./assets"
import { drawFlyer, type FlyerScene } from "./render"

/** Genera el PNG final 1080 × 1080 con la misma función que dibuja la vista previa. */
export async function renderFlyerPng(scene: Omit<FlyerScene, "mode" | "debug">): Promise<Blob> {
  await ensureFonts([scene.template.name.fontWeight], `${scene.firstName} ${scene.lastName}`)
  const canvas = document.createElement("canvas")
  canvas.width = CANVAS_SIZE
  canvas.height = CANVAS_SIZE
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas no disponible")
  drawFlyer(ctx, { ...scene, mode: "export" })
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
  // Liberar memoria del lienzo temporal
  canvas.width = 0
  canvas.height = 0
  if (!blob) throw new Error("No se pudo generar la imagen")
  return blob
}

export function flyerFileName(role: string, firstName: string, lastName: string) {
  const slug = `${firstName} ${lastName}`
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return `flyer-shestem-2026-${role}${slug ? `-${slug}` : ""}.png`
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  a.rel = "noopener"
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Se revoca después para que el navegador alcance a iniciar la descarga.
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

export function canShareFile(file: File) {
  return typeof navigator !== "undefined" && !!navigator.canShare && navigator.canShare({ files: [file] })
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* se intenta el método alternativo */
  }
  try {
    const ta = document.createElement("textarea")
    ta.value = text
    ta.setAttribute("readonly", "")
    ta.style.position = "fixed"
    ta.style.opacity = "0"
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand("copy")
    ta.remove()
    return ok
  } catch {
    return false
  }
}
