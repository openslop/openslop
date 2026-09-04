import { createProjectStore } from "@/lib/project/store";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Descendant, Editor } from "slate";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import { GenerationQueue } from "@/lib/generation/queue";
import { forElement, type GenerationNode } from "@/lib/generation/graph";
import { nodeBuilder } from "@/lib/generation/resolveGraph";
import type { CanvasContentElement, SceneElement } from "@/lib/canvas/types";
import { splitAttributes } from "@/lib/video/elementAttributes";

const registry: ConnectorRegistry = {
	llm: {},
	tts: {},
	image: {},
	animated_image: {},
	video: {},
	sfx: {},
	music: {},
};

let editorUnderTest: Editor;

vi.mock("slate-react", () => ({
	useSlateSelector: <T>(selector: (editor: Editor) => T) =>
		selector(editorUnderTest),
}));

vi.mock("react", () => ({
	useCallback: <T>(fn: T) => fn,
	useMemo: <T>(fn: () => T) => fn(),
	useDeferredValue: <T>(value: T) => value,
}));

let queue: GenerationQueue;

vi.mock("@/lib/generation/GenerationQueueProvider", () => ({
	useGenerationQueue: () => queue,
	useQueueSelector: <T>(selector: (q: GenerationQueue) => T) => selector(queue),
}));

// The hook under test is about which elements get queued, so bind a real
// resolver rather than standing up the config and project providers.
const store = createProjectStore();

const resolve = () => nodeBuilder(registry, store.getState());

vi.mock("@/lib/generation/useNodeBuilder", () => ({
	useNodeBuilder: () => resolve(),
}));

function makeElement(
	id: string,
	type: CanvasContentElement["type"],
	text: string,
	attrs?: Record<string, string>,
): CanvasContentElement {
	return {
		id,
		type,
		...splitAttributes({ provider: "openslop", ...attrs }),
		children: [{ id: `${id}-t`, type, text }],
	};
}

function wrapInScene(elements: CanvasContentElement[]): SceneElement {
	return { id: "scene-1", type: "scene", children: elements };
}

/** Commit a result for `element` as if it had just been generated. */
function commitCurrent(element: CanvasContentElement) {
	const node = nodeBuilder(registry, store.getState())(forElement(element));
	queue.commitResult(node, {
		imageUrl: "https://example.com/asset.png",
		durationSec: 0,
	});
}

const { useGenerateAll } = await import("../hooks/useGenerateAll");
const { useGenerateScope } = await import("../hooks/useGenerateScope");

function useScopeForAll(elements: CanvasContentElement[]) {
	const children: Descendant[] = [wrapInScene(elements)];
	// Stands in for Slate's provider by seeding the document the selector reads.
	// eslint-disable-next-line react-hooks/globals
	editorUnderTest = { children } as unknown as Editor;
	return useGenerateAll();
}

function useGenerateAllFor(elements: CanvasContentElement[]) {
	useScopeForAll(elements).run();
	return enqueuedIds();
}

const enqueuedIds = (): string[] =>
	(enqueueGraphSpy.mock.calls[0]?.[0] as GenerationNode[] | undefined)?.map(
		(node) => node.id,
	) ?? [];

let enqueueGraphSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	vi.clearAllMocks();
	queue = new GenerationQueue();
	enqueueGraphSpy = vi
		.spyOn(queue, "enqueueGraph")
		.mockImplementation(() => {});
});

describe("useGenerateAll", () => {
	it("enqueues every element without a result", async () => {
		const ids = useGenerateAllFor([
			makeElement("a", "image", "sunset"),
			makeElement("b", "narration", "hello"),
		]);
		expect(ids).toEqual(["a", "b"]);
	});

	it("skips elements that already have a current result", async () => {
		const a = makeElement("a", "image", "sunset");
		commitCurrent(a);

		const ids = useGenerateAllFor([a, makeElement("b", "narration", "hello")]);
		expect(ids).toEqual(["b"]);
	});

	it("re-generates an element whose prompt drifted", async () => {
		commitCurrent(makeElement("a", "image", "old prompt"));

		const ids = useGenerateAllFor([
			makeElement("a", "image", "new prompt"),
			makeElement("b", "narration", "hello"),
		]);
		expect(ids).toEqual(["a", "b"]);
	});

	it("re-generates an element whose attributes drifted", async () => {
		commitCurrent(makeElement("a", "narration", "hello", { emotion: "calm" }));

		const ids = useGenerateAllFor([
			makeElement("a", "narration", "hello", { emotion: "happy" }),
			makeElement("b", "image", "sunset"),
		]);
		expect(ids).toEqual(["a", "b"]);
	});

	it("enqueues nothing when every element is current", async () => {
		const elements = [
			makeElement("a", "image", "sunset"),
			makeElement("b", "narration", "hello"),
		];
		elements.forEach(commitCurrent);

		expect(useGenerateAllFor(elements)).toEqual([]);
	});

	it("reports no pending work once every element is current", async () => {
		const elements = [
			makeElement("a", "image", "sunset"),
			makeElement("b", "narration", "hello"),
		];
		elements.forEach(commitCurrent);

		expect(useScopeForAll(elements)).toMatchObject({
			empty: false,
			active: false,
			pending: 0,
			stale: 0,
		});
	});

	it("counts the elements still to generate", async () => {
		const a = makeElement("a", "image", "sunset");
		commitCurrent(a);

		expect(
			useScopeForAll([a, makeElement("b", "narration", "hello")]),
		).toMatchObject({ pending: 1, stale: 0 });
	});

	it("is empty when nothing in scope carries a prompt", async () => {
		expect(useScopeForAll([makeElement("a", "image", "")])).toMatchObject({
			empty: true,
			pending: 0,
		});
	});

	it("does not include an uploaded image, which has no prompt", async () => {
		const uploaded = makeElement("a", "image", "");
		commitCurrent(uploaded);

		const ids = useGenerateAllFor([
			uploaded,
			makeElement("b", "narration", "hello"),
		]);
		expect(ids).toEqual(["b"]);
	});

	it("skips elements with blank prompts", async () => {
		const ids = useGenerateAllFor([
			makeElement("a", "image", "sunset"),
			makeElement("b", "narration", "   "),
		]);
		expect(ids).toEqual(["a"]);
	});
});

