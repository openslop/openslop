import { runClaude } from "./process";
import { errorMessage } from "@/lib/errors";

type Login = { controller: AbortController; url?: string; error?: string };
const logins = new Map<string, Login>();

export function claudeLoginUrl(output: string): string | undefined {
	for (const candidate of output.match(/https:\/\/[^\s\x1b]+(?=[\s\x1b])/g) ??
		[]) {
		if (!URL.canParse(candidate)) continue;
		const url = new URL(candidate);
		if (
			(url.hostname === "claude.com" &&
				url.pathname === "/cai/oauth/authorize") ||
			(url.hostname === "claude.ai" && url.pathname === "/oauth/authorize")
		)
			return url.href;
	}
}

export function pendingClaudeLogin(userId: string) {
	const login = logins.get(userId);
	return { loginUrl: login?.url, loginError: login?.error };
}

export function cancelClaudeLogin(userId: string) {
	logins.get(userId)?.controller.abort();
	logins.delete(userId);
}

export async function startClaudeLogin(userId: string) {
	cancelClaudeLogin(userId);
	const login: Login = { controller: new AbortController() };
	logins.set(userId, login);
	let output = "";
	return new Promise<string>((resolve, reject) => {
		const timer = setTimeout(() => {
			login.controller.abort();
			reject(new Error("Claude did not provide a sign-in link. Try again."));
		}, 15000);
		void runClaude(
			userId,
			["auth", "login", "--claudeai"],
			"",
			login.controller.signal,
			(chunk) => {
				output += chunk;
				const url = claudeLoginUrl(output);
				if (!url) return;
				clearTimeout(timer);
				login.url = url;
				resolve(url);
			},
		)
			.then(() => {
				clearTimeout(timer);
				if (logins.get(userId) === login) logins.delete(userId);
				if (!login.url)
					reject(
						new Error(
							"Claude exited without a sign-in link. Refresh the connection.",
						),
					);
			})
			.catch((error) => {
				clearTimeout(timer);
				login.url = undefined;
				login.error = errorMessage(error);
				reject(error);
			});
	});
}
