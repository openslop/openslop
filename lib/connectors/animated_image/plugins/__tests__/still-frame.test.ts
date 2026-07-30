import { describe, expect, it } from "vitest";
import type {
	AnimatedImageGenerateParams,
	AssetResult,
	PluginContext,
} from "@/lib/connectors/types";
import { buildImagePlugins } from "@/lib/connectors/image/plugins/imageChain";
import {
	DEFAULT_CONNECTOR_REGISTRY,
	withRegistry,
} from "@/lib/connectors/registry";
import { forElement, needsGeneration } from "@/lib/generation/graph";
import { GenerationQueue } from "@/lib/generation/queue";
import { nodeBuilder } from "@/lib/generation/resolveGraph";
import { MetadataSchema } from "@/lib/project/types";
import { buildAnimatedImagePlugins } from "../animated-image-chain";
import {
	createStillFramePlugin,
	stillElementId,
	stillFrameUrl,
} from "../still-frame";

const ELEMENT_ID = "anim-1";
const STILL_URL = "https://example.com/still.png";

const ctx = (
	imageUrl?: string,
): PluginContext<AnimatedImageGenerateParams, AssetResult> => ({
	elementId: ELEMENT_ID,
	dependencies: imageUrl
		? { [stillElementId(ELEMENT_ID)]: { imageUrl, durationSec: 0 } }
		: {},
});

describe("still-frame plugin", () => {
	const plugin = createStillFramePlugin();

	it("animates the still frame using the motion prompt", async () => {
		const params = await plugin.beforeGenerate?.(
			{ prompt: "a dark forest", videoPrompt: "slow zoom in", duration: 8 },
			ctx(STILL_URL),
		);

		// The element's own text prompts the still, not the animation.
		expect(params).toEqual({
			prompt: "slow zoom in",
			frameImages: [STILL_URL],
			duration: 8,
		});
	});

	it("keeps the still on the result as the poster frame", async () => {
		const result = await plugin.afterGenerate?.(
			{ videoUrl: "https://example.com/v.mp4", durationSec: 5 },
			ctx(STILL_URL),
		);

		expect(result).toEqual({
			videoUrl: "https://example.com/v.mp4",
			durationSec: 5,
			imageUrl: STILL_URL,
		});
	});

	it("throws when videoPrompt is missing", () => {
		expect(() =>
			plugin.beforeGenerate?.({ prompt: "a dark forest" }, ctx(STILL_URL)),
		).toThrow(/videoPrompt/);
	});

	it("throws when the still dependency produced no frame", () => {
		expect(() =>
			plugin.beforeGenerate?.(
				{ prompt: "a dark forest", videoPrompt: "slow zoom in" },
				ctx(),
			),
		).toThrow(/still frame/);
	});
});

describe("stillFrameUrl", () => {
	const registry = withRegistry(DEFAULT_CONNECTOR_REGISTRY)
		.appendPlugins("image", ...buildImagePlugins())
		.appendPlugins("animated_image", ...buildAnimatedImagePlugins())
		.build();
	const state = { metadata: MetadataSchema.parse({}), referenceImages: [] };
	const animated = {
		id: ELEMENT_ID,
		type: "animated_image" as const,
		customAttributes: { videoPrompt: "slow pan" },
		children: [{ id: "t", type: "animated_image" as const, text: "a forest" }],
	};

	// Regression: the preview used to read the animation's own result, so an
	// uploaded still stayed invisible until the animation re-rendered.
	it("reads the still node rather than the animation's own result", () => {
		const queue = new GenerationQueue({ batchSize: 1 });
		const node = nodeBuilder(registry, state)(forElement(animated));
		const still = node.dependsOn.find(
			(dep) => dep.id === stillElementId(ELEMENT_ID),
		);
		if (!still) throw new Error("expected a still dependency");

		// The animation was rendered from an older frame.
		queue.commitResult(node, {
			imageUrl: "rendered-from.png",
			videoUrl: "https://example.com/v.mp4",
			durationSec: 5,
		});
		expect(stillFrameUrl(node, queue)).toBeUndefined();

		queue.commitResult(
			still,
			{ imageUrl: "uploaded.png", durationSec: 0 },
			{ pinned: true },
		);
		expect(stillFrameUrl(node, queue)).toBe("uploaded.png");
	});

	it("has no still frame before one exists", () => {
		const queue = new GenerationQueue({ batchSize: 1 });
		const node = nodeBuilder(registry, state)(forElement(animated));
		expect(stillFrameUrl(node, queue)).toBeUndefined();
	});
});

describe("uploaded still lifetime", () => {
	const registry = withRegistry(DEFAULT_CONNECTOR_REGISTRY)
		.appendPlugins("image", ...buildImagePlugins())
		.appendPlugins("animated_image", ...buildAnimatedImagePlugins())
		.build();
	const state = { metadata: MetadataSchema.parse({}), referenceImages: [] };

	const animated = (text: string, videoPrompt: string) => ({
		id: ELEMENT_ID,
		type: "animated_image" as const,
		customAttributes: { videoPrompt },
		children: [{ id: "t", type: "animated_image" as const, text }],
	});

	/** Upload a still, then read back both nodes against a possibly-edited element. */
	const afterUpload = (text: string, videoPrompt: string) => {
		const queue = new GenerationQueue({ batchSize: 1 });
		const build = nodeBuilder(registry, state);
		const original = build(forElement(animated("a forest", "slow pan")));
		const still = original.dependsOn.find(
			(dep) => dep.id === stillElementId(ELEMENT_ID),
		);
		if (!still) throw new Error("expected a still dependency");
		queue.commitResult(still, { imageUrl: "uploaded.png", durationSec: 0 });
		queue.commitResult(original, {
			imageUrl: "uploaded.png",
			videoUrl: "https://example.com/v.mp4",
			durationSec: 5,
		});

		const edited = build(forElement(animated(text, videoPrompt)));
		return {
			animation: needsGeneration(edited, queue),
			still: needsGeneration(
				edited.dependsOn.find((dep) => dep.id === stillElementId(ELEMENT_ID)) ??
					still,
				queue,
			),
		};
	};

	it("keeps the uploaded still when only the videoPrompt changed", () => {
		const { animation, still } = afterUpload("a forest", "fast zoom");
		expect(still).toBe(false);
		expect(animation).toBe(true);
	});

	it("regenerates the still when the element's own prompt changed", () => {
		const { still } = afterUpload("a meadow", "slow pan");
		expect(still).toBe(true);
	});

	it("leaves both alone when nothing changed", () => {
		const { animation, still } = afterUpload("a forest", "slow pan");
		expect(still).toBe(false);
		expect(animation).toBe(false);
	});
});
