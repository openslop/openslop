import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Descendant, Editor } from "slate";
import { splitAttributes } from "@/lib/canvas/elementAttributes";
import {
	SCENE_TYPE,
	type CanvasContentElement,
	type SceneElement,
} from "@/lib/canvas/types";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { createProjectStore, type ProjectStore } from "@/lib/project/store";
import { forElement } from "../graph";

// Real useMemo semantics: the value survives only while its deps are identical,
// which is the whole subject of these tests.
let slots: { deps?: unknown[]; value: unknown }[] = [];
let slot = 0;
const render = <T>(hook: () => T): T => {
	slot = 0;
	return hook();
};
vi.mock("react", () => ({
	useMemo: <T>(fn: () => T, deps?: unknown[]) => {
		const index = slot++;
		const cached = slots[index];
		const unchanged =
			cached?.deps &&
			deps &&
			cached.deps.length === deps.length &&
			cached.deps.every((dep, i) => Object.is(dep, deps[i]));
		if (unchanged) return cached.value as T;
		const value = fn();
		slots[index] = { deps, value };
		return value;
	},
}));

let children: Descendant[] = [];
// One editor for the life of a test, as Slate's own is: only `children` is
// swapped, and that swap is what a document revision means.
const editor = {
	get children() {
		return children;
	},
} as unknown as Editor;
vi.mock("slate-react", () => ({
	useSlateSelector: <T>(selector: (e: Editor) => T) => selector(editor),
	useSlateStatic: () => editor,
}));

vi.mock("@/lib/config/ConfigProvider", () => ({
	useConfig: () => ({ connectorConfig: DEFAULT_CONNECTOR_REGISTRY }),
}));

let store: ProjectStore;
vi.mock("@/lib/project/useProject", () => ({
	useProject: <T>(selector: (state: unknown) => T) =>
		selector(store.getState()),
}));

const { useNodeBuilder } = await import("../useNodeBuilder");

const video = (id: string, text: string): CanvasContentElement => ({
	id,
	type: "video",
	...splitAttributes({ continuity: "true" }),
	children: [{ id: `${id}-t`, type: "video", text }],
});

/** A document is a new array for every edit, as Slate hands it back. */
const document = (...elements: CanvasContentElement[]): Descendant[] => [
	{ id: "scene-1", type: SCENE_TYPE, children: elements } as SceneElement,
];

beforeEach(() => {
	slots = [];
	store = createProjectStore();
});

describe("useNodeBuilder", () => {
	it("keeps one builder while the document and the project state hold", () => {
		children = document(video("vid-1", "shot one"), video("vid-2", "shot two"));

		expect(render(useNodeBuilder)).toBe(render(useNodeBuilder));
	});

	// The regression: `vid-1` is edited in place, so the element ids and their
	// order are untouched. A builder keyed on those alone lived on, and every
	// graph memoized from it went on holding `vid-1` as it used to be.
	it("rebuilds when an element changes without moving", () => {
		const second = video("vid-2", "shot two");
		children = document(video("vid-1", "shot one"), second);
		const before = render(useNodeBuilder);

		children = document(video("vid-1", "shot one, rewritten"), second);

		expect(render(useNodeBuilder)).not.toBe(before);
	});

	it("reads an edited dependency as it is now, not as the graph first saw it", () => {
		const second = video("vid-2", "shot two");
		children = document(video("vid-1", "shot one"), second);
		render(useNodeBuilder);

		children = document(video("vid-1", "shot one, rewritten"), second);
		const dependency = render(useNodeBuilder)(
			forElement(second),
		).dependsOn.find((node) => node.id === "vid-1");

		expect(dependency?.inputs.prompt).toBe("shot one, rewritten");
	});

	it("rebuilds when the project state changes, which nodes also read", () => {
		children = document(video("vid-1", "shot one"));
		const before = render(useNodeBuilder);

		store.getState().updateMetadata({ style: "noir" });

		expect(render(useNodeBuilder)).not.toBe(before);
	});
});
