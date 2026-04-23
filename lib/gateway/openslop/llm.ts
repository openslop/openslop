import type {
	LLMGenerateParams,
	LLMGenerateResult,
	LLMStreamChunk,
} from "@/lib/connectors/types";
import { readSSE } from "@/lib/api/sse";
import { OpenSlopGatewayClient } from "./base";

export class OpenSlopLLMGateway extends OpenSlopGatewayClient<
	LLMGenerateParams,
	LLMGenerateResult
> {
	async generate(params: LLMGenerateParams): Promise<LLMGenerateResult> {
		return this.client.post("/api/v1/llm", params);
	}

	async *stream(params: LLMGenerateParams): AsyncGenerator<LLMStreamChunk> {
		const res = await this.client.postStream("/api/v1/llm", {
			...params,
			stream: true,
		});
		if (!res.body) throw new Error("No response body");
		yield* readSSE<LLMStreamChunk>(res.body);
	}
}
