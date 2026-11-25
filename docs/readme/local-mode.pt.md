<p align="center">
  <sub><a href="../local-mode.md">English</a> · <a href="local-mode.zh-CN.md">中文</a> · <a href="local-mode.ja.md">日本語</a> · <a href="local-mode.ko.md">한국어</a> · <a href="local-mode.es.md">Español</a> · <a href="local-mode.fr.md">Français</a> · Português</sub>
</p>

# Modo local

<p>
  <img src="https://img.shields.io/badge/macOS-Apple%20silicon%20%7C%20Intel-000000?style=for-the-badge&logo=apple&logoColor=white" alt="macOS: Apple silicon, Intel">
  <img src="https://img.shields.io/badge/Windows-10%20%7C%2011-0078D4?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMy40IDkuOCAydjkuNkgwek0xMSAxLjkgMjQgMHYxMS42SDExek0wIDEyLjRoOS44VjIyTDAgMjAuNnpNMTEgMTIuNGgxM1YyNGwtMTMtMS45eiIvPjwvc3ZnPg==" alt="Windows 10, 11">
  <img src="https://img.shields.io/badge/Linux-x64%20%7C%20arm64-FCC624?style=for-the-badge&logo=linux&logoColor=black" alt="Linux: x64, arm64">
</p>

Seus projetos e vídeos ficam no seu computador. Só os seus pedidos aos serviços de IA vão para a internet.

<p align="center">
  <img src="../../assets/features/local-light.svg#gh-light-mode-only" alt="Um terminal roda npm run local e o OpenSlop abre em localhost:3000 com projetos salvos neste computador" width="100%">
  <img src="../../assets/features/local-dark.svg#gh-dark-mode-only" alt="Um terminal roda npm run local e o OpenSlop abre em localhost:3000 com projetos salvos neste computador" width="100%">
</p>

## O que você precisa

| Seu computador          | Node.js 22+ | Docker Desktop         |
| ----------------------- | ----------- | ---------------------- |
| Mac com M1 ou mais novo | ✅          | —                      |
| Mac com Intel           | ✅          | ✅ aberto enquanto usa |
| Windows 10 ou 11        | ✅          | ✅ aberto enquanto usa |
| Linux (x64 ou arm64)    | ✅          | —                      |

Você também precisa da chave de pelo menos um provedor de IA. O passo 5 mostra quais.

## Instalação

<table>
<tr>
<td width="50%" valign="middle">

#### 1. Instale o Node.js

