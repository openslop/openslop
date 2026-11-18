<p align="center">
  <img src="../../assets/openslop-lockup-animated-light.svg#gh-light-mode-only" alt="OpenSlop" width="560">
  <img src="../../assets/openslop-lockup-animated-dark.svg#gh-dark-mode-only" alt="OpenSlop" width="560">
</p>

<p align="center"><b>Créateur de vidéos IA gratuit et open source.</b></p>

<p align="center">
  <a href="https://openslop.ai"><img src="https://img.shields.io/badge/status-private%20beta-6b6bcf?style=flat" alt="Statut : bêta privée"></a>
  <a href="#local-mode"><img src="https://img.shields.io/badge/runs%20on-macOS%20%7C%20Windows%20%7C%20Linux-555555?style=flat" alt="Fonctionne sur macOS, Windows et Linux"></a>
  <a href="https://github.com/openslop/openslop/actions/workflows/ci.yml?query=branch%3Amaster"><img src="https://github.com/openslop/openslop/actions/workflows/ci.yml/badge.svg?branch=master" alt="CI"></a>
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
  <img src="../../assets/openslop-demo-light.svg#gh-light-mode-only" alt="OpenSlop - votre créateur de vidéos IA gratuit" width="100%">
  <img src="../../assets/openslop-demo-dark.svg#gh-dark-mode-only" alt="OpenSlop - votre créateur de vidéos IA gratuit" width="100%">
</p>

---

