# Local Claude subscription

Run `npm run dev -- --hostname 127.0.0.1` and open the app on localhost. Install
[Claude Code](https://code.claude.com/docs/en/setup) on the same computer first.
In the account menu, open **Settings → Models → Claude subscription · Local only**.
Click **Sign in with Claude**, then **Continue to Claude**. Finish the browser sign-in with your personal Claude
account, then select **Claude subscription** in a text model picker. The account
Text default also applies to Sloppy. Disconnect removes only this OpenSlop login.

This uses the official `claude -p` interface, which currently draws from your
subscription limits when signed in with a Claude plan ([Anthropic guidance](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan)).
No API key is needed. Subscription limits still apply; OpenSlop does not record
these calls as hosted API spend. Responses arrive when the CLI finishes, rather
than token by token. Image, voice, music, and video generation still require their
usual providers. The local model currently uses Claude Code's `sonnet` alias.

This is for personal local development. Routes return 404 outside development and
reject remote hostnames and cross-origin mutations. Keep the development server
bound to loopback. A signed-in OpenSlop session is required; Sloppy also checks
project ownership. This is not a subscription proxy for a deployed multiuser app.

Credentials are managed by Claude Code in a separate directory under
`~/.openslop/claude/<Supabase-project-hash>/<OpenSlop-user-id>`. They are never sent
to Supabase or returned to the browser. Existing `~/.claude` logins are not reused.
The child process receives only basic OS variables and its dedicated config path:
inherited API keys, cloud credentials, and Claude authentication overrides are
excluded. Safe mode, an empty tool list, an empty MCP configuration, a separate
working directory, and disabled session persistence keep local project files and
customizations out of generation. Requests have a three-minute timeout and an
output-size limit; cancellation terminates the subprocess.

Sloppy's existing client tools still operate on the current project. The local
adapter asks Claude for structured tool requests, validates tool names, then
hands them back to the existing application tool execution loop. Claude Code
itself cannot run shell commands or read files through this integration.
