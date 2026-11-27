<p align="center">
  <sub><a href="../local-mode.md">English</a> · 中文 · <a href="local-mode.ja.md">日本語</a> · <a href="local-mode.ko.md">한국어</a> · <a href="local-mode.es.md">Español</a> · <a href="local-mode.fr.md">Français</a> · <a href="local-mode.pt.md">Português</a></sub>
</p>

# 本地模式

<p>
  <img src="https://img.shields.io/badge/macOS-Apple%20silicon%20%7C%20Intel-000000?style=for-the-badge&logo=apple&logoColor=white" alt="macOS: Apple silicon, Intel">
  <img src="https://img.shields.io/badge/Windows-10%20%7C%2011-0078D4?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMy40IDkuOCAydjkuNkgwek0xMSAxLjkgMjQgMHYxMS42SDExek0wIDEyLjRoOS44VjIyTDAgMjAuNnpNMTEgMTIuNGgxM1YyNGwtMTMtMS45eiIvPjwvc3ZnPg==" alt="Windows 10, 11">
  <img src="https://img.shields.io/badge/Linux-x64%20%7C%20arm64-FCC624?style=for-the-badge&logo=linux&logoColor=black" alt="Linux: x64, arm64">
</p>

你的项目和视频都留在你的电脑上。只有发给 AI 服务的请求会上网。

<p align="center">
  <img src="../../assets/features/local-dark.svg" alt="终端运行 npm run local，随后 OpenSlop 在 localhost:3000 打开，显示保存在这台电脑上的项目" width="100%">
</p>

## 需要准备什么

| 你的电脑              | Node.js 22+ | Docker Desktop    |
| --------------------- | ----------- | ----------------- |
| M1 或更新芯片的 Mac   | ✅          | —                 |
| Intel 芯片的 Mac      | ✅          | ✅ 使用时保持打开 |
| Windows 10 或 11      | ✅          | ✅ 使用时保持打开 |
| Linux（x64 或 arm64） | ✅          | —                 |

你还需要至少一家 AI 服务商的密钥。第 5 步会告诉你需要哪些。

## 设置

<table>
<tr>
<td width="50%" valign="middle">

#### 1. 安装 Node.js

