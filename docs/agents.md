# Drive OpenSlop from your own agent

OpenSlop exposes a streamable HTTP MCP endpoint, so a coding agent can sign in and read and write the open project live. This is separate from the API-key providers listed in the README: here your own agent is the client.

## Endpoint

- Hosted app: `https://app.openslop.ai/api/mcp`
- Local mode: `http://localhost:3000/api/mcp`

The endpoint uses OAuth for sign-in. Any MCP client that supports remote HTTP servers with OAuth should work the same way.

## Verified agents

Verified end to end over MCP (sign in, read and write the open project live):

| Agent | Connect |
| --- | --- |
| [Claude Code](https://claude.com/product/claude-code) | `claude mcp add --transport http openslop https://app.openslop.ai/api/mcp` |
| [Codex](https://openai.com/codex) | add `https://app.openslop.ai/api/mcp` as a streamable HTTP MCP server |
| [Cursor](https://cursor.com/cli) | add `https://app.openslop.ai/api/mcp` to `mcp.json` |

Any other MCP client that supports remote HTTP servers with OAuth should work the same way. In local mode use `http://localhost:3000/api/mcp` instead of the hosted URL.

## How it works

The MCP server is the same project surface the web app uses: once the agent is signed in, it can read the open project and write to it, so changes made from the agent show up in the app. See [local mode](local-mode.md) for running the app yourself.
