import { describe, expect, it, vi } from "vitest";
import type { GenerationNode } from "../graph";
import { GenerationQueue } from "../queue";
import { generationInputs, isNodeStale, needsGeneration } from "../staleness";
import { jobNode as node } from "./_graph";

const commit = (queue: GenerationQueue, target: GenerationNode, url: string) =>
	queue.commitResult(target, { imageUrl: url, durationSec: 0 });

describe("generationInputs", () => {
	it("records each dependency's result, blank before it has one, and what the node read", () => {
		const queue = new GenerationQueue();
		const avatar = node("avatar");
		const image = node("image", [avatar, node("previous")], {
			"the aspect ratio": "16:9",
		});
		commit(queue, avatar, "avatar.png");

		const { dependencies, reads } = generationInputs(image, queue);

		expect(dependencies.avatar).toContain("avatar.png");
		expect(dependencies.previous).toBe("");
		expect(reads).toEqual({ "the aspect ratio": "16:9" });
	});
});

describe("isNodeStale", () => {
	it("is false for a node with no result yet", () => {
		const queue = new GenerationQueue();
		expect(isNodeStale(node("a"), queue)).toBe(false);
	});

	it("is false right after a result is committed", () => {
		const queue = new GenerationQueue();
		const avatar = node("avatar");
		const image = node("image", [avatar]);
		commit(queue, avatar, "avatar.png");
		commit(queue, image, "image.png");

		expect(isNodeStale(image, queue)).toBe(false);
	});

	it("is true once a dependency resolves to a different output", () => {
		const queue = new GenerationQueue();
		const avatar = node("avatar");
		const image = node("image", [avatar]);
		commit(queue, avatar, "avatar.png");
		commit(queue, image, "image.png");
		expect(isNodeStale(image, queue)).toBe(false);

		commit(queue, avatar, "avatar-v2.png");
		expect(isNodeStale(image, queue)).toBe(true);
	});

	it("is true once something it read changes", () => {
		const queue = new GenerationQueue();
		const framed = (aspectRatio: string) =>
			node("image", [], { "the aspect ratio": aspectRatio });
		commit(queue, framed("16:9"), "image.png");

		expect(isNodeStale(framed("16:9"), queue)).toBe(false);
		expect(isNodeStale(framed("9:16"), queue)).toBe(true);
	});

	it("propagates through a dependency that itself needs regenerating", () => {
		const queue = new GenerationQueue();
		const avatar = (style: string) =>
			node("avatar", [], { "the art style": style });
		const image = (style: string) => node("image", [avatar(style)]);

		commit(queue, avatar("noir"), "avatar.png");
		commit(queue, image("noir"), "image.png");
		expect(isNodeStale(image("noir"), queue)).toBe(false);

		expect(needsGeneration(avatar("watercolor"), queue)).toBe(true);
		expect(isNodeStale(image("watercolor"), queue)).toBe(true);
	});

	// commitResult is the "the queue did not generate this" path: uploads and
	// template seeds. It pins, so project state drifting cannot overwrite them.
	it("never marks a committed upload stale, however far its inputs drift", () => {
		const queue = new GenerationQueue();
		const uploaded = (style: string) =>
			node("el", [], { "the art style": style });
		queue.commitResult(
			uploaded("noir"),
			{ imageUrl: "uploaded.png", durationSec: 0 },
			{ pinned: true },
		);

		expect(isNodeStale(uploaded("watercolor"), queue)).toBe(false);
		expect(needsGeneration(uploaded("watercolor"), queue)).toBe(false);
	});

	it("still generates a pinned node that has no result yet", () => {
		const queue = new GenerationQueue();
		queue.discard("el");
		expect(needsGeneration(node("el"), queue)).toBe(true);
	});

	it("judges again when the result it holds is committed for other inputs", () => {
		const queue = new GenerationQueue();
		const result = { imageUrl: "image.png", durationSec: 0 };
		const withRefs = (aspectRatio: string) =>
			node("image", [], { "the aspect ratio": aspectRatio });
		const edited = withRefs("9:16");
		queue.commitResult(withRefs("16:9"), result);
		expect(needsGeneration(edited, queue)).toBe(true);

		queue.commitResult(edited, result);
		expect(needsGeneration(edited, queue)).toBe(false);
	});

	it("judges a chain once, not once per dependent", () => {
		const queue = new GenerationQueue();
		const chain: GenerationNode[] = [];
		for (let i = 0; i < 50; i++) chain.push(node(`shot-${i}`, chain.slice(-1)));
		for (const shot of chain) commit(queue, shot, `${shot.id}.png`);
		const read = vi.spyOn(queue, "getElementSnapshot");

		expect(chain.some((shot) => needsGeneration(shot, queue))).toBe(false);
		expect(read.mock.calls.length).toBeLessThanOrEqual(2 * chain.length);
	});
});
