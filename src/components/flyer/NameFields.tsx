import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const MAX_LENGTH = 40

interface NameFieldsProps {
  firstName: string
  lastName: string
  onFirstNameChange: (v: string) => void
  onLastNameChange: (v: string) => void
  showErrors: boolean
}

export function NameFields({ firstName, lastName, onFirstNameChange, onLastNameChange, showErrors }: NameFieldsProps) {
  const firstInvalid = showErrors && !firstName.trim()
  const lastInvalid = showErrors && !lastName.trim()
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="first-name">Nombre</Label>
        <Input
          id="first-name"
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          placeholder="Ej. María José"
          autoComplete="given-name"
          autoCapitalize="words"
          spellCheck={false}
          maxLength={MAX_LENGTH}
          aria-invalid={firstInvalid || undefined}
          aria-describedby={firstInvalid ? "first-name-error" : undefined}
          className="h-11 text-base"
        />
        {firstInvalid && (
          <p id="first-name-error" className="text-xs text-destructive">
            Escribe tu nombre.
          </p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="last-name">Apellido</Label>
        <Input
          id="last-name"
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
          placeholder="Ej. Fernández"
          autoComplete="family-name"
          autoCapitalize="words"
          spellCheck={false}
          maxLength={MAX_LENGTH}
          aria-invalid={lastInvalid || undefined}
          aria-describedby={lastInvalid ? "last-name-error" : undefined}
          className="h-11 text-base"
        />
        {lastInvalid && (
          <p id="last-name-error" className="text-xs text-destructive">
            Escribe tu apellido.
          </p>
        )}
      </div>
    </div>
  )
}
