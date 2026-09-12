<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/openslop-lockup-animated-dark.svg">
    <img src="../../assets/openslop-lockup-animated-light.svg" alt="OpenSlop" width="560">
  </picture>
</p>

<p align="center"><b>Creador de vídeo con IA, libre y de código abierto.</b></p>

<p align="center">
  <a href="https://openslop.ai"><img src="https://img.shields.io/badge/status-private%20beta-6b6bcf?style=flat" alt="Estado: beta privada"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue?style=flat" alt="Licencia: Apache-2.0"></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js" alt="Next.js 16"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white" alt="React 19"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript 5"></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4"></a>
  <a href="https://discord.gg/zeP5482ced"><img src="https://img.shields.io/badge/Discord-Join-5865F2?style=flat&logo=discord&logoColor=white" alt="Discord"></a>
</p>

<p align="center">
  <sub><a href="../../README.md">English</a> · <a href="README.zh-CN.md">中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · Español · <a href="README.fr.md">Français</a> · <a href="README.pt.md">Português</a></sub>
</p>

<p align="center">
  <a href="https://openslop.ai"><b>openslop.ai</b></a>
  &nbsp;·&nbsp;
  <a href="https://app.openslop.ai">app.openslop.ai</a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/openslop-demo-dark.svg">
    <img src="../../assets/openslop-demo-light.svg" alt="OpenSlop - tu creador de vídeo con IA gratuito" width="100%">
  </picture>
</p>

---

