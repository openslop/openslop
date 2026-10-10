// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createEditor, Transforms, type Descendant } from "slate";
import { Slate, withReact } from "slate-react";
import { SCENE_TYPE } from "@/lib/canvas/types";
import { useSceneIndex } from "../hooks/use-scene-index";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const scene = (id: string): Descendant => ({
	id,
	type: SCENE_TYPE,
	children: [
		{
			id: `${id}-image`,
			type: "image",
			children: [{ id: `${id}-text`, type: "image", text: "a sunset" }],
		},
	],
});

function SceneNumber({ sceneId }: { sceneId: string }) {
	return useSceneIndex(sceneId);
}

const container = document.body.appendChild(document.createElement("div"));
let root: Root;
const editor = withReact(createEditor());

beforeEach(async () => {
	root = createRoot(container);
	await act(async () =>
		root.render(
			<Slate
				editor={editor}
				initialValue={[scene("scene-1"), scene("scene-2"), scene("scene-3")]}
			>
				<SceneNumber sceneId="scene-3" />
			</Slate>,
		),
	);
});

afterEach(() => act(() => root.unmount()));

describe("useSceneIndex", () => {
	it("numbers a scene by its place in the document", () => {
		expect(container.textContent).toBe("3");
	});

	it("renumbers a scene when one before it is deleted", async () => {
		await act(async () => Transforms.removeNodes(editor, { at: [0] }));

		expect(container.textContent).toBe("2");
	});

	it("renumbers a scene when it is moved", async () => {
		await act(async () => Transforms.moveNodes(editor, { at: [2], to: [0] }));

		expect(container.textContent).toBe("1");
	});
});
