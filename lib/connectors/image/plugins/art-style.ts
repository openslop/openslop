import { assetText } from "@/lib/canvas/assets";
import type { ConnectorPlugin } from "@/lib/connectors/types";

const ART_STYLE = "the art style";

export function createArtStylePlugin(): ConnectorPlugin<{ prompt: string }> {
	return {
		name: "art-style",
		reads: [
			(_, { canvas }) => ({ [ART_STYLE]: assetText(canvas, "asset_style") }),
		],
		transformPrompt(prompt, ctx) {
			const style = ctx.reads?.[ART_STYLE];
			return style ? `${style}. ${prompt}` : prompt;
		},
	};
}
