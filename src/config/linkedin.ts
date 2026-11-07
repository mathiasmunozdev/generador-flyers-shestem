import type { RoleId } from "./templates"

/**
 * Textos sugeridos para LinkedIn. Edítalos libremente: la app los muestra tal
 * cual en la tarjeta «Comparte tu logro en LinkedIn».
 */
export const LINKEDIN_TEXTS: Record<RoleId, string> = {
  graduada:
    "¡Hoy celebro ser parte de SheSTEM 2026! 💜 Esta experiencia me permitió fortalecer mi liderazgo y conectar con más mujeres en ciencia, tecnología e innovación. ¡Sigamos abriendo oportunidades para más mujeres en STEM! #SheSTEM #MujeresEnSTEM #LiderazgoFemenino",
  mentora:
    "¡Feliz de ser parte de SheSTEM 2026 como mentora! 💜 Compartir experiencias y acompañar a otras mujeres en su crecimiento es una oportunidad para impulsar más talento en STEM. ¡Sigamos creciendo juntas! #SheSTEM #MujeresEnSTEM #Mentoría #LiderazgoFemenino",
}

/** Abre LinkedIn para que la usuaria publique manualmente (sin integración ni login desde la app). */
export const LINKEDIN_URL = "https://www.linkedin.com/feed/"
