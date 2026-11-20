import type { LLMProvider, LLMRequest } from "@/lib/providers/llm/base";
import { claudeAgentModel } from "./agent-model";
import { claudeAccount } from "./account";
import { generateWithClaude } from "./generate";

export class LocalClaudeProvider implements LLMProvider {
	constructor(
		private readonly userId: string,
		private readonly signal?: AbortSignal,
	) {}
	async validate() {
		return (await claudeAccount(this.userId)).connected
			? { ok: true as const }
			: { ok: false as const, error: "Sign in with Claude in Settings first." };
	}
	async generate(params: LLMRequest) {
		return {
			output: {
				text: await generateWithClaude(
					this.userId,
					params.prompt,
					params.systemPrompt ?? "",
					this.signal,
				),
				model: "sonnet",
			},
			costUsd: 0,
		};
	}
	async *stream(params: LLMRequest) {
		const { output } = await this.generate(params);
		yield { text: output.text, done: true };
		return 0;
	}
	agentModel() {
		return claudeAgentModel(this.userId, this.signal);
	}
}
