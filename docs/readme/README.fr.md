<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/openslop-lockup-animated-dark.svg">
    <img src="../../assets/openslop-lockup-animated-light.svg" alt="OpenSlop" width="560">
  </picture>
</p>

<p align="center"><b>Créateur de vidéos IA gratuit et open source.</b></p>

<p align="center">
  <a href="https://openslop.ai"><img src="https://img.shields.io/badge/status-private%20beta-6b6bcf?style=flat" alt="Statut : bêta privée"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue?style=flat" alt="Licence : Apache-2.0"></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js" alt="Next.js 16"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white" alt="React 19"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript 5"></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4"></a>
  <a href="https://discord.gg/zeP5482ced"><img src="https://img.shields.io/badge/Discord-Join-5865F2?style=flat&logo=discord&logoColor=white" alt="Discord"></a>
</p>

<p align="center">
  <sub><a href="../../README.md">English</a> · <a href="README.zh-CN.md">中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <a href="README.es.md">Español</a> · Français · <a href="README.pt.md">Português</a></sub>
</p>

<p align="center">
  <a href="https://openslop.ai"><b>openslop.ai</b></a>
  &nbsp;·&nbsp;
  <a href="https://app.openslop.ai">app.openslop.ai</a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/openslop-demo-dark.svg">
    <img src="../../assets/openslop-demo-light.svg" alt="OpenSlop - votre créateur de vidéos IA gratuit" width="100%">
  </picture>
</p>

---

