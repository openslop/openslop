import { describe, expect, it, vi } from "vitest";
import { createViewModeStore } from "../ViewModeContext";

const store = (sceneIds: string[] = ["scene-1", "scene-2"]) =>
	createViewModeStore(() => sceneIds);

describe("createViewModeStore", () => {
	it("starts with every scene expanded", () => {
		const mode = store();

		expect(mode.isCollapsed("scene-1")).toBe(false);
		expect(mode.hasCollapsed()).toBe(false);
	});

	it("folds and unfolds one scene, leaving the others alone", () => {
		const mode = store();

		mode.toggle("scene-1");
		expect(mode.isCollapsed("scene-1")).toBe(true);
		expect(mode.isCollapsed("scene-2")).toBe(false);
		expect(mode.hasCollapsed()).toBe(true);

		mode.toggle("scene-1");
		expect(mode.isCollapsed("scene-1")).toBe(false);
		expect(mode.hasCollapsed()).toBe(false);
	});

	it("collapses the scenes the document holds when asked, not when made", () => {
		const sceneIds = ["scene-1"];
		const mode = store(sceneIds);
		sceneIds.push("scene-2");

		mode.collapseAll();

		expect(mode.isCollapsed("scene-1")).toBe(true);
		expect(mode.isCollapsed("scene-2")).toBe(true);
	});

	it("expands every scene at once", () => {
		const mode = store();
		mode.collapseAll();

		mode.expandAll();

		expect(mode.isCollapsed("scene-1")).toBe(false);
		expect(mode.hasCollapsed()).toBe(false);
	});

	it("notifies subscribers on every change", () => {
		const mode = store();
		const listener = vi.fn();
		mode.subscribe(listener);

		mode.toggle("scene-1");
		mode.collapseAll();
		mode.expandAll();

		expect(listener).toHaveBeenCalledTimes(3);
	});
});
