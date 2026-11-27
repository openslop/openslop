# Local agents

To set one up, see [Use your coding agent instead](local-mode.md#use-your-coding-agent-instead). The agent's own limits apply, and OpenSlop records no spend for these calls.

## How it works

OpenSlop starts the agent as an [Agent Client Protocol](https://agentclientprotocol.com) server and keeps it running. Each step of a Sloppy turn opens a new session in an empty folder, writes the conversation out as the prompt, and offers Sloppy's tools over MCP on loopback. When the agent calls one, the step ends and the editor runs it, as with any other model.

The agent asks before it edits, deletes, moves or runs anything on your computer, or fetches from the web, and OpenSlop always says no. It runs with your PATH, home folder, locale and proxy settings, but none of OpenSlop's own keys.

These routes answer only in development, and only to a page served from this computer.

## Adding an agent

Any ACP agent works. Add a line to `lib/connectors/llm/local/models.ts` with the command that starts it on stdio. The agent needs HTTP MCP support to take Sloppy's tools.
