# Local agents

<p align="center">
  <img src="../assets/features/local-step-agent-light.svg#gh-light-mode-only" alt="In the composer, the model picker lists the local agents, Claude Code is picked, and Sloppy starts on it" width="100%">
  <img src="../assets/features/local-step-agent-dark.svg#gh-dark-mode-only" alt="In the composer, the model picker lists the local agents, Claude Code is picked, and Sloppy starts on it" width="100%">
</p>

When OpenSlop runs on your own computer, with [`npm run local`](local-mode.md) or `npm run dev`, Sloppy and text generation can run on a coding agent you already use, on that agent's own sign-in. No API key is needed for text.

## Supported agents

<p>
  <a href="https://claude.com/product/claude-code"><kbd><img src="https://www.google.com/s2/favicons?domain=claude.com&amp;sz=64" alt="Claude Code logo" width="16" valign="middle"> Claude Code</kbd></a> &nbsp;
  <a href="https://openai.com/codex"><kbd><img src="https://www.google.com/s2/favicons?domain=openai.com&amp;sz=64" alt="Codex logo" width="16" valign="middle"> Codex</kbd></a> &nbsp;
  <a href="https://cursor.com/cli"><kbd><img src="https://www.google.com/s2/favicons?domain=cursor.com&amp;sz=64" alt="Cursor logo" width="16" valign="middle"> Cursor</kbd></a>
</p>

## Set up

1. Install the agent and sign in to it once in a terminal:

   | Agent       | Sign in with  |
   | ----------- | ------------- |
   | Claude Code | `claude`      |
   | Codex       | `codex login` |
   | Cursor      | `agent login` |

2. Open OpenSlop on this computer at `localhost`, and pick the agent under **Local agent** in any text model picker, such as the one in the composer or under Settings > Models.

The agent's own limits apply, and OpenSlop records no spend for these calls. Speech, images, music and video still need their own keys.

## How it works

OpenSlop starts the agent as an [Agent Client Protocol](https://agentclientprotocol.com) server and keeps it running. Each step of a Sloppy turn opens a new session in an empty folder, writes the conversation out as the prompt, and offers Sloppy's tools over MCP on loopback. When the agent calls one, the step ends and the editor runs it, as with any other model.

The agent asks before it edits, deletes, moves or runs anything on your computer, or fetches from the web, and OpenSlop always says no. It runs with your PATH, home folder, locale and proxy settings, but none of OpenSlop's own keys.

These routes answer only in development, and only to a page served from this computer.

## Drive OpenSlop from your agent

You can also go the other way: work in your own agent and let it edit a project with Sloppy's tools, over MCP. Any agent that takes an HTTP MCP server works. Add OpenSlop as one, for example:

```bash
claude mcp add --transport http openslop http://localhost:3000/api/local/mcp
```

Then open the project in OpenSlop on this computer. The agent works on the project you opened last, and its edits show up as it makes them. Sloppy's instructions come with the server, so the agent writes scripts the way Sloppy does.

## Adding an agent

Any ACP agent works. Add a line to `lib/connectors/llm/local/models.ts` with the command that starts it on stdio. The agent needs HTTP MCP support to take Sloppy's tools.
