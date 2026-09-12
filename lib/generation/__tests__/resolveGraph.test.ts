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
	isSourceNode,
	needsGeneration,
} from "../graph";
import { GenerationQueue } from "../queue";
import { nodeBuilder } from "../resolveGraph";

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

/** Builds `el` against a canvas holding `others`, which a start frame may name. */
const resolveOn = (el: CanvasContentElement, others: CanvasContentElement[]) =>
	nodeBuilder(
		DEFAULT_CONNECTOR_REGISTRY,
		store.getState(),
		() => others,
	)(forElement(el));

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
	// The builder is memoized across renders, so its per-graph dedupe cache must
	// not outlive one call or an edited element keeps resolving to its old node.
	it("rebuilds a node when its element changed", () => {
		const buildNode = nodeBuilder(
			DEFAULT_CONNECTOR_REGISTRY,
			store.getState(),
			() => [],
		);
		const withText = (text: string) => ({
			...element("img", "image"),
			children: [{ id: "img-t", type: "image" as const, text }],
		});

		expect(buildNode(forElement(withText("first"))).inputs.prompt).toBe(
			"first",
		);
		expect(buildNode(forElement(withText("second"))).inputs.prompt).toBe(
			"second",
		);
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
		const avatar = resolve(
			element("img", "image", { characters: "Alice" }),
		).dependsOn.find((node) => node.id === characterAvatarElementId("Alice"));
		expect(avatar?.dependsOn.map((node) => node.id)).toEqual([
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

	it("builds the canvas element a video opens on ahead of the video", () => {
		const img = element("img", "image");
		const video = element("vid-1", "video", { startFrame: "img" });

		const ids = flattenGraph([resolveOn(video, [img])]).map((node) => node.id);
		expect(ids).toContain("img");
		expect(ids.indexOf("img")).toBeLessThan(ids.indexOf("vid-1"));
	});

	it("marks a video stale when its start frame is replaced by an upload", () => {
		const img = element("img", "image");
		const video = resolveOn(element("vid-1", "video", { startFrame: "img" }), [
			img,
		]);
		const frame = video.dependsOn.find((node) => node.id === "img");
		if (!frame) throw new Error("expected a start-frame dependency");

		const queue = new GenerationQueue();
		const commit = (node: typeof video, url: string) =>
			queue.commitResult(node, { imageUrl: url, durationSec: 0 });

		commit(frame, "frame.png");
		commit(video, "video.mp4");
		expect(isNodeStale(video, queue)).toBe(false);

		commit(frame, "uploaded.png");
		expect(isNodeStale(video, queue)).toBe(true);
	});

	// A start frame whose element left the canvas still resolves, as a source
	// the queue never runs: the video keeps reading whatever it last produced.
	it("reads a start frame that left the canvas as a source, not a job", () => {
		const video = resolve(element("vid-1", "video", { startFrame: "gone" }));
		const frame = video.dependsOn.find((node) => node.id === "gone");

		expect(frame && isSourceNode(frame)).toBe(true);
		expect(frame?.label).toBe("the start frame");
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
