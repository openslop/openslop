<p align="center">
  <img src="../../assets/openslop-lockup-animated-light.svg#gh-light-mode-only" alt="OpenSlop" width="560">
  <img src="../../assets/openslop-lockup-animated-dark.svg#gh-dark-mode-only" alt="OpenSlop" width="560">
</p>

<p align="center"><b>开源 AI 制作工作室。</b><br>聊着天，就能做出完整的电影、剧集、有声书、音乐视频、纪录片、短剧等等。</p>

<p align="center">
  <a href="https://openslop.ai"><img src="https://img.shields.io/badge/status-private%20beta-6b6bcf?style=flat" alt="状态：私测中"></a>
  <a href="local-mode.zh-CN.md"><img src="https://img.shields.io/badge/runs%20on-macOS%20%7C%20Windows%20%7C%20Linux-555555?style=flat" alt="支持 macOS、Windows 和 Linux"></a>
  <a href="https://github.com/openslop/openslop/actions/workflows/ci.yml?query=branch%3Amaster"><img src="https://github.com/openslop/openslop/actions/workflows/ci.yml/badge.svg?branch=master" alt="CI"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue?style=flat" alt="许可证：Apache-2.0"></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js" alt="Next.js 16"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white" alt="React 19"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript 5"></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4"></a>
  <a href="https://discord.gg/zeP5482ced"><img src="https://img.shields.io/badge/Discord-Join-5865F2?style=flat&logo=discord&logoColor=white" alt="Discord"></a>
</p>

<p align="center">
  <sub><a href="../../README.md">English</a> · 中文 · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <a href="README.es.md">Español</a> · <a href="README.fr.md">Français</a> · <a href="README.pt.md">Português</a></sub>
</p>

<p align="center">
  <a href="https://openslop.ai"><b>openslop.ai</b></a>
  &nbsp;·&nbsp;
  <a href="https://app.openslop.ai">app.openslop.ai</a>
</p>

<p align="center">
  <img src="../../assets/openslop-hero-dark.svg" alt="OpenSlop - 你的免费 AI 视频创作工具" width="100%">
</p>

---

