# Agents

<p align="center">
  <img src="../assets/features/agents-mcp-light.svg#gh-light-mode-only" alt="OpenSlop is added to Claude Code as an MCP server and allowed in the browser. A prompt's tool calls travel over MCP into the open project: a title, then a script of speech, image and video, which Generate renders" width="100%">
  <img src="../assets/features/agents-mcp-dark.svg#gh-dark-mode-only" alt="OpenSlop is added to Claude Code as an MCP server and allowed in the browser. A prompt's tool calls travel over MCP into the open project: a title, then a script of speech, image and video, which Generate renders" width="100%">
</p>

Your own coding agent can work in OpenSlop: Claude Code, Codex, Cursor or any other app that speaks MCP. It edits the project you have open with Sloppy's tools, on its own sign-in, and you watch the changes land.

## Connect

Add OpenSlop as an MCP server in your agent, for example:

```bash
claude mcp add --transport http openslop https://app.openslop.ai/api/mcp
```

In [local mode](local-mode.md), use `http://localhost:3000/api/mcp` instead. The first time, your agent opens a browser to sign in to OpenSlop and asks you to allow it. **Settings > MCP** has the URL to copy, and lists the agents you've allowed so you can disconnect them.

Then open a project in OpenSlop. The agent works on the project you opened last, and its edits show up as it makes them. OpenSlop's working rules and skills come with the server, so the agent writes scripts the way Sloppy does.

## How it works

The MCP endpoint lists Sloppy's tools. Your agent signs in through Supabase Auth's OAuth server and calls them as you. Each call goes over a private Supabase Realtime channel to your newest open project tab, which runs it the way Sloppy would and sends back the result.
