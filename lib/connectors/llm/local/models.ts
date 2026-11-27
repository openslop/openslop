/** Each id is the command that starts the agent as an ACP server on stdio. */
export const LOCAL_LLM_MODELS = {
	"Claude Code": {
		id: "npx -y @agentclientprotocol/claude-agent-acp@0.113.0",
		cost: "low",
		speed: "medium",
		description: "Runs on your Claude sign-in. Run `claude` once to sign in.",
	},
	Codex: {
		id: "npx -y @agentclientprotocol/codex-acp@2.12.1",
		cost: "low",
		speed: "medium",
		description:
			"Runs on your ChatGPT sign-in. Run `codex login` once to sign in.",
	},
	Cursor: {
		id: "agent acp",
		cost: "low",
		speed: "medium",
		description:
			"Runs on your Cursor sign-in. Run `agent login` once to sign in.",
	},
} as const;
