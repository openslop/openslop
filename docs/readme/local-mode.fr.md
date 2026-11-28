<p align="center">
  <sub><a href="../local-mode.md">English</a> · <a href="local-mode.zh-CN.md">中文</a> · <a href="local-mode.ja.md">日本語</a> · <a href="local-mode.ko.md">한국어</a> · <a href="local-mode.es.md">Español</a> · Français · <a href="local-mode.pt.md">Português</a></sub>
</p>

# Mode local

<p>
  <img src="https://img.shields.io/badge/macOS-Apple%20silicon%20%7C%20Intel-000000?style=for-the-badge&logo=apple&logoColor=white" alt="macOS: Apple silicon, Intel">
  <img src="https://img.shields.io/badge/Windows-10%20%7C%2011-0078D4?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMy40IDkuOCAydjkuNkgwek0xMSAxLjkgMjQgMHYxMS42SDExek0wIDEyLjRoOS44VjIyTDAgMjAuNnpNMTEgMTIuNGgxM1YyNGwtMTMtMS45eiIvPjwvc3ZnPg==" alt="Windows 10, 11">
  <img src="https://img.shields.io/badge/Linux-x64%20%7C%20arm64-FCC624?style=for-the-badge&logo=linux&logoColor=black" alt="Linux: x64, arm64">
</p>

Vos projets et vos vidéos restent sur votre ordinateur. Seules vos demandes aux services d'IA passent par Internet.

<p align="center">
  <img src="../../assets/features/local-dark.svg" alt="Un terminal lance npm run local, puis OpenSlop s'ouvre sur localhost:3000 avec des projets enregistrés sur cet ordinateur" width="100%">
</p>

## Ce qu'il vous faut

| Votre ordinateur           | Node.js 22+ | Docker Desktop                  |
| -------------------------- | ----------- | ------------------------------- |
| Mac avec M1 ou plus récent | ✅          | —                               |
| Mac avec Intel             | ✅          | ✅ ouvert pendant l'utilisation |
| Windows 10 ou 11           | ✅          | ✅ ouvert pendant l'utilisation |
| Linux (x64 ou arm64)       | ✅          | —                               |

Il vous faut aussi la clé d'au moins un fournisseur d'IA. L'étape 5 indique lesquelles.

## Installation

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

## Agents pris en charge

Utilisez votre propre agent de code pour créer des vidéos dans OpenSlop gratuitement, sur votre ordinateur : ajoutez `http://localhost:3000/api/mcp` comme serveur MCP. [Comment le connecter](../agents.md).

