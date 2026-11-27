/** Each id is the command that starts the agent as an ACP server on stdio. */
export const LOCAL_LLM_MODELS = {
	"Claude Code": {
		id: "npx -y @agentclientprotocol/claude-agent-acp@0.113.0",
		cost: "low",
		speed: "medium",
		description: "Runs on your Claude sign-in. Run `claude` once to sign in.",
	},
	Codex: {
		id: "npx -y @zed-industries/codex-acp@0.16.0",
		cost: "low",
		speed: "medium",
		description: "Runs on your ChatGPT sign-in. Run `codex` once to sign in.",
	},
	"Gemini CLI": {
		id: "gemini --acp",
		cost: "low",
		speed: "medium",
		description: "Needs Gemini CLI installed and signed in.",
	},
	Cursor: {
		id: "agent acp",
		cost: "low",
		speed: "medium",
		description: "Needs the Cursor CLI installed and signed in.",
	},
} as const;