Acesse a [página de download do Node.js](https://nodejs.org/en/download). Clique no botão verde do instalador (**Windows Installer** ou **macOS Installer**), abra o arquivo e siga os passos. Qualquer versão a partir da 22 serve.

</td>
<td width="50%">
  <img src="../../assets/features/local-step-node-light.svg#gh-light-mode-only" alt="No nodejs.org, o botão Windows Installer é clicado, o instalador roda e o Node.js fica instalado" width="100%">
  <img src="../../assets/features/local-step-node-dark.svg#gh-dark-mode-only" alt="No nodejs.org, o botão Windows Installer é clicado, o instalador roda e o Node.js fica instalado" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 2. Instale o Docker Desktop (só Windows e Mac com Intel)

_Pule este passo no Linux ou num Mac com chip M1 ou mais novo (M2, M3 etc.). Para conferir o seu Mac, abra o menu Apple > **Sobre Este Mac** e veja **Chip**._

No [docker.com](https://www.docker.com/products/docker-desktop/), clique em **Download Docker Desktop**, escolha o seu computador e instale. Abra o Docker Desktop e deixe-o aberto enquanto usa o OpenSlop.

</td>
<td width="50%">
  <img src="../../assets/features/local-step-docker-light.svg#gh-light-mode-only" alt="No docker.com, o download para Windows é escolhido e o Docker Desktop abre com o motor rodando" width="100%">
  <img src="../../assets/features/local-step-docker-dark.svg#gh-dark-mode-only" alt="No docker.com, o download para Windows é escolhido e o Docker Desktop abre com o motor rodando" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 3. Baixe o OpenSlop

Na [página do OpenSlop no GitHub](https://github.com/openslop/openslop), clique no botão verde **Code** e depois em **Download ZIP**. Você também pode [baixar o ZIP direto](https://github.com/openslop/openslop/archive/refs/heads/master.zip).

</td>
<td width="50%">
  <img src="../../assets/features/local-step-download-light.svg#gh-light-mode-only" alt="No GitHub, o botão verde Code abre um menu e Download ZIP é clicado" width="100%">
  <img src="../../assets/features/local-step-download-dark.svg#gh-dark-mode-only" alt="No GitHub, o botão verde Code abre um menu e Download ZIP é clicado" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 4. Descompacte e inicie o OpenSlop

No Windows, clique com o botão direito no ZIP > **Extract All** e depois com o botão direito na pasta nova > **Open in Terminal**. No Mac, clique duas vezes no ZIP e depois com o botão direito na pasta nova > **New Terminal at Folder**. No terminal, rode:

```bash
npm install
npm run local
```

Na primeira vez leva alguns minutos. Depois o OpenSlop abre no seu navegador, já com login feito. Para parar, aperte Ctrl+C no terminal. Seus projetos ficam salvos para a próxima vez.

</td>
<td width="50%">
  <img src="../../assets/features/local-step-terminal-light.svg#gh-light-mode-only" alt="Na pasta Downloads, o ZIP é extraído e aberto no terminal, e npm install e npm run local iniciam o OpenSlop" width="100%">
  <img src="../../assets/features/local-step-terminal-dark.svg#gh-dark-mode-only" alt="Na pasta Downloads, o ZIP é extraído e aberto no terminal, e npm install e npm run local iniciam o OpenSlop" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 5. Adicione suas chaves de IA

Clique no ícone do seu perfil, depois em **Settings** > **Add providers**, e conecte um provedor com a sua chave. As chaves de que você precisa dependem do que você faz:

- **Tudo:** os 7 tipos: Text, Speech, Images, Videos, Music, Sound e Captions.
- **Vídeos com narração sem rosto:** Text, Speech e Images.
- **Vídeos cinematográficos:** Text e Videos.

</td>
<td width="50%">
  <img src="../../assets/features/local-step-keys-light.svg#gh-light-mode-only" alt="O menu do perfil abre Settings, Add providers lista os provedores e uma chave da Anthropic é colada e conectada" width="100%">
  <img src="../../assets/features/local-step-keys-dark.svg#gh-dark-mode-only" alt="O menu do perfil abre Settings, Add providers lista os provedores e uma chave da Anthropic é colada e conectada" width="100%">
</td>
</tr>
</table>

## No dia a dia

| Para                    | Faça isto                                                         |
| ----------------------- | ----------------------------------------------------------------- |
| Iniciar o OpenSlop      | Abra um terminal na pasta do OpenSlop e rode `npm run local`      |
| Parar o OpenSlop        | Aperte <kbd>Ctrl</kbd>+<kbd>C</kbd> nesse terminal                |
| Continuar de onde parou | Rode `npm run local` de novo. Seus projetos e chaves continuam lá |

## Modo local ou online

|                  | Modo local                                       | Online em [app.openslop.ai](https://app.openslop.ai)            |
| ---------------- | ------------------------------------------------ | --------------------------------------------------------------- |
| Quem pode usar   | Qualquer pessoa, hoje                            | Só com convite, [entre na lista de espera](https://openslop.ai) |
| Instalação       | Node.js, e Docker Desktop em alguns computadores | Nada                                                            |
| Login            | Automático, um usuário                           | Sua conta                                                       |
| Projetos e mídia | No seu computador                                | Na nuvem                                                        |
| Modelos de IA    | Suas próprias chaves                             | Modelos hospedados, mais suas próprias chaves                   |
| Exportar vídeo   | Renderizado no seu computador                    | Renderizado na nuvem                                            |

## Se algo der errado

| O terminal mostra                                              | Faça isto                                                                                            |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `OpenSlop needs Node.js 22 or newer`                           | Instale o Node.js 22 ou mais novo pelo passo 1, abra um terminal novo e rode `npm run local` de novo |
| `` `npx supabase start …` failed `` (Windows ou Mac com Intel) | Abra o Docker Desktop, espere o motor rodar e rode `npm run local` de novo                           |
| Qualquer outra coisa                                           | Pergunte no [Discord](https://discord.gg/zeP5482ced) com o que o terminal mostrou                    |

<details>
<summary>O que é baixado</summary>

- `npm install` baixa o código do app.
- O primeiro `npm run local` também baixa, uma única vez:
  - **Supabase**: o banco de dados e o armazenamento de arquivos, em `~/.supabase/cache`. No Windows e em Mac com Intel, fica guardado dentro do Docker Desktop.
  - **Chrome Headless Shell**: transforma seu projeto em um arquivo de vídeo. Fica em `node_modules/.remotion`.

</details>

> Vai programar no OpenSlop? Para desenvolver com serviços hospedados, veja [Desenvolver com um projeto Supabase](../../CONTRIBUTING.md#develop-against-a-supabase-project).
