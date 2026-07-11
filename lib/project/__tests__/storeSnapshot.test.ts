import { describe, expect, it } from "vitest";
import { BLOB_BASE_URL } from "@/lib/blob";
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
		src.getState().updateMetadata({
			title: "T",
			style: "noir",
			narration: { age: "adult" },
		});
		src.getState().setReferenceImages(["x", "y"]);
		src.getState().setTemplateReferenceImages(["y"]);

		const snap = extractStoreSnapshot(src);
		const dest = getProjectStore(targetId);
		applyStoreSnapshot(dest, snap);

		const after = dest.getState();
		expect(after.metadata.title).toBe("T");
		expect(after.metadata.style).toBe("noir");
		expect(after.metadata.narration.age).toBe("adult");
		expect(after.referenceImages).toEqual(["x", "y"]);
		expect(after.templateReferenceImages).toEqual(["y"]);

		clearProjectStore(sourceId);
		clearProjectStore(targetId);
	});

	it("survives an autosave/reload round trip without leaking template images into future switches", () => {
		const id = newProjectId();
		const store = getProjectStore(id);
		store.getState().setReferenceImages(["user.png", "template-a.png"]);
		store.getState().setTemplateReferenceImages(["template-a.png"]);

		const snap = extractStoreSnapshot(store);
		clearProjectStore(id);

		const reloaded = getProjectStore(id);
		applyStoreSnapshot(reloaded, snap);

		expect(reloaded.getState().templateReferenceImages).toEqual([
			"template-a.png",
		]);

		clearProjectStore(id);
	});

	it("backfills templateReferenceImages for snapshots saved before the field existed", () => {
		const id = newProjectId();
		const store = getProjectStore(id);
		const templateImage = `${BLOB_BASE_URL}/assets/upload/template/tpl-1`;

		applyStoreSnapshot(store, {
			referenceImages: ["user.png", templateImage],
		});

		expect(store.getState().templateReferenceImages).toEqual([templateImage]);
		clearProjectStore(id);
	});

	it("respects an explicit empty templateReferenceImages instead of backfilling", () => {
		const id = newProjectId();
		const store = getProjectStore(id);
		const templateImage = `${BLOB_BASE_URL}/assets/upload/template/tpl-1`;

		applyStoreSnapshot(store, {
			referenceImages: [templateImage],
			templateReferenceImages: [],
		});

		expect(store.getState().templateReferenceImages).toEqual([]);
		clearProjectStore(id);
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
