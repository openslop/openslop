import { requireState } from "@/lib/connectors/plugins";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import { forArtStyle } from "@/lib/generation/sourceNodes";

export function createArtStylePlugin(): ConnectorPlugin<{ prompt: string }> {
	return {
		name: "art-style",
		dependencies: () => [forArtStyle],
		transformPrompt(prompt, ctx) {
			const style = requireState(ctx, "art-style").metadata.style.trim();
			if (!style) return prompt;
			return `${style}. ${prompt}`;
		},
	};
}
