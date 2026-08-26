import { describe, expect, it } from "vitest";
import type {
	AnimatedImageGenerateParams,
	AssetResult,
	PluginContext,
} from "@/lib/connectors/types";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import {
	forElement,
	needsGeneration,
	type GenerationNode,
} from "@/lib/generation/graph";
import { GenerationQueue } from "@/lib/generation/queue";
import { nodeBuilder } from "@/lib/generation/resolveGraph";
import { MetadataSchema } from "@/lib/project/types";
import {
	createStillFramePlugin,
	pictureNode,
	stillElementId,
	stillSnapshot,
} from "../still-frame";
import { splitAttributes } from "@/lib/video/elementAttributes";

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

describe("stillSnapshot", () => {
	const registry = DEFAULT_CONNECTOR_REGISTRY;
	const state = {
		hydrated: true,
		metadata: MetadataSchema.parse({}),
		referenceImages: [],
	};
	const animated = {
		id: ELEMENT_ID,
		type: "animated_image" as const,
		...splitAttributes({ provider: "openslop", videoPrompt: "slow pan" }),
		children: [{ id: "t", type: "animated_image" as const, text: "a forest" }],
	};

	const frameUrl = (node: GenerationNode, queue: GenerationQueue) =>
		getPrimaryUrl(stillSnapshot(node, queue).result, "image");

	// Regression: the preview used to read the animation's own result, so an
	// uploaded still stayed invisible until the animation re-rendered.
	it("reads the still node rather than the animation's own result", () => {
		const queue = new GenerationQueue();
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
		expect(frameUrl(node, queue)).toBeUndefined();

		queue.commitResult(
			still,
			{ imageUrl: "uploaded.png", durationSec: 0 },
			{ pinned: true },
		);
		expect(frameUrl(node, queue)).toBe("uploaded.png");
	});

	it("has no still frame before one exists", () => {
		const queue = new GenerationQueue();
		const node = nodeBuilder(registry, state)(forElement(animated));
		expect(frameUrl(node, queue)).toBeUndefined();
	});

	it("reports the still node's own state, not the animation's", () => {
		const queue = new GenerationQueue();
		const node = nodeBuilder(registry, state)(forElement(animated));
		queue.setError(stillElementId(ELEMENT_ID), "still failed");

		expect(stillSnapshot(node, queue)).toBe(
			queue.getElementSnapshot(stillElementId(ELEMENT_ID)),
		);
		expect(queue.getElementSnapshot(ELEMENT_ID).error).toBeNull();
	});
});

describe("duplicated animation", () => {
	const registry = DEFAULT_CONNECTOR_REGISTRY;
	const state = {
		hydrated: true,
		metadata: MetadataSchema.parse({}),
		referenceImages: [],
	};
	const COPY_ID = "anim-2";

	const animated = (id: string) => ({
		id,
		type: "animated_image" as const,
		...splitAttributes({ provider: "openslop", videoPrompt: "slow pan" }),
		children: [
			{ id: `${id}-t`, type: "animated_image" as const, text: "a forest" },
		],
	});

	const duplicated = () => {
		const queue = new GenerationQueue();
		const build = nodeBuilder(registry, state);
		const source = build(forElement(animated(ELEMENT_ID)));
		const still = source.dependsOn.find(
			(dep) => dep.id === stillElementId(ELEMENT_ID),
		);
		if (!still) throw new Error("expected a still dependency");
		queue.commitResult(still, { imageUrl: STILL_URL, durationSec: 0 });
		queue.commitResult(source, {
			imageUrl: STILL_URL,
			videoUrl: "https://example.com/v.mp4",
			durationSec: 5,
		});

		return { queue, copy: build(forElement(animated(COPY_ID))) };
	};

	it("starts empty, so Generate makes it from scratch", () => {
		const { queue, copy } = duplicated();
		expect(needsGeneration(copy, queue)).toBe(true);
		expect(stillSnapshot(copy, queue).result).toBeNull();
	});

	it("leaves the element it was duplicated from alone", () => {
		const { queue } = duplicated();
		expect(queue.getElementSnapshot(ELEMENT_ID).result).not.toBeNull();
	});
});

describe("uploaded still lifetime", () => {
	const registry = DEFAULT_CONNECTOR_REGISTRY;
	const state = {
		hydrated: true,
		metadata: MetadataSchema.parse({}),
		referenceImages: [],
	};

	const animated = (text: string, videoPrompt: string) => ({
		id: ELEMENT_ID,
		type: "animated_image" as const,
		...splitAttributes({ provider: "openslop", videoPrompt }),
		children: [{ id: "t", type: "animated_image" as const, text }],
	});

	/** Upload a still, then read back both nodes against a possibly-edited element. */
	const afterUpload = (text: string, videoPrompt: string) => {
		const queue = new GenerationQueue();
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

describe("pictureNode", () => {
	const registry = DEFAULT_CONNECTOR_REGISTRY;
	const state = {
		hydrated: true,
		metadata: MetadataSchema.parse({}),
		referenceImages: [],
	};

	const element = (
		type: "image" | "animated_image" | "clip" | "narration",
	) => ({
		id: `el-${type}`,
		type,
		...splitAttributes({ provider: "openslop", videoPrompt: "slow pan" }),
		children: [{ id: `el-${type}-t`, type, text: "a forest" }],
	});

	const pictureFor = (type: Parameters<typeof element>[0]) =>
		pictureNode(nodeBuilder(registry, state)(forElement(element(type))));

	it("is the element itself when it generates an image", () => {
		expect(pictureFor("image")?.id).toBe("el-image");
	});

	it("is the still behind an animated image, not the animation", () => {
		expect(pictureFor("animated_image")?.id).toBe(
			stillElementId("el-animated_image"),
		);
	});

	it("is nothing for an element that makes no picture", () => {
		expect(pictureFor("clip")).toBeNull();
		expect(pictureFor("narration")).toBeNull();
	});
});
