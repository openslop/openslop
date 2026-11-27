<p align="center">
  <sub><a href="../local-mode.md">English</a> · <a href="local-mode.zh-CN.md">中文</a> · 日本語 · <a href="local-mode.ko.md">한국어</a> · <a href="local-mode.es.md">Español</a> · <a href="local-mode.fr.md">Français</a> · <a href="local-mode.pt.md">Português</a></sub>
</p>

# ローカルモード

<p>
  <img src="https://img.shields.io/badge/macOS-Apple%20silicon%20%7C%20Intel-000000?style=for-the-badge&logo=apple&logoColor=white" alt="macOS: Apple silicon, Intel">
  <img src="https://img.shields.io/badge/Windows-10%20%7C%2011-0078D4?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMy40IDkuOCAydjkuNkgwek0xMSAxLjkgMjQgMHYxMS42SDExek0wIDEyLjRoOS44VjIyTDAgMjAuNnpNMTEgMTIuNGgxM1YyNGwtMTMtMS45eiIvPjwvc3ZnPg==" alt="Windows 10, 11">
  <img src="https://img.shields.io/badge/Linux-x64%20%7C%20arm64-FCC624?style=for-the-badge&logo=linux&logoColor=black" alt="Linux: x64, arm64">
</p>

プロジェクトと動画はパソコンの中に残ります。インターネットに出るのは、AI サービスへのリクエストだけです。

<p align="center">
  <img src="../../assets/features/local-dark.svg" alt="ターミナルで npm run local を実行すると、OpenSlop が localhost:3000 で開き、このパソコンに保存されたプロジェクトが表示される" width="100%">
</p>

## 必要なもの

| あなたのパソコン          | Node.js 22+ | Docker Desktop        |
| ------------------------- | ----------- | --------------------- |
| M1 以降の Mac             | ✅          | —                     |
| Intel の Mac              | ✅          | ✅ 使う間は開いたまま |
| Windows 10 または 11      | ✅          | ✅ 使う間は開いたまま |
| Linux（x64 または arm64） | ✅          | —                     |

AI プロバイダのキーも最低 1 つ必要です。どれが要るかは手順 5 にあります。

## セットアップ

<table>
<tr>
<td width="50%" valign="middle">

#### 1. Node.js をインストール

