import { assetText } from "@/lib/canvas/assets";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import { reading } from "@/lib/generation/dependency";

const style = reading("the art style", (_, { canvas }) =>
	assetText(canvas, "asset_style"),
);

export function createArtStylePlugin(): ConnectorPlugin<{ prompt: string }> {
	return {
		name: "art-style",
		reads: style.reads,
		transformPrompt(prompt, ctx) {
			const value = style.value(ctx);
			return value ? `${value}. ${prompt}` : prompt;
		},
	};
}
