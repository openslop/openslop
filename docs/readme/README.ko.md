<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/openslop-lockup-animated-dark.svg">
    <img src="../../assets/openslop-lockup-animated-light.svg" alt="OpenSlop" width="560">
  </picture>
</p>

<p align="center"><b>무료 오픈 소스 AI 비디오 제작 도구.</b></p>

<p align="center">
  <a href="https://openslop.ai"><img src="https://img.shields.io/badge/status-private%20beta-6b6bcf?style=flat" alt="상태: 비공개 베타"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue?style=flat" alt="라이선스: Apache-2.0"></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js" alt="Next.js 16"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white" alt="React 19"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript 5"></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4"></a>
  <a href="https://discord.gg/zeP5482ced"><img src="https://img.shields.io/badge/Discord-Join-5865F2?style=flat&logo=discord&logoColor=white" alt="Discord"></a>
</p>

<p align="center">
  <sub><a href="../../README.md">English</a> · <a href="README.zh-CN.md">中文</a> · <a href="README.ja.md">日本語</a> · 한국어 · <a href="README.es.md">Español</a> · <a href="README.fr.md">Français</a> · <a href="README.pt.md">Português</a></sub>
</p>

<p align="center">
  <a href="https://openslop.ai"><b>openslop.ai</b></a>
  &nbsp;·&nbsp;
  <a href="https://app.openslop.ai">app.openslop.ai</a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/openslop-demo-dark.svg">
    <img src="../../assets/openslop-demo-light.svg" alt="OpenSlop - 무료 AI 비디오 제작 도구" width="100%">
  </picture>
</p>

---

