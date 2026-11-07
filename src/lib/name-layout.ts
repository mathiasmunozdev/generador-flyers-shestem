import type { NameBox } from "@/config/templates"

export interface NameLayout {
  lines: string[]
  fontSize: number
  font: string
  /** Línea base (y) de cada línea. */
  baselines: number[]
  x: number
}

/** Proporción de la altura de mayúsculas y del descendente de Poppins respecto al tamaño de letra. */
const CAP_HEIGHT_RATIO = 0.74
const DESCENDER_RATIO = 0.28

export function nameFont(weight: number, size: number) {
  return `${weight} ${size}px Poppins`
}

/** Limpia espacios sobrantes. Conserva mayúsculas, tildes y caracteres tal como se escribieron. */
export function normalizeNamePart(value: string) {
  return value.normalize("NFC").replace(/\s+/g, " ").trim()
}

function wrapWords(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] | null {
  const words = text.split(" ").filter(Boolean)
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    if (ctx.measureText(word).width > maxWidth) return null
    const candidate = current ? `${current} ${word}` : word
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate
    } else {
      lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines
}

function tryLayout(
  ctx: CanvasRenderingContext2D,
  parts: string[],
  box: NameBox,
  size: number,
  maxLines: number,
  allowWrap: boolean,
): NameLayout | null {
  ctx.font = nameFont(box.fontWeight, size)
  const lines: string[] = []
  for (const part of parts) {
    if (allowWrap) {
      const wrapped = wrapWords(ctx, part, box.maxWidth)
      if (!wrapped) return null
      lines.push(...wrapped)
    } else {
      if (ctx.measureText(part).width > box.maxWidth) return null
      lines.push(part)
    }
  }
  if (lines.length > maxLines) return null

  const lineGap = size * box.lineHeight
  const capHeight = size * CAP_HEIGHT_RATIO
  const blockHeight = capHeight + (lines.length - 1) * lineGap
  let top = box.centerY - blockHeight / 2
  // Mantener el bloque dentro de sus límites (logo arriba, línea de puntos abajo).
  const bottomWithDescender = top + blockHeight + size * DESCENDER_RATIO
  if (bottomWithDescender > box.maxBottom) top -= bottomWithDescender - box.maxBottom
  if (top < box.minTop) return null

  const firstBaseline = top + capHeight
  return {
    lines,
    fontSize: size,
    font: nameFont(box.fontWeight, size),
    baselines: lines.map((_, i) => firstBaseline + i * lineGap),
    x: box.x,
  }
}

/** Penalización por cada línea extra: se prefiere menos líneas salvo que más líneas permitan letra claramente mayor. */
const EXTRA_LINE_PENALTY = 0.07

/**
 * Calcula cómo se dibuja el nombre:
 * - Opción base: nombre en una línea y apellido en otra (como en los ejemplos).
 * - Alternativas: repartir las palabras en 3 o 4 líneas.
 * Para cada opción se busca el mayor tamaño que cabe y se elige la que deja
 * la letra más grande (con una leve preferencia por menos líneas).
 * Último recurso: reducir por debajo del mínimo hasta que entre.
 */
export function layoutName(
  ctx: CanvasRenderingContext2D,
  firstName: string,
  lastName: string,
  box: NameBox,
): NameLayout | null {
  const parts = [normalizeNamePart(firstName), normalizeNamePart(lastName)].filter(Boolean)
  if (parts.length === 0) return null

  ctx.save()
  try {
    const options: Array<{ maxLines: number; wrap: boolean }> = [
      { maxLines: 2, wrap: false },
      { maxLines: 3, wrap: true },
      { maxLines: 4, wrap: true },
    ]
    let best: { layout: NameLayout; score: number } | null = null
    for (const opt of options) {
      for (let size = box.maxFontSize; size >= box.minFontSize; size -= 1) {
        const layout = tryLayout(ctx, parts, box, size, opt.maxLines, opt.wrap)
        if (!layout) continue
        const score = size * (1 - EXTRA_LINE_PENALTY * Math.max(0, layout.lines.length - 2))
        if (!best || score > best.score) best = { layout, score }
        break
      }
    }
    if (best) return best.layout
    // Palabras extremadamente largas: seguir reduciendo hasta que quepan.
    for (let size = box.minFontSize; size >= 12; size -= 1) {
      const layout = tryLayout(ctx, parts, box, size, 4, true)
      if (layout) return layout
    }
    return null
  } finally {
    ctx.restore()
  }
}
