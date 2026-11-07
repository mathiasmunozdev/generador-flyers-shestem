import { useEffect, useRef, useState } from "react"
import { Camera, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"

interface CameraDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCapture: (blob: Blob) => void
}

type CameraState = { status: "starting" } | { status: "live" } | { status: "error"; title: string; message: string }

function describeCameraError(err: unknown): { title: string; message: string } {
  const name = err instanceof DOMException ? err.name : ""
  if (name === "NotAllowedError" || name === "SecurityError") {
    return {
      title: "Permiso de cámara denegado",
      message: "Habilita la cámara para este sitio en la configuración de tu navegador, o sube una foto desde tu dispositivo.",
    }
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return { title: "No encontramos una cámara", message: "Conecta una cámara o sube una foto desde tu dispositivo." }
  }
  if (name === "NotReadableError") {
    return { title: "La cámara está ocupada", message: "Cierra otras apps que estén usando la cámara e inténtalo de nuevo." }
  }
  return {
    title: "No se pudo abrir la cámara",
    message: "Revisa que hayas permitido el acceso a la cámara en tu navegador, o sube una foto desde tu dispositivo.",
  }
}

/** Captura con la cámara usando getUserMedia. El permiso se pide solo al abrir este diálogo. */
export function CameraDialog({ open, onOpenChange, onCapture }: CameraDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [state, setState] = useState<CameraState>({ status: "starting" })
  const [attempt, setAttempt] = useState(0)

  const retry = () => {
    setState({ status: "starting" })
    setAttempt((a) => a + 1)
  }

  useEffect(() => {
    if (!open) return
    let cancelled = false
    const video = videoRef.current

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      queueMicrotask(() =>
        setState({
          status: "error",
          title: "Cámara no disponible",
          message: "Tu navegador solo permite usar la cámara en sitios seguros (HTTPS). Sube una foto desde tu dispositivo.",
        }),
      )
      return
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1920 } }, audio: false })
      .then(async (stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        const el = videoRef.current
        if (el) {
          el.srcObject = stream
          await el.play().catch(() => undefined)
        }
        setState({ status: "live" })
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", ...describeCameraError(err) })
      })

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      if (video) video.srcObject = null
    }
  }, [open, attempt])

  const capture = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    // La vista de la cámara frontal se muestra en espejo; la foto se guarda igual que se ve.
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        canvas.width = 0
        canvas.height = 0
        if (blob) {
          onCapture(blob)
          onOpenChange(false)
        }
      },
      "image/jpeg",
      0.92,
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tómate una foto</DialogTitle>
          <DialogDescription>Mira a la cámara y sonríe. Luego podrás ajustar el encuadre.</DialogDescription>
        </DialogHeader>

        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-black sm:aspect-[4/3]">
          <video ref={videoRef} playsInline muted className="h-full w-full -scale-x-100 object-cover" />
          {state.status === "starting" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-sm text-white/90">
              <Spinner className="size-6" />
              Esperando permiso de cámara…
            </div>
          )}
          {state.status === "error" && (
            <div className="absolute inset-0 flex items-center justify-center bg-background p-4">
              <Alert variant="destructive">
                <AlertTitle>{state.title}</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {state.status === "error" ? (
            <Button variant="outline" onClick={retry}>
              <RefreshCw /> Reintentar
            </Button>
          ) : (
            <Button size="lg" onClick={capture} disabled={state.status !== "live"} className="w-full sm:w-auto">
              <Camera /> Tomar foto
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
