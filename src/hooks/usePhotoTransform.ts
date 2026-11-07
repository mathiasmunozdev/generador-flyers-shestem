import { useCallback, useMemo, useState } from "react"
import type { PhotoFrame } from "@/config/templates"
import { clampTransform, DEFAULT_TRANSFORM, MAX_ZOOM, MIN_ZOOM, type PhotoAsset, type PhotoTransform } from "@/lib/render"

/** Estado del encuadre de la foto (zoom + desplazamiento), siempre ajustado al marco. */
export function usePhotoTransform(frame: PhotoFrame, photo: PhotoAsset | null) {
  const [transform, setTransform] = useState<PhotoTransform>(DEFAULT_TRANSFORM)

  // Al cambiar de foto o de plantilla, el encuadre se valida al vuelo.
  const clamped = useMemo(() => clampTransform(frame, photo, transform), [frame, photo, transform])

  const pan = useCallback(
    (dx: number, dy: number) =>
      setTransform((t) => clampTransform(frame, photo, { ...t, offsetX: t.offsetX + dx, offsetY: t.offsetY + dy })),
    [frame, photo],
  )

  const setZoom = useCallback(
    (zoom: number) =>
      setTransform((t) => {
        const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom))
        const k = z / t.zoom
        // Mantiene el punto central del marco fijo al hacer zoom.
        return clampTransform(frame, photo, { zoom: z, offsetX: t.offsetX * k, offsetY: t.offsetY * k })
      }),
    [frame, photo],
  )

  const zoomBy = useCallback(
    (factor: number) =>
      setTransform((t) => {
        const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, t.zoom * factor))
        const k = z / t.zoom
        return clampTransform(frame, photo, { zoom: z, offsetX: t.offsetX * k, offsetY: t.offsetY * k })
      }),
    [frame, photo],
  )

  const reset = useCallback(() => setTransform(DEFAULT_TRANSFORM), [])

  return { transform: clamped, pan, setZoom, zoomBy, reset }
}
