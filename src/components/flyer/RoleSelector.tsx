import { Check } from "lucide-react"
import { ROLE_ORDER, TEMPLATES, type RoleId } from "@/config/templates"
import { cn } from "@/lib/utils"

interface RoleSelectorProps {
  value: RoleId
  onChange: (role: RoleId) => void
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div role="radiogroup" aria-label="Elige tu rol" className="grid grid-cols-2 gap-3">
      {ROLE_ORDER.map((id) => {
        const t = TEMPLATES[id]
        const selected = id === value
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(id)}
            className={cn(
              "flex items-start justify-between gap-3 rounded-xl border-2 p-4 text-left transition-all outline-none focus-visible:ring-4 focus-visible:ring-ring/40",
              selected
                ? "border-primary bg-accent shadow-md shadow-primary/10"
                : "border-border bg-card hover:border-primary/40",
            )}
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-tight sm:text-base">{t.label}</span>
              <span className="mt-1 block text-xs text-muted-foreground sm:text-sm">{t.description}</span>
            </span>
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                selected ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card",
              )}
              aria-hidden
            >
              {selected && <Check className="size-3" strokeWidth={3} />}
            </span>
          </button>
        )
      })}
    </div>
  )
}
