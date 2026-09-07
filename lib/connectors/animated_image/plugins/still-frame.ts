import omit from "lodash/omit";
import {
	ELEMENT_TYPES,
	type CanvasContentElement,
	type CanvasElementType,
} from "@/lib/canvas/types";
import {
	type AnimatedImageGenerateParams,
	type AssetResult,
	type ConnectorPlugin,
	type PluginContext,
} from "@/lib/connectors/types";
import { buildImagePlugins } from "@/lib/connectors/image/plugins/imageChain";
import { resolveModel } from "@/lib/connectors/models";
import { ELEMENT_MODEL } from "@/lib/connectors/attributes/model";
import { STILL_MODEL } from "../attributes";
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
const VIDEO_ONLY_KEYS = [
	"videoPrompt",
	"duration",
	"resolution",
	...Object.values(ELEMENT_MODEL),
];

const STILL_MODEL_KEYS = Object.values(STILL_MODEL);

/** Attributes of the still, which the animation's video generation has no use for. */
const STILL_ONLY_KEYS = ["format", ...STILL_MODEL_KEYS];

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
	const attributes = element.generationAttributes ?? {};
	return {
		...element,
		id: stillElementId(element.id),
		type: "image",
		generationAttributes: {
			...omit(attributes, VIDEO_ONLY_KEYS, STILL_MODEL_KEYS),
			...resolveModel("image", {
				provider: attributes[STILL_MODEL.providerAttr],
				model: attributes[STILL_MODEL.key],
			}),
		},
	};
}

export const forStillOf =
	(element: CanvasContentElement): NodeSpec =>
	() => ({
		element: stillElement(element),
		plugins: buildImagePlugins(),
		label: "the still frame",
	});

/** The still node behind an animated image, when the element has one. */
export const stillDependency = (node: GenerationNode) =>
	derivedDependency(node, STILL);

const makesPicture = (type: CanvasElementType) =>
	ELEMENT_TYPES[type].outputKind === "image";

/**
 * Where an element's picture comes from: the still behind an animated image, an
 * image element itself, and nowhere at all for a type that makes none. Whoever
 * reads or supplies a picture goes through here.
 */
export function pictureElementId(element: CanvasContentElement) {
	if (element.type === "animated_image") return stillElementId(element.id);
	return makesPicture(element.type) ? element.id : undefined;
}

/** The same answer off a built node, which is what supplying a picture needs. */
export function pictureNode(node: GenerationNode): JobNode | null {
	const target = stillDependency(node) ?? node;
	if (isSourceNode(target)) return null;
	return makesPicture(target.job.elementType) ? target : null;
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
				...omit(params, "videoPrompt", STILL_ONLY_KEYS),
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
