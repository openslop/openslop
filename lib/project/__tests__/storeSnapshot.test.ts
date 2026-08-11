import { describe, expect, it } from "vitest";
import { createProjectStore } from "../store";
import {
	applyStoreSnapshot,
	extractStoreSnapshot,
	parseStoreSnapshot,
} from "../storeSnapshot";

describe("storeSnapshot", () => {
	it("extracts a method-free snapshot", () => {
		const store = createProjectStore();
		store.getState().updateMetadata({ title: "Hello" });
		store.getState().setReferenceImages(["a.png"]);

		const snap = extractStoreSnapshot(store);

		expect(JSON.stringify(snap)).toContain('"title":"Hello"');
		expect(snap.referenceImages).toEqual(["a.png"]);
		for (const value of Object.values(snap)) {
			expect(typeof value).not.toBe("function");
		}
	});

	it("round-trips through apply", () => {
		const src = createProjectStore();
		src.getState().updateMetadata({
			title: "T",
			style: "noir",
			narration: { age: "adult" },
		});
		src.getState().setReferenceImages(["x", "y"]);

		const snap = extractStoreSnapshot(src);
		const dest = createProjectStore();
		applyStoreSnapshot(dest, snap);

		const after = dest.getState();
		expect(after.metadata.title).toBe("T");
		expect(after.metadata.style).toBe("noir");
		expect(after.metadata.narration.age).toBe("adult");
		expect(after.referenceImages).toEqual(["x", "y"]);
	});

	it("no-ops on an empty parsed snapshot", () => {
		const store = createProjectStore();
		const before = JSON.stringify(extractStoreSnapshot(store));
		applyStoreSnapshot(store, parseStoreSnapshot(null));
		expect(JSON.stringify(extractStoreSnapshot(store))).toBe(before);
	});
});

describe("parseStoreSnapshot", () => {
	it("fills defaults for absent and partial rows", () => {
		expect(parseStoreSnapshot(null)).toEqual({
			metadata: {
				title: "",
				style: "",
				language: "auto",
				narration: {},
				characters: {},
			},
			referenceImages: [],
		});
		expect(parseStoreSnapshot({ metadata: { title: "T" } }).metadata).toEqual({
			title: "T",
			style: "",
			language: "auto",
			narration: {},
			characters: {},
		});
	});

	it("keeps a full snapshot intact", () => {
		const snapshot = {
			metadata: {
				title: "T",
				style: "noir",
				language: "es" as const,
				narration: { age: "adult" as const },
				characters: {
					Ada: { appearance: "tall", gender: "feminine" as const },
				},
				videoSettings: {
					aspectRatio: "9:16" as const,
					transitionType: "fade" as const,
				},
			},
			referenceImages: ["a.png"],
		};
		expect(parseStoreSnapshot(snapshot)).toEqual(snapshot);
	});

	it("throws on a structurally invalid row", () => {
		expect(() => parseStoreSnapshot({ metadata: { title: 42 } })).toThrow();
		expect(() => parseStoreSnapshot({ referenceImages: "a.png" })).toThrow();
	});
});
