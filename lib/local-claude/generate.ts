import { z } from "zod";
import { claudeAccount } from "./account";
import { runClaude } from "./process";

const Result = z.object({
	is_error: z.boolean().optional(),
	result: z.string().optional(),
	structured_output: z.unknown().optional(),
});

export async function generateWithClaude(
	userId: string,
	prompt: string,
	systemPrompt: string,
	signal?: AbortSignal,
	schema?: Record<string, unknown>,
) {
	if (!(await claudeAccount(userId)).connected)
		throw new Error("Sign in to your Claude subscription in Settings first.");
	const args = [
		"--safe-mode",
		"-p",
		"--model",
		"sonnet",
		"--output-format",
		"json",
		"--tools",
		"",
		"--strict-mcp-config",
		"--mcp-config",
		'{"mcpServers":{}}',
		"--no-session-persistence",
		"--system-prompt",
		systemPrompt,
	];
	if (schema) args.push("--json-schema", JSON.stringify(schema));
	const result = Result.parse(
		JSON.parse(await runClaude(userId, args, prompt, signal)),
	);
	if (result.is_error)
		throw new Error(
			"Claude could not generate this response. Check your subscription limits and retry.",
		);
	if (schema) {
		if (result.structured_output === undefined)
			throw new Error(
				"Claude did not return the requested structured response.",
			);
		return JSON.stringify(result.structured_output);
	}
	if (!result.result) throw new Error("Claude returned an empty response.");
	return result.result;
}
