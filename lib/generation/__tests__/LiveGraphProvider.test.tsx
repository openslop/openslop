// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { Descendant } from "slate";
import { getContentElements } from "@/lib/canvas/scenes";
import { SCENE_TYPE, type CanvasContentElement } from "@/lib/canvas/types";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { createProjectStore } from "@/lib/project/store";
import { forElement, type GenerationNode, type NodeSpec } from "../graph";
import { LiveGraphProvider, useResolveNode } from "../LiveGraphProvider";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const editor = { children: [] as Descendant[] };
vi.mock("slate-react", () => ({ useSlateStatic: () => editor }));

const store = createProjectStore();
const contextNow = () =>
	vi.fn(() => ({
		store,
		state: store.getState(),
		canvas: getContentElements(editor.children),
		registry: DEFAULT_CONNECTOR_REGISTRY,
	}));
let context = contextNow();
vi.mock("../useBuildContext", () => ({ useBuildContext: () => context }));

type Resolve = (spec: NodeSpec) => GenerationNode;
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

const element = (id: string, text: string): CanvasContentElement => ({
	id,
	type: "image",
	children: [{ id: `${id}-t`, type: "image", text }],
});

const edit = (...elements: CanvasContentElement[]) => {
	editor.children = [{ id: "scene-1", type: SCENE_TYPE, children: elements }];
};

beforeEach(() => {
	root = createRoot(container);
	context = contextNow();
	edit();
});

afterEach(() => act(() => root.unmount()));

describe("LiveGraphProvider", () => {
	it("builds a revision once, however many read it", () => {
		const image = element("img", "a sunset");
		const other = element("other", "a sunrise");
		edit(image, other);
		render();

		const node = resolve(forElement(image));
		resolve(forElement(other));

		expect(resolve(forElement(image))).toBe(node);
		expect(context).toHaveBeenCalledTimes(1);
	});

	it("builds a new revision when the document changes", () => {
		const image = element("img", "a sunset");
		edit(image);
		render();
		resolve(forElement(image));

		edit(element("img", "a sunrise"));

		expect(resolve(forElement(image)).inputs.prompt).toBe("a sunrise");
		expect(context).toHaveBeenCalledTimes(2);
	});

	it("builds a new revision when the project context changes", () => {
		const image = element("img", "a sunset");
		edit(image);
		render();
		resolve(forElement(image));

		store.getState().updateMetadata({ style: "noir" });
		context = contextNow();
		render();

		expect(
			resolve(forElement(image)).dependsOn.artStyle?.node.inputs.attributes
				.style,
		).toBe("noir");
	});
});