> **Bêta privée.** Sur invitation uniquement pour le moment.
> [Inscrivez-vous sur la liste d'attente sur openslop.ai](https://openslop.ai), ou [utilisez le mode local](#local-mode) pour le lancer dès aujourd'hui sur votre ordinateur.

## Aperçu

OpenSlop relie tous vos outils IA préférés dans un seul flux de travail pour que vous puissiez faire de belles vidéos en quelques minutes, sans plus jongler entre dix onglets. Vous apportez vos comptes IA, OpenSlop apporte le flux de travail. C'est tout.

Ça tourne dans votre navigateur, rien à installer. Open source, gratuit pour toujours. Construit par des ingénieurs venus de Meta, Google, Stripe et Dropbox.

## Fonctionnalités

<table>
<tr>
<td width="50%" valign="middle">

### Décrivez votre vidéo

Tapez une ligne. Choisissez 16:9 ou 9:16, une langue, un modèle et une durée, ou collez un script que vous avez déjà. Sept modèles sont là si vous avez besoin d'un coup de pouce.

[Le composeur →](../../app/components/copilot/composer-copilot.tsx)

</td>
<td width="50%">
  <img src="../../assets/features/describe-light.svg#gh-light-mode-only" alt="La zone de prompt fait défiler des exemples d'idées, puis une ligne est tapée et envoyée" width="100%">
  <img src="../../assets/features/describe-dark.svg#gh-dark-mode-only" alt="La zone de prompt fait défiler des exemples d'idées, puis une ligne est tapée et envoyée" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Sloppy l'écrit avec vous

Le copilote vit dans le panneau de gauche. Il lit le script, structure l'histoire, écrit les scènes et ajuste les cartes vidéo au dialogue. Tout ce qu'il fait atterrit sur le canevas sous vos yeux.

[Comment un tour fonctionne →](../../ARCHITECTURE.md#sloppy)

</td>
<td width="50%">
  <img src="../../assets/features/sloppy-light.svg#gh-light-mode-only" alt="Sloppy réfléchit, lit, structure, écrit un script, et des scènes apparaissent sur le canevas" width="100%">
  <img src="../../assets/features/sloppy-dark.svg#gh-dark-mode-only" alt="Sloppy réfléchit, lit, structure, écrit un script, et des scènes apparaissent sur le canevas" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Un storyboard, pas une zone de prompt

Chaque scène est une pile de cartes : voix, image, vidéo, son, musique. Modifiez n'importe quel prompt, choisissez un modèle par carte, glissez pour réordonner, et insérez là où vous survolez.

[Le modèle de document →](../../lib/canvas)

</td>
<td width="50%">
  <img src="../../assets/features/canvas-light.svg#gh-light-mode-only" alt="Survoler une ligne ouvre le menu d'insertion avec les six types d'éléments et une nouvelle carte Sound apparaît" width="100%">
  <img src="../../assets/features/canvas-dark.svg#gh-dark-mode-only" alt="Survoler une ligne ouvre le menu d'insertion avec les six types d'éléments et une nouvelle carte Sound apparaît" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Un clic génère tout

Generate all (tout générer) met chaque élément en file d'attente et lance d'abord les dépendances : la carte vidéo dont une scène continue avant la scène elle-même, un avatar avant l'image où il apparaît. Changez un prompt plus tard et la carte affiche **Stale** (obsolète) et pourquoi.

[Le graphe de génération →](../../ARCHITECTURE.md#canvas-and-generation)

</td>
<td width="50%">
  <img src="../../assets/features/generate-light.svg#gh-light-mode-only" alt="Generate all lance la file, les aperçus se remplissent, et un prompt modifié est marqué Stale avec une raison" width="100%">
  <img src="../../assets/features/generate-dark.svg#gh-dark-mode-only" alt="Generate all lance la file, les aperçus se remplissent, et un prompt modifié est marqué Stale avec une raison" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Lecteur et timeline

Regardez le montage se remplir, sous-titres mot par mot. Quatre pistes en dessous : visuels, voix, effets, musique. Parcourez la règle, sautez de scène en scène, ou passez à la bande storyboard.

[Le lecteur →](../../app/components/player)

</td>
<td width="50%">
  <img src="../../assets/features/timeline-light.svg#gh-light-mode-only" alt="Le lecteur joue avec des sous-titres mot par mot pendant que la tête de lecture balaie une timeline à quatre pistes" width="100%">
  <img src="../../assets/features/timeline-dark.svg#gh-dark-mode-only" alt="Le lecteur joue avec des sous-titres mot par mot pendant que la tête de lecture balaie une timeline à quatre pistes" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Apportez vos propres clés

Les modèles hébergés viennent avec votre compte. Collez une clé Anthropic, Runware, Cartesia ou ElevenLabs et leurs modèles apparaissent dans chaque sélecteur. Les clés vivent dans Supabase Vault et n'atteignent jamais le navigateur.

[Modèles et clés de fournisseurs →](../../ARCHITECTURE.md#models-and-keys)

</td>
<td width="50%">
  <img src="../../assets/features/providers-light.svg#gh-light-mode-only" alt="Une clé Cartesia est collée et validée, passant de Unverified à Connected" width="100%">
  <img src="../../assets/features/providers-dark.svg#gh-dark-mode-only" alt="Une clé Cartesia est collée et validée, passant de Unverified à Connected" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Lancez-le sur votre ordinateur

Utilisez OpenSlop sur votre propre Mac, PC Windows ou Linux. Vos projets et vos vidéos restent chez vous.

[Mode local →](#local-mode)

</td>
<td width="50%">
  <img src="../../assets/features/local-light.svg#gh-light-mode-only" alt="Un terminal lance npm run local, puis OpenSlop s'ouvre sur localhost:3000 avec des projets enregistrés sur cet ordinateur" width="100%">
  <img src="../../assets/features/local-dark.svg#gh-dark-mode-only" alt="Un terminal lance npm run local, puis OpenSlop s'ouvre sur localhost:3000 avec des projets enregistrés sur cet ordinateur" width="100%">
</td>
</tr>
</table>

**Aussi dans la boîte :**

- **[Sous-titres](../../app/components/canvas/panel/captions-panel.tsx)** — Six préréglages, douze polices, apparition mot par mot ou ligne par ligne, et chaque couleur, bordure et placement est à vous de changer.
- **[Export jusqu'en 4K](../../app/components/player/export-button.tsx)** — Rend sur Remotion Lambda en morceaux parallèles et vous livre un MP4.
- **[Historique des versions](../../app/components/canvas/panel/canvas-history-panel.tsx)** — Sauvegarde automatique pendant que vous travaillez, regroupée en points de contrôle. Consultez n'importe quelle version et restaurez-la.
- **[Personnages et style graphique](../../app/components/canvas/elements/asset-strip.tsx)** — Nommez un personnage une fois et chaque image, réplique et avatar reste cohérent.
- **[Modèles](../../lib/templates/templates.ts)** — POV Life, Sleep Story, True Crime, et plus. Chacun amorce un style, ses personnages et une durée.
- **[Mocks pour le développement](../../.env.example)** — Laissez une clé de fournisseur vide et ses appels retombent sur des résultats préenregistrés, pour que vous puissiez développer sans payer.

## Démarrer

Vous pouvez utiliser OpenSlop de deux façons :

- **En ligne** sur [app.openslop.ai](https://app.openslop.ai). Rien à installer. C'est sur invitation pour l'instant, alors [inscrivez-vous sur la liste d'attente](https://openslop.ai).
- **Mode local** sur votre propre ordinateur. Suivez les étapes ci-dessous.

<a name="local-mode"></a>

### Mode local

<p>
  <img src="https://img.shields.io/badge/macOS-Apple%20silicon%20%7C%20Intel-000000?style=for-the-badge&logo=apple&logoColor=white" alt="macOS: Apple silicon, Intel">
  <img src="https://img.shields.io/badge/Windows-10%20%7C%2011-0078D4?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMy40IDkuOCAydjkuNkgwek0xMSAxLjkgMjQgMHYxMS42SDExek0wIDEyLjRoOS44VjIyTDAgMjAuNnpNMTEgMTIuNGgxM1YyNGwtMTMtMS45eiIvPjwvc3ZnPg==" alt="Windows 10, 11">
  <img src="https://img.shields.io/badge/Linux-x64%20%7C%20arm64-FCC624?style=for-the-badge&logo=linux&logoColor=black" alt="Linux: x64, arm64">
</p>

Vos projets et vos vidéos restent sur votre ordinateur. Seules vos demandes aux services d'IA passent par Internet.

<table>
<tr>
<td width="50%" valign="middle">

#### 1. Installez Node.js

Allez sur la [page de téléchargement de Node.js](https://nodejs.org/en/download). Cliquez sur le bouton vert de l'installateur (**Windows Installer** ou **macOS Installer**), ouvrez le fichier et suivez les étapes. Toute version à partir de la 22 convient.

</td>
<td width="50%">
  <img src="../../assets/features/local-step-node-light.svg#gh-light-mode-only" alt="Sur nodejs.org, on clique sur Windows Installer, l'installateur se lance et Node.js est installé" width="100%">
  <img src="../../assets/features/local-step-node-dark.svg#gh-dark-mode-only" alt="Sur nodejs.org, on clique sur Windows Installer, l'installateur se lance et Node.js est installé" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 2. Installez Docker Desktop (Windows et Mac Intel uniquement)

_Passez cette étape sous Linux ou sur un Mac avec une puce M1 ou plus récente (M2, M3, etc.). Pour vérifier, ouvrez le menu Apple > **À propos de ce Mac** et regardez **Puce**._

Sur [docker.com](https://www.docker.com/products/docker-desktop/), cliquez sur **Download Docker Desktop**, choisissez votre ordinateur et installez-le. Ouvrez-le et laissez-le ouvert pendant que vous utilisez OpenSlop.

</td>
<td width="50%">
  <img src="../../assets/features/local-step-docker-light.svg#gh-light-mode-only" alt="Sur docker.com, on choisit le téléchargement Windows et Docker Desktop s'ouvre avec son moteur lancé" width="100%">
  <img src="../../assets/features/local-step-docker-dark.svg#gh-dark-mode-only" alt="Sur docker.com, on choisit le téléchargement Windows et Docker Desktop s'ouvre avec son moteur lancé" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 3. Téléchargez OpenSlop

Sur la [page GitHub d'OpenSlop](https://github.com/openslop/openslop), cliquez sur le bouton vert **Code**, puis sur **Download ZIP**. Vous pouvez aussi [télécharger le ZIP directement](https://github.com/openslop/openslop/archive/refs/heads/master.zip).

</td>
<td width="50%">
  <img src="../../assets/features/local-step-download-light.svg#gh-light-mode-only" alt="Sur GitHub, le bouton vert Code ouvre un menu et on clique sur Download ZIP" width="100%">
  <img src="../../assets/features/local-step-download-dark.svg#gh-dark-mode-only" alt="Sur GitHub, le bouton vert Code ouvre un menu et on clique sur Download ZIP" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 4. Décompressez-le et lancez OpenSlop

Sous Windows, clic droit sur le ZIP > **Extract All**, puis clic droit sur le nouveau dossier > **Open in Terminal**. Sur Mac, double-cliquez sur le ZIP, puis clic droit sur le nouveau dossier > **New Terminal at Folder**. Dans le terminal, lancez :

```bash
npm install
npm run local
```

Le premier lancement prend quelques minutes. OpenSlop s'ouvre ensuite dans votre navigateur, déjà connecté. Pour l'arrêter, appuyez sur Ctrl+C dans le terminal. Vos projets sont gardés pour la prochaine fois.

</td>
<td width="50%">
  <img src="../../assets/features/local-step-terminal-light.svg#gh-light-mode-only" alt="Dans le dossier Téléchargements, le ZIP est extrait et ouvert dans le terminal, puis npm install et npm run local lancent OpenSlop" width="100%">
  <img src="../../assets/features/local-step-terminal-dark.svg#gh-dark-mode-only" alt="Dans le dossier Téléchargements, le ZIP est extrait et ouvert dans le terminal, puis npm install et npm run local lancent OpenSlop" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 5. Ajoutez vos clés d'IA

Cliquez sur votre icône de profil, puis sur **Settings** > **Add providers**, et connectez un fournisseur avec votre clé. Les clés nécessaires dépendent de ce que vous créez :

- **Tout :** les 7 types : Text, Speech, Images, Videos, Music, Sound et Captions.
- **Vidéos en voix off sans visage :** Text, Speech et Images.
- **Vidéos cinématiques :** Text et Videos.

</td>
<td width="50%">
  <img src="../../assets/features/local-step-keys-light.svg#gh-light-mode-only" alt="Le menu du profil ouvre Settings, Add providers liste les fournisseurs, et une clé Anthropic est collée puis connectée" width="100%">
  <img src="../../assets/features/local-step-keys-dark.svg#gh-dark-mode-only" alt="Le menu du profil ouvre Settings, Add providers liste les fournisseurs, et une clé Anthropic est collée puis connectée" width="100%">
</td>
</tr>
</table>

<details>
<summary>Ce qui est téléchargé</summary>

- `npm install` récupère le code de l'app.
- Le premier `npm run local` télécharge aussi, une seule fois :
  - **Supabase** : la base de données et le stockage des fichiers, dans `~/.supabase/cache`. Sous Windows et sur Mac Intel, il est stocké dans Docker Desktop.
  - **Chrome Headless Shell** : transforme votre projet en fichier vidéo. Stocké dans `node_modules/.remotion`.

</details>

### Développer avec un projet Supabase

#### Prérequis

- [Node.js](https://nodejs.org) 20.9+ (le minimum de Next.js 16 ; la CI tourne sur 22)
- Un projet [Supabase](https://supabase.com) (pour l'auth et la base de données)

#### Installation

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
| Icônes     | Jeu maison de SVG masqués (`components/ui/icon.tsx` + `components/ui/icons/`), aucune dépendance d'icônes    |

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
  script/        Écriture et affinage du script
  project/       Store Zustand par projet, sauvegarde automatique, persistance
  render/        Mise en page des scènes et client de rendu
  templates/     Modèles de prompt proposés dans le composeur
  upload/        Envoi de fichiers côté client (image, vidéo, audio)
  supabase/      Clients Supabase navigateur/serveur
remotion/        Point d'entrée Remotion et compositions
supabase/        Migrations de la base de données
```

Voir [`ARCHITECTURE.md`](../../ARCHITECTURE.md) pour la façon dont ces couches interagissent.

## Scripts

| Commande                  | Ce qu'elle fait                     |
| ------------------------- | ----------------------------------- |
| `npm run dev`             | Démarre le serveur de développement |
| `npm run local`           | Lance le mode local                 |
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
  <a href="https://api.star-history.com/svg?repos=openslop/openslop&type=Date#gh-light-mode-only"><img src="https://api.star-history.com/svg?repos=openslop/openslop&type=Date#gh-light-mode-only" alt="Graphique de l'historique des étoiles GitHub pour openslop/openslop" width="880"></a>
  <a href="https://api.star-history.com/svg?repos=openslop/openslop&type=Date&theme=dark#gh-dark-mode-only"><img src="https://api.star-history.com/svg?repos=openslop/openslop&type=Date&theme=dark#gh-dark-mode-only" alt="Graphique de l'historique des étoiles GitHub pour openslop/openslop" width="880"></a>
</p>

## Licence

Sous [licence Apache 2.0](../../LICENSE).
