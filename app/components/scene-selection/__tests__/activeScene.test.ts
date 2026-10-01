import { describe, expect, it, vi } from "vitest";
import { createActiveSceneStore } from "../ActiveSceneContext";

describe("createActiveSceneStore", () => {
	it("starts with no active scene", () => {
		expect(createActiveSceneStore().get()).toBeNull();
	});

	it("notifies subscribers when the active scene changes", () => {
		const store = createActiveSceneStore();
		const listener = vi.fn();
		store.subscribe(listener);

		store.set("scene-1");
		expect(store.get()).toBe("scene-1");

		store.set(null);
		expect(store.get()).toBeNull();
		expect(listener).toHaveBeenCalledTimes(2);
	});

	it("stays quiet when the same scene is set again", () => {
		const store = createActiveSceneStore();
		store.set("scene-1");
		const listener = vi.fn();
		store.subscribe(listener);

		store.set("scene-1");

		expect(listener).not.toHaveBeenCalled();
	});
});
