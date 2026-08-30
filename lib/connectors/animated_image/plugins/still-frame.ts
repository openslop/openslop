import omit from "lodash/omit";
import { ELEMENT_TYPES, type CanvasContentElement } from "@/lib/canvas/types";
import {
	type AnimatedImageGenerateParams,
	type AssetResult,
	type ConnectorPlugin,
	type PluginContext,
} from "@/lib/connectors/types";
import { buildImagePlugins } from "@/lib/connectors/image/plugins/imageChain";
import { MODEL_CATALOGS } from "@/lib/connectors/models";
import {
	derivedDependency,
	derivedNodeId,
	isSourceNode,
	type GenerationNode,
	type JobNode,
	type NodeSpec,
} from "@/lib/generation/graph";
import type { GenerationQueue } from "@/lib/generation/queue";
import type { ElementSnapshot } from "@/lib/generation/snapshots";

/** Attributes of the animation, which the still's image generation has no use for. */
const VIDEO_ONLY_KEYS = ["videoPrompt", "duration", "model"] as const;

const STILL = "still";

export const stillElementId = (elementId: string) =>
	derivedNodeId(STILL, elementId);

/**
 * The frame an animated image animates. Being a node of its own is what makes it
 * regenerate only on its own inputs, and makes replacing it stale the animation.
 */
export function stillElement(
	element: CanvasContentElement,
): CanvasContentElement {
	const { stillModel, ...attributes } = element.generationAttributes ?? {};
	return {
		...element,
		id: stillElementId(element.id),
		type: "image",
		generationAttributes: {
			...omit(attributes, VIDEO_ONLY_KEYS),
			...(stillModel && { model: MODEL_CATALOGS.image.resolve(stillModel) }),
		},
	};
}

export const forStillOf =
	(element: CanvasContentElement): NodeSpec =>
	() => ({ element: stillElement(element), plugins: buildImagePlugins() });

/** The still node behind an animated image, when the element has one. */
export const stillDependency = (node: GenerationNode) =>
	derivedDependency(node, STILL);

/**
 * The node that makes an element's picture: the still behind an animated image,
 * an image element itself, and nothing at all for an element that makes no
 * picture. Whoever supplies a picture writes it here.
 */
export function pictureNode(node: GenerationNode): JobNode | null {
	const target = stillDependency(node) ?? node;
	if (isSourceNode(target)) return null;
	const makesPicture =
		ELEMENT_TYPES[target.job.elementType].outputKind === "image";
	return makesPicture ? target : null;
}

/**
 * The snapshot of the still a node depends on
 */
export const stillSnapshot = (
	node: GenerationNode,
	queue: GenerationQueue,
): ElementSnapshot => queue.getElementSnapshot(stillDependency(node)?.id);

const stillFrame = (
	ctx?: PluginContext<AnimatedImageGenerateParams, AssetResult>,
): string | undefined =>
	ctx?.elementId
		? ctx.dependencies?.[stillElementId(ctx.elementId)]?.imageUrl
		: undefined;

export function createStillFramePlugin(): ConnectorPlugin<
	AnimatedImageGenerateParams,
	AssetResult
> {
	return {
		name: "still-frame",
		dependencies: (element) => [forStillOf(element)],
		beforeGenerate(params, ctx) {
			const { videoPrompt } = params;
			if (!videoPrompt) {
				throw new Error(
					"animated_image element is missing required videoPrompt attribute",
				);
			}
			const imageUrl = stillFrame(ctx);
			if (!imageUrl) {
				throw new Error(
					"animated_image expected a still frame from its dependency",
				);
			}
			// The element's own text prompts the still, not the animation.
			return {
				...omit(params, "videoPrompt", "stillModel"),
				prompt: videoPrompt,
				frameImages: [imageUrl],
			};
		},
		afterGenerate: (result, ctx) => ({
			...result,
			imageUrl: stillFrame(ctx),
		}),
	};
}
