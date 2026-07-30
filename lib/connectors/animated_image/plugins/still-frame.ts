import omit from "lodash/omit";
import type { CanvasContentElement } from "@/lib/canvas/types";
import type {
	AnimatedImageGenerateParams,
	AssetResult,
	ConnectorPlugin,
	PluginContext,
} from "@/lib/connectors/types";
import { buildImagePlugins } from "@/lib/connectors/image/plugins/imageChain";
import {
	derivedNodeId,
	type GenerationNode,
	type NodeSpec,
} from "@/lib/generation/graph";

/** Attributes that drive only the animation; the still frame ignores them. */
const VIDEO_ONLY_KEYS = ["videoPrompt", "duration"] as const;

export const stillElementId = (elementId: string) =>
	derivedNodeId("still", elementId);

/**
 * The frame an animated image animates. It is a node of its own, so it is
 * regenerated only when the still's own inputs change, and replacing it (by
 * regenerating or uploading) makes the animation stale.
 */
export function stillElement(
	element: CanvasContentElement,
): CanvasContentElement {
	return {
		...element,
		id: stillElementId(element.id),
		type: "image",
		customAttributes: omit(element.customAttributes ?? {}, VIDEO_ONLY_KEYS),
	};
}

/** Generate the still frame an animated image animates. */
export const forStillOf =
	(element: CanvasContentElement): NodeSpec =>
	() => ({ element: stillElement(element), plugins: buildImagePlugins() });

/** The still node behind an animated image, when the element has one. */
export const stillDependency = (node: GenerationNode) =>
	node.dependsOn.find((dep) => dep.id === stillElementId(node.id));

export function createStillFramePlugin(): ConnectorPlugin<
	AnimatedImageGenerateParams,
	AssetResult
> {
	return {
		name: "still-frame",
		dependencies: (element) => [forStillOf(element)],
		beforeGenerate(
			params,
			ctx?: PluginContext<AnimatedImageGenerateParams, AssetResult>,
		) {
			const imageUrl = ctx?.elementId
				? ctx.dependencies?.[stillElementId(ctx.elementId)]?.imageUrl
				: undefined;
			if (!imageUrl) {
				throw new Error(
					"animated_image expected a still frame from its dependency",
				);
			}
			return { ...params, frameImages: [imageUrl] };
		},
	};
}
