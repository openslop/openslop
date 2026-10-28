// @vitest-environment happy-dom

import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { DndContext } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { createEditor, type Editor } from "slate";
import { Slate, withReact, type RenderElementProps } from "slate-react";
import { afterEach, expect, it } from "vitest";
import { canvasCollisionDetection } from "../dnd/collision-detection";
import { SortableItem } from "../dnd/sortable-item";
import { useDragAndDrop } from "../dnd/use-drag-and-drop";
import { content, scene } from "./fixtures";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root;
let editor: Editor;
const container = document.body.appendChild(document.createElement("div"));

function SortableScene({
	id,
	includeInsertMenu = false,
}: {
	id: string;
	includeInsertMenu?: boolean;
}) {
	return (
		<SortableItem
			sceneId={id}
			sortableType="scene"
			wrapperClassName={`test-${id}`}
			insertMenu={
				includeInsertMenu ? <button type="button">+</button> : undefined
			}
			attributes={{} as RenderElementProps["attributes"]}
			block={scene([content("image", `${id}-image`)], id)}
		>
			{id}
		</SortableItem>
	);
}

function KeyboardSortingProbe({
	includeInsertMenu = false,
}: {
	includeInsertMenu?: boolean;
}) {
	const {
		sceneItems,
		sensors,
		handleDragStart,
		handleDragOver,
		handleDragEnd,
		handleDragCancel,
	} = useDragAndDrop(editor);
	return (
		<DndContext
			sensors={sensors}
			collisionDetection={canvasCollisionDetection}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
			onDragCancel={handleDragCancel}
		>
			<SortableContext
				items={sceneItems}
				strategy={verticalListSortingStrategy}
			>
				{sceneItems.map((id) => (
					<SortableScene
						key={id}
						id={id}
						includeInsertMenu={includeInsertMenu}
					/>
				))}
			</SortableContext>
		</DndContext>
	);
}

async function mountCanvas(children: ReactNode) {
	editor = withReact(createEditor());
	root = createRoot(container);
	await act(async () =>
		root.render(
			<Slate
				editor={editor}
				initialValue={[
					scene([content("image", "image-1")], "scene-1"),
					scene([content("image", "image-2")], "scene-2"),
				]}
			>
				{children}
			</Slate>,
		),
	);
}

function dragHandles() {
	return Array.from(
		container.querySelectorAll<HTMLButtonElement>(
			'button[aria-label="Drag to reorder"]',
		),
	);
}

function setSortableBounds(handles: HTMLButtonElement[]) {
	handles.forEach((handle, index) => {
		const sortable = handle.parentElement?.parentElement?.parentElement;
		if (!sortable) throw new Error("drag handle is missing its sortable item");
		const top = index * 100;
		Object.defineProperty(sortable, "getBoundingClientRect", {
			value: () => ({
				top,
				bottom: top + 100,
				left: 0,
				right: 300,
				width: 300,
				height: 100,
				x: 0,
				y: top,
				toJSON: () => ({}),
			}),
		});
	});
}

async function pressKey(target: EventTarget, code: string, key: string) {
	await act(async () => {
		target.dispatchEvent(
			new KeyboardEvent("keydown", {
				bubbles: true,
				cancelable: true,
				code,
				key,
			}),
		);
		await new Promise((resolve) => setTimeout(resolve, 0));
	});
}

afterEach(() => act(() => root.unmount()));

it("reorders scenes with the keyboard", async () => {
	await mountCanvas(<KeyboardSortingProbe />);
	const handles = dragHandles();
	setSortableBounds(handles);

	const [firstHandle] = handles;
	const instructionId = firstHandle.getAttribute("aria-describedby");
	expect(instructionId).toBeTruthy();
	expect(document.getElementById(instructionId ?? "")?.textContent).toContain(
		"To pick up a draggable item",
	);
	firstHandle.focus();
	await pressKey(firstHandle, "Space", " ");
	expect(document.body.textContent).toContain(
		"Draggable item scene-1 was moved over droppable area scene-1.",
	);
	await pressKey(document, "ArrowDown", "ArrowDown");
	await pressKey(document, "Space", " ");

	expect(editor.children.map((node) => node.id)).toEqual([
		"scene-2",
		"scene-1",
	]);
});

it("preserves drag-handle focus when another control precedes it", async () => {
	await mountCanvas(<KeyboardSortingProbe includeInsertMenu />);
	const handles = dragHandles();
	setSortableBounds(handles);

	const [firstHandle] = handles;
	firstHandle.focus();
	await pressKey(firstHandle, "Space", " ");
	await pressKey(document, "ArrowDown", "ArrowDown");
	await pressKey(document, "Space", " ");

	expect(document.activeElement).toBe(firstHandle);
});
