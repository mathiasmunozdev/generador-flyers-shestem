import { useRef, useState } from "react"
import { Camera, ImageUp, LocateFixed, ShieldCheck, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { PHOTO_ACCEPT } from "@/lib/photo"
import { MAX_ZOOM, MIN_ZOOM, type PhotoAsset } from "@/lib/render"
import { CameraDialog } from "./CameraDialog"
import { cn } from "@/lib/utils"

interface PhotoPickerProps {
  photo: PhotoAsset | null
  loading: boolean
  error: string | null
  showRequired: boolean
  zoom: number
  onFile: (file: Blob, name?: string) => void
  onZoomChange: (zoom: number) => void
  onReset: () => void
}

/** En pantallas táctiles se usa la cámara nativa del sistema (más fiable); en desktop, getUserMedia. */
function prefersNativeCamera() {
  return typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches
}

export function PhotoPicker({ photo, loading, error, showRequired, zoom, onFile, onZoomChange, onReset }: PhotoPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const captureRef = useRef<HTMLInputElement>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraSession, setCameraSession] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
    e.target.value = "" // permite volver a elegir el mismo archivo
  }

  const openCamera = () => {
    if (prefersNativeCamera()) captureRef.current?.click()
    else {
      setCameraSession((n) => n + 1) // estado limpio en cada apertura
      setCameraOpen(true)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div className="grid gap-3">
      <input ref={fileRef} type="file" accept={PHOTO_ACCEPT} className="sr-only" tabIndex={-1} onChange={handleInput} aria-hidden />
      <input
        ref={captureRef}
        type="file"
        accept="image/*"
        capture="user"
        className="sr-only"
        tabIndex={-1}
        onChange={handleInput}
        aria-hidden
      />

      {!photo ? (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "grid gap-3 rounded-xl border-2 border-dashed p-4 transition-colors sm:p-5",
            dragOver ? "border-primary bg-accent" : showRequired ? "border-destructive/60 bg-destructive/5" : "border-input bg-muted/40",
          )}
        >
          <p className="text-center text-sm text-muted-foreground">
            Usa una foto donde se vea bien tu rostro. <span className="hidden sm:inline">También puedes arrastrarla aquí.</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button size="lg" className="h-12" onClick={() => fileRef.current?.click()} disabled={loading}>
              {loading ? <Spinner /> : <ImageUp />} Subir foto
            </Button>
            <Button size="lg" variant="outline" className="h-12 bg-card" onClick={openCamera} disabled={loading}>
              <Camera /> Usar cámara
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">JPG o PNG · HEIC si tu navegador lo admite</p>
        </div>
      ) : (
        <div className="grid gap-4 rounded-xl border bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={loading}>
              {loading ? <Spinner /> : <ImageUp />} Cambiar foto
            </Button>
            <Button variant="outline" size="sm" onClick={openCamera} disabled={loading}>
              <Camera /> Cámara
            </Button>
            <Button variant="ghost" size="sm" onClick={onReset} className="ml-auto">
              <LocateFixed /> Centrar
            </Button>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Ajustar encuadre</span>
              <span className="tabular-nums text-muted-foreground">{Math.round(zoom * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Alejar"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => onZoomChange(zoom / 1.15)}
              >
                <ZoomOut className="size-5" />
              </button>
              <Slider
                aria-label="Zoom de la foto"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.01}
                value={[zoom]}
                onValueChange={([v]) => onZoomChange(v)}
                className="[&_[data-slot=slider-thumb]]:size-5"
              />
              <button
                type="button"
                aria-label="Acercar"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => onZoomChange(zoom * 1.15)}
              >
                <ZoomIn className="size-5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Arrastra la foto en la vista previa para moverla. En el celular, pellizca para hacer zoom.
            </p>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {showRequired && !photo && !error && <p className="text-xs text-destructive">Agrega tu foto para continuar.</p>}

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-px size-4 shrink-0 text-primary" />
        <span>
          Tu foto y tus datos se utilizan únicamente para generar tu flyer. Todo se procesa en tu dispositivo y no se envía a ningún servidor.
        </span>
      </p>

      <CameraDialog key={cameraSession} open={cameraOpen} onOpenChange={setCameraOpen} onCapture={(blob) => onFile(blob, "foto-camara.jpg")} />
    </div>
  )
}
