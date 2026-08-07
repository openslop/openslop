import { describe, expect, it } from "vitest";
import type { AssetResult } from "@/lib/connectors/types";
import type { GenerationInputs } from "../inputs";
import { SnapshotStore, type ElementSnapshot } from "../snapshots";

const inputs = (prompt: string): GenerationInputs => ({
	prompt,
	attributes: {},
	dependencies: {},
});

const result = (imageUrl: string): AssetResult => ({
	imageUrl,
	durationSec: 0,
});

const commit = (store: SnapshotStore, id: string, url: string) =>
	store.commit(id, result(url), inputs(url), "image", false);

describe("SnapshotStore", () => {
	it("reports an unknown element as idle and empty", () => {
		expect(new SnapshotStore().get("nope")).toEqual<ElementSnapshot>({
			status: "idle",
			seconds: 0,
			result: null,
			error: null,
			resultInputs: null,
			connectorType: null,
			pinned: false,
		});
	});

	it("restores initial state as idle, dropping any in-flight progress", () => {
		const store = new SnapshotStore({
			a: {
				status: "generating",
				seconds: 12,
				result: result("a.png"),
				error: null,
				resultInputs: inputs("a.png"),
				connectorType: "image",
				pinned: true,
			},
		});
		expect(store.get("a")).toMatchObject({
			status: "idle",
			seconds: 0,
			pinned: true,
			result: result("a.png"),
		});
	});

	it("bumps the result version only when a result actually changes", () => {
		const store = new SnapshotStore();
		expect(store.getResultVersion()).toBe(0);

		store.update("a", { status: "queued" });
		expect(store.getResultVersion()).toBe(0);

		commit(store, "a", "a.png");
		expect(store.getResultVersion()).toBe(1);

		store.update("a", { seconds: 3 });
		expect(store.getResultVersion()).toBe(1);

		store.remove("a");
		expect(store.getResultVersion()).toBe(2);
	});

	it("keeps a settled result on reset but forgets an untouched element", () => {
		const store = new SnapshotStore();
		commit(store, "kept", "kept.png");
		store.update("kept", { status: "generating", seconds: 4 });
		store.update("bare", { status: "queued" });

		store.resetToIdle("kept");
		store.resetToIdle("bare");

		expect(store.get("kept")).toMatchObject({
			status: "idle",
			seconds: 0,
			result: result("kept.png"),
		});
		expect(store.ids()).toEqual(["kept"]);
	});

	it("restores a result previously committed for the same inputs", () => {
		const store = new SnapshotStore();
		commit(store, "a", "a.png");
		store.update("a", { result: null, resultInputs: null });

		expect(store.restore("a", inputs("other"))).toBe(false);
		expect(store.restore("a", inputs("a.png"))).toBe(true);
		expect(store.get("a")).toMatchObject({
			result: result("a.png"),
			error: null,
			resultInputs: inputs("a.png"),
		});
	});

	it("counts active and generated elements separately", () => {
		const store = new SnapshotStore();
		commit(store, "done", "done.png");
		store.update("running", { status: "generating" });
		store.update("waiting", { status: "queued" });

		expect(store.isBusy()).toBe(true);
		expect(store.getActiveCount()).toBe(2);
		expect(store.getGeneratedCount()).toBe(1);
	});

	it("notifies subscribers until they unsubscribe", () => {
		const store = new SnapshotStore();
		let calls = 0;
		const unsubscribe = store.subscribe(() => {
			calls++;
		});

		store.notify();
		expect(calls).toBe(1);

		unsubscribe();
		store.notify();
		expect(calls).toBe(1);
	});
});