打开 [Node.js 下载页面](https://nodejs.org/en/download)。点击绿色的安装程序按钮（**Windows Installer** 或 **macOS Installer**），打开下载的文件，按提示一步步装好。22 或更新的版本都可以。

</td>
<td width="50%">
  <img src="../../assets/features/local-step-node-light.svg#gh-light-mode-only" alt="在 nodejs.org 点击 Windows Installer，运行安装程序，装好 Node.js" width="100%">
  <img src="../../assets/features/local-step-node-dark.svg#gh-dark-mode-only" alt="在 nodejs.org 点击 Windows Installer，运行安装程序，装好 Node.js" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 2. 安装 Docker Desktop（仅限 Windows 和 Intel Mac）

_如果是 Linux，或是 M1 及更新芯片（M2、M3 等）的 Mac，请跳过这一步。要查看你的 Mac，打开苹果菜单 > **关于本机**，看 **芯片** 一栏。_

在 [docker.com](https://www.docker.com/products/docker-desktop/) 点击 **Download Docker Desktop**，选择你的电脑并安装。打开它，使用 OpenSlop 期间一直开着。

</td>
<td width="50%">
  <img src="../../assets/features/local-step-docker-light.svg#gh-light-mode-only" alt="在 docker.com 选择 Windows 版下载，Docker Desktop 打开并显示引擎正在运行" width="100%">
  <img src="../../assets/features/local-step-docker-dark.svg#gh-dark-mode-only" alt="在 docker.com 选择 Windows 版下载，Docker Desktop 打开并显示引擎正在运行" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 3. 下载 OpenSlop

在 [OpenSlop 的 GitHub 页面](https://github.com/openslop/openslop) 点击绿色的 **Code** 按钮，然后点 **Download ZIP**。也可以[直接下载 ZIP](https://github.com/openslop/openslop/archive/refs/heads/master.zip)。

</td>
<td width="50%">
  <img src="../../assets/features/local-step-download-light.svg#gh-light-mode-only" alt="在 GitHub 上，绿色的 Code 按钮打开菜单，然后点击 Download ZIP" width="100%">
  <img src="../../assets/features/local-step-download-dark.svg#gh-dark-mode-only" alt="在 GitHub 上，绿色的 Code 按钮打开菜单，然后点击 Download ZIP" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 4. 解压并启动 OpenSlop

Windows：右键点击 ZIP > **Extract All**，再右键点击新文件夹 > **Open in Terminal**。Mac：双击 ZIP，再右键点击新文件夹 > **New Terminal at Folder**。在终端里运行：

```bash
npm install
npm run local
```

第一次运行需要几分钟。之后 OpenSlop 会在浏览器中打开，并且已经登录。要停止，在终端里按 Ctrl+C。你的项目会保留到下次。

</td>
<td width="50%">
  <img src="../../assets/features/local-step-terminal-light.svg#gh-light-mode-only" alt="在下载文件夹里解压 ZIP 并用终端打开，然后用 npm install 和 npm run local 启动 OpenSlop" width="100%">
  <img src="../../assets/features/local-step-terminal-dark.svg#gh-dark-mode-only" alt="在下载文件夹里解压 ZIP 并用终端打开，然后用 npm install 和 npm run local 启动 OpenSlop" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 5. 添加你的 AI 密钥

点击个人头像，然后点 **Settings** > **Add providers**，用你的密钥连接一个提供商。需要哪些密钥取决于你要做什么：

- **全部功能**：全部 7 类（Text、Speech、Images、Videos、Music、Sound 和 Captions）。
- **不露脸的配音视频**：Text、Speech 和 Images。
- **电影感视频**：Text 和 Videos。

</td>
<td width="50%">
  <img src="../../assets/features/local-step-keys-light.svg#gh-light-mode-only" alt="从个人菜单打开 Settings，在 Add providers 中选择提供商，粘贴并连接 Anthropic 密钥" width="100%">
  <img src="../../assets/features/local-step-keys-dark.svg#gh-dark-mode-only" alt="从个人菜单打开 Settings，在 Add providers 中选择提供商，粘贴并连接 Anthropic 密钥" width="100%">
</td>
</tr>
</table>

## 改用你的编程智能体

已经在用 Claude Code、Codex 或 Cursor？Sloppy 和文本生成可以直接用它运行，不需要文本密钥。详见 [Local agents](../local-agents.md)。

## 之后每天

| 想要           | 这样做                                             |
| -------------- | -------------------------------------------------- |
| 启动 OpenSlop  | 在 OpenSlop 文件夹里打开终端，运行 `npm run local` |
| 停止 OpenSlop  | 在那个终端里按 <kbd>Ctrl</kbd>+<kbd>C</kbd>        |
| 继续之前的工作 | 再次运行 `npm run local`。你的项目和密钥都还在     |

## 本地模式与在线版

|            | 本地模式                               | 在线版 [app.openslop.ai](https://app.openslop.ai) |
| ---------- | -------------------------------------- | ------------------------------------------------- |
| 谁能用     | 任何人，今天就能用                     | 仅限邀请，[加入等候名单](https://openslop.ai)     |
| 安装       | Node.js，部分电脑还要 Docker Desktop   | 无需安装                                          |
| 登录       | 自动登录，单个用户                     | 你的账号                                          |
| 项目和媒体 | 在你的电脑上                           | 在云端                                            |
| AI 模型    | 你自己的密钥，或这台电脑上的编程智能体 | 自带的托管模型，加上你自己的密钥                  |
| 导出视频   | 在你的电脑上渲染                       | 在云端渲染                                        |

## 遇到问题

| 终端显示                                                   | 这样做                                                                  |
| ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| `OpenSlop needs Node.js 22 or newer`                       | 从第 1 步安装 Node.js 22 或更新版本，打开新终端，再运行 `npm run local` |
| `` `npx supabase start …` failed `` (Windows 或 Intel Mac) | 打开 Docker Desktop，等引擎运行起来，再运行 `npm run local`             |
| 其他情况                                                   | 到 [Discord](https://discord.gg/zeP5482ced) 提问，附上终端输出的内容    |

<details>
<summary>会下载什么</summary>

- `npm install` 获取应用代码。
- 第一次运行 `npm run local` 还会下载以下内容，只下载一次：
  - **Supabase**：数据库和文件存储，保存在 `~/.supabase/cache`。在 Windows 和 Intel Mac 上，则保存在 Docker Desktop 里。
  - **Chrome Headless Shell**：把你的项目做成视频文件，保存在 `node_modules/.remotion`。

</details>

> 要为 OpenSlop 写代码？想改用托管服务开发，请看[用 Supabase 项目开发](../../CONTRIBUTING.md#develop-against-a-supabase-project)。
