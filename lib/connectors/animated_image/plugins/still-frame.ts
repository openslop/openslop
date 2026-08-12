import omit from "lodash/omit";
import type { CanvasContentElement } from "@/lib/canvas/types";
import type {
	AnimatedImageGenerateParams,
	AssetResult,
	ConnectorPlugin,
	PluginContext,
} from "@/lib/connectors/types";
import { buildImagePlugins } from "@/lib/connectors/image/plugins/imageChain";
import { DEFAULT_PROVIDER } from "@/lib/connectors/registry";
import {
	derivedNodeId,
	type GenerationNode,
	type NodeSpec,
} from "@/lib/generation/graph";
import type { GenerationQueue } from "@/lib/generation/queue";
import type { ElementSnapshot } from "@/lib/generation/snapshots";

/**
 * Attributes that drive only the animation. `model` is among them: it names a
 * video model, which the still's image generation cannot use.
 */
const VIDEO_ONLY_KEYS = ["videoPrompt", "duration", "model"] as const;

export const stillElementId = (elementId: string) =>
	derivedNodeId("still", elementId);

/**
 * The frame an animated image animates. Being a node of its own is what makes it
 * regenerate only on its own inputs, and makes replacing it stale the animation.
 */
export function stillElement(
	element: CanvasContentElement,
): CanvasContentElement {
	return {
		...element,
		id: stillElementId(element.id),
		type: "image",
		customAttributes: {
			...omit(element.customAttributes ?? {}, VIDEO_ONLY_KEYS),
			// The element's own provider generates the video, not the still.
			provider: DEFAULT_PROVIDER,
		},
	};
}

export const forStillOf =
	(element: CanvasContentElement): NodeSpec =>
	() => ({ element: stillElement(element), plugins: buildImagePlugins() });

/** The still node behind an animated image, when the element has one. */
export const stillDependency = (node: GenerationNode) =>
	node.dependsOn.find((dep) => dep.id === stillElementId(node.id));

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
			const { videoPrompt, ...rest } = params;
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
			return { ...rest, prompt: videoPrompt, frameImages: [imageUrl] };
		},
		afterGenerate: (result, ctx) => ({
			...result,
			imageUrl: stillFrame(ctx),
		}),
	};
}
