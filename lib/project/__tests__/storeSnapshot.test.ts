import { describe, expect, it } from "vitest";
import { avatarInputsSignature, isAvatarStale } from "../avatarInputs";
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

		const snap = extractStoreSnapshot(src);
		const dest = getProjectStore(targetId);
		applyStoreSnapshot(dest, snap);

		const after = dest.getState();
		expect(after.metadata.title).toBe("T");
		expect(after.metadata.style).toBe("noir");
		expect(after.metadata.narration.age).toBe("adult");
		expect(after.referenceImages).toEqual(["x", "y"]);

		clearProjectStore(sourceId);
		clearProjectStore(targetId);
	});

	it("backfills a baseline signature for a legacy avatar on load", () => {
		const sourceId = newProjectId();
		const targetId = newProjectId();
		const src = getProjectStore(sourceId);
		src.getState().updateMetadata({
			style: "anime",
			characters: {
				Alice: {
					appearance: "A girl in red",
					avatarUrl: "https://img/alice.png",
				},
			},
		});
		src.getState().setReferenceImages(["ref-a"]);

		const dest = getProjectStore(targetId);
		applyStoreSnapshot(dest, extractStoreSnapshot(src));

		const alice = dest.getState().metadata.characters["Alice"];
		// Stamped to the loaded inputs, so it reads as in sync now,
		expect(alice.avatarInputsSignature).toBe(
			avatarInputsSignature("A girl in red", "anime", ["ref-a"]),
		);
		expect(isAvatarStale(alice, "anime", ["ref-a"])).toBe(false);
		// but goes stale the moment the appearance changes.
		expect(
			isAvatarStale({ ...alice, appearance: "A girl in blue" }, "anime", [
				"ref-a",
			]),
		).toBe(true);

		clearProjectStore(sourceId);
		clearProjectStore(targetId);
	});

	it("does not overwrite an existing signature or stamp uploads on load", () => {
		const sourceId = newProjectId();
		const targetId = newProjectId();
		const src = getProjectStore(sourceId);
		src.getState().updateMetadata({
			characters: {
				Signed: {
					appearance: "x",
					avatarUrl: "u",
					avatarInputsSignature: "keep-me",
				},
				Uploaded: { appearance: "y", avatarUrl: "up", avatarUploaded: true },
			},
		});

		const dest = getProjectStore(targetId);
		applyStoreSnapshot(dest, extractStoreSnapshot(src));

		const chars = dest.getState().metadata.characters;
		expect(chars["Signed"].avatarInputsSignature).toBe("keep-me");
		expect(chars["Uploaded"].avatarInputsSignature).toBeUndefined();

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
