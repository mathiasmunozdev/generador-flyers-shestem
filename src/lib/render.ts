import { CANVAS_SIZE, type FlyerTemplate, type PhotoFrame } from "@/config/templates"
import { layoutName } from "./name-layout"

export interface PhotoTransform {
  /** 1 = la foto cubre exactamente el marco. */
  zoom: number
  /** Desplazamiento del centro de la foto respecto al centro del marco, en px del lienzo. */
  offsetX: number
  offsetY: number
}

export interface PhotoAsset {
  source: CanvasImageSource
  width: number
  height: number
  fileName: string
}

export interface FlyerScene {
  template: FlyerTemplate
  /** Arte maestro rasterizado a 1080 × 1080 (ver assets.ts). */
  art: CanvasImageSource
  photo: PhotoAsset | null
  transform: PhotoTransform
  firstName: string
  lastName: string
  /** En vista previa se dibujan marcadores de posición si faltan datos. Nunca en la exportación. */
  mode: "preview" | "export"
  debug?: { example?: CanvasImageSource | null }
}

export const MIN_ZOOM = 1
export const MAX_ZOOM = 5
export const DEFAULT_TRANSFORM: PhotoTransform = { zoom: 1, offsetX: 0, offsetY: 0 }

export function getPhotoPlacement(frame: PhotoFrame, photo: Pick<PhotoAsset, "width" | "height">, t: PhotoTransform) {
  const cover = Math.max(frame.width / photo.width, frame.height / photo.height)
  const scale = cover * t.zoom
  const width = photo.width * scale
  const height = photo.height * scale
  const maxX = Math.max(0, (width - frame.width) / 2)
  const maxY = Math.max(0, (height - frame.height) / 2)
  const offsetX = clamp(t.offsetX, -maxX, maxX)
  const offsetY = clamp(t.offsetY, -maxY, maxY)
  const cx = frame.x + frame.width / 2 + offsetX
  const cy = frame.y + frame.height / 2 + offsetY
  return { x: cx - width / 2, y: cy - height / 2, width, height, offsetX, offsetY }
}

/** Ajusta zoom y desplazamiento para que la foto siempre cubra todo el marco. */
export function clampTransform(frame: PhotoFrame, photo: PhotoAsset | null, t: PhotoTransform): PhotoTransform {
  const zoom = clamp(t.zoom, MIN_ZOOM, MAX_ZOOM)
  if (!photo) return { zoom, offsetX: 0, offsetY: 0 }
  const p = getPhotoPlacement(frame, photo, { ...t, zoom })
  return { zoom, offsetX: p.offsetX, offsetY: p.offsetY }
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

function roundedRectPath(ctx: CanvasRenderingContext2D, f: PhotoFrame) {
  const r = Math.min(f.radius, f.width / 2, f.height / 2)
  const { x, y, width: w, height: h } = f
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

/**
 * Dibuja el flyer completo. Es la ÚNICA función de composición: la usan tanto
 * la vista previa como la exportación PNG, así ambas son idénticas.
 *
 * Orden de capas (verificado contra los PNG de ejemplo oficiales):
 *   1. Arte maestro SVG (opaco, sin hueco para la foto).
 *   2. Foto recortada al rectángulo redondeado del marco.
 *   3. Nombre en Poppins, blanco.
 */
export function drawFlyer(ctx: CanvasRenderingContext2D, scene: FlyerScene) {
  const { template, photo, transform, mode } = scene
  const frame = template.photo

  ctx.save()
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"

  // 1. Arte maestro
  ctx.drawImage(scene.art, 0, 0, CANVAS_SIZE, CANVAS_SIZE)

  // 2. Foto
  if (photo) {
    const p = getPhotoPlacement(frame, photo, transform)
    ctx.save()
    roundedRectPath(ctx, frame)
    ctx.clip()
    ctx.drawImage(photo.source, p.x, p.y, p.width, p.height)
    ctx.restore()
  } else if (mode === "preview") {
    drawPhotoPlaceholder(ctx, frame)
  }

  // 3. Nombre
  const hasName = scene.firstName.trim() || scene.lastName.trim()
  const first = hasName || mode === "export" ? scene.firstName : "Tu nombre"
  const last = hasName || mode === "export" ? scene.lastName : "Tu apellido"
  const layout = layoutName(ctx, first, last, template.name)
  if (layout) {
    ctx.save()
    ctx.font = layout.font
    ctx.fillStyle = template.name.color
    ctx.globalAlpha = hasName ? 1 : 0.4
    ctx.textBaseline = "alphabetic"
    ctx.textAlign = "left"
    layout.lines.forEach((line, i) => ctx.fillText(line, layout.x, layout.baselines[i]))
    ctx.restore()
  }

  if (scene.debug) drawDebug(ctx, scene)
  ctx.restore()
}

function drawPhotoPlaceholder(ctx: CanvasRenderingContext2D, frame: PhotoFrame) {
  ctx.save()
  roundedRectPath(ctx, frame)
  ctx.fillStyle = "rgba(255,255,255,0.10)"
  ctx.fill()
  ctx.setLineDash([14, 12])
  ctx.lineWidth = 4
  ctx.strokeStyle = "rgba(255,255,255,0.55)"
  ctx.stroke()
  ctx.setLineDash([])

  const visibleLeft = Math.max(frame.x, 0)
  const cx = (visibleLeft + frame.x + frame.width) / 2
  const cy = frame.y + frame.height / 2
  // Silueta simple de persona
  ctx.fillStyle = "rgba(255,255,255,0.55)"
  ctx.beginPath()
  ctx.arc(cx, cy - 70, 46, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx, cy + 40, 88, 56, 0, Math.PI, 0)
  ctx.fill()
  ctx.font = "600 30px Poppins"
  ctx.textAlign = "center"
  ctx.fillStyle = "rgba(255,255,255,0.85)"
  ctx.fillText("Tu foto aquí", cx, cy + 110)
  ctx.restore()
}

function drawDebug(ctx: CanvasRenderingContext2D, scene: FlyerScene) {
  const { template } = scene
  ctx.save()
  if (scene.debug?.example) {
    ctx.globalAlpha = 0.5
    ctx.drawImage(scene.debug.example, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
    ctx.globalAlpha = 1
  }
  ctx.lineWidth = 2
  ctx.strokeStyle = "#00e5ff"
  roundedRectPath(ctx, template.photo)
  ctx.stroke()
  const n = template.name
  ctx.strokeStyle = "#ffea00"
  ctx.strokeRect(n.x, n.minTop, n.maxWidth, n.maxBottom - n.minTop)
  ctx.beginPath()
  ctx.moveTo(n.x - 20, n.centerY)
  ctx.lineTo(n.x + n.maxWidth, n.centerY)
  ctx.stroke()
  ctx.restore()
}
