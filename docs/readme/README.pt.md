<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/openslop-lockup-animated-dark.svg">
    <img src="../../assets/openslop-lockup-animated-light.svg" alt="OpenSlop" width="560">
  </picture>
</p>

<p align="center"><b>Criador de vídeo com IA, gratuito e de código aberto.</b></p>

<p align="center">
  <a href="https://openslop.ai"><img src="https://img.shields.io/badge/status-private%20beta-6b6bcf?style=flat" alt="Status: beta privado"></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue?style=flat" alt="Licença: Apache-2.0"></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js" alt="Next.js 16"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white" alt="React 19"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript 5"></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4"></a>
  <a href="https://discord.gg/zeP5482ced"><img src="https://img.shields.io/badge/Discord-Join-5865F2?style=flat&logo=discord&logoColor=white" alt="Discord"></a>
</p>

<p align="center">
  <sub><a href="../../README.md">English</a> · <a href="README.zh-CN.md">中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <a href="README.es.md">Español</a> · <a href="README.fr.md">Français</a> · Português</sub>
</p>

<p align="center">
  <a href="https://openslop.ai"><b>openslop.ai</b></a>
  &nbsp;·&nbsp;
  <a href="https://app.openslop.ai">app.openslop.ai</a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/openslop-demo-dark.svg">
    <img src="../../assets/openslop-demo-light.svg" alt="OpenSlop - seu criador de vídeo com IA gratuito" width="100%">
  </picture>
</p>

---

