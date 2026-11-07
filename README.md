# Generador de flyers · SheSTEM 2026

Aplicación web de una sola página para que graduadas y mentoras de **SheSTEM 2026** creen su flyer personalizado (foto + nombre), lo descarguen en **PNG 1080 × 1080** y copien un texto sugerido para LinkedIn.

- Sin login, sin backend y sin analítica: la foto y el nombre **nunca salen del navegador**.
- Mobile-first, con vista previa en tiempo real idéntica al PNG exportado.
- Stack: **Vite + React + TypeScript + Tailwind CSS v4 + shadcn/ui**.

## Requisitos

- Node.js 20 o superior (probado con Node 22).

## Ejecutar

```bash
npm install
npm run dev        # http://localhost:5173
```

Producción:

```bash
npm run build      # genera dist/ (sitio 100 % estático)
npm run preview    # sirve dist/ localmente para revisarlo
```

`dist/` se puede publicar en cualquier hosting estático (Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3 + CloudFront, IIS, Nginx…).
**Importante:** publícalo con **HTTPS**; los navegadores solo permiten usar la cámara en sitios seguros. Si la app vive en una subcarpeta (p. ej. `https://dominio.com/flyers/`), agrega `base: "/flyers/"` en `vite.config.ts` y ajusta las rutas de `src/config/templates.ts`.

## Estructura

```
public/
  templates/
    plantilla-graduada.svg   ← arte maestro oficial (sin modificar)
    plantilla-mentora.svg    ← arte maestro oficial (sin modificar)
    ejemplo-*.png            ← referencias oficiales (solo calibración)
    miniatura-*.webp         ← miniaturas de las tarjetas de rol (de los ejemplos)
  brand/                     ← logo del encabezado, logos de empresas del footer (recortados del arte oficial) y favicon
src/
  config/
    templates.ts             ← coordenadas de foto y nombre POR PLANTILLA + peso de fuente
    linkedin.ts              ← textos sugeridos de LinkedIn (editables)
  lib/
    render.ts                ← drawFlyer(): única función de composición (preview y PNG)
    name-layout.ts           ← ajuste automático del nombre (tamaño y líneas)
    assets.ts                ← carga/rasterizado del SVG y espera de fuentes
    photo.ts                 ← lectura de la foto (EXIF, reducción, errores HEIC)
    export.ts                ← PNG, descarga y copiar al portapapeles
  hooks/usePhotoTransform.ts ← estado del encuadre (zoom + desplazamiento)
  components/
    flyer/                   ← Editor, vista previa, selector de rol, campos, foto, cámara, LinkedIn
    layout/                  ← encabezado y landing
    ui/                      ← componentes shadcn/ui
```

## Cómo se compone el flyer

`src/lib/render.ts → drawFlyer()` dibuja, en este orden, sobre un lienzo de 1080 × 1080:

1. **Arte maestro SVG**, rasterizado por el propio navegador a 1080 × 1080 (máscaras, filtros e imágenes embebidas incluidas; nada se redibuja ni se aproxima).
2. **Foto** de la usuaria, recortada al rectángulo redondeado del marco.
3. **Nombre** en Poppins blanca.

> **Nota sobre el orden de capas.** El brief proponía poner el arte encima de la foto, pero los SVG entregados son **totalmente opacos** y no tienen un hueco para la foto (esa zona es solo fondo morado). Por eso la foto se dibuja encima del arte, recortada con la misma forma que en los ejemplos. Se verificó píxel a píxel que nada del arte oficial queda tapado salvo la zona de la foto, igual que en los PNG de ejemplo.

La vista previa y la descarga usan exactamente la misma función: el PNG exportado es idéntico, píxel por píxel, a lo que se ve en pantalla.

## Cómo cargar o reemplazar las plantillas oficiales

1. Exporta el arte nuevo como SVG de **1080 × 1080** (o con `viewBox` cuadrado), con los textos convertidos a trazos o las fuentes embebidas.
2. Reemplaza `public/templates/plantilla-graduada.svg` y/o `plantilla-mentora.svg` (mismo nombre) o cambia `svgUrl` en `src/config/templates.ts`.
3. Reemplaza también el PNG de ejemplo correspondiente (`ejemplo-*.png`) para poder calibrar.
4. Si cambió la posición de la foto o del nombre, calibra (siguiente sección).