[Node.js のダウンロードページ](https://nodejs.org/en/download)を開きます。緑のインストーラーボタン（**Windows Installer** か **macOS Installer**）をクリックし、ダウンロードしたファイルを開いて進めます。バージョンは 22 以上なら大丈夫です。

</td>
<td width="50%">
  <img src="../../assets/features/local-step-node-light.svg#gh-light-mode-only" alt="nodejs.org で Windows Installer をクリックし、インストーラーを進めて Node.js をインストールする" width="100%">
  <img src="../../assets/features/local-step-node-dark.svg#gh-dark-mode-only" alt="nodejs.org で Windows Installer をクリックし、インストーラーを進めて Node.js をインストールする" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 2. Docker Desktop をインストール（Windows と Intel の Mac のみ）

_Linux や、M1 以降のチップ（M2、M3 など）の Mac では飛ばしてください。Mac のチップは、Apple メニュー > **この Mac について** の **チップ** で確認できます。_

[docker.com](https://www.docker.com/products/docker-desktop/) で **Download Docker Desktop** をクリックし、自分のパソコンを選んでインストールします。起動したら、OpenSlop を使っている間は開いたままにしておきます。

</td>
<td width="50%">
  <img src="../../assets/features/local-step-docker-light.svg#gh-light-mode-only" alt="docker.com で Windows 用のダウンロードを選び、Docker Desktop がエンジン起動済みで開く" width="100%">
  <img src="../../assets/features/local-step-docker-dark.svg#gh-dark-mode-only" alt="docker.com で Windows 用のダウンロードを選び、Docker Desktop がエンジン起動済みで開く" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 3. OpenSlop をダウンロード

[OpenSlop の GitHub ページ](https://github.com/openslop/openslop)で緑の **Code** ボタンをクリックし、**Download ZIP** を選びます。[ZIP を直接ダウンロード](https://github.com/openslop/openslop/archive/refs/heads/master.zip)することもできます。

</td>
<td width="50%">
  <img src="../../assets/features/local-step-download-light.svg#gh-light-mode-only" alt="GitHub で緑の Code ボタンがメニューを開き、Download ZIP をクリックする" width="100%">
  <img src="../../assets/features/local-step-download-dark.svg#gh-dark-mode-only" alt="GitHub で緑の Code ボタンがメニューを開き、Download ZIP をクリックする" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 4. 展開して OpenSlop を起動

Windows では ZIP を右クリック > **Extract All**、次に新しいフォルダを右クリック > **Open in Terminal** を選びます。Mac では ZIP をダブルクリックし、新しいフォルダを右クリック > **New Terminal at Folder** を選びます。ターミナルで次を実行します。

```bash
npm install
npm run local
```

初回は数分かかります。そのあと OpenSlop がブラウザで開き、すでにサインインした状態になります。止めるときはターミナルで Ctrl+C を押します。プロジェクトは次回のために保存されます。

</td>
<td width="50%">
  <img src="../../assets/features/local-step-terminal-light.svg#gh-light-mode-only" alt="ダウンロードフォルダで ZIP を展開してターミナルで開き、npm install と npm run local で OpenSlop を起動する" width="100%">
  <img src="../../assets/features/local-step-terminal-dark.svg#gh-dark-mode-only" alt="ダウンロードフォルダで ZIP を展開してターミナルで開き、npm install と npm run local で OpenSlop を起動する" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 5. AI のキーを追加

プロフィールアイコンをクリックし、**Settings** > **Add providers** を開いて、自分のキーでプロバイダーを接続します。必要なキーは作るものによって変わります。

- **すべて使う**：7 種類すべて（Text、Speech、Images、Videos、Music、Sound、Captions）
- **顔出しなしのナレーション動画**：Text、Speech、Images
- **シネマティックな動画**：Text、Videos

</td>
<td width="50%">
  <img src="../../assets/features/local-step-keys-light.svg#gh-light-mode-only" alt="プロフィールメニューから Settings を開き、Add providers でプロバイダーを選んで Anthropic のキーを貼り付けて接続する" width="100%">
  <img src="../../assets/features/local-step-keys-dark.svg#gh-dark-mode-only" alt="プロフィールメニューから Settings を開き、Add providers でプロバイダーを選んで Anthropic のキーを貼り付けて接続する" width="100%">
</td>
</tr>
</table>

## コーディングエージェントを使う

<table>
<tr>
<td width="50%" valign="middle">

Claude Code、Codex、Gemini CLI、Cursor をすでに使っているなら、テキスト用のキーの代わりにそれで Sloppy とテキスト生成を動かせます。ターミナルで一度エージェントにサインインし（例：`claude` を実行）、テキストのモデル選択で **Local agent** の中から選びます。音声・画像・音楽・動画には引き続きそれぞれのキーが必要です。[仕組み](../local-agents.md)

</td>
<td width="50%">
  <img src="../../assets/features/local-step-agent-light.svg#gh-light-mode-only" alt="入力欄のモデル選択にローカルエージェントが並び、Claude Code を選ぶと Sloppy がそれで動き出す" width="100%">
  <img src="../../assets/features/local-step-agent-dark.svg#gh-dark-mode-only" alt="入力欄のモデル選択にローカルエージェントが並び、Claude Code を選ぶと Sloppy がそれで動き出す" width="100%">
</td>
</tr>
</table>

## 次からの使い方

| したいこと      | やり方                                                                    |
| --------------- | ------------------------------------------------------------------------- |
| OpenSlop を起動 | OpenSlop のフォルダでターミナルを開き、`npm run local` を実行             |
| OpenSlop を停止 | そのターミナルで <kbd>Ctrl</kbd>+<kbd>C</kbd> を押す                      |
| 続きから作業    | もう一度 `npm run local` を実行。プロジェクトもキーもそのまま残っています |

## ローカルモードとオンライン版

|                        | ローカルモード                                           | オンライン版 [app.openslop.ai](https://app.openslop.ai) |
| ---------------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| 使える人               | 誰でも、今日から                                         | 招待制、[ウェイトリストに登録](https://openslop.ai)     |
| インストール           | Node.js、パソコンによっては Docker Desktop も            | 不要                                                    |
| サインイン             | 自動、ユーザーは 1 人                                    | あなたのアカウント                                      |
| プロジェクトとメディア | あなたのパソコン                                         | クラウド                                                |
| AI モデル              | 自分のキー、またはこのパソコンのコーディングエージェント | ホストされたモデルと自分のキー                          |
| 動画の書き出し         | あなたのパソコンでレンダリング                           | クラウドでレンダリング                                  |

## うまくいかないとき

| ターミナルの表示                                                  | やること                                                                                 |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `OpenSlop needs Node.js 22 or newer`                              | 手順 1 で Node.js 22 以降を入れ、新しいターミナルを開いて `npm run local` をもう一度実行 |
| `` `npx supabase start …` failed `` (Windows または Intel の Mac) | Docker Desktop を開き、エンジンが動き出したら `npm run local` をもう一度実行             |
| それ以外                                                          | ターミナルの表示を添えて [Discord](https://discord.gg/zeP5482ced) で質問                 |

<details>
<summary>ダウンロードされるもの</summary>

- `npm install` でアプリのコードを取得します。
- 最初の `npm run local` では、次のものも一度だけダウンロードします。
  - **Supabase**：データベースとファイルの保存先です。`~/.supabase/cache` に置かれます。Windows と Intel の Mac では、代わりに Docker Desktop の中に保存されます。
  - **Chrome Headless Shell**：プロジェクトを動画ファイルにします。`node_modules/.remotion` に置かれます。

</details>

> OpenSlop のコードを書くなら、ホストされたサービスで開発する方法は[Supabase プロジェクトで開発する](../../CONTRIBUTING.md#develop-against-a-supabase-project)を見てください。
