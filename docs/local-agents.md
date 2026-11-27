# Local agents

When OpenSlop runs on your own computer (`npm run local` or `npm run dev`), Sloppy and text generation can run on a coding agent you already use, on that agent's own sign-in. No API key is needed.

Pick one under **Local agent** in any text model picker:

| Agent       | Before you pick it                                      |
| ----------- | ------------------------------------------------------- |
| Claude Code | Install Claude Code and run `claude` once to sign in.   |
| Codex       | Install Codex and run `codex` once to sign in.          |
| Gemini CLI  | Install Gemini CLI and run `gemini` once to sign in.    |
| Cursor      | Install the Cursor CLI and run `agent` once to sign in. |

The agent's own limits apply, and OpenSlop records no spend for these calls. Images, voice, music and video still use their usual providers.

## How it works

OpenSlop starts the agent as an [Agent Client Protocol](https://agentclientprotocol.com) server and keeps it running. Each step of a Sloppy turn opens a new session in an empty folder, writes the conversation out as the prompt, and offers Sloppy's tools over MCP on loopback. When the agent calls one, the step ends and the editor runs it, as with any other model.

The agent asks before it edits, deletes, moves or runs anything on your computer, or fetches from the web, and OpenSlop always says no. It runs with your PATH, home folder, locale and proxy settings, but none of OpenSlop's own keys.

These routes answer only in development, and only to a page served from this computer.

## Adding an agent

Any ACP agent works. Add a line to `lib/connectors/llm/local/models.ts` with the command that starts it on stdio. The agent needs HTTP MCP support to take Sloppy's tools.
