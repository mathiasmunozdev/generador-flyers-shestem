import { CANVAS_SIZE } from "@/config/templates"

const artCache = new Map<string, Promise<HTMLCanvasElement>>()
const imageCache = new Map<string, Promise<HTMLImageElement>>()

export function loadImage(url: string): Promise<HTMLImageElement> {
  let cached = imageCache.get(url)
  if (!cached) {
    cached = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.decoding = "async"
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`No se pudo cargar ${url}`))
      img.src = url
    }).then(async (img) => {
      try {
        await img.decode()
      } catch {
        /* algunos navegadores rechazan decode() en SVG ya cargados */
      }
      return img
    })
    cached.catch(() => imageCache.delete(url))
    imageCache.set(url, cached)
  }
  return cached
}

/**
 * Rasteriza el SVG maestro tal cual a 1080 × 1080, una sola vez por plantilla.
 * El navegador interpreta el SVG original (máscaras, filtros e imágenes
 * embebidas incluidas); no se redibuja ni se aproxima nada.
 */
export function loadTemplateArt(svgUrl: string): Promise<HTMLCanvasElement> {
  let cached = artCache.get(svgUrl)
  if (!cached) {
    cached = (async () => {
      const img = await loadImage(svgUrl)
      const canvas = document.createElement("canvas")
      canvas.width = CANVAS_SIZE
      canvas.height = CANVAS_SIZE
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas no disponible")
      ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
      // Safari puede pintar las imágenes embebidas del SVG un fotograma tarde:
      // se espera un fotograma y se vuelve a dibujar.
      await new Promise((r) => requestAnimationFrame(() => r(null)))
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
      ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
      return canvas
    })()
    cached.catch(() => artCache.delete(svgUrl))
    artCache.set(svgUrl, cached)
  }
  return cached
}

/** Espera a que Poppins esté lista para los caracteres concretos que se van a dibujar. */
export async function ensureFonts(weights: number[], text: string) {
  if (!("fonts" in document)) return
  const sample = text.trim() || "Aa"
  await Promise.all(
    weights.map((w) => document.fonts.load(`${w} 40px Poppins`, sample).catch(() => [])),
  )
  await document.fonts.ready
}
