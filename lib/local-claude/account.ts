import { z } from "zod";
import { pendingClaudeLogin } from "./login";
import { runClaude } from "./process";

const AuthStatus = z.object({
	loggedIn: z.boolean(),
	authMethod: z.string().optional(),
	email: z.string().optional(),
	subscriptionType: z.string().nullable().optional(),
});

export async function claudeAccount(userId: string) {
	let output: string;
	try {
		output = await runClaude(userId, ["auth", "status"]);
	} catch (error) {
		if (
			error instanceof Error &&
			error.message.startsWith("Install Claude Code")
		)
			return { installed: false, connected: false };
		throw error;
	}
	const status = AuthStatus.parse(JSON.parse(output));
	return {
		...pendingClaudeLogin(userId),
		installed: true,
		connected: status.loggedIn && status.authMethod === "claude.ai",
		email: status.email,
		subscription: status.subscriptionType ?? undefined,
	};
}