> **私测中。** 目前仅限邀请。
> [在 openslop.ai 加入等候名单](https://openslop.ai)，或者[使用本地模式](local-mode.zh-CN.md)，今天就在自己的电脑上运行。

## 概览

OpenSlop 把你喜欢的 AI 工具串成一条工作流，几分钟就能做出好看的视频，不用再在十个标签页之间来回跳。你带上自己的 AI 账号，OpenSlop 带上工作流。就这么简单。

它在浏览器里运行，什么都不用装。开源，永久免费。由来自 Meta、Google、Stripe 和 Dropbox 的工程师打造。

## 快速开始

OpenSlop 有两种用法：

- **在线**：打开 [app.openslop.ai](https://app.openslop.ai)，无需安装。目前仅限邀请，请先[加入等候名单](https://openslop.ai)。
- **本地模式**：在你自己的电脑上运行。[查看设置指南 →](local-mode.zh-CN.md)

要改代码？按 [CONTRIBUTING.md](../../CONTRIBUTING.md#setup) 搭建开发环境。

## 功能

<table>
<tr>
<td width="50%" valign="middle">

### 描述你的视频

打一行字。选 16:9 或 9:16、一种语言、一个模型和一个时长，或者直接粘贴你已有的脚本。没头绪的话，还有七个模板可以帮你起步。

[编辑器 →](../../app/components/copilot/composer-copilot.tsx)

</td>
<td width="50%">
  <img src="../../assets/features/describe-dark.svg" alt="提示框轮流展示示例创意，然后输入一行字并发送" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Sloppy 和你一起写

副驾驶住在左侧面板里。它读脚本，列出故事大纲，写出场景，再把视频卡片对到台词上。它做的每一步都会在你眼前落到画布上。

[一轮对话是怎么进行的 →](../../ARCHITECTURE.md#sloppy)

</td>
<td width="50%">
  <img src="../../assets/features/sloppy-dark.svg" alt="Sloppy 思考、阅读、列大纲、写脚本，场景在画布上出现" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 是分镜板，不是提示框

每个场景是一叠卡片：语音、图片、视频、音效、音乐。改任意一条提示词，为每张卡片单独选模型，拖动排序，鼠标停在哪里就能在哪里插入。

[文档模型 →](../../lib/canvas)

</td>
<td width="50%">
  <img src="../../assets/features/canvas-dark.svg" alt="鼠标悬停在一行上打开插入菜单，列出六种元素类型，一张新的 Sound 卡片出现" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 一键生成全部

Generate all（全部生成）会把每个元素排进队列，并先处理依赖：先出一个场景所接续的视频卡片再出该场景，先出头像再出它所在的图片。之后改了提示词，卡片会标上 **Stale**（已过期）并说明原因。

[生成图 →](../../ARCHITECTURE.md#canvas-and-generation)

</td>
<td width="50%">
  <img src="../../assets/features/generate-dark.svg" alt="Generate all 跑完队列，预览逐个填上，一条改过的提示词被标为 Stale 并附上原因" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 播放器和时间线

一边生成一边看成片，字幕逐词显示。下面四条轨道：画面、人声、音效、音乐。拖动标尺，按场景跳转，或者切到分镜条。

[播放器 →](../../app/components/player)

</td>
<td width="50%">
  <img src="../../assets/features/timeline-dark.svg" alt="播放器逐词显示字幕，播放头扫过四条轨道的时间线" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 带上你自己的密钥

托管模型随账号附带。粘贴一个 Anthropic、Runware、Cartesia 或 ElevenLabs 的密钥，它们的模型就会出现在每个选择器里。密钥存放在 Supabase Vault 中，永远不会到达浏览器。

[模型和提供商密钥 →](../../ARCHITECTURE.md#models-and-keys)

</td>
<td width="50%">
  <img src="../../assets/features/providers-dark.svg" alt="粘贴并验证一个 Cartesia 密钥，状态从 Unverified 变为 Connected" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 在自己的电脑上运行

在你自己的 Mac、Windows 或 Linux 电脑上运行 OpenSlop。项目和视频都留在你手里。

[本地模式 →](local-mode.zh-CN.md)

</td>
<td width="50%">
  <img src="../../assets/features/local-dark.svg" alt="终端运行 npm run local，随后 OpenSlop 在 localhost:3000 打开，显示保存在这台电脑上的项目" width="100%">
</td>
</tr>
</table>

**盒子里还有：**

- **[字幕](../../app/components/canvas/panel/captions-panel.tsx)** — 六种预设、十二种字体、逐词或逐行显示，每种颜色、描边和位置都随你改。
- **[导出最高 4K](../../app/components/player/export-button.tsx)** — 在 Remotion Lambda 上分块并行渲染，交给你一个 MP4。
- **[版本历史](../../app/components/canvas/panel/canvas-history-panel.tsx)** — 边做边自动保存，合并成检查点。查看任意版本并恢复。
- **[角色和画风](../../app/components/canvas/elements/asset-strip.tsx)** — 给角色起一次名，每张图片、每句配音和每个头像都保持一致。
- **[模板](../../lib/templates/templates.ts)** — POV Life、Sleep Story、True Crime 等等。每个模板都预设了一种风格、一组角色和一个时长。
- **[开发用的 mock](../../.env.example)** — 不填某个提供商的密钥，它的调用就会回退到预置结果，让你不花钱也能开发。

## 支持的智能体

用你自己的编程智能体在 OpenSlop 里免费做视频，可以在线用 [app.openslop.ai](https://app.openslop.ai)，也可以[在你自己的电脑上](local-mode.zh-CN.md)运行。[如何连接](../agents.md)

<img height="16" valign="middle" alt="" src="../../assets/agents/amp.svg" />&nbsp;[Amp](https://ampcode.com/) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/antigravity.svg" />&nbsp;[Antigravity CLI](https://antigravity.google/) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/openai.svg#gh-light-mode-only" /><img height="16" valign="middle" alt="" src="../../assets/agents/openai-white.svg#gh-dark-mode-only" />&nbsp;[ChatGPT](https://chatgpt.com/) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/claude.svg" />&nbsp;[Claude Code](https://claude.com/product/claude-code) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/claude.svg" />&nbsp;[Claude Desktop](https://claude.ai/download) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/codex.svg#gh-light-mode-only" /><img height="16" valign="middle" alt="" src="../../assets/agents/codex-white.svg#gh-dark-mode-only" />&nbsp;[Codex](https://openai.com/codex) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/cursor.svg" />&nbsp;[Cursor](https://cursor.com/cli) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/devin.svg#gh-light-mode-only" /><img height="16" valign="middle" alt="" src="../../assets/agents/devin-white.svg#gh-dark-mode-only" />&nbsp;[Devin](https://devin.ai/cli) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/droid.svg#gh-light-mode-only" /><img height="16" valign="middle" alt="" src="../../assets/agents/droid-white.svg#gh-dark-mode-only" />&nbsp;[Droid](https://www.factory.ai/) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/fx.svg#gh-light-mode-only" /><img height="16" valign="middle" alt="" src="../../assets/agents/fx-white.svg#gh-dark-mode-only" />&nbsp;[fx](https://fx.sh/) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/gemini.svg" />&nbsp;[Gemini CLI](https://github.com/google-gemini/gemini-cli) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/copilot.svg#gh-light-mode-only" /><img height="16" valign="middle" alt="" src="../../assets/agents/copilot-white.svg#gh-dark-mode-only" />&nbsp;[GitHub Copilot](https://github.com/features/copilot) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/grok.svg#gh-light-mode-only" /><img height="16" valign="middle" alt="" src="../../assets/agents/grok-white.svg#gh-dark-mode-only" />&nbsp;[Grok](https://x.ai/) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/hermes.svg#gh-light-mode-only" /><img height="16" valign="middle" alt="" src="../../assets/agents/hermes-white.svg#gh-dark-mode-only" />&nbsp;[Hermes](https://github.com/NousResearch/hermes-agent) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/kimi.svg#gh-light-mode-only" /><img height="16" valign="middle" alt="" src="../../assets/agents/kimi-white.svg#gh-dark-mode-only" />&nbsp;[Kimi Code](https://www.kimi.com/) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/kiro.svg" />&nbsp;[Kiro](https://kiro.dev/cli/) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/mastracode.svg#gh-light-mode-only" /><img height="16" valign="middle" alt="" src="../../assets/agents/mastracode-white.svg#gh-dark-mode-only" />&nbsp;[Mastra Code](https://mastra.ai/) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/vibe.svg" />&nbsp;[Mistral Vibe](https://mistral.ai/) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/muse.svg#gh-light-mode-only" /><img height="16" valign="middle" alt="" src="../../assets/agents/muse-white.svg#gh-dark-mode-only" />&nbsp;[Muse Code](https://developer.meta.com/ai/products/muse-code/) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/pi.svg#gh-light-mode-only" /><img height="16" valign="middle" alt="" src="../../assets/agents/pi-white.svg#gh-dark-mode-only" />&nbsp;[Oh My Pi](https://github.com/can1357/oh-my-pi) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/opencode.svg#gh-light-mode-only" /><img height="16" valign="middle" alt="" src="../../assets/agents/opencode-white.svg#gh-dark-mode-only" />&nbsp;[OpenCode](https://opencode.ai/) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/pi.svg#gh-light-mode-only" /><img height="16" valign="middle" alt="" src="../../assets/agents/pi-white.svg#gh-dark-mode-only" />&nbsp;[Pi](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/vscode.svg" />&nbsp;[VS Code](https://code.visualstudio.com/) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/windsurf.svg#gh-light-mode-only" /><img height="16" valign="middle" alt="" src="../../assets/agents/windsurf-white.svg#gh-dark-mode-only" />&nbsp;[Windsurf](https://windsurf.com/) &nbsp;·&nbsp; <img height="16" valign="middle" alt="" src="../../assets/agents/zed.svg#gh-light-mode-only" /><img height="16" valign="middle" alt="" src="../../assets/agents/zed-white.svg#gh-dark-mode-only" />&nbsp;[Zed](https://zed.dev/)

## 技术栈

| 层级          | 技术                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| 框架          | [Next.js 16](https://nextjs.org)（App Router）                                                               |
| 语言          | [TypeScript 5](https://www.typescriptlang.org)                                                               |
| UI            | [React 19](https://react.dev)、[Tailwind CSS 4](https://tailwindcss.com)、[shadcn/ui](https://ui.shadcn.com) |
| 认证 + 数据库 | [Supabase](https://supabase.com)（Auth、Postgres、RLS）                                                      |
| 视频          | [Remotion 4](https://remotion.dev)（合成、渲染、播放器）                                                     |
| 存储          | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)（生成资源的存储）                                 |
| 图标          | 自研的遮罩 SVG 图标集（`components/ui/icon.tsx` + `components/ui/icons/`），无图标依赖                       |

## 项目结构

代码怎么组织、各层如何配合，见 [`ARCHITECTURE.md`](../../ARCHITECTURE.md#project-structure)。

## 脚本

| 命令                      | 作用                               |
| ------------------------- | ---------------------------------- |
| `npm run dev`             | 启动开发服务器                     |
| `npm run local`           | 以本地模式运行                     |
| `npm run build`           | 生产构建                           |
| `npm run lint`            | ESLint                             |
| `npm run format:check`    | Prettier 检查                      |
| `npm run typecheck`       | TypeScript 检查                    |
| `npm run knip`            | 死代码检查                         |
| `npm run test:run`        | 跑一次测试（Vitest）               |
| `npm run test:e2e`        | 冒烟测试（Playwright）             |
| `npm run db:push`         | 把迁移推送到已关联的 Supabase 项目 |
| `npm run remotion:studio` | 打开 Remotion Studio               |

<details>
<summary><strong>常见问题</strong></summary>
<br />

<details>
<summary>OpenSlop 免费吗？</summary>
<br />

是的。它以 [Apache 2.0 许可证](../../LICENSE)开源。在线版的托管模型随账户提供，本地模式用你自己的 AI 密钥。

</details>

<details>
<summary>需要邀请吗？</summary>
<br />

只有在线版需要。[本地模式](local-mode.zh-CN.md)现在就能在你自己的 Mac、Windows 或 Linux 上运行。

</details>

<details>
<summary>能用哪些 AI 模型？</summary>
<br />

图片和视频来自 Runware，语音来自 Cartesia，音乐和音效来自 ElevenLabs，写作用 Anthropic 的 Claude。每张卡片都能选模型。

</details>

<details>
<summary>能用我已有的剧本吗？</summary>
<br />

能。把它粘贴到输入框里，代替一句话的创意。

</details>

<details>
<summary>项目和视频存在哪里？</summary>
<br />

在线版存在你账户的云端，本地模式存在你的电脑上，只有发给 AI 服务的请求会联网。

</details>

<details>
<summary>怎么拿到成片？</summary>
<br />

点击 **Export**，导出最高 4K 的 MP4。在线版在云端渲染，本地模式在你的电脑上渲染。

</details>

<details>
<summary>生成后改了提示词会怎样？</summary>
<br />

卡片会显示 **Stale** 和原因，你就知道该重新生成什么。

</details>

<details>
<summary>去哪里求助？</summary>
<br />

在 [Discord](https://discord.gg/zeP5482ced) 提问，或发邮件到 [hi@openslop.ai](mailto:hi@openslop.ai)。

</details>

</details>

## 参与贡献

欢迎贡献。安装步骤、检查顺序，以及我们在 PR 里看重什么，见 [`CONTRIBUTING.md`](../../CONTRIBUTING.md)。

## 社区

<p align="center">
  <a href="https://discord.gg/zeP5482ced"><img src="https://img.shields.io/badge/Discord-Join%20the%20community-5865F2?style=flat&logo=discord&logoColor=white" alt="加入我们的 Discord 社区"></a>
</p>

有问题、有想法，或者只是想来聊聊？[加入我们的 Discord](https://discord.gg/zeP5482ced) 或[给我们发邮件](mailto:hi@openslop.ai)。

社区里的每个人都应遵守我们的[行为准则](../../CODE_OF_CONDUCT.md)。如需举报问题，请发邮件到 [hi@openslop.ai](mailto:hi@openslop.ai)。

<a href="https://github.com/openslop/openslop/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=openslop/openslop" alt="OpenSlop 贡献者">
</a>

## Star 历史

<p align="center">
  <a href="https://api.star-history.com/svg?repos=openslop/openslop&type=Date#gh-light-mode-only"><img src="https://api.star-history.com/svg?repos=openslop/openslop&type=Date#gh-light-mode-only" alt="openslop/openslop 的 GitHub star 历史图" width="880"></a>
  <a href="https://api.star-history.com/svg?repos=openslop/openslop&type=Date&theme=dark#gh-dark-mode-only"><img src="https://api.star-history.com/svg?repos=openslop/openslop&type=Date&theme=dark#gh-dark-mode-only" alt="openslop/openslop 的 GitHub star 历史图" width="880"></a>
</p>

## 许可证

采用 [Apache 许可证 2.0](../../LICENSE) 授权。