describe("useGenerateScope", () => {
	const sceneOne = [
		makeElement("a", "image", "sunset"),
		makeElement("b", "narration", "hello"),
	];
	const sceneTwo = [makeElement("c", "image", "a scene away")];

	it("enqueues only the elements it is given", async () => {
		useGenerateScope(sceneOne, "scene").run();
		expect(enqueuedIds()).toEqual(["a", "b"]);
	});

	it("queues nothing when the scope is already current", async () => {
		[...sceneOne, ...sceneTwo].forEach(commitCurrent);

		useGenerateScope(sceneTwo, "scene").run();
		expect(enqueuedIds()).toEqual([]);
	});

	it("leaves out an element from another scene of the same document", async () => {
		useGenerateAllFor([...sceneOne, ...sceneTwo]);
		expect(enqueuedIds()).toEqual(["a", "b", "c"]);

		vi.clearAllMocks();
		useGenerateScope(sceneTwo, "scene").run();
		expect(enqueuedIds()).toEqual(["c"]);
	});
});

describe("scope description", () => {
	const useDescription = (
		elements: CanvasContentElement[],
		subject: Parameters<typeof useGenerateScope>[1] = "project",
	) => useGenerateScope(elements, subject).description;

	it("reports no work when nothing in scope has a prompt", () => {
		expect(useDescription([makeElement("a", "image", "")], "scene")).toBe(
			"Nothing to generate right now",
		);
	});

	it("reports work already under way", () => {
		const running = {
			...queue.getElementSnapshot("a"),
			status: "generating" as const,
		};
		vi.spyOn(queue, "getElementSnapshot").mockReturnValue(running);

		expect(useDescription([makeElement("a", "image", "sunset")])).toBe(
			"Generating this project…",
		);
	});

	it("names the whole scope when none of it has run", () => {
		const elements = [
			makeElement("a", "image", "sunset"),
			makeElement("b", "narration", "hello"),
		];
		expect(useDescription(elements)).toBe(
			"Generate 2 elements in this project",
		);
	});

	it("reports the state, not a click, when every result is current", () => {
		const elements = [
			makeElement("a", "image", "sunset"),
			makeElement("b", "image", "sunrise"),
		];
		elements.forEach(commitCurrent);
		expect(useDescription(elements, "scene")).toBe(
			"Everything in this scene is generated",
		);
	});

	it("counts only the elements still to run when some are current", () => {
		const current = makeElement("a", "image", "sunset");
		commitCurrent(current);
		const elements = [
			current,
			makeElement("b", "image", "sunrise"),
			makeElement("c", "image", "moonrise"),
		];
		expect(useDescription(elements, "scene")).toBe(
			"Generate 2 elements in this scene",
		);
	});

	it("calls it a regenerate when every stale element has a result", () => {
		const elements = [
			makeElement("a", "image", "sunset"),
			makeElement("b", "image", "sunrise"),
		];
		elements.forEach(commitCurrent);
		elements[1].children[0].text = "moonrise";

		expect(useDescription(elements, "scene")).toBe(
			"Regenerate 1 stale element in this scene",
		);
	});

	it("splits a mixed scope into what is new and what is stale", () => {
		const drifted = makeElement("a", "image", "sunset");
		commitCurrent(drifted);
		drifted.children[0].text = "moonrise";

		const elements = [
			drifted,
			makeElement("b", "image", "sunrise"),
			makeElement("c", "narration", "hello"),
		];
		expect(useDescription(elements, "scene")).toBe(
			"Generate 2 elements and regenerate 1 stale in this scene",
		);
	});

	it("says element in the singular", () => {
		const current = makeElement("a", "image", "sunset");
		commitCurrent(current);
		expect(
			useDescription([current, makeElement("b", "image", "sunrise")], "scene"),
		).toBe("Generate 1 element in this scene");
		expect(useDescription([current], "scene")).toBe(
			"Everything in this scene is generated",
		);
	});
});
