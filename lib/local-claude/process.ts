import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export class ClaudeNotInstalledError extends Error {
	constructor() {
		super("Install Claude Code on this computer, then retry.");
	}
}

export class ClaudeExitError extends Error {
	constructor(
		readonly code: number,
		readonly stdout: string,
	) {
		super(
			"Claude Code did not complete. Check your subscription sign-in and usage limits, then retry.",
		);
	}
}

export async function runClaude(
	userId: string,
	args: string[],
	input = "",
	signal?: AbortSignal,
	onOutput?: (chunk: string) => void,
	timeout = 180_000,
): Promise<string> {
	const project = createHash("sha256")
		.update(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "local")
		.digest("hex")
		.slice(0, 16);
	const config = join(homedir(), ".openslop", "claude", project, userId);
	const cwd = join(config, "workspace");
	await mkdir(cwd, { recursive: true, mode: 0o700 });
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
				timeout,
				maxBuffer: 2_000_000,
				signal,
			},
			(error, stdout) => {
				if (!error) resolve(stdout);
				else if (error.code === "ENOENT") reject(new ClaudeNotInstalledError());
				else if (signal?.aborted)
					reject(new Error("Claude request cancelled."));
				else if (error.killed)
					reject(new Error("Claude Code timed out. Retry."));
				else reject(new ClaudeExitError(Number(error.code), stdout));
			},
		);
		if (onOutput) child.stdout?.on("data", (chunk) => onOutput(String(chunk)));
		child.stdin?.on("error", () =>
			reject(new Error("Claude Code closed its input unexpectedly.")),
		);
		child.stdin?.end(input);
	});
}
