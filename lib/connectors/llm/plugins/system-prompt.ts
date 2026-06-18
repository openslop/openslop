import type { LLMGenerateParams } from "@/lib/connectors/types";
import compact from "lodash/compact";

export function prependSystemPrompt(
	params: LLMGenerateParams,
	base: string | undefined,
): LLMGenerateParams {
	return {
		...params,
		systemPrompt: compact([base?.trim(), params.systemPrompt?.trim()]).join(
			"\n\n",
		),
	};
}
