import omit from "lodash/omit";
import type { CanvasContentElement } from "@/lib/canvas/types";
import {
	DEFAULT_PROVIDER,
	type AnimatedImageGenerateParams,
	type AssetResult,
	type ConnectorPlugin,
	type PluginContext,
} from "@/lib/connectors/types";
import { buildImagePlugins } from "@/lib/connectors/image/plugins/imageChain";
import {
	derivedNodeId,
	type GenerationNode,
	type NodeSpec,
} from "@/lib/generation/graph";
import type { GenerationQueue } from "@/lib/generation/queue";
import type { NodeBuilder } from "@/lib/generation/resolveGraph";
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
		generationAttributes: {
			...omit(element.generationAttributes ?? {}, VIDEO_ONLY_KEYS),
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

/**
 * Moves an image's own result onto the still it is about to become, so animating
 * an image animates the frame the user already has instead of a fresh one. The
 * still stays a node with its own inputs, so editing it still stales the animation.
 */
export function carryOverStill(
	element: CanvasContentElement,
	queue: GenerationQueue,
	buildNode: NodeBuilder,
): void {
	const { result } = queue.getElementSnapshot(element.id);
	if (!result) return;
	queue.commitResult(buildNode(forStillOf(element)), result);
	queue.discard(element.id);
}

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
