import { describe, expect, it } from "vitest";
import { createEditor, type Editor } from "slate";
import type { DragOverEvent } from "@dnd-kit/core";
import { resolveDragTransfer } from "../dnd/useDragAndDrop";

function makeEditor(): Editor {
	const editor = createEditor();
	editor.children = [
		{
			id: "scene-1",
			type: "scene",
			children: [
				{ id: "a", type: "narration", children: [{ text: "" }] },
				{ id: "b", type: "narration", children: [{ text: "" }] },
			],
		},
		{
			id: "scene-2",
			type: "scene",
			children: [{ id: "c", type: "narration", children: [{ text: "" }] }],
		},
	] as unknown as Editor["children"];
	return editor;
}

const dragOver = (
	activeId: string,
	activeSceneId: string | undefined,
	over: { id: string; sceneId?: string } | null,
) =>
	({
		active: { id: activeId, data: { current: { sceneId: activeSceneId } } },
		over: over && {
			id: over.id,
			data: { current: { sceneId: over.sceneId } },
		},
	}) as unknown as DragOverEvent;

describe("resolveDragTransfer", () => {
	it("proposes a transfer at the hovered element's index in the target scene", () => {
		expect(
			resolveDragTransfer(
				makeEditor(),
				dragOver("a", "scene-1", { id: "c", sceneId: "scene-2" }),
			),
		).toEqual({
			itemId: "a",
			fromSceneId: "scene-1",
			toSceneId: "scene-2",
			atIndex: 0,
		});
	});

	it("clears the transfer once the pointer leaves every droppable", () => {
		expect(
			resolveDragTransfer(makeEditor(), dragOver("a", "scene-1", null)),
		).toBe(null);
	});

	it("clears the transfer when the hover target is missing a scene id", () => {
		expect(
			resolveDragTransfer(
				makeEditor(),
				dragOver("a", "scene-1", { id: "c", sceneId: undefined }),
			),
		).toBe(null);
	});

	it("clears the transfer when the hovered element is unknown to the editor", () => {
		expect(
			resolveDragTransfer(
				makeEditor(),
				dragOver("a", "scene-1", { id: "ghost", sceneId: "scene-2" }),
			),
		).toBe(null);
	});

	it("returns null for a same-scene reorder", () => {
		expect(
			resolveDragTransfer(
				makeEditor(),
				dragOver("a", "scene-1", { id: "b", sceneId: "scene-1" }),
			),
		).toBe(null);
	});

	it("appends to the end when hovering the target scene itself", () => {
		const event = {
			active: { id: "a", data: { current: { sceneId: "scene-1" } } },
			over: { id: "scene-2", data: { current: { sceneId: "scene-2" } } },
		} as unknown as DragOverEvent;

		expect(resolveDragTransfer(makeEditor(), event)).toMatchObject({
			toSceneId: "scene-2",
			atIndex: 1,
		});
	});
});
