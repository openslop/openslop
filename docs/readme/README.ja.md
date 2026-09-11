<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/openslop-lockup-animated-dark.svg">
    <img src="../../assets/openslop-lockup-animated-light.svg" alt="OpenSlop" width="560">
  </picture>
</p>

<p align="center"><b>無料でオープンソースの AI 動画クリエイター。</b></p>

<p align="center">
  <a href="https://openslop.ai"><img src="https://img.shields.io/badge/status-private%20beta-6b6bcf?style=flat" alt="ステータス: プライベートベータ"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue?style=flat" alt="ライセンス: Apache-2.0"></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js" alt="Next.js 16"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white" alt="React 19"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript 5"></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4"></a>
  <a href="https://discord.gg/zeP5482ced"><img src="https://img.shields.io/badge/Discord-Join-5865F2?style=flat&logo=discord&logoColor=white" alt="Discord"></a>
</p>

<p align="center">
  <sub><a href="../../README.md">English</a> · <a href="README.zh-CN.md">中文</a> · 日本語 · <a href="README.ko.md">한국어</a> · <a href="README.es.md">Español</a> · <a href="README.fr.md">Français</a> · <a href="README.pt.md">Português</a></sub>
</p>

<p align="center">
  <a href="https://openslop.ai"><b>openslop.ai</b></a>
  &nbsp;·&nbsp;
  <a href="https://app.openslop.ai">app.openslop.ai</a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/openslop-demo-dark.svg">
    <img src="../../assets/openslop-demo-light.svg" alt="OpenSlop - あなたの無料 AI 動画クリエイター" width="100%">
  </picture>
</p>

---

