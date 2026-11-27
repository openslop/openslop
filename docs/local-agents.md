# Local agents

<p align="center">
  <img src="../assets/features/local-step-agent-light.svg#gh-light-mode-only" alt="In the composer, the model picker lists the local agents, Claude Code is picked, and Sloppy starts on it" width="100%">
  <img src="../assets/features/local-step-agent-dark.svg#gh-dark-mode-only" alt="In the composer, the model picker lists the local agents, Claude Code is picked, and Sloppy starts on it" width="100%">
</p>

To set one up, see [Use your coding agent instead](local-mode.md#use-your-coding-agent-instead). The agent's own limits apply, and OpenSlop records no spend for these calls.

## How it works

OpenSlop starts the agent as an [Agent Client Protocol](https://agentclientprotocol.com) server and keeps it running. Each step of a Sloppy turn opens a new session in an empty folder, writes the conversation out as the prompt, and offers Sloppy's tools over MCP on loopback. When the agent calls one, the step ends and the editor runs it, as with any other model.

The agent asks before it edits, deletes, moves or runs anything on your computer, or fetches from the web, and OpenSlop always says no. It runs with your PATH, home folder, locale and proxy settings, but none of OpenSlop's own keys.

These routes answer only in development, and only to a page served from this computer.

## Not supported yet

This runs one way: OpenSlop drives the agent. The other way, where you work in your own agent (Claude Code, Codex, Cursor, Claude Desktop) and it controls OpenSlop over MCP, isn't supported yet. It's on the list as [#1468](https://github.com/openslop/openslop/issues/1468).

## Adding an agent

Any ACP agent works. Add a line to `lib/connectors/llm/local/models.ts` with the command that starts it on stdio. The agent needs HTTP MCP support to take Sloppy's tools.
