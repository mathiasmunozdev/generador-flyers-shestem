import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Download, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { TEMPLATES, type RoleId } from "@/config/templates"
import { usePhotoTransform } from "@/hooks/usePhotoTransform"
import { ensureFonts, loadImage, loadTemplateArt } from "@/lib/assets"
import { downloadBlob, flyerFileName, renderFlyerPng } from "@/lib/export"
import { loadPhotoFromFile, PhotoError } from "@/lib/photo"
import type { PhotoAsset } from "@/lib/render"
import { FlyerPreview } from "./FlyerPreview"
import { LinkedInCard } from "./LinkedInCard"
import { NameFields } from "./NameFields"
import { PhotoPicker } from "./PhotoPicker"
import { RoleSelector } from "./RoleSelector"

const DEBUG = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug")

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3" aria-labelledby={`step-${n}`}>
      <h2 id={`step-${n}`} className="flex items-center gap-2.5 text-base font-semibold sm:text-lg">
        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

export function Editor() {
  const [role, setRole] = useState<RoleId>("graduada")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [photo, setPhoto] = useState<PhotoAsset | null>(null)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [arts, setArts] = useState<Partial<Record<RoleId, HTMLCanvasElement>>>({})
  const [examples, setExamples] = useState<Partial<Record<RoleId, HTMLImageElement>>>({})
  const [artError, setArtError] = useState(false)
  const [fontKey, setFontKey] = useState(0)
  const [showErrors, setShowErrors] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const shareRef = useRef<HTMLDivElement>(null)

  const template = TEMPLATES[role]
  const { transform, pan, setZoom, zoomBy, reset } = usePhotoTransform(template.photo, photo)

  // Precarga de ambas plantillas para que el cambio de rol sea inmediato.
  useEffect(() => {
    let alive = true
    for (const id of Object.keys(TEMPLATES) as RoleId[]) {
      loadTemplateArt(TEMPLATES[id].svgUrl)
        .then((art) => alive && setArts((a) => ({ ...a, [id]: art })))
        .catch(() => alive && setArtError(true))
      if (DEBUG) loadImage(TEMPLATES[id].exampleUrl).then((img) => alive && setExamples((e) => ({ ...e, [id]: img })))
    }
    return () => {
      alive = false
    }
  }, [])

  // Redibujar cuando Poppins termine de cargar los caracteres del nombre (tildes, ñ, etc.).
  useEffect(() => {
    let alive = true
    ensureFonts([template.name.fontWeight, 600], `${firstName} ${lastName} Tu nombre apellido foto aquí`).then(
      () => alive && setFontKey((k) => k + 1),
    )
    return () => {
      alive = false
    }
  }, [firstName, lastName, template.name.fontWeight])

  const onFile = useCallback(
    async (file: Blob, name?: string) => {
      setPhotoLoading(true)
      setPhotoError(null)
      try {
        const asset = await loadPhotoFromFile(file, name)
        setPhoto(asset)
        reset()
      } catch (err) {
        setPhotoError(err instanceof PhotoError ? err.message : "No pudimos leer esta imagen. Prueba con otra foto.")
      } finally {
        setPhotoLoading(false)
      }
    },
    [reset],
  )

  // Liberar el lienzo de la foto anterior al reemplazarla.
  useEffect(() => {
    return () => {
      if (photo?.source instanceof HTMLCanvasElement) {
        photo.source.width = 0
        photo.source.height = 0
      }
    }
  }, [photo])

  const scene = useMemo(
    () => ({
      template,
      art: arts[role] ?? null,
      photo,
      transform,
      firstName,
      lastName,
      debug: DEBUG ? { example: examples[role] ?? null } : undefined,
    }),
    [template, arts, role, photo, transform, firstName, lastName, examples],
  )

  const missing = [
    !firstName.trim() && "nombre",
    !lastName.trim() && "apellido",
    !photo && "foto",
  ].filter(Boolean) as string[]

  const onDownload = async () => {
    if (missing.length) {
      setShowErrors(true)
      toast.error("Falta completar tu flyer", { description: `Agrega tu ${missing.join(", ").replace(/, ([^,]*)$/, " y $1")}.` })
      return
    }
    const art = arts[role]
    if (!art || !photo) return
    setGenerating(true)
    try {
      const blob = await renderFlyerPng({ template, art, photo, transform, firstName, lastName })
      downloadBlob(blob, flyerFileName(role, firstName, lastName))
      toast.success("¡Tu flyer está listo!", { description: "Revisa tus descargas. Ahora compártelo en LinkedIn." })
      setDownloaded(true)
      setTimeout(() => shareRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150)
    } catch {
      toast.error("No pudimos generar tu flyer", { description: "Inténtalo de nuevo. Si persiste, prueba con otro navegador." })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Crea tu flyer</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">Completa los pasos y mira el resultado en tiempo real.</p>
      </div>

      <div className="grid gap-8 [grid-template-areas:'role'_'preview'_'form'] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-x-12 lg:[grid-template-areas:'role_preview'_'form_preview']">
        <div className="[grid-area:role]">
          <Step n={1} title="Elige tu rol">
            <RoleSelector value={role} onChange={setRole} />
          </Step>
        </div>

        <div className="[grid-area:preview]">
          <div className="lg:sticky lg:top-24">
            <FlyerPreview scene={scene} redrawKey={fontKey} onPan={pan} onZoomBy={zoomBy} />
            {artError && (
              <p className="mt-2 text-sm text-destructive">No se pudo cargar la plantilla. Recarga la página para intentarlo de nuevo.</p>
            )}
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Vista previa en tiempo real · El PNG final mide 1080 × 1080 px
              {DEBUG && " · Modo calibración (ejemplo oficial superpuesto al 50 %)"}
            </p>
          </div>
        </div>

        <div className="grid content-start gap-8 [grid-area:form]">
          <Step n={2} title="Escribe tu nombre">
            <NameFields
              firstName={firstName}
              lastName={lastName}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
              showErrors={showErrors}
            />
          </Step>

          <Step n={3} title="Agrega tu foto">
            <PhotoPicker
              photo={photo}
              loading={photoLoading}
              error={photoError}
              showRequired={showErrors}
              zoom={transform.zoom}
              onFile={onFile}
              onZoomChange={setZoom}
              onReset={reset}
            />
          </Step>

          <Step n={4} title="Descarga y comparte">
            <div className="grid gap-2">
              <Button
                size="lg"
                onClick={onDownload}
                disabled={generating || !arts[role]}
                className="h-14 rounded-xl text-base font-semibold shadow-lg shadow-primary/25"
              >
                {generating ? <Spinner className="size-5" /> : <Download className="size-5" />}
                {generating ? "Generando…" : "Descargar mi flyer"}
              </Button>
            </div>
            {downloaded && (
              <>
                <LinkedInCard ref={shareRef} role={role} />
                <Button
                  variant="ghost"
                  className="justify-self-center text-muted-foreground"
                  onClick={() => {
                    setPhoto(null)
                    setFirstName("")
                    setLastName("")
                    setShowErrors(false)
                    setDownloaded(false)
                    reset()
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                >
                  <RotateCcw /> Crear otro flyer
                </Button>
              </>
            )}
          </Step>
        </div>
      </div>
    </main>
  )
}
