import { assetText } from "@/lib/canvas/assets";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import { read } from "@/lib/generation/declare";

const artStyle = read("the art style", (_, { canvas }) =>
	assetText(canvas, "asset_style"),
);

export function createArtStylePlugin(): ConnectorPlugin<{ prompt: string }> {
	return {
		name: "art-style",
		reads: [artStyle],
		transformPrompt(prompt, ctx) {
			const style = artStyle.value(ctx);
			return style ? `${style}. ${prompt}` : prompt;
		},
	};
}
