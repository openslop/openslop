import type { ConnectorPlugin } from "@/lib/connectors/types";
import type {
	GenerationNode,
	GraphContext,
	GraphResolveContext,
} from "@/lib/generation/graph";
import { resolveGraph } from "@/lib/generation/resolveGraph";
import { characterAvatarElement } from "@/lib/project/characterAvatar";
import { createDimensionsPlugin } from "@/lib/connectors/plugins/dimensions";
import { createArtStylePlugin } from "./art-style";
import { createCharacterAvatarPlugin } from "./character-avatar";
import { createReferenceImagesPlugin } from "./reference-images";

export function buildCharacterAvatarPlugins(name: string): ConnectorPlugin[] {
	return [
		createCharacterAvatarPlugin(name),
		createArtStylePlugin(),
		createReferenceImagesPlugin(),
		createDimensionsPlugin("image"),
	];
}

export function characterAvatarNode(
	name: string,
	ctx: GraphContext,
): GenerationNode {
	return ctx.resolve(characterAvatarElement(ctx.state, name), "image", {
		plugins: buildCharacterAvatarPlugins(name),
	});
}

/** An avatar as a graph root, for generating one on its own. */
export function characterAvatarGraph(
	name: string,
	ctx: GraphResolveContext,
): GenerationNode {
	return resolveGraph(characterAvatarElement(ctx.state, name), ctx, {
		plugins: buildCharacterAvatarPlugins(name),
	});
}
