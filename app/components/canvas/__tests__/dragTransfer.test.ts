import { describe, expect, it, vi } from "vitest";
import {
	createDragTransferStore,
	dropIndexIn,
	type DragTransfer,
} from "../dnd/DragTransferContext";

const transfer = (
	overrides: Partial<NonNullable<DragTransfer>> = {},
): DragTransfer => ({
	itemId: "item-1",
	fromSceneId: "scene-1",
	toSceneId: "scene-2",
	atIndex: 3,
	...overrides,
});

describe("dropIndexIn", () => {
	it("reports the landing index for the receiving scene", () => {
		expect(dropIndexIn(transfer(), "scene-2")).toBe(3);
	});

	it("reports nothing while no drag is in flight", () => {
		expect(dropIndexIn(null, "scene-2")).toBeNull();
	});

	it("reports nothing for scenes the drag is not over", () => {
		expect(dropIndexIn(transfer(), "scene-9")).toBeNull();
	});

	it("reports nothing when the item is being reordered within its own scene", () => {
		expect(
			dropIndexIn(transfer({ toSceneId: "scene-1" }), "scene-1"),
		).toBeNull();
	});
});

describe("createDragTransferStore", () => {
	it("starts empty", () => {
		expect(createDragTransferStore().get()).toBeNull();
	});

	it("notifies subscribers on every change", () => {
		const store = createDragTransferStore();
		const listener = vi.fn();
		store.subscribe(listener);

		store.set(transfer());
		expect(store.get()).toEqual(transfer());

		store.set(null);
		expect(store.get()).toBeNull();
		expect(listener).toHaveBeenCalledTimes(2);
	});

	it("stays quiet when the write leaves the value alone", () => {
		const store = createDragTransferStore();
		const listener = vi.fn();
		store.subscribe(listener);

		store.set(null);
		expect(listener).not.toHaveBeenCalled();
	});

	it("stops notifying once unsubscribed", () => {
		const store = createDragTransferStore();
		const listener = vi.fn();
		store.subscribe(listener)();

		store.set(transfer());
		expect(listener).not.toHaveBeenCalled();
	});
});
