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

// Real useCallback semantics: the value survives only while its deps are
// identical, which is the whole subject of these tests.
let slots: { deps?: unknown[]; value: unknown }[] = [];
let slot = 0;
const render = <T>(hook: () => T): T => {
	slot = 0;
	return hook();
};
vi.mock("react", () => ({
	useCallback: <T>(fn: T, deps?: unknown[]) => {
		const index = slot++;
		const cached = slots[index];
		const unchanged =
			cached?.deps &&
			deps &&
			cached.deps.length === deps.length &&
			cached.deps.every((dep, i) => Object.is(dep, deps[i]));
		if (unchanged) return cached.value as T;
		slots[index] = { deps, value: fn };
		return fn;
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

const { useBuildContext } = await import("../useBuildContext");

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

describe("useBuildContext", () => {
	it("keeps its identity while the document is edited", () => {
		children = document(video("vid-1", "shot one"));
		const before = render(useBuildContext);

		children = document(video("vid-1", "shot one, rewritten"));

		expect(render(useBuildContext)).toBe(before);
	});

	it("reads the canvas when called, not when rendered", () => {
		children = document(video("vid-1", "shot one"));
		const context = render(useBuildContext);

		children = document(video("vid-1", "shot one, rewritten"));

		expect(context().canvas[0]?.children[0]?.text).toBe("shot one, rewritten");
	});

	it("changes when the project state changes, which a build also reads", () => {
		children = document(video("vid-1", "shot one"));
		const before = render(useBuildContext);

		store.getState().updateMetadata({ style: "noir" });

		expect(render(useBuildContext)).not.toBe(before);
	});
});
