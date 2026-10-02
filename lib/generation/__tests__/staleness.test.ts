import { describe, expect, it, vi } from "vitest";
import { sourceNode, type GenerationNode } from "../graph";
import { GenerationQueue } from "../queue";
import { generationInputs, isNodeStale, needsGeneration } from "../staleness";
import { jobNode as node } from "./_graph";

const commit = (queue: GenerationQueue, target: GenerationNode, url: string) =>
	queue.commitResult(target, { imageUrl: url, durationSec: 0 });

describe("generationInputs", () => {
	it("records what each dependency resolved to", () => {
		const queue = new GenerationQueue();
		const avatar = node("avatar");
		const image = node("image", [
			avatar,
			sourceNode("project:refs", { urls: "a.png" }),
		]);
		commit(queue, avatar, "avatar.png");

		expect(generationInputs(image, queue).dependencies).toEqual({
			avatar: "avatar.png",
			"project:refs": JSON.stringify({
				prompt: "",
				attributes: { urls: "a.png" },
				dependencies: {},
			}),
		});
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

	it("is true when a source node's inputs change, without regenerating anything", () => {
		const queue = new GenerationQueue();
		const withRefs = (urls: string) =>
			node("image", [sourceNode("project:refs", { urls })]);
		commit(queue, withRefs("a.png"), "image.png");

		expect(isNodeStale(withRefs("a.png"), queue)).toBe(false);
		expect(isNodeStale(withRefs("a.png,b.png"), queue)).toBe(true);
	});

	it("propagates through a dependency that itself needs regenerating", () => {
		const queue = new GenerationQueue();
		const refs = (urls: string) => sourceNode("project:refs", { urls });
		const avatar = (urls: string) => node("avatar", [refs(urls)]);
		const image = (urls: string) => node("image", [avatar(urls)]);

		commit(queue, avatar("a.png"), "avatar.png");
		commit(queue, image("a.png"), "image.png");
		expect(isNodeStale(image("a.png"), queue)).toBe(false);

		// Changing refs makes the avatar stale, which makes the image stale too.
		expect(needsGeneration(avatar("b.png"), queue)).toBe(true);
		expect(isNodeStale(image("b.png"), queue)).toBe(true);
	});

	// commitResult is the "the queue did not generate this" path: uploads and
	// template seeds. It pins, so project state drifting cannot overwrite them.
	it("never marks a committed upload stale, however far its inputs drift", () => {
		const queue = new GenerationQueue();
		const uploaded = (style: string) =>
			node("el", [sourceNode("project:artStyle", { style })]);
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
		const withRefs = (urls: string) =>
			node("image", [sourceNode("project:refs", { urls })]);
		const edited = withRefs("b.png");
		queue.commitResult(withRefs("a.png"), result);
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

	it("never marks a source node stale", () => {
		const queue = new GenerationQueue();
		expect(isNodeStale(sourceNode("project:refs", { urls: "a" }), queue)).toBe(
			false,
		);
	});
});