> **Bêta privée.** Sur invitation uniquement pour le moment.
> [Inscrivez-vous sur la liste d'attente sur openslop.ai](https://openslop.ai) pour y entrer.

## Aperçu

OpenSlop relie tous vos outils IA préférés dans un seul flux de travail pour que vous puissiez faire de belles vidéos en quelques minutes, sans plus jongler entre dix onglets. Vous apportez vos comptes IA, OpenSlop apporte le flux de travail. C'est tout.

Ça tourne dans votre navigateur, rien à installer. Open source, gratuit pour toujours. Construit par des ingénieurs venus de Meta, Google, Stripe et Dropbox.

## Fonctionnalités

<table>
<tr>
<td width="50%" valign="middle">

### Décrivez votre vidéo

Tapez une ligne. Choisissez 16:9 ou 9:16, une langue, un modèle et une durée, ou collez un script que vous avez déjà. Sept modèles sont là si vous avez besoin d'un coup de pouce.

[Le composeur →](../../app/components/copilot/ComposerCopilot.tsx)

</td>
<td width="50%">
  <a href="../../app/components/copilot/ComposerCopilot.tsx"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/describe-dark.svg">
    <img src="../../assets/features/describe-light.svg" alt="La zone de prompt fait défiler des exemples d'idées, puis une ligne est tapée et envoyée" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Sloppy l'écrit avec vous

Le copilote vit dans le panneau de gauche. Il lit le script, structure l'histoire, écrit les scènes et ajuste les clips au dialogue. Tout ce qu'il fait atterrit sur le canevas sous vos yeux.

[Comment un tour fonctionne →](../../ARCHITECTURE.md#sloppy)

</td>
<td width="50%">
  <a href="../../ARCHITECTURE.md#sloppy"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/sloppy-dark.svg">
    <img src="../../assets/features/sloppy-light.svg" alt="Sloppy réfléchit, lit, structure, écrit un script, et des scènes apparaissent sur le canevas" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Un storyboard, pas une zone de prompt

Chaque scène est une pile de cartes : narration, personnage, image, image animée, clip, son, musique. Modifiez n'importe quel prompt, choisissez un modèle par carte, glissez pour réordonner, et insérez là où vous survolez.

[Le modèle de document →](../../lib/canvas)

</td>
<td width="50%">
  <a href="../../lib/canvas"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/canvas-dark.svg">
    <img src="../../assets/features/canvas-light.svg" alt="Survoler une ligne ouvre le menu d'insertion avec les sept types d'éléments et une nouvelle carte Sound apparaît" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Un clic génère tout

Generate all (tout générer) met chaque élément en file d'attente et lance d'abord les dépendances : une image fixe avant son clip animé, un avatar avant l'image où il apparaît. Changez un prompt plus tard et la carte affiche **Stale** (obsolète) et pourquoi.

[Le graphe de génération →](../../ARCHITECTURE.md#generation-graph)

</td>
<td width="50%">
  <a href="../../ARCHITECTURE.md#generation-graph"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/generate-dark.svg">
    <img src="../../assets/features/generate-light.svg" alt="Generate all lance la file, les aperçus se remplissent, et un prompt modifié est marqué Stale avec une raison" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Lecteur et timeline

Regardez le montage se remplir, sous-titres mot par mot. Quatre pistes en dessous : vidéo, voix, effets, musique. Parcourez la règle, sautez de scène en scène, ou passez à la bande storyboard.

[Le lecteur →](../../app/components/video)

</td>
<td width="50%">
  <a href="../../app/components/video"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/timeline-dark.svg">
    <img src="../../assets/features/timeline-light.svg" alt="Le lecteur joue avec des sous-titres mot par mot pendant que la tête de lecture balaie une timeline à quatre pistes" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Apportez vos propres clés

Les modèles hébergés viennent avec votre compte. Collez une clé Anthropic, Runware, Cartesia ou ElevenLabs et leurs modèles apparaissent dans chaque sélecteur. Les clés vivent dans Supabase Vault et n'atteignent jamais le navigateur.

[Modèles et clés de fournisseurs →](../../ARCHITECTURE.md#models-and-provider-keys)

</td>
<td width="50%">
  <a href="../../ARCHITECTURE.md#models-and-provider-keys"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/providers-dark.svg">
    <img src="../../assets/features/providers-light.svg" alt="Une clé Cartesia est collée et validée, passant de Unverified à Connected" width="100%">
  </picture></a>
</td>
</tr>
</table>

**Aussi dans la boîte :**

- **[Sous-titres](../../app/components/canvas/panel/CaptionsPanel.tsx)** — Six préréglages, douze polices, apparition mot par mot ou ligne par ligne, et chaque couleur, bordure et placement est à vous de changer.
- **[Export jusqu'en 4K](../../app/components/video/ExportButton.tsx)** — Rend sur Remotion Lambda en morceaux parallèles et vous livre un MP4.
- **[Historique des versions](../../app/components/canvas/panel/CanvasHistoryPanel.tsx)** — Sauvegarde automatique pendant que vous travaillez, regroupée en points de contrôle. Consultez n'importe quelle version et restaurez-la.
- **[Personnages et style graphique](../../app/components/canvas/elements/AssetsSection.tsx)** — Nommez un personnage une fois et chaque image, réplique et avatar reste cohérent.
- **[Modèles](../../lib/templates/templates.ts)** — POV Life, Sleep Story, True Crime, et plus. Chacun amorce un style, un narrateur et une durée.
- **[Mocks pour le développement](../../.env.example)** — Laissez une clé de fournisseur vide et ses appels retombent sur des résultats préenregistrés, pour que vous puissiez développer sans payer.

## Démarrer

### Prérequis

- [Node.js](https://nodejs.org) 20.9+ (le minimum de Next.js 16 ; la CI tourne sur 22)
- Un projet [Supabase](https://supabase.com) (pour l'auth et la base de données)

### Installation

1. Clonez le dépôt :

```bash
git clone https://github.com/openslop/openslop.git
cd openslop
```

2. Installez les dépendances :

```bash
npm install
```

3. Copiez le modèle d'env annoté et remplissez-le :

```bash
cp .env.example .env.local
```

Les variables Supabase sont obligatoires. Tout le reste est optionnel : un fournisseur dont la clé est absente retombe sur un mock.

4. Lancez les migrations de la base de données :

```bash
npm run db:push
```

5. Démarrez le serveur de développement :

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) et vous devriez voir l'app.

## Stack technique

| Couche     | Techno                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| Framework  | [Next.js 16](https://nextjs.org) (App Router)                                                                |
| Langage    | [TypeScript 5](https://www.typescriptlang.org)                                                               |
| UI         | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) |
| Auth + BDD | [Supabase](https://supabase.com) (Auth, Postgres, RLS)                                                       |
| Vidéo      | [Remotion 4](https://remotion.dev) (composition, rendu, lecteur)                                             |
| Stockage   | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (stockage des ressources générées)                |
| Icônes     | Jeu maison de SVG masqués (`components/ui/icon.tsx` + `icons/`), aucune dépendance d'icônes                  |

## Structure du projet

```
app/             Routes Next.js, endpoints API et composants de l'éditeur
  api/v1/        API REST par type de ressource (image, video, music, sfx, tts, llm)
  components/    UI de l'éditeur (canevas, aperçu vidéo, etc.)
lib/
  agent/         Sloppy : définitions d'outils, registre, prompt et contexte de tour
  connectors/    API client côté éditeur par type de ressource
  gateway/       Clients HTTP vers /api/v1/*
  providers/     Adaptateurs fournisseurs côté serveur (Runware, ElevenLabs, …)
  generation/    File de génération et orchestration des jobs
  canvas/        Modèle de document Slate : types d'éléments, gardes, parse/sérialisation OSML
  script/        Contexte et affinage du script
  project/       Store Zustand par projet, sauvegarde automatique, persistance
  video/         Mise en page des scènes et client de rendu
  templates/     Modèles de prompt proposés dans le composeur
  upload/        Envoi d'images côté client
  supabase/      Clients Supabase navigateur/serveur
remotion/        Point d'entrée Remotion et compositions
supabase/        Migrations de la base de données
```

Voir [`ARCHITECTURE.md`](../../ARCHITECTURE.md) pour la façon dont ces couches interagissent.

## Scripts

| Commande                  | Ce qu'elle fait                     |
| ------------------------- | ----------------------------------- |
| `npm run dev`             | Démarre le serveur de développement |
| `npm run build`           | Build de production                 |
| `npm run lint`            | ESLint                              |
| `npm run format:check`    | Vérification Prettier               |
| `npm run typecheck`       | Vérification TypeScript             |
| `npm run knip`            | Vérification du code mort           |
| `npm run test:run`        | Lance les tests une fois (Vitest)   |
| `npm run test:e2e`        | Tests de fumée (Playwright)         |
| `npm run db:push`         | Pousse les migrations vers Supabase |
| `npm run remotion:studio` | Ouvre Remotion Studio               |

## Contribuer

Les contributions sont les bienvenues. Voir [`CONTRIBUTING.md`](../../CONTRIBUTING.md) pour l'installation, la séquence de vérifications, et ce que nous attendons d'une PR.

## Communauté

<p align="center">
  <a href="https://discord.gg/zeP5482ced"><img src="https://img.shields.io/badge/Discord-Join%20the%20community-5865F2?style=flat&logo=discord&logoColor=white" alt="Rejoignez notre communauté Discord"></a>
</p>

Des questions, des idées, ou juste envie de passer ? [Rejoignez notre Discord](https://discord.gg/zeP5482ced) ou [écrivez-nous](mailto:hi@openslop.ai).

Tout le monde dans la communauté est tenu de suivre notre [Code de conduite](../../CODE_OF_CONDUCT.md). Pour signaler un problème, écrivez à [hi@openslop.ai](mailto:hi@openslop.ai).

<a href="https://github.com/openslop/openslop/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=openslop/openslop" alt="Contributeurs OpenSlop">
</a>

## Historique des étoiles

<p align="center">
  <a href="https://star-history.com/#openslop/openslop&Date">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=openslop/openslop&type=Date&theme=dark">
      <img src="https://api.star-history.com/svg?repos=openslop/openslop&type=Date" alt="Graphique de l'historique des étoiles GitHub pour openslop/openslop" width="880">
    </picture>
  </a>
</p>

## Licence

Sous [licence Apache 2.0](../../LICENSE).
