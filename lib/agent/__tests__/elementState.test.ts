import { describe, expect, it, vi } from "vitest";
import type { AssetResult } from "@/lib/connectors/types";
import type { GenerationNode } from "@/lib/generation/graph";
import { GenerationQueue } from "@/lib/generation/queue";
import { staleReason } from "@/lib/generation/staleReason";
import { elementState } from "../elementState";
import { EMPTY_CONTEXT } from "@/lib/generation/__tests__/_context";
import { jobNode } from "@/lib/generation/__tests__/_graph";

vi.mock("@/lib/generation/generationGraph", async (original) => ({
	...(await original<typeof import("@/lib/generation/generationGraph")>()),
	rebuildNode: (node: GenerationNode) => node,
}));

vi.mock("@/lib/generation/generateForElement", () => ({
	generateForElement: () => new Promise(() => {}),
}));

const node = (id: string, prompt = id, reads: Record<string, string> = {}) =>
	jobNode(id, [], { prompt, reads });

const image = (imageUrl: string): AssetResult => ({ imageUrl, durationSec: 0 });

const stateOf = (target: GenerationNode, queue: GenerationQueue) =>
	elementState(
		target.id,
		queue.getElementSnapshot(target.id),
		staleReason(target, queue),
	);

describe("elementState", () => {
	it("reads an element that never ran as ungenerated, not as an error", () => {
		expect(stateOf(node("a"), new GenerationQueue())).toEqual({
			id: "a",
			state: "ungenerated",
		});
	});

	it("reads a settled result as generated", () => {
		const queue = new GenerationQueue();
		queue.commitResult(node("a"), image("a.png"));

		expect(stateOf(node("a"), queue)).toEqual({ id: "a", state: "generated" });
	});

	it("reads a drifted result as stale, with the reason the badge shows", () => {
		const queue = new GenerationQueue();
		queue.commitResult(node("a", "a knight"), image("a.png"));

		expect(stateOf(node("a", "a wizard"), queue)).toEqual({
			id: "a",
			state: "stale",
			detail: "The prompt changed — regenerate to update",
		});
	});

	it("reads an upload as pinned, however far the element has drifted", () => {
		const queue = new GenerationQueue();
		queue.commitResult(node("a", "a knight"), image("up.png"), {
			pinned: true,
		});

		expect(stateOf(node("a", "a wizard"), queue)).toEqual({
			id: "a",
			state: "pinned",
		});
	});

	it("names what the element reads when only that changed", () => {
		const queue = new GenerationQueue();
		queue.commitResult(
			node("a", "a", { "the art style": "ink" }),
			image("a.png"),
		);

		expect(stateOf(node("a", "a", { "the art style": "oil" }), queue)).toEqual({
			id: "a",
			state: "stale",
			detail: "The art style changed — regenerate to update",
		});
	});

	it("reads a failure with its error", () => {
		const queue = new GenerationQueue();
		queue.setError("a", "Provider returned 503");

		expect(stateOf(node("a"), queue)).toEqual({
			id: "a",
			state: "failed",
			detail: "Provider returned 503",
		});
	});

	it("reads what the queue is working on by its status", () => {
		const queue = new GenerationQueue({ limits: { image: 1 } });
		queue.enqueueGraph([node("a"), node("b")], () => EMPTY_CONTEXT);

		expect(stateOf(node("a"), queue).state).toBe("generating");
		expect(stateOf(node("b"), queue).state).toBe("queued");

		queue.cancelAll();
	});
});
