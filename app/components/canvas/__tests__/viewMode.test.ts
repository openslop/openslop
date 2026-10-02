import { describe, expect, it } from "vitest";
import { createViewModeStore } from "../ViewModeContext";

const store = (sceneIds: string[] = ["scene-1", "scene-2"]) =>
	createViewModeStore(() => sceneIds);

const collapsed = (mode: ReturnType<typeof store>) => [
	...mode.getState().collapsed,
];

describe("createViewModeStore", () => {
	it("starts with every scene expanded", () => {
		expect(collapsed(store())).toEqual([]);
	});

	it("folds and unfolds one scene, leaving the others alone", () => {
		const mode = store();

		mode.getState().toggle("scene-1");
		expect(collapsed(mode)).toEqual(["scene-1"]);

		mode.getState().toggle("scene-1");
		expect(collapsed(mode)).toEqual([]);
	});

	it("collapses the scenes the document holds when asked, not when made", () => {
		const sceneIds = ["scene-1"];
		const mode = store(sceneIds);
		sceneIds.push("scene-2");

		mode.getState().collapseAll();

		expect(collapsed(mode)).toEqual(["scene-1", "scene-2"]);
	});

	it("expands every scene at once", () => {
		const mode = store();
		mode.getState().collapseAll();

		mode.getState().expandAll();

		expect(collapsed(mode)).toEqual([]);
	});
});
