<p align="center">
  <sub>English · <a href="readme/local-mode.zh-CN.md">中文</a> · <a href="readme/local-mode.ja.md">日本語</a> · <a href="readme/local-mode.ko.md">한국어</a> · <a href="readme/local-mode.es.md">Español</a> · <a href="readme/local-mode.fr.md">Français</a> · <a href="readme/local-mode.pt.md">Português</a></sub>
</p>

# Local mode

<p>
  <img src="https://img.shields.io/badge/macOS-Apple%20silicon%20%7C%20Intel-000000?style=for-the-badge&logo=apple&logoColor=white" alt="macOS: Apple silicon and Intel">
  <img src="https://img.shields.io/badge/Windows-10%20%7C%2011-0078D4?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMy40IDkuOCAydjkuNkgwek0xMSAxLjkgMjQgMHYxMS42SDExek0wIDEyLjRoOS44VjIyTDAgMjAuNnpNMTEgMTIuNGgxM1YyNGwtMTMtMS45eiIvPjwvc3ZnPg==" alt="Windows 10 and 11">
  <img src="https://img.shields.io/badge/Linux-x64%20%7C%20arm64-FCC624?style=for-the-badge&logo=linux&logoColor=black" alt="Linux: x64 and arm64">
</p>

Your projects and videos stay on your computer. Only your requests to AI services go online.

<p align="center">
  <img src="../assets/features/local-dark.svg" alt="A terminal runs npm run local, then OpenSlop opens at localhost:3000 with projects saved on this computer" width="100%">
</p>

## What you need

| Your computer        | Node.js 22+ |      Docker Desktop      |
| -------------------- | :---------: | :----------------------: |
| Mac with M1 or newer |     ✅      |            —             |
| Mac with Intel       |     ✅      | ✅ open while you use it |
| Windows 10 or 11     |     ✅      | ✅ open while you use it |
| Linux (x64 or arm64) |     ✅      |            —             |

You also need a key from at least one AI provider. Step 5 shows which.

## Set up

<table>
<tr>
<td width="50%" valign="middle">

#### 1. Install Node.js

