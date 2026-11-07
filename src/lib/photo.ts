import type { PhotoAsset } from "./render"

/** Tamaño máximo del lado mayor tras reducir la foto (ahorra memoria en móviles). */
const MAX_PHOTO_SIDE = 2400
const MAX_FILE_BYTES = 25 * 1024 * 1024
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]

export const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"

export class PhotoError extends Error {}

function isHeic(file: File) {
  return /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name)
}

/**
 * Convierte el archivo en un lienzo listo para dibujar, respetando la
 * orientación EXIF. Todo ocurre en el navegador: la foto no se sube a ningún servidor.
 */
export async function loadPhotoFromFile(file: File | Blob, fileName = "foto"): Promise<PhotoAsset> {
  const name = file instanceof File ? file.name : fileName
  const asFile = file instanceof File ? file : null
  if (asFile && file.type && !ACCEPTED.includes(file.type.toLowerCase()) && !isHeic(asFile)) {
    throw new PhotoError("Formato no compatible. Usa una foto JPG o PNG.")
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new PhotoError("La foto pesa demasiado (máx. 25 MB). Prueba con otra o con una captura.")
  }

  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error("decode"))
      el.src = url
    })
    const w = img.naturalWidth
    const h = img.naturalHeight
    if (!w || !h) throw new Error("decode")

    const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(w, h))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(w * scale)
    canvas.height = Math.round(h * scale)
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("canvas")
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return { source: canvas, width: canvas.width, height: canvas.height, fileName: name }
  } catch (err) {
    if (err instanceof PhotoError) throw err
    if (asFile && isHeic(asFile)) {
      throw new PhotoError(
        "Tu navegador no puede abrir fotos HEIC. Conviértela a JPG o PNG (o haz una captura de pantalla) e inténtalo de nuevo.",
      )
    }
    throw new PhotoError("No pudimos leer esta imagen. Prueba con otra foto JPG o PNG.")
  } finally {
    URL.revokeObjectURL(url)
  }
}
