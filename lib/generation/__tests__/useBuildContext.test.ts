import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEditor, type Descendant } from "slate";
import { findAsset, getAssets } from "@/lib/canvas/assets";
import { createCanvasNode } from "@/lib/canvas/createCanvasNode";
import {
	flatAttributes,
	splitAttributes,
} from "@/lib/canvas/elementAttributes";
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

// One editor for the life of a test, as Slate's own is: only `children` is
// swapped, and that swap is what a document revision means.
const editor = createEditor();
editor.defaultModels = () => ({});
let children: Descendant[] = [];
Object.defineProperty(editor, "children", {
	get: () => children,
	set: (next: Descendant[]) => {
		children = next;
	},
});
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
vi.mock("@/lib/project/ProjectStoreProvider", () => ({
	useProjectStoreHandle: () => store,
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

		store.getState().updateVideoSettings({ aspectRatio: "9:16" });

		expect(render(useBuildContext)).not.toBe(before);
	});

	it("reads every element of the document, assets first", () => {
		const style = createCanvasNode("style", { text: "noir" });
		children = [style, ...document(video("vid-1", "shot one"))];

		const { canvas } = render(useBuildContext)();

		expect(canvas.map(({ id }) => id)).toEqual(["style", "vid-1"]);
	});

	it.each([
		["merges a write onto the asset it names", [{ gender: "feminine" }]],
		["creates the asset a write names when it is missing", []],
	])("%s", (_, existing) => {
		const voices = existing.map((attrs) =>
			createCanvasNode("voice", { attrs }),
		);
		children = [...voices, ...document(video("vid-1", "shot one"))];

		render(useBuildContext)().setAsset({
			type: "voice",
			attrs: { voiceId: "v1" },
		});

		const written = findAsset(children, "voice");
		expect(getAssets(children)).toHaveLength(1);
		expect(written && flatAttributes(written)).toMatchObject({
			...existing[0],
			voiceId: "v1",
		});
	});
});
