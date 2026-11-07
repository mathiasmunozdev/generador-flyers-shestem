import { ArrowRight, Download, ImagePlus, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TEMPLATES } from "@/config/templates"

const STEPS = [
  { icon: UserRound, title: "Elige tu rol", text: "Graduada o Mentora." },
  { icon: ImagePlus, title: "Agrega tu nombre y foto", text: "Ajusta el encuadre a tu gusto." },
  { icon: Download, title: "Descarga y comparte", text: "PNG listo para LinkedIn." },
]

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <main>
      <section className="brand-gradient relative overflow-hidden text-white">
        <Sparkle className="absolute -right-10 top-10 size-48 opacity-15 sm:size-72" />
        <Sparkle className="absolute -left-12 bottom-0 size-40 opacity-10" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div className="text-center lg:text-left">
            <p className="mb-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide backdrop-blur-sm sm:text-sm">
              Generador oficial de flyers
            </p>
            <h1 className="text-3xl font-extrabold leading-tight text-balance sm:text-5xl lg:text-[3.4rem]">
              ¡Celebra que eres parte de SheSTEM 2026!
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/85 text-pretty sm:text-lg lg:mx-0">
              Crea tu flyer personalizado en menos de un minuto y compártelo en LinkedIn. Sin registros ni contraseñas.
            </p>
            <Button
              size="lg"
              onClick={onStart}
              className="mt-8 h-14 rounded-full bg-white px-8 text-base font-semibold text-brand shadow-xl shadow-black/20 hover:bg-brand-lilac"
            >
              Crear mi flyer <ArrowRight className="size-5" />
            </Button>
          </div>

          <div className="relative mx-auto flex w-full max-w-md justify-center lg:max-w-none">
            <img
              src={TEMPLATES.mentora.thumbnailUrl}
              alt="Ejemplo de flyer Mentora SheSTEM"
              className="absolute left-0 top-6 w-[58%] rotate-[-6deg] rounded-2xl shadow-2xl shadow-black/30 ring-4 ring-white/20"
              width={480}
              height={480}
            />
            <img
              src={TEMPLATES.graduada.thumbnailUrl}
              alt="Ejemplo de flyer Graduada SheSTEM"
              className="relative ml-[38%] w-[62%] rotate-[4deg] rounded-2xl shadow-2xl shadow-black/30 ring-4 ring-white/25"
              width={480}
              height={480}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="flex items-start gap-4 rounded-2xl border bg-card p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wider text-primary">Paso {i + 1}</span>
                <span className="block font-semibold">{title}</span>
                <span className="block text-sm text-muted-foreground">{text}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Tu foto y tus datos se utilizan únicamente para generar tu flyer.
        </p>
      </section>
    </main>
  )
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden fill="white">
      <path d="M50 0C53 30 70 47 100 50C70 53 53 70 50 100C47 70 30 53 0 50C30 47 47 30 50 0Z" />
    </svg>
  )
}
