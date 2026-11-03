import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export async function runClaude(
	userId: string,
	args: string[],
	input = "",
	signal?: AbortSignal,
): Promise<string> {
	const project = createHash("sha256")
		.update(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "local")
		.digest("hex")
		.slice(0, 16);
	const config = join(homedir(), ".openslop", "claude", project, userId);
	const cwd = join(config, "workspace");
	await mkdir(cwd, { recursive: true, mode: 0o700 });
	// Only the dedicated login and basic OS environment reach the CLI.
	const env = Object.fromEntries(
		["PATH", "HOME", "USER", "TMPDIR", "SYSTEMROOT"].flatMap((key) =>
			process.env[key] ? [[key, process.env[key]]] : [],
		),
	);
	return new Promise((resolve, reject) => {
		const child = execFile(
			"claude",
			args,
			{
				cwd,
				env: {
					...env,
					NODE_ENV: "development",
					CLAUDE_CONFIG_DIR: config,
					CLAUDE_CODE_SAFE_MODE: "1",
				},
				timeout: 180_000,
				maxBuffer: 2_000_000,
				signal,
			},
			(error, stdout) => {
				if (
					error &&
					!(
						args[0] === "auth" &&
						args[1] === "status" &&
						error.code === 1 &&
						stdout.trim().startsWith("{")
					)
				) {
					const code = "code" in error ? error.code : undefined;
					reject(
						new Error(
							code === "ENOENT"
								? "Install Claude Code on this computer, then retry."
								: signal?.aborted
									? "Claude request cancelled."
									: "Claude Code did not complete. Check your subscription sign-in and usage limits, then retry.",
						),
					);
				} else resolve(stdout);
			},
		);
		child.stdin?.on("error", () =>
			reject(new Error("Claude Code closed its input unexpectedly.")),
		);
		child.stdin?.end(input);
	});
}