> **비공개 베타.** 지금은 초대받은 분만 쓸 수 있습니다.
> [openslop.ai에서 대기자 명단에 올라](https://openslop.ai) 들어오세요.

## 개요

OpenSlop은 여러분이 즐겨 쓰는 AI 도구를 하나의 워크플로로 엮어, 탭 열 개를 오가지 않고도 몇 분 만에 보기 좋은 비디오를 만들 수 있게 합니다. 여러분은 AI 계정을 가져오고, OpenSlop은 워크플로를 가져옵니다. 그게 전부입니다.

브라우저에서 돌아가니 설치할 게 없습니다. 오픈 소스이고, 영원히 무료입니다. Meta, Google, Stripe, Dropbox 출신 엔지니어들이 만들었습니다.

## 기능

<table>
<tr>
<td width="50%" valign="middle">

### 비디오를 설명하세요

한 줄만 적으세요. 16:9 또는 9:16, 언어, 모델, 길이를 고르거나, 이미 있는 스크립트를 붙여 넣으세요. 힌트가 필요하면 템플릿 일곱 개가 있습니다.

[컴포저 →](../../app/components/copilot/ComposerCopilot.tsx)

</td>
<td width="50%">
  <a href="../../app/components/copilot/ComposerCopilot.tsx"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/describe-dark.svg">
    <img src="../../assets/features/describe-light.svg" alt="프롬프트 상자에 예시 아이디어가 차례로 지나가고, 한 줄을 입력해 보냅니다" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Sloppy가 함께 씁니다

코파일럿은 왼쪽 패널에 있습니다. 스크립트를 읽고, 이야기의 뼈대를 잡고, 장면을 쓰고, 대사에 맞춰 동영상 카드를 배치합니다. 하는 일 전부가 여러분이 보는 동안 캔버스에 올라옵니다.

[한 턴이 돌아가는 방식 →](../../ARCHITECTURE.md#sloppy)

</td>
<td width="50%">
  <a href="../../ARCHITECTURE.md#sloppy"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/sloppy-dark.svg">
    <img src="../../assets/features/sloppy-light.svg" alt="Sloppy가 생각하고, 읽고, 뼈대를 잡고, 스크립트를 쓰면 캔버스에 장면이 나타납니다" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 프롬프트 상자가 아니라 스토리보드

모든 장면은 카드 묶음입니다: 내레이션, 캐릭터, 이미지, 동영상, 효과음, 음악. 어떤 프롬프트든 고치고, 카드마다 모델을 고르고, 끌어서 순서를 바꾸고, 마우스를 올린 곳 어디든 끼워 넣으세요.

[문서 모델 →](../../lib/canvas)

</td>
<td width="50%">
  <a href="../../lib/canvas"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/canvas-dark.svg">
    <img src="../../assets/features/canvas-light.svg" alt="줄에 마우스를 올리면 일곱 가지 요소 유형이 있는 삽입 메뉴가 열리고 새 Sound 카드가 나타납니다" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 한 번 눌러 전부 생성

Generate all(모두 생성)은 모든 요소를 큐에 넣고 의존하는 것부터 먼저 돌립니다: 장면이 이어받는 동영상 카드를 그 장면보다 먼저, 아바타가 들어갈 이미지보다 아바타를 먼저. 나중에 프롬프트를 바꾸면 카드에 **Stale**(오래됨)과 그 이유가 표시됩니다.

[생성 그래프 →](../../ARCHITECTURE.md#generation-graph)

</td>
<td width="50%">
  <a href="../../ARCHITECTURE.md#generation-graph"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/generate-dark.svg">
    <img src="../../assets/features/generate-light.svg" alt="Generate all이 큐를 돌리고, 미리보기가 채워지고, 고친 프롬프트는 이유와 함께 Stale로 표시됩니다" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 플레이어와 타임라인

채워지는 대로 편집본을 보세요. 자막은 단어 단위로 나옵니다. 아래에는 네 개의 레인: 화면, 음성, 효과, 음악. 눈금자를 문지르거나, 장면 단위로 건너뛰거나, 스토리보드 스트립으로 바꾸세요.

[플레이어 →](../../app/components/player)

</td>
<td width="50%">
  <a href="../../app/components/player"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/timeline-dark.svg">
    <img src="../../assets/features/timeline-light.svg" alt="플레이어가 단어 단위 자막과 함께 재생되고, 재생 헤드가 네 레인짜리 타임라인을 지나갑니다" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### 자기 키 가져오기

호스팅 모델은 계정에 딸려 옵니다. Anthropic, Runware, Cartesia, ElevenLabs 키를 붙여 넣으면 그 모델들이 모든 선택 메뉴에 나타납니다. 키는 Supabase Vault에 보관되고 브라우저에는 절대 닿지 않습니다.

[모델과 공급자 키 →](../../ARCHITECTURE.md#models-and-provider-keys)

</td>
<td width="50%">
  <a href="../../ARCHITECTURE.md#models-and-provider-keys"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/providers-dark.svg">
    <img src="../../assets/features/providers-light.svg" alt="Cartesia 키를 붙여 넣고 검증하면 Unverified(미확인)에서 Connected(연결됨)로 바뀝니다" width="100%">
  </picture></a>
</td>
</tr>
</table>

**함께 들어 있는 것:**

- **[자막](../../app/components/canvas/panel/CaptionsPanel.tsx)** — 프리셋 여섯 개, 글꼴 열두 개, 단어 단위 또는 줄 단위로 나타나기, 그리고 색, 테두리, 위치 전부를 마음대로 바꿀 수 있습니다.
- **[최대 4K로 내보내기](../../app/components/player/ExportButton.tsx)** — Remotion Lambda에서 여러 조각을 동시에 렌더링해 MP4를 건네줍니다.
- **[버전 기록](../../app/components/canvas/panel/CanvasHistoryPanel.tsx)** — 작업하는 동안 자동 저장되고, 체크포인트로 묶입니다. 어떤 버전이든 보고 되돌릴 수 있습니다.
- **[캐릭터와 화풍](../../app/components/canvas/elements/AssetsSection.tsx)** — 캐릭터 이름을 한 번만 정하면 모든 이미지, 음성 대사, 아바타가 일관되게 유지됩니다.
- **[템플릿](../../lib/templates/templates.ts)** — POV Life, Sleep Story, True Crime 등. 각각 스타일, 내레이터, 길이를 미리 채워 줍니다.
- **[개발용 목(mock)](../../.env.example)** — 공급자 키를 비워 두면 그 호출은 미리 준비된 결과로 대체되어, 돈을 내지 않고도 개발할 수 있습니다.

## 시작하기

### 준비물

- [Node.js](https://nodejs.org) 20.9 이상 (Next.js 16의 최소 요구 사항; CI는 22로 돌아갑니다)
- [Supabase](https://supabase.com) 프로젝트 (인증과 데이터베이스용)

### 설정

1. 저장소를 클론합니다:

```bash
git clone https://github.com/openslop/openslop.git
cd openslop
```

2. 의존성을 설치합니다:

```bash
npm install
```

3. 주석이 달린 env 템플릿을 복사해 채웁니다:

```bash
cp .env.example .env.local
```

Supabase 변수는 필수입니다. 나머지는 모두 선택입니다: 키가 비어 있는 공급자는 목(mock)으로 대체됩니다.

4. 데이터베이스 마이그레이션을 실행합니다:

```bash
npm run db:push
```

5. 개발 서버를 시작합니다:

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)을 열면 앱이 보일 겁니다.

## 기술 스택

| 계층       | 기술                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| 프레임워크 | [Next.js 16](https://nextjs.org) (App Router)                                                                |
| 언어       | [TypeScript 5](https://www.typescriptlang.org)                                                               |
| UI         | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) |
| 인증 + DB  | [Supabase](https://supabase.com) (Auth, Postgres, RLS)                                                       |
| 비디오     | [Remotion 4](https://remotion.dev) (합성, 렌더링, 플레이어)                                                  |
| 스토리지   | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (생성된 에셋 저장)                                |
| 아이콘     | 자체 제작 마스크 SVG 세트 (`components/ui/icon.tsx` + `icons/`), 아이콘 의존성 없음                          |

## 프로젝트 구조

```
app/             Next.js 라우트, API 엔드포인트, 에디터 컴포넌트
  api/v1/        에셋 유형별 REST API (image, video, music, sfx, tts, llm)
  components/    에디터 UI (캔버스, 비디오 미리보기 등)
lib/
  agent/         Sloppy: 도구 정의, 레지스트리, 프롬프트와 턴 컨텍스트
  connectors/    에셋 유형별 에디터용 클라이언트 API
  gateway/       /api/v1/* 로 가는 HTTP 클라이언트
  providers/     서버 측 벤더 어댑터 (Runware, ElevenLabs, …)
  generation/    생성 큐와 작업 오케스트레이션
  canvas/        Slate 문서 모델: 요소 유형, 가드, OSML 파싱/직렬화
  script/        스크립트 컨텍스트와 다듬기
  project/       프로젝트별 Zustand 스토어, 자동 저장, 영속화
  video/         장면 레이아웃과 렌더 클라이언트
  templates/     컴포저에서 제공하는 프롬프트 템플릿
  upload/        클라이언트 측 이미지 업로드
  supabase/      브라우저/서버 Supabase 클라이언트
remotion/        Remotion 진입점과 컴포지션
supabase/        데이터베이스 마이그레이션
```

이 계층들이 어떻게 맞물리는지는 [`ARCHITECTURE.md`](../../ARCHITECTURE.md)를 보세요.

## 스크립트

| 명령                      | 하는 일                        |
| ------------------------- | ------------------------------ |
| `npm run dev`             | 개발 서버 시작                 |
| `npm run build`           | 프로덕션 빌드                  |
| `npm run lint`            | ESLint                         |
| `npm run format:check`    | Prettier 검사                  |
| `npm run typecheck`       | TypeScript 검사                |
| `npm run knip`            | 죽은 코드 검사                 |
| `npm run test:run`        | 테스트 한 번 실행 (Vitest)     |
| `npm run test:e2e`        | 스모크 테스트 (Playwright)     |
| `npm run db:push`         | 마이그레이션을 Supabase에 푸시 |
| `npm run remotion:studio` | Remotion Studio 열기           |

## 기여하기

기여를 환영합니다. 설정, 검사 순서, PR에서 우리가 보는 것은 [`CONTRIBUTING.md`](../../CONTRIBUTING.md)를 보세요.

## 커뮤니티

<p align="center">
  <a href="https://discord.gg/zeP5482ced"><img src="https://img.shields.io/badge/Discord-Join%20the%20community-5865F2?style=flat&logo=discord&logoColor=white" alt="Discord 커뮤니티에 참여하기"></a>
</p>

질문이나 아이디어가 있거나, 그냥 어울리고 싶나요? [Discord에 참여](https://discord.gg/zeP5482ced)하거나 [이메일을 보내세요](mailto:hi@openslop.ai).

커뮤니티의 모든 분은 [행동 강령](../../CODE_OF_CONDUCT.md)을 따라야 합니다. 문제를 알리려면 [hi@openslop.ai](mailto:hi@openslop.ai)로 이메일을 보내세요.

<a href="https://github.com/openslop/openslop/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=openslop/openslop" alt="OpenSlop 기여자">
</a>

## 스타 히스토리

<p align="center">
  <a href="https://star-history.com/#openslop/openslop&Date">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=openslop/openslop&type=Date&theme=dark">
      <img src="https://api.star-history.com/svg?repos=openslop/openslop&type=Date" alt="openslop/openslop의 GitHub 스타 히스토리 차트" width="880">
    </picture>
  </a>
</p>

## 라이선스

[Apache License 2.0](../../LICENSE)에 따라 배포됩니다.
