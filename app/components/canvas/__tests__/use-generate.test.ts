import { beforeEach, describe, expect, it, vi } from "vitest";
import { element } from "@/lib/canvas/__tests__/_assets";
import type { ContentElement, GeneratedElement } from "@/lib/canvas/types";
import type { GenerationNode } from "@/lib/generation/graph";
import { GenerationQueue } from "@/lib/generation/queue";
import { needsGeneration } from "@/lib/generation/staleness";
import { buildNode, createGraphFor } from "@/lib/generation/generation-graph";
import { buildCtx } from "@/lib/generation/__tests__/_context";

// Memos hold across renders, as React's do: the bug is a graph kept from an
// earlier render. Each render reads its slots back in call order.
let slots: unknown[] = [];
let slot = 0;
const render = <T>(hook: () => T): T => {
	slot = 0;
	return hook();
};

vi.mock("react", () => ({
	useCallback: <T>(fn: T) => fn,
	useMemo: <T>(fn: () => T) => {
		const index = slot++;
		if (!(index in slots)) slots[index] = fn();
		return slots[index] as T;
	},
}));

vi.mock("slate-react", () => ({
	useSlateStatic: () => ({}),
	useSlateSelector: <T>(selector: () => T) => selector(),
}));

let queue: GenerationQueue;
vi.mock("@/lib/generation/generation-queue-provider", () => ({
	useGenerationQueue: () => queue,
	useQueueSelector: <T>(selector: (q: GenerationQueue) => T) => selector(queue),
}));

let canvas: ContentElement[] = [];
// Like the real hook, the context keeps its identity while text inside an
// element changes, and reads the canvas when it is made.
const buildContext = () => buildCtx(canvas);
vi.mock("@/lib/generation/use-build-context", () => ({
	useBuildContext: () => buildContext,
}));
const graphFor = createGraphFor();
vi.mock("@/lib/generation/live-graph-provider", () => ({
	useResolveNode: () => (target: GeneratedElement) =>
		graphFor(buildContext, canvas).resolve(target),
}));

const { useGenerate } = await import("../hooks/use-generate");
const { useGenerateScope } = await import("../hooks/use-generate-scope");

const image = element("img", "image", "a sunset");
const video = element("vid", "video", "Shot 1: slow pan", {
	startFrame: "previous",
});
const edited = element("img", "image", "a sunrise");

/** The image as it was regenerated from its own card: current, not stale. */
function regenerateImageFromItsCard() {
	canvas = [edited, video];
	queue.commitResult(buildNode(edited, buildContext()), {
		imageUrl: "https://img/sunrise.png",
		durationSec: 0,
	});
}

const queuedImage = (spy: ReturnType<typeof vi.spyOn>) => {
	const roots = spy.mock.calls[0]?.[0] as GenerationNode[];
	return roots[0]?.dependsOn["the previous visual"];
};

let enqueue: ReturnType<typeof vi.spyOn>;

const useVideoGeneration = () => useGenerate(video);
const useVideoScope = () => useGenerateScope(() => [video], "scene");

beforeEach(() => {
	slots = [];
	queue = new GenerationQueue();
	enqueue = vi.spyOn(queue, "enqueueGraph").mockImplementation(() => {});
	canvas = [image, video];
});

describe("generating after the element it depends on changed", () => {
	it("reads that element as it is now, so a current one is not queued again", () => {
		render(useVideoGeneration);
		regenerateImageFromItsCard();

		render(useVideoGeneration).generate();

		const dependency = queuedImage(enqueue);
		expect(dependency?.inputs.prompt).toBe("a sunrise");
		expect(dependency && needsGeneration(dependency, queue)).toBe(false);
	});

	it("does the same when a whole scope is generated", () => {
		render(useVideoScope);
		regenerateImageFromItsCard();

		render(useVideoScope).run();

		const dependency = queuedImage(enqueue);
		expect(dependency?.inputs.prompt).toBe("a sunrise");
		expect(dependency && needsGeneration(dependency, queue)).toBe(false);
	});
});