<img height="16" valign="middle" alt="" src="../../assets/agents/amp.svg" />&nbsp;[Amp](https://ampcode.com/) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/antigravity.svg" />&nbsp;[Antigravity CLI](https://antigravity.google/) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/claude.svg" />&nbsp;[Claude Code](https://claude.com/product/claude-code) &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="../../assets/agents/codex-white.svg" /><img height="16" valign="middle" alt="" src="../../assets/agents/codex.svg" /></picture>&nbsp;[Codex](https://openai.com/codex) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/cursor.svg" />&nbsp;[Cursor](https://cursor.com/cli) &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="../../assets/agents/droid-white.svg" /><img height="16" valign="middle" alt="" src="../../assets/agents/droid.svg" /></picture>&nbsp;[Droid](https://www.factory.ai/) &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="../../assets/agents/fx-white.svg" /><img height="16" valign="middle" alt="" src="../../assets/agents/fx.svg" /></picture>&nbsp;[fx](https://fx.sh/) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/gemini.svg" />&nbsp;[Gemini CLI](https://github.com/google-gemini/gemini-cli) &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="../../assets/agents/copilot-white.svg" /><img height="16" valign="middle" alt="" src="../../assets/agents/copilot.svg" /></picture>&nbsp;[GitHub Copilot](https://github.com/features/copilot) &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="../../assets/agents/grok-white.svg" /><img height="16" valign="middle" alt="" src="../../assets/agents/grok.svg" /></picture>&nbsp;[Grok](https://x.ai/) &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="../../assets/agents/hermes-white.svg" /><img height="16" valign="middle" alt="" src="../../assets/agents/hermes.svg" /></picture>&nbsp;[Hermes](https://github.com/NousResearch/hermes-agent) &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="../../assets/agents/kimi-white.svg" /><img height="16" valign="middle" alt="" src="../../assets/agents/kimi.svg" /></picture>&nbsp;[Kimi Code](https://www.kimi.com/) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/kiro.svg" />&nbsp;[Kiro](https://kiro.dev/cli/) &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="../../assets/agents/mastracode-white.svg" /><img height="16" valign="middle" alt="" src="../../assets/agents/mastracode.svg" /></picture>&nbsp;[Mastra Code](https://mastra.ai/) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/vibe.svg" />&nbsp;[Mistral Vibe](https://mistral.ai/) &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="../../assets/agents/muse-white.svg" /><img height="16" valign="middle" alt="" src="../../assets/agents/muse.svg" /></picture>&nbsp;[Muse Code](https://developer.meta.com/ai/products/muse-code/) &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="../../assets/agents/pi-white.svg" /><img height="16" valign="middle" alt="" src="../../assets/agents/pi.svg" /></picture>&nbsp;[Oh My Pi](https://github.com/can1357/oh-my-pi) &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="../../assets/agents/opencode-white.svg" /><img height="16" valign="middle" alt="" src="../../assets/agents/opencode.svg" /></picture>&nbsp;[OpenCode](https://opencode.ai/) &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="../../assets/agents/pi-white.svg" /><img height="16" valign="middle" alt="" src="../../assets/agents/pi.svg" /></picture>&nbsp;[Pi](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/vscode.svg" />&nbsp;[VS Code](https://code.visualstudio.com/) &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="../../assets/agents/windsurf-white.svg" /><img height="16" valign="middle" alt="" src="../../assets/agents/windsurf.svg" /></picture>&nbsp;[Windsurf](https://windsurf.com/) &nbsp;·&nbsp; <picture><source media="(prefers-color-scheme: dark)" srcset="../../assets/agents/zed-white.svg" /><img height="16" valign="middle" alt="" src="../../assets/agents/zed.svg" /></picture>&nbsp;[Zed](https://zed.dev/)

## Au quotidien

| Pour                    | Faites ceci                                                           |
| ----------------------- | --------------------------------------------------------------------- |
| Lancer OpenSlop         | Ouvrez un terminal dans le dossier OpenSlop et lancez `npm run local` |
| Arrêter OpenSlop        | Appuyez sur <kbd>Ctrl</kbd>+<kbd>C</kbd> dans ce terminal             |
| Reprendre votre travail | Relancez `npm run local`. Vos projets et vos clés sont toujours là    |

## Mode local ou en ligne

|                     | Mode local                                          | En ligne sur [app.openslop.ai](https://app.openslop.ai)                      |
| ------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------- |
| Qui peut l'utiliser | Tout le monde, dès aujourd'hui                      | Sur invitation, [inscrivez-vous sur la liste d'attente](https://openslop.ai) |
| Installation        | Node.js, et Docker Desktop sur certains ordinateurs | Rien                                                                         |
| Connexion           | Automatique, un seul utilisateur                    | Votre compte                                                                 |
| Projets et médias   | Sur votre ordinateur                                | Dans le cloud                                                                |
| Modèles d'IA        | Vos propres clés                                    | Modèles hébergés, plus vos propres clés                                      |
| Export vidéo        | Rendu sur votre ordinateur                          | Rendu dans le cloud                                                          |

## En cas de problème

| Le terminal affiche                                             | Faites ceci                                                                                                  |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `OpenSlop needs Node.js 22 or newer`                            | Installez Node.js 22 ou plus récent depuis l'étape 1, ouvrez un nouveau terminal et relancez `npm run local` |
| `` `npx supabase start …` failed `` (Windows ou Mac avec Intel) | Ouvrez Docker Desktop, attendez que son moteur tourne et relancez `npm run local`                            |
| Autre chose                                                     | Demandez sur [Discord](https://discord.gg/zeP5482ced) avec ce qu'affiche le terminal                         |

<details>
<summary>Ce qui est téléchargé</summary>

- `npm install` récupère le code de l'app.
- Le premier `npm run local` télécharge aussi, une seule fois :
  - **Supabase** : la base de données et le stockage des fichiers, dans `~/.supabase/cache`. Sous Windows et sur Mac Intel, il est stocké dans Docker Desktop.
  - **Chrome Headless Shell** : transforme votre projet en fichier vidéo. Stocké dans `node_modules/.remotion`.

</details>

> Vous codez sur OpenSlop ? Pour développer avec des services hébergés, voir [Développer avec un projet Supabase](../../CONTRIBUTING.md#develop-against-a-supabase-project).