## Cómo calibrar

1. Ejecuta `npm run dev` y abre **`http://localhost:5173/?debug=1`**.
2. La vista previa superpone el **PNG de ejemplo oficial al 50 %** y dibuja:
   - en **cian**, el marco de la foto (`photo`);
   - en **amarillo**, la caja del nombre (`minTop`/`maxBottom`/`maxWidth`) y su centro vertical (`centerY`).
3. Escribe el mismo nombre del ejemplo (p. ej. «Carla» / «Fernández») y ajusta los valores en `src/config/templates.ts` hasta que todo coincida. Vite recarga al guardar.

Valores actuales (iguales en ambos roles, pero configurados por separado):

| Campo | Valor | Origen |
|---|---|---|
| `photo` | x −32, y 80,5, 501 × 766,5, radio 46 | medido comparando SVG vs ejemplo |
| `name.x` | 540 | inicio del texto en los ejemplos |
| `name.centerY` | 325 | centro del bloque de 2 líneas de los ejemplos |
| `name.maxFontSize` | 74,67 px | tamaño de los ejemplos (56 pt en el viewBox de 810) |
| `name.lineHeight` | 1,22 | separación entre líneas base de los ejemplos |
| `minTop` / `maxBottom` | 180 / 472 | debajo del logo / encima de la línea de puntos |

### Peso de la fuente del nombre

El brief pide **Poppins ExtraBold (800)** y así está configurado. Al medir los ejemplos oficiales, el nombre coincide con **Poppins Bold (700)**: el ancho de las cuatro palabras de ejemplo encaja con 700 y no con 800. Si se prefiere replicar los ejemplos al píxel, cambia `NAME_FONT_WEIGHT` a `700` en `src/config/templates.ts`.

### Nombres largos

`src/lib/name-layout.ts` prueba tres opciones: nombre y apellido en 2 líneas (como los ejemplos), y repartir las palabras en 3 o 4 líneas. Elige la que permite la letra más grande, con una leve preferencia por menos líneas. Nunca invade el logo ni la línea de puntos. Conserva tildes, ñ y nombres compuestos tal como se escriben.

## Textos de LinkedIn

Se editan en `src/config/linkedin.ts`. La publicación es manual: la app copia el texto y ofrece un enlace para abrir LinkedIn (sin autenticación ni API).

## Privacidad

- Todo el procesamiento ocurre en el navegador (Canvas 2D). No hay servidor, base de datos ni analítica.
- La cámara solo se solicita al pulsar «Usar cámara». En celulares se usa la cámara nativa del sistema; en desktop, `getUserMedia`, y el flujo se detiene al cerrar el diálogo.
- Las URLs temporales de objetos se liberan y los lienzos de fotos anteriores se vacían.
- Las fuentes Poppins se sirven desde el propio sitio (`@fontsource/poppins`), sin Google Fonts.

## Fotos

- JPG, PNG y WebP. HEIC/HEIF solo si el navegador puede decodificarlo (Safari); si no, se muestra un mensaje claro para convertirla.
- Se respeta la orientación EXIF y se reduce a un máximo de 2400 px por lado para cuidar la memoria en móviles.
- Encuadre: arrastrar, rueda del ratón, pellizco, deslizador de zoom, botones ± y teclado (flechas y + / −).

## shadcn/ui

Los componentes de `src/components/ui/` son los oficiales de shadcn (estilo *new-york v4*), con `components.json` configurado. Para agregar más:

```bash
npx shadcn@latest add tooltip
```

## Pruebas realizadas

- Flujo completo automatizado en Chromium (desktop 1440 px y iPhone 13 emulado): validaciones, carga de foto, zoom, arrastre y pellizco táctil, cambio de rol, descarga, copiar texto, cámara simulada (permitida y denegada) y error HEIC.
- El PNG descargado mide 1080 × 1080 y es idéntico a la vista previa.
- El arte exportado coincide al 100 % con el SVG renderizado por el navegador.
- Con peso 700, el nombre coincide en un 96 % con la posición de los ejemplos oficiales (el resto es suavizado de bordes).

**Pendiente de validar en dispositivos reales:** Safari en iPhone y Chrome en Android (cámara nativa, descarga del PNG y portapapeles).
