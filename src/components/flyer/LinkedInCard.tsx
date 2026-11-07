import { forwardRef, useState } from "react"
import { Check, Copy, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LINKEDIN_TEXTS, LINKEDIN_URL } from "@/config/linkedin"
import type { RoleId } from "@/config/templates"
import { copyText } from "@/lib/export"

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}

export const LinkedInCard = forwardRef<HTMLDivElement, { role: RoleId }>(function LinkedInCard({ role }, ref) {
  const [copied, setCopied] = useState(false)
  const text = LINKEDIN_TEXTS[role]

  const onCopy = async () => {
    const ok = await copyText(text)
    if (ok) {
      setCopied(true)
      toast.success("Texto copiado", { description: "Pégalo en tu publicación de LinkedIn junto a tu flyer." })
      setTimeout(() => setCopied(false), 2500)
    } else {
      toast.error("No se pudo copiar automáticamente", { description: "Selecciona el texto y cópialo manualmente." })
    }
  }

  return (
    <Card ref={ref} className="scroll-mt-6 gap-4 border-primary/20 bg-gradient-to-b from-accent to-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <LinkedInIcon className="size-5 text-[#0a66c2]" /> Comparte tu logro en LinkedIn
        </CardTitle>
        <CardDescription>Copia este texto, abre LinkedIn y adjunta el flyer que descargaste.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <p className="select-all whitespace-pre-line rounded-lg border bg-card p-3 text-sm leading-relaxed">{text}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button size="lg" onClick={onCopy} className="h-11">
            {copied ? <Check /> : <Copy />} {copied ? "¡Copiado!" : "Copiar texto"}
          </Button>
          <Button size="lg" variant="outline" className="h-11 bg-card" asChild>
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink /> Abrir LinkedIn
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})
