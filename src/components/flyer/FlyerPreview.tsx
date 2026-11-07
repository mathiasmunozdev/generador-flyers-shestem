import { useEffect, useRef, useState } from "react"
import { Move } from "lucide-react"
import { CANVAS_SIZE } from "@/config/templates"
import { drawFlyer, type FlyerScene } from "@/lib/render"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

interface FlyerPreviewProps {
  scene: Omit<FlyerScene, "mode" | "art"> & { art: CanvasImageSource | null }
  /** Se incrementa cuando termina de cargar una fuente, para redibujar. */
  redrawKey: number
  onPan: (dx: number, dy: number) => void
  onZoomBy: (factor: number) => void
  className?: string
}

export function FlyerPreview({ scene, redrawKey, onPan, onZoomBy, className }: FlyerPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ dist: number; midX: number; midY: number } | null>(null)
  const [interacted, setInteracted] = useState(false)
  const [dragging, setDragging] = useState(false)

  const { art, photo } = scene

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !art) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const id = requestAnimationFrame(() => drawFlyer(ctx, { ...scene, art, mode: "preview" }))
    return () => cancelAnimationFrame(id)
  }, [scene, art, redrawKey])

  // Rueda del ratón / trackpad para zoom (listener no pasivo para evitar el scroll de página).
  useEffect(() => {
    const el = overlayRef.current
    if (!el || !photo) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setInteracted(true)
      onZoomBy(Math.exp(-e.deltaY * 0.0015))
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [photo, onZoomBy])

  const canvasScale = () => {
    const rect = canvasRef.current?.getBoundingClientRect()
    return rect && rect.width ? CANVAS_SIZE / rect.width : 1
  }

  const pinchState = () => {
    const pts = [...pointers.current.values()]
    if (pts.length < 2) return null
    const [a, b] = pts
    return { dist: Math.hypot(a.x - b.x, a.y - b.y), midX: (a.x + b.x) / 2, midY: (a.y + b.y) / 2 }
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!photo) return
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    pinch.current = pinchState()
    setDragging(true)
    setInteracted(true)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId)
    if (!prev) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const s = canvasScale()
    if (pointers.current.size === 1) {
      onPan((e.clientX - prev.x) * s, (e.clientY - prev.y) * s)
      return
    }
    const next = pinchState()
    if (next && pinch.current) {
      if (pinch.current.dist > 0) onZoomBy(next.dist / pinch.current.dist)
      onPan((next.midX - pinch.current.midX) * s, (next.midY - pinch.current.midY) * s)
    }
    pinch.current = next
  }

  const endPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId)
    pinch.current = pinchState()
    if (pointers.current.size === 0) setDragging(false)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!photo) return
    const step = e.shiftKey ? 40 : 10
    const actions: Record<string, () => void> = {
      ArrowLeft: () => onPan(-step, 0),
      ArrowRight: () => onPan(step, 0),
      ArrowUp: () => onPan(0, -step),
      ArrowDown: () => onPan(0, step),
      "+": () => onZoomBy(1.1),
      "=": () => onZoomBy(1.1),
      "-": () => onZoomBy(1 / 1.1),
    }
    const action = actions[e.key]
    if (action) {
      e.preventDefault()
      setInteracted(true)
      action()
    }
  }

  // Área interactiva = parte visible del marco de la foto.
  const f = scene.template.photo
  const left = Math.max(0, f.x)
  const right = Math.min(CANVAS_SIZE, f.x + f.width)
  const overlayStyle = {
    left: `${(left / CANVAS_SIZE) * 100}%`,
    top: `${(f.y / CANVAS_SIZE) * 100}%`,
    width: `${((right - left) / CANVAS_SIZE) * 100}%`,
    height: `${(f.height / CANVAS_SIZE) * 100}%`,
    borderTopRightRadius: `${(f.radius / (right - left)) * 100}% ${(f.radius / f.height) * 100}%`,
    borderBottomRightRadius: `${(f.radius / (right - left)) * 100}% ${(f.radius / f.height) * 100}%`,
  }

  return (
    <div className={cn("relative aspect-square w-full overflow-hidden rounded-2xl bg-brand shadow-xl shadow-brand/20 ring-1 ring-black/5", className)}>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="block h-full w-full"
        role="img"
        aria-label={`Vista previa del flyer ${scene.template.label}`}
      />
      {!art && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
          <Spinner className="size-8" />
          <span className="text-sm font-medium">Cargando plantilla…</span>
        </div>
      )}
      {photo && (
        <div
          ref={overlayRef}
          style={overlayStyle}
          tabIndex={0}
          role="application"
          aria-label="Encuadre de la foto. Arrastra para mover, pellizca o usa la rueda para hacer zoom. Con teclado: flechas para mover, + y − para zoom."
          className={cn(
            "absolute touch-none select-none outline-none transition-shadow focus-visible:ring-4 focus-visible:ring-white/70",
            dragging ? "cursor-grabbing" : "cursor-grab hover:ring-2 hover:ring-white/50",
          )}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onKeyDown={onKeyDown}
        >
          {!interacted && (
            <span className="pointer-events-none absolute inset-x-2 bottom-2 mx-auto flex w-fit max-w-full items-center justify-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-center text-[10px] leading-tight font-medium text-white backdrop-blur-sm sm:bottom-3 sm:px-3 sm:py-1.5 sm:text-xs">
              <Move className="size-3 shrink-0 sm:size-3.5" /> Arrastra para encuadrar
            </span>
          )}
        </div>
      )}
    </div>
  )
}
