/**
 * Configuración de las plantillas oficiales de SheSTEM 2026.
 *
 * Todas las coordenadas están en píxeles del lienzo final (1080 × 1080).
 * Fueron medidas comparando cada SVG maestro con su PNG de ejemplo
 * (ver README → «Cómo calibrar las plantillas»). Para ajustarlas, abre la
 * app con `?debug=1`: se superpone el ejemplo oficial y se dibujan las cajas.
 */

export type RoleId = "graduada" | "mentora"

export interface PhotoFrame {
  /** Esquina superior izquierda del rectángulo de la foto (puede salir del lienzo). */
  x: number
  y: number
  width: number
  height: number
  /** Radio de las esquinas redondeadas. */
  radius: number
}

export interface NameBox {
  /** Inicio del texto (alineado a la izquierda). */
  x: number
  /** Ancho máximo disponible para cada línea. */
  maxWidth: number
  /**
   * Centro vertical del bloque de nombre, medido desde la parte superior de
   * las mayúsculas de la primera línea hasta la línea base de la última.
   */
  centerY: number
  /** Límites verticales que el bloque no puede invadir (logo arriba, puntos abajo). */
  minTop: number
  maxBottom: number
  /** Tamaño de letra máximo (el de los ejemplos oficiales) y mínimo permitido. */
  maxFontSize: number
  minFontSize: number
  /** Interlineado como múltiplo del tamaño de letra. */
  lineHeight: number
  /** Grosor de Poppins usado para el nombre. */
  fontWeight: number
  color: string
}

export interface FlyerTemplate {
  id: RoleId
  label: string
  shortLabel: string
  description: string
  /** Arte maestro oficial (no se modifica). */
  svgUrl: string
  /** PNG de referencia, solo para calibrar y para las miniaturas. */
  exampleUrl: string
  thumbnailUrl: string
  photo: PhotoFrame
  name: NameBox
}

export const CANVAS_SIZE = 1080

/**
 * Peso del nombre dentro del flyer.
 * El brief pide Poppins ExtraBold (800). Los PNG de ejemplo oficiales están
 * compuestos con Poppins Bold (700): si se prefiere replicarlos al píxel,
 * cambia este valor a 700.
 */
export const NAME_FONT_WEIGHT = 800

export const TEMPLATES: Record<RoleId, FlyerTemplate> = {
  graduada: {
    id: "graduada",
    label: "Graduada SheSTEM",
    shortLabel: "Graduada",
    description: "Completaste el programa SheSTEM 2026.",
    svgUrl: "/templates/plantilla-graduada.svg",
    exampleUrl: "/templates/ejemplo-graduada.png",
    thumbnailUrl: "/templates/miniatura-graduada.webp",
    photo: { x: -32, y: 80.5, width: 501, height: 766.5, radius: 46 },
    name: {
      x: 540,
      maxWidth: 490,
      centerY: 325,
      minTop: 180,
      maxBottom: 472,
      maxFontSize: 74.67,
      minFontSize: 34,
      lineHeight: 1.22,
      fontWeight: NAME_FONT_WEIGHT,
      color: "#ffffff",
    },
  },
  mentora: {
    id: "mentora",
    label: "Mentora SheSTEM",
    shortLabel: "Mentora",
    description: "Acompañaste a otras mujeres en SheSTEM 2026.",
    svgUrl: "/templates/plantilla-mentora.svg",
    exampleUrl: "/templates/ejemplo-mentora.png",
    thumbnailUrl: "/templates/miniatura-mentora.webp",
    photo: { x: -32, y: 80.5, width: 501, height: 766.5, radius: 46 },
    name: {
      x: 540,
      maxWidth: 490,
      centerY: 325,
      minTop: 180,
      maxBottom: 472,
      maxFontSize: 74.67,
      minFontSize: 34,
      lineHeight: 1.22,
      fontWeight: NAME_FONT_WEIGHT,
      color: "#ffffff",
    },
  },
}

export const ROLE_ORDER: RoleId[] = ["graduada", "mentora"]
