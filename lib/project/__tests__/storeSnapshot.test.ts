import { describe, expect, it } from "vitest";
import { getProjectStore, clearProjectStore } from "../store";
import { applyStoreSnapshot, extractStoreSnapshot } from "../storeSnapshot";

const newProjectId = () =>
	`p-${Math.random().toString(36).slice(2)}-${Date.now()}`;

describe("storeSnapshot", () => {
	it("extracts a method-free snapshot", () => {
		const id = newProjectId();
		const store = getProjectStore(id);
		store.getState().updateMetadata({ title: "Hello" });
		store.getState().setReferenceImages(["a.png"]);

		const snap = extractStoreSnapshot(store);

		expect(JSON.stringify(snap)).toContain('"title":"Hello"');
		expect(snap.referenceImages).toEqual(["a.png"]);
		for (const value of Object.values(snap)) {
			expect(typeof value).not.toBe("function");
		}
		clearProjectStore(id);
	});

	it("round-trips through apply", () => {
		const sourceId = newProjectId();
		const targetId = newProjectId();
		const src = getProjectStore(sourceId);
		src
			.getState()
			.updateMetadata({ title: "T", style: "noir", narration: { age: "30" } });
		src.getState().setReferenceImages(["x", "y"]);

		const snap = extractStoreSnapshot(src);
		const dest = getProjectStore(targetId);
		applyStoreSnapshot(dest, snap);

		const after = dest.getState();
		expect(after.metadata.title).toBe("T");
		expect(after.metadata.style).toBe("noir");
		expect(after.metadata.narration.age).toBe("30");
		expect(after.referenceImages).toEqual(["x", "y"]);

		clearProjectStore(sourceId);
		clearProjectStore(targetId);
	});

	it("no-ops on null snapshot", () => {
		const id = newProjectId();
		const store = getProjectStore(id);
		const before = JSON.stringify(extractStoreSnapshot(store));
		applyStoreSnapshot(store, null);
		expect(JSON.stringify(extractStoreSnapshot(store))).toBe(before);
		clearProjectStore(id);
	});
});
