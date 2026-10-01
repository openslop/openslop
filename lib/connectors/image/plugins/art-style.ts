import { requireContext } from "@/lib/connectors/plugins";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import { dependency } from "@/lib/generation/dependency";
import { forArtStyle } from "@/lib/generation/sourceNodes";

export function createArtStylePlugin(): ConnectorPlugin<{ prompt: string }> {
	return {
		name: "art-style",
		dependencies: [dependency("artStyle", "the art style", () => forArtStyle)],
		transformPrompt(prompt, ctx) {
			const { metadata } = requireContext(ctx, "state", "art-style");
			const style = metadata.style.trim();
			return style ? `${style}. ${prompt}` : prompt;
		},
	};
}