> **Beta privada.** Por ahora solo con invitación.
> [Apúntate a la lista de espera en openslop.ai](https://openslop.ai) para entrar.

## Resumen

OpenSlop conecta todas tus herramientas de IA favoritas en un solo flujo de trabajo para que hagas vídeos que se vean bien en minutos, sin saltar entre diez pestañas. Tú pones tus cuentas de IA, OpenSlop pone el flujo de trabajo. Eso es todo.

Corre en tu navegador, no hay nada que instalar. Código abierto, gratis para siempre. Hecho por ingenieros de Meta, Google, Stripe y Dropbox.

## Funciones

<table>
<tr>
<td width="50%" valign="middle">

### Describe tu vídeo

Escribe una línea. Elige 16:9 o 9:16, un idioma, un modelo y una duración, o pega un guion que ya tengas. Hay siete plantillas por si necesitas un empujón.

[El compositor →](../../app/components/copilot/ComposerCopilot.tsx)

</td>
<td width="50%">
  <a href="../../app/components/copilot/ComposerCopilot.tsx"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/describe-dark.svg">
    <img src="../../assets/features/describe-light.svg" alt="La caja de prompt recorre ideas de ejemplo, luego se escribe una línea y se envía" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Sloppy lo escribe contigo

El copiloto vive en el panel izquierdo. Lee el guion, esboza la historia, escribe las escenas y ajusta los clips al diálogo. Todo lo que hace aparece en el lienzo mientras miras.

[Cómo funciona un turno →](../../ARCHITECTURE.md#sloppy)

</td>
<td width="50%">
  <a href="../../ARCHITECTURE.md#sloppy"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/sloppy-dark.svg">
    <img src="../../assets/features/sloppy-light.svg" alt="Sloppy piensa, lee, esboza, escribe un guion y las escenas aparecen en el lienzo" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Un storyboard, no una caja de prompt

Cada escena es una pila de tarjetas: narración, personaje, imagen, imagen animada, clip, sonido, música. Edita cualquier prompt, elige un modelo por tarjeta, arrastra para reordenar e inserta donde pases el ratón.

[El modelo de documento →](../../lib/canvas)

</td>
<td width="50%">
  <a href="../../lib/canvas"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/canvas-dark.svg">
    <img src="../../assets/features/canvas-light.svg" alt="Al pasar el ratón por una fila se abre el menú de inserción con los siete tipos de elemento y aparece una tarjeta de Sound nueva" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Un clic lo genera todo

Generate all (generar todo) pone en cola cada elemento y corre primero las dependencias: un fotograma fijo antes de su clip animado, un avatar antes de la imagen en la que aparece. Cambia un prompt después y la tarjeta dice **Stale** (obsoleto) y por qué.

[El grafo de generación →](../../ARCHITECTURE.md#generation-graph)

</td>
<td width="50%">
  <a href="../../ARCHITECTURE.md#generation-graph"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/generate-dark.svg">
    <img src="../../assets/features/generate-light.svg" alt="Generate all corre la cola, las vistas previas se rellenan y un prompt editado se marca como Stale con un motivo" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Reproductor y línea de tiempo

Mira el montaje mientras se rellena, con subtítulos palabra por palabra. Cuatro pistas debajo: vídeo, voz, efectos, música. Recorre la regla, salta por escena o cambia a la tira del storyboard.

[El reproductor →](../../app/components/video)

</td>
<td width="50%">
  <a href="../../app/components/video"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/timeline-dark.svg">
    <img src="../../assets/features/timeline-light.svg" alt="El reproductor reproduce con subtítulos palabra por palabra mientras el cabezal recorre una línea de tiempo de cuatro pistas" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Trae tus propias claves

Los modelos alojados vienen con tu cuenta. Pega una clave de Anthropic, Runware, Cartesia o ElevenLabs y sus modelos aparecen en todos los selectores. Las claves viven en Supabase Vault y nunca llegan al navegador.

[Modelos y claves de proveedor →](../../ARCHITECTURE.md#models-and-provider-keys)

</td>
<td width="50%">
  <a href="../../ARCHITECTURE.md#models-and-provider-keys"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/providers-dark.svg">
    <img src="../../assets/features/providers-light.svg" alt="Se pega y valida una clave de Cartesia, pasando de Unverified a Connected" width="100%">
  </picture></a>
</td>
</tr>
</table>

**También en la caja:**

- **[Subtítulos](../../app/components/canvas/panel/CaptionsPanel.tsx)** — Seis preajustes, doce fuentes, aparición palabra por palabra o línea por línea, y cada color, borde y posición es tuyo para cambiarlo.
- **[Exporta hasta 4K](../../app/components/video/ExportButton.tsx)** — Renderiza en Remotion Lambda en fragmentos paralelos y te entrega un MP4.
- **[Historial de versiones](../../app/components/canvas/panel/CanvasHistoryPanel.tsx)** — Guarda automáticamente mientras trabajas, agrupado en puntos de control. Mira cualquier versión y restáurala.
- **[Personajes y estilo artístico](../../app/components/canvas/elements/AssetsSection.tsx)** — Nombra un personaje una vez y cada imagen, línea de voz y avatar se mantiene coherente.
- **[Plantillas](../../lib/templates/templates.ts)** — POV Life, Sleep Story, True Crime y más. Cada una siembra un estilo, un narrador y una duración.
- **[Mocks para desarrollo](../../.env.example)** — Deja sin definir la clave de un proveedor y sus llamadas devuelven resultados de prueba, así puedes construir sin pagar.

## Primeros pasos

### Requisitos

- [Node.js](https://nodejs.org) 20.9+ (el mínimo de Next.js 16; la CI corre 22)
- Un proyecto de [Supabase](https://supabase.com) (para autenticación y base de datos)

### Instalación

1. Clona el repo:

```bash
git clone https://github.com/openslop/openslop.git
cd openslop
```

2. Instala las dependencias:

```bash
npm install
```

3. Copia la plantilla de entorno comentada y rellénala:

```bash
cp .env.example .env.local
```

Las variables de Supabase son obligatorias. Todo lo demás es opcional: un proveedor cuya clave no está definida usa un mock.

4. Corre las migraciones de la base de datos:

```bash
npm run db:push
```

5. Arranca el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) y deberías ver la app.

## Tecnologías

| Capa           | Tecnología                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| Framework      | [Next.js 16](https://nextjs.org) (App Router)                                                                |
| Lenguaje       | [TypeScript 5](https://www.typescriptlang.org)                                                               |
| UI             | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) |
| Auth + BD      | [Supabase](https://supabase.com) (Auth, Postgres, RLS)                                                       |
| Vídeo          | [Remotion 4](https://remotion.dev) (composición, renderizado, reproductor)                                   |
| Almacenamiento | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (almacenamiento de los recursos generados)        |
| Iconos         | Conjunto propio de SVG enmascarados (`components/ui/icon.tsx` + `icons/`), sin dependencia de iconos         |

## Estructura del proyecto

```
app/             Next.js routes, API endpoints, and editor components
  api/v1/        REST API per asset type (image, video, music, sfx, tts, llm)
  components/    Editor UI (canvas, video preview, etc.)
lib/
  agent/         Sloppy: tool definitions, registry, prompt and turn context
  connectors/    Editor-facing client API per asset type
  gateway/       HTTP clients to /api/v1/*
  providers/     Server-side vendor adapters (Runware, ElevenLabs, …)
  generation/    Generation queue and job orchestration
  canvas/        Slate document model: element types, guards, OSML parse/serialize
  script/        Script context and refinement
  project/       Per-project Zustand store, autosave, persistence
  video/         Scene layout and render client
  templates/     Prompt templates offered in the composer
  upload/        Client-side image upload
  supabase/      Browser/server Supabase clients
remotion/        Remotion entry point and compositions
supabase/        Database migrations
```

Mira [`ARCHITECTURE.md`](../../ARCHITECTURE.md) para ver cómo interactúan estas capas.

## Scripts

| Comando                   | Qué hace                          |
| ------------------------- | --------------------------------- |
| `npm run dev`             | Arranca el servidor de desarrollo |
| `npm run build`           | Build de producción               |
| `npm run lint`            | ESLint                            |
| `npm run format:check`    | Comprobación de Prettier          |
| `npm run typecheck`       | Comprobación de TypeScript        |
| `npm run knip`            | Comprobación de código muerto     |
| `npm run test:run`        | Corre los tests una vez (Vitest)  |
| `npm run test:e2e`        | Pruebas de humo (Playwright)      |
| `npm run db:push`         | Sube las migraciones a Supabase   |
| `npm run remotion:studio` | Abre Remotion Studio              |

## Contribuir

Las contribuciones son bienvenidas. Mira [`CONTRIBUTING.md`](../../CONTRIBUTING.md) para la instalación, la secuencia de comprobaciones y lo que buscamos en un PR.

## Comunidad

<p align="center">
  <a href="https://discord.gg/zeP5482ced"><img src="https://img.shields.io/badge/Discord-Join%20the%20community-5865F2?style=flat&logo=discord&logoColor=white" alt="Únete a nuestra comunidad de Discord"></a>
</p>

¿Preguntas, ideas o solo quieres pasar el rato? [Únete a nuestro Discord](https://discord.gg/zeP5482ced) o [escríbenos](mailto:hi@openslop.ai).

Se espera que todos en la comunidad sigan nuestro [Código de conducta](../../CODE_OF_CONDUCT.md). Para reportar un problema, escribe a [hi@openslop.ai](mailto:hi@openslop.ai).

<a href="https://github.com/openslop/openslop/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=openslop/openslop" alt="Colaboradores de OpenSlop">
</a>

## Historial de estrellas

<p align="center">
  <a href="https://star-history.com/#openslop/openslop&Date">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=openslop/openslop&type=Date&theme=dark">
      <img src="https://api.star-history.com/svg?repos=openslop/openslop&type=Date" alt="Gráfico del historial de estrellas de GitHub para openslop/openslop" width="880">
    </picture>
  </a>
</p>

## Licencia

Licenciado bajo la [Licencia Apache 2.0](../../LICENSE).
