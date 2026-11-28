<p align="center">
  <sub><a href="../local-mode.md">English</a> · <a href="local-mode.zh-CN.md">中文</a> · <a href="local-mode.ja.md">日本語</a> · 한국어 · <a href="local-mode.es.md">Español</a> · <a href="local-mode.fr.md">Français</a> · <a href="local-mode.pt.md">Português</a></sub>
</p>

# 로컬 모드

<p>
  <img src="https://img.shields.io/badge/macOS-Apple%20silicon%20%7C%20Intel-000000?style=for-the-badge&logo=apple&logoColor=white" alt="macOS: Apple silicon, Intel">
  <img src="https://img.shields.io/badge/Windows-10%20%7C%2011-0078D4?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMy40IDkuOCAydjkuNkgwek0xMSAxLjkgMjQgMHYxMS42SDExek0wIDEyLjRoOS44VjIyTDAgMjAuNnpNMTEgMTIuNGgxM1YyNGwtMTMtMS45eiIvPjwvc3ZnPg==" alt="Windows 10, 11">
  <img src="https://img.shields.io/badge/Linux-x64%20%7C%20arm64-FCC624?style=for-the-badge&logo=linux&logoColor=black" alt="Linux: x64, arm64">
</p>

프로젝트와 비디오는 내 컴퓨터에 남습니다. 인터넷으로 나가는 것은 AI 서비스에 보내는 요청뿐입니다.

<p align="center">
  <img src="../../assets/features/local-dark.svg" alt="터미널에서 npm run local을 실행하면 OpenSlop이 localhost:3000에서 열리고, 이 컴퓨터에 저장된 프로젝트가 보입니다" width="100%">
</p>

## 준비물

| 내 컴퓨터             | Node.js 22+ | Docker Desktop       |
| --------------------- | ----------- | -------------------- |
| M1 이상 Mac           | ✅          | —                    |
| Intel Mac             | ✅          | ✅ 쓰는 동안 켜 두기 |
| Windows 10 또는 11    | ✅          | ✅ 쓰는 동안 켜 두기 |
| Linux(x64 또는 arm64) | ✅          | —                    |

AI 제공업체 키도 하나 이상 필요합니다. 어떤 키가 필요한지는 5단계에 있습니다.

## 설치

<table>
<tr>
<td width="50%" valign="middle">

#### 1. Node.js 설치

