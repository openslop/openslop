// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { Descendant } from "slate";
import { getCanvasElements } from "@/lib/canvas/assets";
import { createCanvasElement } from "@/lib/canvas/createCanvasElement";
import {
	SCENE_TYPE,
	type ContentElement,
	type GeneratedElement,
} from "@/lib/canvas/types";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { createProjectStore, type ProjectContext } from "@/lib/project/store";
import type { GenerationNode } from "../graph";
import { LiveGraphProvider, useResolveNode } from "../LiveGraphProvider";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const editor = { children: [] as Descendant[] };
vi.mock("slate-react", () => ({ useSlateStatic: () => editor }));

const store = createProjectStore();
const state = store.getState();
const contextNow = () =>
	vi.fn(() => ({
		state,
		canvas: getCanvasElements(editor.children),
		registry: DEFAULT_CONNECTOR_REGISTRY,
		setAsset: () => {},
	}));
let buildContext = contextNow();
vi.mock("../useBuildContext", () => ({ useBuildContext: () => buildContext }));
vi.mock("@/lib/project/useProject", async () => {
	const { useStore } = await import("zustand");
	return {
		useProject: <T,>(selector: (state: ProjectContext) => T) =>
			useStore(store, selector),
	};
});

type Resolve = (element: GeneratedElement) => GenerationNode;
let resolve: Resolve;
function Reader({ onRead }: { onRead: (resolve: Resolve) => void }) {
	onRead(useResolveNode());
	return null;
}

const container = document.body.appendChild(document.createElement("div"));
let root: Root;
const render = () =>
	act(() =>
		root.render(
			<LiveGraphProvider>
				<Reader onRead={(read) => (resolve = read)} />
			</LiveGraphProvider>,
		),
	);

const element = (id: string, text: string): ContentElement => ({
	id,
	type: "image",
	children: [{ id: `${id}-t`, type: "image", text }],
});

const edit = (...elements: ContentElement[]) => {
	editor.children = [{ id: "scene-1", type: SCENE_TYPE, children: elements }];
};

beforeEach(() => {
	root = createRoot(container);
	buildContext = contextNow();
	edit();
});

afterEach(() => act(() => root.unmount()));

describe("LiveGraphProvider", () => {
	it("builds a revision once, however many read it", () => {
		const image = element("img", "a sunset");
		const other = element("other", "a sunrise");
		edit(image, other);
		render();

		const node = resolve(image);
		resolve(other);

		expect(resolve(image)).toBe(node);
		expect(buildContext).toHaveBeenCalledTimes(1);
	});

	it("builds a new revision when the document changes", () => {
		const image = element("img", "a sunset");
		edit(image);
		render();
		resolve(image);

		edit(element("img", "a sunrise"));

		expect(resolve(image).inputs.prompt).toBe("a sunrise");
		expect(buildContext).toHaveBeenCalledTimes(2);
	});

	it("builds a new revision when an asset joins the document", () => {
		const image = element("img", "a sunset");
		edit(image);
		render();
		resolve(image);

		editor.children = [
			createCanvasElement("asset_style", { text: "noir" }),
			...editor.children,
		];

		expect(resolve(image).inputs.reads["the art style"]).toBe("noir");
	});

	it("builds a new revision when the settings change", () => {
		const image = element("img", "a sunset");
		edit(image);
		render();
		resolve(image);

		act(() => store.getState().updateVideoSettings({ aspectRatio: "9:16" }));
		resolve(image);

		expect(buildContext).toHaveBeenCalledTimes(2);
	});
});
