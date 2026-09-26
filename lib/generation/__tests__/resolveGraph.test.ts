import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { characterAvatarElementId } from "@/lib/project/characterAvatar";
import { createProjectStore, type ProjectStore } from "@/lib/project/store";
import {
	LAYOUT_ATTRIBUTE_KEYS,
	splitAttributes,
} from "@/lib/canvas/elementAttributes";
import {
	flattenGraph,
	forElement,
	isNodeStale,
	needsGeneration,
	type BuildContext,
} from "../graph";
import { GenerationQueue } from "../queue";
import { buildNode } from "../resolveGraph";

let store: ProjectStore;

const element = (
	id: string,
	type: CanvasContentElement["type"],
	customAttributes?: Record<string, string>,
): CanvasContentElement => ({
	id,
	type,
	...splitAttributes({ ...customAttributes }),
	children: [{ id: `${id}-t`, type, text: "a sunset" }],
});

const context = (canvas: CanvasContentElement[]): BuildContext => ({
	state: store.getState(),
	canvas,
	registry: DEFAULT_CONNECTOR_REGISTRY,
});

const resolveOn = (el: CanvasContentElement, canvas: CanvasContentElement[]) =>
	buildNode(forElement(el), context(canvas));

const resolve = (el: CanvasContentElement) => resolveOn(el, []);

const idsOf = (el: CanvasContentElement) =>
	flattenGraph([resolve(el)]).map((node) => node.id);

beforeEach(() => {
	store = createProjectStore();
	store
		.getState()
		.updateMetadata({ characters: { Alice: { appearance: "red hair" } } });
});