[Node.js 다운로드 페이지](https://nodejs.org/en/download)로 가세요. 초록색 설치 프로그램 버튼(**Windows Installer** 또는 **macOS Installer**)을 누르고, 받은 파일을 열어 안내대로 진행하세요. 22 이상이면 어떤 버전이든 됩니다.

</td>
<td width="50%">
  <img src="../../assets/features/local-step-node-light.svg#gh-light-mode-only" alt="nodejs.org에서 Windows Installer를 누르고 설치 프로그램을 진행해 Node.js를 설치한다" width="100%">
  <img src="../../assets/features/local-step-node-dark.svg#gh-dark-mode-only" alt="nodejs.org에서 Windows Installer를 누르고 설치 프로그램을 진행해 Node.js를 설치한다" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 2. Docker Desktop 설치 (Windows와 Intel Mac만)

_Linux이거나 M1 이상 칩(M2, M3 등)의 Mac이라면 건너뛰세요. Mac의 칩은 Apple 메뉴 > **이 Mac에 관하여**의 **칩**에서 확인할 수 있습니다._

[docker.com](https://www.docker.com/products/docker-desktop/)에서 **Download Docker Desktop**을 누르고, 내 컴퓨터를 고른 뒤 설치하세요. 실행한 다음, OpenSlop을 쓰는 동안 계속 열어 두세요.

</td>
<td width="50%">
  <img src="../../assets/features/local-step-docker-light.svg#gh-light-mode-only" alt="docker.com에서 Windows용 다운로드를 고르고, Docker Desktop이 엔진이 실행된 상태로 열린다" width="100%">
  <img src="../../assets/features/local-step-docker-dark.svg#gh-dark-mode-only" alt="docker.com에서 Windows용 다운로드를 고르고, Docker Desktop이 엔진이 실행된 상태로 열린다" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 3. OpenSlop 내려받기

[OpenSlop GitHub 페이지](https://github.com/openslop/openslop)에서 초록색 **Code** 버튼을 누른 다음 **Download ZIP**을 누르세요. [ZIP을 바로 내려받을](https://github.com/openslop/openslop/archive/refs/heads/master.zip) 수도 있습니다.

</td>
<td width="50%">
  <img src="../../assets/features/local-step-download-light.svg#gh-light-mode-only" alt="GitHub에서 초록색 Code 버튼이 메뉴를 열고 Download ZIP을 누른다" width="100%">
  <img src="../../assets/features/local-step-download-dark.svg#gh-dark-mode-only" alt="GitHub에서 초록색 Code 버튼이 메뉴를 열고 Download ZIP을 누른다" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 4. 압축을 풀고 OpenSlop 시작

Windows에서는 ZIP을 오른쪽 클릭 > **Extract All**, 그다음 새 폴더를 오른쪽 클릭 > **Open in Terminal**을 고르세요. Mac에서는 ZIP을 더블 클릭한 다음 새 폴더를 오른쪽 클릭 > **New Terminal at Folder**를 고르세요. 터미널에서 다음을 실행하세요.

```bash
npm install
npm run local
```

처음에는 몇 분 걸립니다. 그다음 OpenSlop이 브라우저에서 열리고, 이미 로그인되어 있습니다. 멈추려면 터미널에서 Ctrl+C를 누르세요. 프로젝트는 다음에도 그대로 남아 있습니다.

</td>
<td width="50%">
  <img src="../../assets/features/local-step-terminal-light.svg#gh-light-mode-only" alt="다운로드 폴더에서 ZIP을 풀고 터미널로 연 다음, npm install과 npm run local로 OpenSlop을 시작한다" width="100%">
  <img src="../../assets/features/local-step-terminal-dark.svg#gh-dark-mode-only" alt="다운로드 폴더에서 ZIP을 풀고 터미널로 연 다음, npm install과 npm run local로 OpenSlop을 시작한다" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 5. AI 키 추가

프로필 아이콘을 누르고 **Settings** > **Add providers**로 가서, 내 키로 제공자를 연결하세요. 필요한 키는 무엇을 만드느냐에 따라 다릅니다.

- **전부 쓰기**: 7가지 모두(Text, Speech, Images, Videos, Music, Sound, Captions)
- **얼굴 없는 내레이션 비디오**: Text, Speech, Images
- **시네마틱 비디오**: Text, Videos

</td>
<td width="50%">
  <img src="../../assets/features/local-step-keys-light.svg#gh-light-mode-only" alt="프로필 메뉴에서 Settings를 열고, Add providers에서 제공자를 골라 Anthropic 키를 붙여 넣고 연결한다" width="100%">
  <img src="../../assets/features/local-step-keys-dark.svg#gh-dark-mode-only" alt="프로필 메뉴에서 Settings를 열고, Add providers에서 제공자를 골라 Anthropic 키를 붙여 넣고 연결한다" width="100%">
</td>
</tr>
</table>

## 그다음부터

| 하려는 일           | 방법                                                         |
| ------------------- | ------------------------------------------------------------ |
| OpenSlop 시작       | OpenSlop 폴더에서 터미널을 열고 `npm run local` 실행         |
| OpenSlop 중지       | 그 터미널에서 <kbd>Ctrl</kbd>+<kbd>C</kbd>                   |
| 하던 작업 이어 하기 | `npm run local`을 다시 실행. 프로젝트와 키가 그대로 있습니다 |

## 로컬 모드와 온라인

|                   | 로컬 모드                               | 온라인 [app.openslop.ai](https://app.openslop.ai) |
| ----------------- | --------------------------------------- | ------------------------------------------------- |
| 쓸 수 있는 사람   | 누구나, 오늘 바로                       | 초대제, [대기자 명단에 등록](https://openslop.ai) |
| 설치              | Node.js, 일부 컴퓨터는 Docker Desktop도 | 없음                                              |
| 로그인            | 자동, 사용자 한 명                      | 내 계정                                           |
| 프로젝트와 미디어 | 내 컴퓨터                               | 클라우드                                          |
| AI 모델           | 내 키                                   | 기본 제공 모델과 내 키                            |
| 동영상 내보내기   | 내 컴퓨터에서 렌더링                    | 클라우드에서 렌더링                               |

## 문제가 생기면

| 터미널에 나온 내용                                           | 할 일                                                                              |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `OpenSlop needs Node.js 22 or newer`                         | 1단계에서 Node.js 22 이상을 설치하고, 새 터미널을 열어 `npm run local`을 다시 실행 |
| `` `npx supabase start …` failed `` (Windows 또는 Intel Mac) | Docker Desktop을 열고 엔진이 돌아갈 때까지 기다린 뒤 `npm run local`을 다시 실행   |
| 그 밖의 문제                                                 | 터미널 출력을 붙여 [Discord](https://discord.gg/zeP5482ced)에 물어보기             |

<details>
<summary>내려받는 것</summary>

- `npm install`은 앱 코드를 받습니다.
- 처음 `npm run local`을 실행하면 다음도 한 번만 내려받습니다.
  - **Supabase**: 데이터베이스와 파일 저장소입니다. `~/.supabase/cache`에 저장됩니다. Windows와 Intel Mac에서는 대신 Docker Desktop 안에 저장됩니다.
  - **Chrome Headless Shell**: 프로젝트를 비디오 파일로 만듭니다. `node_modules/.remotion`에 저장됩니다.

</details>

> OpenSlop 코드를 작성하나요? 호스팅 서비스로 개발하려면 [Supabase 프로젝트로 개발하기](../../CONTRIBUTING.md#develop-against-a-supabase-project)를 보세요.
