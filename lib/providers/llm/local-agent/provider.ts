import { streamText } from "ai";
import type { LLMStreamChunk } from "@/lib/connectors/types";
import type { AgentModel } from "../agent-model";
import type { LLMProvider, LLMRequest } from "../base";
import { localAgentModel } from "./language-model";

/** Agents run on their own sign-in, so nothing is checked or charged here. */
export class LocalAgentLLM implements LLMProvider {
	async validate() {
		return { ok: true as const };
	}

	async generate(params: LLMRequest) {
		let text = "";
		for await (const chunk of this.stream(params)) text += chunk.text;
		return { output: { text, model: params.model }, costUsd: 0 };
	}

	async *stream(params: LLMRequest): AsyncGenerator<LLMStreamChunk, number> {
		const result = streamText({
			model: localAgentModel(params.model),
			instructions: params.systemPrompt,
			prompt: params.prompt,
		});
		for await (const part of result.fullStream) {
			if (part.type === "text-delta") yield { text: part.text, done: false };
			if (part.type === "error") throw part.error;
		}
		yield { text: "", done: true };
		return 0;
	}

	agentModel(command: string): AgentModel {
		return {
			model: localAgentModel(command),
			modelId: command,
			providerOptions: {},
			cachedPrefix: {},
			costOf: () => 0,
		};
	}
}
