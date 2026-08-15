import { describe, expect, it } from "vitest";
import type { AssetResult } from "@/lib/connectors/types";
import { derivedNodeId } from "../graph";
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

	it("copies a result, its inputs and its history onto a new id", () => {
		const store = new SnapshotStore();
		commit(store, "a", "a.png");
		store.update("a", { pinned: true });

		store.copy("a", "b");

		expect(store.get("b")).toMatchObject({
			status: "idle",
			seconds: 0,
			result: result("a.png"),
			resultInputs: inputs("a.png"),
			connectorType: "image",
			pinned: true,
		});
		expect(store.restore("b", inputs("a.png"))).toBe(true);
	});

	it("carries the nodes derived from the element onto the copy", () => {
		const store = new SnapshotStore();
		const derived = derivedNodeId("still", "a");
		commit(store, derived, "still.png");
		store.commit(
			"a",
			result("a.png"),
			{ prompt: "a", attributes: {}, dependencies: { [derived]: "still.png" } },
			"animated_image",
			false,
		);

		store.copy("a", "b");

		expect(store.get(derivedNodeId("still", "b")).result).toEqual(
			result("still.png"),
		);
		expect(store.get("b").resultInputs?.dependencies).toEqual({
			[derivedNodeId("still", "b")]: "still.png",
		});
		expect(
			store.restore("b", {
				prompt: "a",
				attributes: {},
				dependencies: { [derivedNodeId("still", "b")]: "still.png" },
			}),
		).toBe(true);
	});

	it("copies an in-flight element as idle, not as a second active job", () => {
		const store = new SnapshotStore();
		store.update("a", { status: "generating", seconds: 7 });

		store.copy("a", "b");

		expect(store.get("b")).toMatchObject({ status: "idle", seconds: 0 });
		expect(store.getActiveCount()).toBe(1);
	});

	it("leaves a copy untouched when its source is removed", () => {
		const store = new SnapshotStore();
		commit(store, "a", "a.png");
		store.copy("a", "b");

		store.remove("a");

		expect(store.get("b").result).toEqual(result("a.png"));
	});

	it("ignores a copy from an element it has never seen", () => {
		const store = new SnapshotStore();
		store.copy("nope", "b");
		expect(store.ids()).toEqual([]);
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