> **プライベートベータ。** 今は招待制です。
> [openslop.ai でウェイトリストに登録](https://openslop.ai)して、参加してください。

## 概要

OpenSlop は、お気に入りの AI ツールをすべてひとつのワークフローにつなぎます。10個のタブを行き来しなくても、数分で見栄えのいい動画が作れます。あなたは AI アカウントを持ち寄り、OpenSlop はワークフローを持ち寄る。それだけです。

ブラウザで動くので、インストールするものはありません。オープンソースで、ずっと無料。Meta、Google、Stripe、Dropbox 出身のエンジニアが作っています。

## 機能

<table>
<tr>
<td width="50%" valign="middle">

### 動画を説明する

一行だけ打ちます。16:9 か 9:16、言語、モデル、長さを選ぶか、すでにある台本を貼り付けます。ひと押しほしいときは、7つのテンプレートがあります。

[コンポーザー →](../../app/components/copilot/ComposerCopilot.tsx)

</td>
<td width="50%">
  <a href="../../app/components/copilot/ComposerCopilot.tsx"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/describe-dark.svg">
    <img src="../../assets/features/describe-light.svg" alt="プロンプト欄がアイデアの例を順に見せ、そのあと一行が打ち込まれて送信される" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Sloppy が一緒に書く

コパイロットは左のパネルにいます。台本を読み、話の骨組みを作り、シーンを書き、クリップをセリフに合わせます。やったことはすべて、見ている間にキャンバスに現れます。

[ターンの仕組み →](../../ARCHITECTURE.md#sloppy)

</td>
<td width="50%">
  <a href="../../ARCHITECTURE.md#sloppy"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/sloppy-dark.svg">
    <img src="../../assets/features/sloppy-light.svg" alt="Sloppy が考え、読み、骨組みを作り、台本を書き、シーンがキャンバスに現れる" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### プロンプト欄ではなく、ストーリーボード

どのシーンもカードの束です: ナレーション、キャラクター、画像、アニメーション画像、クリップ、効果音、音楽。どのプロンプトも編集でき、カードごとにモデルを選び、ドラッグで並べ替え、ホバーした場所に挿入できます。

[ドキュメントモデル →](../../lib/canvas)

</td>
<td width="50%">
  <a href="../../lib/canvas"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/canvas-dark.svg">
    <img src="../../assets/features/canvas-light.svg" alt="行にホバーすると7種類の要素の挿入メニューが開き、新しい Sound カードが現れる" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### ワンクリックですべて生成

Generate all（すべて生成）は、すべての要素をキューに入れ、依存するものを先に走らせます: アニメーションクリップの前に静止画を、それが登場する画像の前にアバターを。あとでプロンプトを変えると、カードが **Stale**（古い）と、その理由を示します。

[生成グラフ →](../../ARCHITECTURE.md#generation-graph)

</td>
<td width="50%">
  <a href="../../ARCHITECTURE.md#generation-graph"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/generate-dark.svg">
    <img src="../../assets/features/generate-light.svg" alt="Generate all がキューを走らせ、プレビューが埋まり、編集されたプロンプトが理由つきで stale と印される" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### プレイヤーとタイムライン

埋まっていくカットを、単語ごとの字幕つきで見られます。下には4つのレーン: 映像、声、効果音、音楽。ルーラーをスクラブし、シーン単位で飛び、ストーリーボードの帯に切り替えられます。

[プレイヤー →](../../app/components/video)

</td>
<td width="50%">
  <a href="../../app/components/video"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/timeline-dark.svg">
    <img src="../../assets/features/timeline-light.svg" alt="プレイヤーが単語ごとの字幕つきで再生され、再生ヘッドが4レーンのタイムラインを掃いていく" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 自分のキーを持ち込む

ホストされたモデルはアカウントについてきます。Anthropic、Runware、Cartesia、ElevenLabs のキーを貼り付けると、そのモデルがすべての選択肢に現れます。キーは Supabase Vault に置かれ、ブラウザには決して届きません。

[モデルとプロバイダーキー →](../../ARCHITECTURE.md#models-and-provider-keys)

</td>
<td width="50%">
  <a href="../../ARCHITECTURE.md#models-and-provider-keys"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/providers-dark.svg">
    <img src="../../assets/features/providers-light.svg" alt="Cartesia のキーが貼り付けられて検証され、Unverified から Connected に変わる" width="100%">
  </picture></a>
</td>
</tr>
</table>

**ほかにも入っています:**

- **[字幕](../../app/components/canvas/panel/CaptionsPanel.tsx)** — 6つのプリセット、12のフォント、単語ごとか行ごとの表示。色、縁取り、位置はすべて自由に変えられます。
- **[最大 4K で書き出し](../../app/components/video/ExportButton.tsx)** — Remotion Lambda 上で並列のチャンクにしてレンダリングし、MP4 を渡します。
- **[バージョン履歴](../../app/components/canvas/panel/CanvasHistoryPanel.tsx)** — 作業中に自動保存され、チェックポイントにまとめられます。どのバージョンでも見て、戻せます。
- **[キャラクターとアートスタイル](../../app/components/canvas/elements/AssetsSection.tsx)** — キャラクターに一度名前をつければ、すべての画像、セリフ、アバターが一貫します。
- **[テンプレート](../../lib/templates/templates.ts)** — POV Life、Sleep Story、True Crime など。それぞれがスタイル、ナレーター、長さの種になります。
- **[開発用のモック](../../.env.example)** — プロバイダーのキーを未設定のままにすると、その呼び出しは用意された結果に切り替わるので、お金をかけずに開発できます。

## はじめ方

### 前提条件

- [Node.js](https://nodejs.org) 20.9 以上（Next.js 16 の最低要件。CI は 22 で動いています）
- [Supabase](https://supabase.com) のプロジェクト（認証とデータベース用）

### セットアップ

1. リポジトリをクローンします:

```bash
git clone https://github.com/openslop/openslop.git
cd openslop
```

2. 依存関係をインストールします:

```bash
npm install
```

3. 注釈つきの env テンプレートをコピーして、埋めます:

```bash
cp .env.example .env.local
```

Supabase の変数は必須です。ほかはすべて任意です: キーが未設定のプロバイダーはモックに切り替わります。

4. データベースのマイグレーションを実行します:

```bash
npm run db:push
```

5. 開発サーバーを起動します:

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開くと、アプリが見えるはずです。

## 技術スタック

| レイヤー       | 技術                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| フレームワーク | [Next.js 16](https://nextjs.org)（App Router）                                                               |
| 言語           | [TypeScript 5](https://www.typescriptlang.org)                                                               |
| UI             | [React 19](https://react.dev)、[Tailwind CSS 4](https://tailwindcss.com)、[shadcn/ui](https://ui.shadcn.com) |
| 認証 + DB      | [Supabase](https://supabase.com)（Auth、Postgres、RLS）                                                      |
| 動画           | [Remotion 4](https://remotion.dev)（コンポジション、レンダリング、プレイヤー）                               |
| ストレージ     | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)（生成したアセットの保存先）                       |
| アイコン       | 自前のマスク SVG セット（`components/ui/icon.tsx` + `icons/`）。アイコンの依存なし                           |

## プロジェクト構成

```
app/             Next.js のルート、API エンドポイント、エディターのコンポーネント
  api/v1/        アセット種別ごとの REST API（image、video、music、sfx、tts、llm）
  components/    エディター UI（キャンバス、動画プレビューなど）
lib/
  agent/         Sloppy: ツール定義、レジストリ、プロンプトとターンのコンテキスト
  connectors/    アセット種別ごとの、エディター向けクライアント API
  gateway/       /api/v1/* への HTTP クライアント
  providers/     サーバー側のベンダーアダプター（Runware、ElevenLabs、…）
  generation/    生成キューとジョブのオーケストレーション
  canvas/        Slate ドキュメントモデル: 要素の型、ガード、OSML のパースとシリアライズ
  script/        台本のコンテキストと推敲
  project/       プロジェクトごとの Zustand ストア、自動保存、永続化
  video/         シーンのレイアウトとレンダークライアント
  templates/     コンポーザーで提供するプロンプトテンプレート
  upload/        クライアント側の画像アップロード
  supabase/      ブラウザ用・サーバー用の Supabase クライアント
remotion/        Remotion のエントリーポイントとコンポジション
supabase/        データベースのマイグレーション
```

これらのレイヤーがどう関わり合うかは [`ARCHITECTURE.md`](../../ARCHITECTURE.md) を見てください。

## スクリプト

| コマンド                  | すること                            |
| ------------------------- | ----------------------------------- |
| `npm run dev`             | 開発サーバーを起動                  |
| `npm run build`           | 本番ビルド                          |
| `npm run lint`            | ESLint                              |
| `npm run format:check`    | Prettier のチェック                 |
| `npm run typecheck`       | TypeScript のチェック               |
| `npm run knip`            | デッドコードのチェック              |
| `npm run test:run`        | テストを一回実行（Vitest）          |
| `npm run test:e2e`        | スモークテスト（Playwright）        |
| `npm run db:push`         | マイグレーションを Supabase に push |
| `npm run remotion:studio` | Remotion Studio を開く              |

## コントリビュート

コントリビューション歓迎です。セットアップ、チェックの順番、PR で見ているポイントは [`CONTRIBUTING.md`](../../CONTRIBUTING.md) を見てください。

## コミュニティ

<p align="center">
  <a href="https://discord.gg/zeP5482ced"><img src="https://img.shields.io/badge/Discord-Join%20the%20community-5865F2?style=flat&logo=discord&logoColor=white" alt="Discord コミュニティに参加"></a>
</p>

質問、アイデア、ただ遊びに来たいだけでも。[Discord に参加](https://discord.gg/zeP5482ced)するか、[メールをください](mailto:hi@openslop.ai)。

コミュニティの全員に、[行動規範](../../CODE_OF_CONDUCT.md)を守ることを求めます。問題を報告するには、[hi@openslop.ai](mailto:hi@openslop.ai) にメールしてください。

<a href="https://github.com/openslop/openslop/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=openslop/openslop" alt="OpenSlop のコントリビューター">
</a>

## スター履歴

<p align="center">
  <a href="https://star-history.com/#openslop/openslop&Date">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=openslop/openslop&type=Date&theme=dark">
      <img src="https://api.star-history.com/svg?repos=openslop/openslop&type=Date" alt="openslop/openslop の GitHub スター履歴グラフ" width="880">
    </picture>
  </a>
</p>

## ライセンス

[Apache License 2.0](../../LICENSE) のもとでライセンスされています。
