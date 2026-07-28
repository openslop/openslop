import { beforeEach, describe, expect, it } from "vitest";
import { buildAnimatedImagePlugins } from "@/lib/connectors/animated_image/plugins/animated-image-chain";
import { buildImagePlugins } from "@/lib/connectors/image/plugins/imageChain";
import { createDimensionsPlugin } from "@/lib/connectors/plugins/dimensions";
import { stillElementId } from "@/lib/connectors/animated_image/plugins/still-frame";
import {
	DEFAULT_CONNECTOR_REGISTRY,
	withRegistry,
	type ConnectorRegistry,
} from "@/lib/connectors/registry";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { characterAvatarElementId } from "@/lib/project/characterAvatar";
import { clearProjectStore, getProjectStore } from "@/lib/project/store";
import { LAYOUT_ATTRIBUTE_KEYS } from "@/lib/video/elementAttributes";
import { flattenGraph, isNodeStale } from "../graph";
import { GenerationQueue } from "../queue";
import { projectState } from "../sourceNodes";
import { resolveGraph } from "../resolveGraph";

const PROJECT_ID = "resolve-graph-test";

function buildRegistry(): ConnectorRegistry {
	const base = withRegistry(DEFAULT_CONNECTOR_REGISTRY)
		.appendPlugins("image", ...buildImagePlugins())
		.appendPlugins("video", createDimensionsPlugin("video"))
		.build();
	return withRegistry(base)
		.appendPlugins("animated_image", ...buildAnimatedImagePlugins(base))
		.build();
}

const element = (
	id: string,
	type: CanvasContentElement["type"],
	customAttributes?: Record<string, string>,
): CanvasContentElement => ({
	id,
	type,
	customAttributes,
	children: [{ id: `${id}-t`, type, text: "a sunset" }],
});

const resolve = (el: CanvasContentElement) =>
	resolveGraph(el, {
		projectId: PROJECT_ID,
		registry: buildRegistry(),
		state: projectState(PROJECT_ID),
	});

const idsOf = (el: CanvasContentElement) =>
	flattenGraph([resolve(el)]).map((node) => node.id);

beforeEach(() => {
	clearProjectStore(PROJECT_ID);
	getProjectStore(PROJECT_ID)
		.getState()
		.updateMetadata({ characters: { Alice: { appearance: "red hair" } } });
});

describe("resolveGraph", () => {
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
		getProjectStore(PROJECT_ID)
			.getState()
			.setCharacter("Bob", { appearance: "tall" });
		const ids = idsOf(element("img", "image", { characters: "Alice" }));
		expect(ids).not.toContain(characterAvatarElementId("Bob"));
	});

	it("splits an animated image into a still node and the animation", () => {
		const ids = idsOf(
			element("anim", "animated_image", { videoPrompt: "slow pan" }),
		);
		expect(ids).toContain(stillElementId("anim"));
		expect(ids.indexOf(stillElementId("anim"))).toBeLessThan(
			ids.indexOf("anim"),
		);
	});

	it("keeps animation-only attributes out of the still's inputs", () => {
		const anim = resolve(
			element("anim", "animated_image", {
				videoPrompt: "slow pan",
				duration: "8",
				format: "png",
			}),
		);
		const still = anim.dependsOn.find(
			(node) => node.id === stillElementId("anim"),
		);
		expect(still?.inputs.attributes).toEqual({ format: "png" });
		expect(anim.inputs.attributes).toMatchObject({
			videoPrompt: "slow pan",
			duration: "8",
		});
	});

	// Ported from the deleted getGenerationInputs tests: node inputs are exactly
	// the authored attributes, minus the centralized layout contract.
	it("keeps generation-affecting attributes as the node's own inputs", () => {
		const node = resolve(
			element("clip", "clip", {
				model: "Slop Video v1",
				duration: "5",
				provider: "openslop",
			}),
		);
		expect(node.inputs.prompt).toBe("a sunset");
		expect(node.inputs.attributes).toEqual({
			model: "Slop Video v1",
			duration: "5",
			provider: "openslop",
		});
	});

	it("strips exactly the centralized LAYOUT_ATTRIBUTE_KEYS contract", () => {
		const layoutOnly = Object.fromEntries(
			LAYOUT_ATTRIBUTE_KEYS.map((key) => [key, "1"]),
		);
		const node = resolve(
			element("clip", "clip", { ...layoutOnly, model: "Slop Video v1" }),
		);
		for (const key of LAYOUT_ATTRIBUTE_KEYS) {
			expect(node.inputs.attributes).not.toHaveProperty(key);
		}
		expect(node.inputs.attributes).toEqual({ model: "Slop Video v1" });
	});

	it("sizes a clip from the project aspect ratio via its dependency", () => {
		const ids = idsOf(element("clip", "clip"));
		expect(ids).toContain("project:aspectRatio");
	});

	it("marks the animation stale when its still is replaced by an upload", () => {
		const anim = resolve(
			element("anim", "animated_image", { videoPrompt: "slow pan" }),
		);
		const still = anim.dependsOn.find(
			(node) => node.id === stillElementId("anim"),
		);
		if (!still) throw new Error("expected a still dependency");

		const queue = new GenerationQueue({ batchSize: 1 });
		const commit = (node: typeof anim, url: string) =>
			queue.commitResult(node, { imageUrl: url, durationSec: 0 });

		commit(still, "still.png");
		commit(anim, "anim.png");
		expect(isNodeStale(anim, queue)).toBe(false);

		commit(still, "uploaded.png");
		expect(isNodeStale(anim, queue)).toBe(true);
	});

	it("visits a dependency shared by the element and its avatar only once", () => {
		const ids = idsOf(element("img", "image", { characters: "Alice" }));
		expect(ids.filter((id) => id === "project:artStyle")).toHaveLength(1);
	});
});