describe("resolveGraph", () => {
	// A card's spec is made at render, but Slate notifies selectors before the
	// next render, so the spec can hold the element as it was one edit ago.
	it("builds from the element on the canvas, not the one the spec captured", () => {
		const stale = element("vid", "video", { duration: "10" });
		const canvas = [element("vid", "video", { duration: "11" })];

		const node = resolveOn(stale, canvas);

		expect(node.inputs.attributes.duration).toBe("11");
		expect(node.inputs.attributes).toBe(canvas[0].generationAttributes);
	});

	it("builds the given element when the canvas does not carry it", () => {
		const offCanvas = element("avatar", "image", { kind: "avatar" });

		expect(resolve(offCanvas).inputs.attributes.kind).toBe("avatar");
	});

	it("labels a dependency for its dependent without renaming the node itself", () => {
		const image = element("img", "image");
		const video = element("vid", "video", { startFrame: "previous" });
		const canvas = [image, video];

		expect(resolveOn(video, canvas).dependsOn.previousVisual?.label).toBe(
			"the previous visual",
		);
		expect(resolveOn(image, canvas).label).toBeUndefined();
	});

	it("keys each edge by the name its plugin declared", () => {
		const video = element("vid", "video", { startFrame: "previous" });

		expect(Object.keys(resolveOn(video, [video]).dependsOn)).toEqual([
			"artStyle",
			"referenceImages",
			"aspectRatio",
			"previousVisual",
		]);
	});

	it("depends on the project state an image reads", () => {
		expect(idsOf(element("img", "image"))).toEqual([
			"project:artStyle",
			"project:referenceImages",
			"project:aspectRatio",
			"img",
		]);
	});

	it("depends on the avatar of each referenced character", () => {
		const ids = idsOf(element("img", "image", { characters: "Alice" }));
		expect(ids).toContain(characterAvatarElementId("Alice"));
		expect(ids.indexOf(characterAvatarElementId("Alice"))).toBeLessThan(
			ids.indexOf("img"),
		);
	});

	it("gives a referenced avatar its own art-style and reference-image edges", () => {
		const avatar = Object.values(
			resolve(element("img", "image", { characters: "Alice" })).dependsOn,
		).find((node) => node.id === characterAvatarElementId("Alice"));
		expect(
			Object.values(avatar?.dependsOn ?? {}).map((node) => node.id),
		).toEqual([
			"project:artStyle",
			"project:referenceImages",
			"project:aspectRatio",
		]);
	});

	it("does not depend on avatars of characters it does not reference", () => {
		store.getState().setCharacter("Bob", { appearance: "tall" });
		const ids = idsOf(element("img", "image", { characters: "Alice" }));
		expect(ids).not.toContain(characterAvatarElementId("Bob"));
	});

	// Ported from the deleted getGenerationInputs tests: node inputs are exactly
	// the authored attributes, minus the centralized layout contract.
	it("keeps generation-affecting attributes as the node's own inputs", () => {
		const node = resolve(
			element("vid-1", "video", {
				model: "Slop Video v1",
				duration: "5",
			}),
		);
		expect(node.inputs.prompt).toBe("a sunset");
		expect(node.inputs.attributes).toEqual({
			model: "Slop Video v1",
			duration: "5",
		});
	});

	it("strips exactly the centralized LAYOUT_ATTRIBUTE_KEYS contract", () => {
		const layoutOnly = Object.fromEntries(
			LAYOUT_ATTRIBUTE_KEYS.map((key) => [key, "1"]),
		);
		const node = resolve(
			element("vid-1", "video", { ...layoutOnly, model: "Slop Video v1" }),
		);
		for (const key of LAYOUT_ATTRIBUTE_KEYS) {
			expect(node.inputs.attributes).not.toHaveProperty(key);
		}
		expect(node.inputs.attributes).toEqual({ model: "Slop Video v1" });
	});

	it("sizes a video from the project aspect ratio via its dependency", () => {
		const ids = idsOf(element("vid-1", "video"));
		expect(ids).toContain("project:aspectRatio");
	});

	it("builds the visual a video opens on ahead of the video", () => {
		const img = element("img", "image");
		const video = element("vid-1", "video", { startFrame: "previous" });

		const ids = flattenGraph([resolveOn(video, [img, video])]).map(
			(node) => node.id,
		);
		expect(ids).toContain("img");
		expect(ids.indexOf("img")).toBeLessThan(ids.indexOf("vid-1"));
	});

	it("marks a video stale when its start frame is replaced by an upload", () => {
		const img = element("img", "image");
		const el = element("vid-1", "video", { startFrame: "previous" });
		const video = resolveOn(el, [img, el]);
		const frame = video.dependsOn.previousVisual;
		if (!frame) throw new Error("expected a previous-visual dependency");

		const queue = new GenerationQueue();
		const commit = (node: typeof video, url: string) =>
			queue.commitResult(node, { imageUrl: url, durationSec: 0 });

		commit(frame, "frame.png");
		commit(video, "video.mp4");
		expect(isNodeStale(video, queue)).toBe(false);

		commit(frame, "uploaded.png");
		expect(isNodeStale(video, queue)).toBe(true);
	});

	it("marks a video stale when the visual before it changes", () => {
		const queue = new GenerationQueue();
		const img = element("img", "image");
		const other = element("other", "image");
		const el = element("vid-1", "video", { startFrame: "previous" });
		const video = resolveOn(el, [img, el]);
		queue.commitResult(resolveOn(img, [img, el]), {
			imageUrl: "frame.png",
			durationSec: 0,
		});
		queue.commitResult(video, { videoUrl: "video.mp4", durationSec: 5 });
		expect(isNodeStale(video, queue)).toBe(false);

		expect(isNodeStale(resolveOn(el, [img, other, el]), queue)).toBe(true);
	});

	// An upload replaces a generated result with the user's own image. Project
	// state drifting underneath it must not let Generate All overwrite it.
	it("regenerates a generated image when the art style changes", () => {
		const queue = new GenerationQueue();
		const img = element("img", "image");

		queue.commitResult(resolve(img), {
			imageUrl: "generated.png",
			durationSec: 0,
		});
		expect(needsGeneration(resolve(img), queue)).toBe(false);

		store.getState().updateMetadata({ style: "noir" });
		expect(needsGeneration(resolve(img), queue)).toBe(true);
	});

	it("visits a dependency shared by the element and its avatar only once", () => {
		const ids = idsOf(element("img", "image", { characters: "Alice" }));
		expect(ids.filter((id) => id === "project:artStyle")).toHaveLength(1);
	});
});
