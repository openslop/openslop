import { requireContext } from "@/lib/connectors/plugins";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import { dependency } from "@/lib/generation/dependency";
import { forArtStyle } from "@/lib/generation/sourceNodes";

export function createArtStylePlugin(): ConnectorPlugin<{ prompt: string }> {
	return {
		name: "art-style",
		dependencies: [dependency("artStyle", () => forArtStyle)],
		transformPrompt(prompt, ctx) {
			const style = requireContext(
				ctx,
				"state",
				"art-style",
			).metadata.style.trim();
			if (!style) return prompt;
			return `${style}. ${prompt}`;
		},
	};
}
