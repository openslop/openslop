# Local agents

<p align="center">
  <img src="../assets/features/local-step-agent-light.svg#gh-light-mode-only" alt="In the composer, the model picker lists the local agents, Claude Code is picked, and Sloppy starts on it" width="100%">
  <img src="../assets/features/local-step-agent-dark.svg#gh-dark-mode-only" alt="In the composer, the model picker lists the local agents, Claude Code is picked, and Sloppy starts on it" width="100%">
</p>

When OpenSlop runs on your own computer, with [`npm run local`](local-mode.md) or `npm run dev`, Sloppy and text generation can run on a coding agent you already use, on that agent's own sign-in. No API key is needed for text.

## Set up

1. Install the agent and sign in to it once in a terminal:

   | Agent       | Sign in with |
   | ----------- | ------------ |
   | Claude Code | `claude`     |
   | Codex       | `codex`      |
   | Gemini CLI  | `gemini`     |
   | Cursor      | `agent`      |

2. Open OpenSlop on this computer at `localhost`, and pick the agent under **Local agent** in any text model picker, such as the one in the composer or under Settings > Models.

The agent's own limits apply, and OpenSlop records no spend for these calls. Speech, images, music and video still need their own keys.

## How it works

OpenSlop starts the agent as an [Agent Client Protocol](https://agentclientprotocol.com) server and keeps it running. Each step of a Sloppy turn opens a new session in an empty folder, writes the conversation out as the prompt, and offers Sloppy's tools over MCP on loopback. When the agent calls one, the step ends and the editor runs it, as with any other model.

The agent asks before it edits, deletes, moves or runs anything on your computer, or fetches from the web, and OpenSlop always says no. It runs with your PATH, home folder, locale and proxy settings, but none of OpenSlop's own keys.

These routes answer only in development, and only to a page served from this computer.

## Not supported yet

This runs one way: OpenSlop drives the agent. The other way, where you work in your own agent (Claude Code, Codex, Cursor, Claude Desktop) and it controls OpenSlop over MCP, isn't supported yet. It's on the list as [#1468](https://github.com/openslop/openslop/issues/1468).

## Adding an agent

Any ACP agent works. Add a line to `lib/connectors/llm/local/models.ts` with the command that starts it on stdio. The agent needs HTTP MCP support to take Sloppy's tools.
