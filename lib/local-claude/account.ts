import { z } from "zod";
import { pendingClaudeLogin } from "./login";
import { ClaudeExitError, ClaudeNotInstalledError, runClaude } from "./process";

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
		if (error instanceof ClaudeNotInstalledError)
			return { installed: false, connected: false };
		// `claude auth status` exits 1 when signed out, still printing its JSON.
		if (!(error instanceof ClaudeExitError && error.code === 1)) throw error;
		output = error.stdout;
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
