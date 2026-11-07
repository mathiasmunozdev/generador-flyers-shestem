import { useState } from "react"
import { Toaster } from "@/components/ui/sonner"
import { Editor } from "@/components/flyer/Editor"
import { Landing } from "@/components/layout/Landing"
import { SiteHeader } from "@/components/layout/SiteHeader"

type View = "landing" | "editor"

function initialView(): View {
  if (typeof window === "undefined") return "landing"
  const params = new URLSearchParams(window.location.search)
  return window.location.hash === "#crear" || params.has("debug") ? "editor" : "landing"
}

export default function App() {
  const [view, setView] = useState<View>(initialView)

  const go = (next: View) => {
    setView(next)
    history.replaceState(null, "", next === "editor" ? `${window.location.search}#crear` : window.location.pathname + window.location.search)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader onLogoClick={() => go("landing")} />
      <div className="flex-1">{view === "landing" ? <Landing onStart={() => go("editor")} /> : <Editor />}</div>
      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-5 sm:px-6">
          <img
            src="/brand/logos-empresas.png"
            alt="Empresas Intercorp: Intercorp Retail, SIP, Real Plaza, Super Food Holding, Promart Homecenter, InDigital XP, Farmacias Peruanas y Oechsle"
            width={1142}
            height={137}
            loading="lazy"
            className="h-auto max-h-10 w-auto max-w-[85%] sm:max-h-11"
          />
          <p className="text-center text-xs text-muted-foreground">
            SheSTEM 2026 · Tu foto y tus datos se utilizan únicamente para generar tu flyer.
          </p>
        </div>
      </footer>
      <Toaster position="top-center" richColors closeButton />
    </div>
  )
}