> **Beta privado.** Só por convite, por enquanto.
> [Entre na lista de espera em openslop.ai](https://openslop.ai) para participar.

## Visão geral

O OpenSlop conecta todas as suas ferramentas de IA favoritas em um só fluxo de trabalho, para você fazer vídeos bonitos em minutos, sem pular entre dez abas. Você traz suas contas de IA, o OpenSlop traz o fluxo de trabalho. Só isso.

Roda no seu navegador, sem nada para instalar. Código aberto, gratuito para sempre. Feito por engenheiros da Meta, Google, Stripe e Dropbox.

## Recursos

<table>
<tr>
<td width="50%" valign="middle">

### Descreva seu vídeo

Digite uma linha. Escolha 16:9 ou 9:16, um idioma, um modelo e uma duração, ou cole um roteiro que você já tem. Sete templates estão lá se você precisar de um empurrão.

[O composer →](../../app/components/copilot/ComposerCopilot.tsx)

</td>
<td width="50%">
  <a href="../../app/components/copilot/ComposerCopilot.tsx"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/describe-dark.svg">
    <img src="../../assets/features/describe-light.svg" alt="A caixa de prompt passa por ideias de exemplo, depois uma linha é digitada e enviada" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Sloppy escreve com você

O copiloto mora no painel da esquerda. Ele lê o roteiro, esboça a história, escreve as cenas e encaixa os cartões de vídeo no diálogo. Tudo o que ele faz aparece no canvas enquanto você assiste.

[Como funciona um turno →](../../ARCHITECTURE.md#sloppy)

</td>
<td width="50%">
  <a href="../../ARCHITECTURE.md#sloppy"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/sloppy-dark.svg">
    <img src="../../assets/features/sloppy-light.svg" alt="Sloppy pensa, lê, esboça, escreve um roteiro e as cenas aparecem no canvas" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Um storyboard, não uma caixa de prompt

Cada cena é uma pilha de cartões: narração, personagem, imagem, vídeo, som, música. Edite qualquer prompt, escolha um modelo por cartão, arraste para reordenar e insira onde você passar o mouse.

[O modelo de documento →](../../lib/canvas)

</td>
<td width="50%">
  <a href="../../lib/canvas"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/canvas-dark.svg">
    <img src="../../assets/features/canvas-light.svg" alt="Passar o mouse sobre uma linha abre o menu de inserção com os sete tipos de elemento e um novo cartão Sound aparece" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Um clique gera tudo

**Generate all** (gerar tudo) coloca cada elemento na fila e roda as dependências primeiro: o cartão de vídeo do qual uma cena continua antes da própria cena, um avatar antes da imagem em que ele aparece. Mude um prompt depois e o cartão diz **Stale** (desatualizado) e o motivo.

[O grafo de geração →](../../ARCHITECTURE.md#generation-graph)

</td>
<td width="50%">
  <a href="../../ARCHITECTURE.md#generation-graph"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/generate-dark.svg">
    <img src="../../assets/features/generate-light.svg" alt="Generate all roda a fila, as prévias vão aparecendo e um prompt editado é marcado como Stale com um motivo" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Player e linha do tempo

Assista ao corte enquanto ele vai sendo preenchido, com legendas palavra por palavra. Quatro faixas embaixo: visuais, voz, efeitos, música. Arraste pela régua, pule por cena ou troque para a tira do storyboard.

[O player →](../../app/components/player)

</td>
<td width="50%">
  <a href="../../app/components/player"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/timeline-dark.svg">
    <img src="../../assets/features/timeline-light.svg" alt="O player toca com legendas palavra por palavra enquanto o cursor de reprodução percorre uma linha do tempo de quatro faixas" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Traga suas próprias chaves

Os modelos hospedados vêm com sua conta. Cole uma chave da Anthropic, Runware, Cartesia ou ElevenLabs e os modelos deles aparecem em todos os seletores. As chaves ficam no Supabase Vault e nunca chegam ao navegador.

[Modelos e chaves de provedores →](../../ARCHITECTURE.md#models-and-provider-keys)

</td>
<td width="50%">
  <a href="../../ARCHITECTURE.md#models-and-provider-keys"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../assets/features/providers-dark.svg">
    <img src="../../assets/features/providers-light.svg" alt="Uma chave da Cartesia é colada e validada, passando de Unverified para Connected" width="100%">
  </picture></a>
</td>
</tr>
</table>

**Também vem na caixa:**

- **[Legendas](../../app/components/canvas/panel/CaptionsPanel.tsx)** — Seis predefinições, doze fontes, revelação palavra por palavra ou linha por linha, e cada cor, borda e posição é sua para mudar.
- **[Exportação em até 4K](../../app/components/player/ExportButton.tsx)** — Renderiza no Remotion Lambda em blocos paralelos e entrega um MP4.
- **[Histórico de versões](../../app/components/canvas/panel/CanvasHistoryPanel.tsx)** — Salva automaticamente enquanto você trabalha, agrupado em checkpoints. Veja qualquer versão e restaure.
- **[Personagens e estilo de arte](../../app/components/canvas/elements/AssetsSection.tsx)** — Dê nome a um personagem uma vez e cada imagem, fala e avatar fica consistente.
- **[Templates](../../lib/templates/templates.ts)** — POV Life, Sleep Story, True Crime e mais. Cada um define um estilo, um narrador e uma duração.
- **[Mocks para desenvolvimento](../../.env.example)** — Deixe a chave de um provedor sem definir e as chamadas dele caem em resultados prontos, para você construir sem pagar.

## Primeiros passos

### Pré-requisitos

- [Node.js](https://nodejs.org) 20.9+ (o mínimo do Next.js 16; a CI roda 22)
- Um projeto no [Supabase](https://supabase.com) (para autenticação e banco de dados)

### Configuração

1. Clone o repositório:

```bash
git clone https://github.com/openslop/openslop.git
cd openslop
```

2. Instale as dependências:

```bash
npm install
```

3. Copie o modelo de env comentado e preencha:

```bash
cp .env.example .env.local
```

As variáveis do Supabase são obrigatórias. Todo o resto é opcional: um provedor sem chave definida cai em um mock.

4. Rode as migrações do banco de dados:

```bash
npm run db:push
```

5. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) e você deve ver o app.

## Stack

| Camada        | Tecnologia                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| Framework     | [Next.js 16](https://nextjs.org) (App Router)                                                                |
| Linguagem     | [TypeScript 5](https://www.typescriptlang.org)                                                               |
| UI            | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) |
| Auth + BD     | [Supabase](https://supabase.com) (Auth, Postgres, RLS)                                                       |
| Vídeo         | [Remotion 4](https://remotion.dev) (composição, renderização, player)                                        |
| Armazenamento | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (armazenamento dos assets gerados)                |
| Ícones        | Conjunto próprio de SVGs com máscara (`components/ui/icon.tsx` + `icons/`), sem dependência de ícones        |

## Estrutura do projeto

```
app/             Rotas do Next.js, endpoints da API e componentes do editor
  api/v1/        API REST por tipo de asset (image, video, music, sfx, tts, llm)
  components/    UI do editor (canvas, prévia de vídeo etc.)
lib/
  agent/         Sloppy: definições de ferramentas, registro, prompt e contexto do turno
  connectors/    API cliente voltada ao editor por tipo de asset
  gateway/       Clientes HTTP para /api/v1/*
  providers/     Adaptadores de fornecedores no servidor (Runware, ElevenLabs, …)
  generation/    Fila de geração e orquestração de jobs
  canvas/        Modelo de documento Slate: tipos de elemento, guards, parse/serialização OSML
  script/        Contexto e refinamento do roteiro
  project/       Store Zustand por projeto, salvamento automático, persistência
  video/         Layout de cenas e cliente de renderização
  templates/     Templates de prompt oferecidos no composer
  upload/        Upload de imagens no cliente
  supabase/      Clientes Supabase para navegador/servidor
remotion/        Ponto de entrada e composições do Remotion
supabase/        Migrações do banco de dados
```

Veja [`ARCHITECTURE.md`](../../ARCHITECTURE.md) para saber como essas camadas interagem.

## Scripts

| Comando                   | O que faz                            |
| ------------------------- | ------------------------------------ |
| `npm run dev`             | Inicia o servidor de desenvolvimento |
| `npm run build`           | Build de produção                    |
| `npm run lint`            | ESLint                               |
| `npm run format:check`    | Verificação do Prettier              |
| `npm run typecheck`       | Verificação do TypeScript            |
| `npm run knip`            | Verificação de código morto          |
| `npm run test:run`        | Roda os testes uma vez (Vitest)      |
| `npm run test:e2e`        | Testes de fumaça (Playwright)        |
| `npm run db:push`         | Envia as migrações para o Supabase   |
| `npm run remotion:studio` | Abre o Remotion Studio               |

## Contribuindo

Contribuições são bem-vindas. Veja [`CONTRIBUTING.md`](../../CONTRIBUTING.md) para a configuração, a sequência de verificações e o que procuramos em um PR.

## Comunidade

<p align="center">
  <a href="https://discord.gg/zeP5482ced"><img src="https://img.shields.io/badge/Discord-Join%20the%20community-5865F2?style=flat&logo=discord&logoColor=white" alt="Entre na nossa comunidade no Discord"></a>
</p>

Dúvidas, ideias ou só quer bater papo? [Entre no nosso Discord](https://discord.gg/zeP5482ced) ou [mande um e-mail](mailto:hi@openslop.ai).

Todo mundo na comunidade deve seguir nosso [Código de Conduta](../../CODE_OF_CONDUCT.md). Para relatar um problema, escreva para [hi@openslop.ai](mailto:hi@openslop.ai).

<a href="https://github.com/openslop/openslop/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=openslop/openslop" alt="Contribuidores do OpenSlop">
</a>

## Histórico de estrelas

<p align="center">
  <a href="https://star-history.com/#openslop/openslop&Date">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=openslop/openslop&type=Date&theme=dark">
      <img src="https://api.star-history.com/svg?repos=openslop/openslop&type=Date" alt="Gráfico do histórico de estrelas do GitHub para openslop/openslop" width="880">
    </picture>
  </a>
</p>

## Licença

Licenciado sob a [Licença Apache 2.0](../../LICENSE).
