import { describe, expect, it, vi } from "vitest";
import type { Editor } from "slate";
import { SCENE_TYPE } from "@/lib/canvas/types";
import { createViewModeStore } from "../ViewModeContext";

const editorWith = (...sceneIds: string[]) =>
	({
		children: sceneIds.map((id) => ({
			type: SCENE_TYPE,
			id,
			children: [],
		})),
	}) as unknown as Editor;

describe("createViewModeStore", () => {
	it("starts fully expanded", () => {
		const store = createViewModeStore(editorWith("scene-1"));
		expect(store.isCollapsed("scene-1")).toBe(false);
		expect(store.hasCollapsed()).toBe(false);
	});

	it("toggles one scene without touching the others", () => {
		const store = createViewModeStore(editorWith("scene-1", "scene-2"));

		store.toggle("scene-1");
		expect(store.isCollapsed("scene-1")).toBe(true);
		expect(store.isCollapsed("scene-2")).toBe(false);
		expect(store.hasCollapsed()).toBe(true);

		store.toggle("scene-1");
		expect(store.isCollapsed("scene-1")).toBe(false);
		expect(store.hasCollapsed()).toBe(false);
	});

	it("collapses every scene in the document and expands them again", () => {
		const store = createViewModeStore(editorWith("scene-1", "scene-2"));

		store.collapseAll();
		expect(store.isCollapsed("scene-1")).toBe(true);
		expect(store.isCollapsed("scene-2")).toBe(true);

		store.expandAll();
		expect(store.hasCollapsed()).toBe(false);
	});

	it("notifies subscribers on every write", () => {
		const store = createViewModeStore(editorWith("scene-1"));
		const listener = vi.fn();
		store.subscribe(listener);

		store.toggle("scene-1");
		store.collapseAll();
		store.expandAll();
		expect(listener).toHaveBeenCalledTimes(3);
	});

	it("stops notifying once unsubscribed", () => {
		const store = createViewModeStore(editorWith("scene-1"));
		const listener = vi.fn();
		store.subscribe(listener)();

		store.toggle("scene-1");
		expect(listener).not.toHaveBeenCalled();
	});
});