Go to the [Node.js download page](https://nodejs.org/en/download). Click the green installer button (**Windows Installer** or **macOS Installer**), open the file, and click through. Any version from 22 up works.

</td>
<td width="50%">
  <img src="../assets/features/local-step-node-light.svg#gh-light-mode-only" alt="On nodejs.org, the Windows Installer button is clicked, the installer runs, and Node.js is installed" width="100%">
  <img src="../assets/features/local-step-node-dark.svg#gh-dark-mode-only" alt="On nodejs.org, the Windows Installer button is clicked, the installer runs, and Node.js is installed" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 2. Install Docker Desktop (Windows and Intel Macs only)

_Skip this if you're on Linux or on a Mac with an M1 chip or newer (M2, M3 and so on). To check your Mac, open the Apple menu > **About This Mac** and look at **Chip**._

On [docker.com](https://www.docker.com/products/docker-desktop/), click **Download Docker Desktop**, pick your computer, and install it. Open it, and leave it open while you use OpenSlop.

</td>
<td width="50%">
  <img src="../assets/features/local-step-docker-light.svg#gh-light-mode-only" alt="On docker.com, the Windows download is picked from the menu, and Docker Desktop opens with its engine running" width="100%">
  <img src="../assets/features/local-step-docker-dark.svg#gh-dark-mode-only" alt="On docker.com, the Windows download is picked from the menu, and Docker Desktop opens with its engine running" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 3. Download OpenSlop

On [OpenSlop's GitHub page](https://github.com/openslop/openslop), click the green **Code** button, then **Download ZIP**. You can also [download the ZIP directly](https://github.com/openslop/openslop/archive/refs/heads/master.zip).

</td>
<td width="50%">
  <img src="../assets/features/local-step-download-light.svg#gh-light-mode-only" alt="On GitHub, the green Code button opens a menu and Download ZIP is clicked" width="100%">
  <img src="../assets/features/local-step-download-dark.svg#gh-dark-mode-only" alt="On GitHub, the green Code button opens a menu and Download ZIP is clicked" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 4. Unzip it and start OpenSlop

On Windows, right-click the ZIP > **Extract All**, then right-click the new folder > **Open in Terminal**. On a Mac, double-click the ZIP, then right-click the new folder > **New Terminal at Folder**. In the terminal, run:

```bash
npm install
npm run local
```

The first run takes a few minutes. OpenSlop then opens in your browser, already signed in. To stop it, press Ctrl+C in the terminal. Your projects are saved for next time.

</td>
<td width="50%">
  <img src="../assets/features/local-step-terminal-light.svg#gh-light-mode-only" alt="In the Downloads folder, the ZIP is extracted and opened in Terminal, then npm install and npm run local start OpenSlop" width="100%">
  <img src="../assets/features/local-step-terminal-dark.svg#gh-dark-mode-only" alt="In the Downloads folder, the ZIP is extracted and opened in Terminal, then npm install and npm run local start OpenSlop" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 5. Add your AI keys

Click your profile icon, then **Settings** > **Add providers**, and connect a provider with your key. Which keys you need depends on what you make:

- **Everything:** all 7 types: Text, Speech, Images, Videos, Music, Sound and Captions.
- **Faceless voiceover videos:** Text, Speech and Images.
- **Cinematic videos:** Text and Videos.

</td>
<td width="50%">
  <img src="../assets/features/local-step-keys-light.svg#gh-light-mode-only" alt="The profile menu opens Settings, Add providers lists the providers, and an Anthropic key is pasted and connected" width="100%">
  <img src="../assets/features/local-step-keys-dark.svg#gh-dark-mode-only" alt="The profile menu opens Settings, Add providers lists the providers, and an Anthropic key is pasted and connected" width="100%">
</td>
</tr>
</table>

## Use your coding agent instead

<table>
<tr>
<td width="50%" valign="middle">

Already use Claude Code, Codex, Gemini CLI or Cursor? Sloppy and text generation can run on it instead of a Text key. Sign in to the agent once in a terminal (for example, run `claude`), then pick it under **Local agent** in a text model picker. Speech, images, music and video still need their keys. [How it works](local-agents.md)

</td>
<td width="50%">
  <img src="../assets/features/local-step-agent-light.svg#gh-light-mode-only" alt="In a terminal, Claude Code is signed in, then Claude Code is picked from the local agents in the model picker" width="100%">
  <img src="../assets/features/local-step-agent-dark.svg#gh-dark-mode-only" alt="In a terminal, Claude Code is signed in, then Claude Code is picked from the local agents in the model picker" width="100%">
</td>
</tr>
</table>

## Every day after

| To                | Do this                                                                   |
| ----------------- | ------------------------------------------------------------------------- |
| Start OpenSlop    | Open a terminal in the OpenSlop folder and run `npm run local`            |
| Stop OpenSlop     | Press <kbd>Ctrl</kbd>+<kbd>C</kbd> in that terminal                       |
| Pick up your work | Run `npm run local` again. Your projects and keys are where you left them |

## Local mode vs online

|                    | Local mode                                        | Online at [app.openslop.ai](https://app.openslop.ai)  |
| ------------------ | ------------------------------------------------- | ----------------------------------------------------- |
| Who can use it     | Anyone, today                                     | Invite-only, [join the waitlist](https://openslop.ai) |
| Install            | Node.js, plus Docker Desktop on some computers    | Nothing                                               |
| Sign-in            | Automatic, one user                               | Your account                                          |
| Projects and media | On your computer                                  | In the cloud                                          |
| AI models          | Your own keys, or a coding agent on this computer | Hosted models, plus your own keys                     |
| Exporting video    | Rendered on your computer                         | Rendered in the cloud                                 |

## If something goes wrong

| The terminal says                                          | Do this                                                                                 |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `OpenSlop needs Node.js 22 or newer`                       | Install Node.js 22 or newer from step 1, open a new terminal, and rerun `npm run local` |
| `` `npx supabase start …` failed `` (Windows or Intel Mac) | Open Docker Desktop, wait until its engine is running, and rerun `npm run local`        |
| Anything else                                              | Ask on [Discord](https://discord.gg/zeP5482ced) with what the terminal printed          |

<details>
<summary>What gets downloaded</summary>

- `npm install` gets the app's code.
- The first `npm run local` also downloads, one time:
  - **Supabase**: the database and file storage, kept in `~/.supabase/cache`. On Windows and Intel Macs, it's stored inside Docker Desktop instead.
  - **Chrome Headless Shell**: used for rendering your final videos. Kept in `node_modules/.remotion`.

</details>

> Writing code for OpenSlop? To develop against hosted services instead, see [Develop against a Supabase project](../CONTRIBUTING.md#develop-against-a-supabase-project).
