import { describe, expect, it, vi } from "vitest";
import type { DragTransfer } from "@/lib/canvas/dragOps";
import { createDragTransferStore } from "../dnd/DragTransferContext";

const transfer: DragTransfer = { sceneId: "scene-2", atIndex: 3 };

describe("createDragTransferStore", () => {
	it("starts empty", () => {
		expect(createDragTransferStore().get()).toBeNull();
	});

	it("notifies subscribers on every change", () => {
		const store = createDragTransferStore();
		const listener = vi.fn();
		store.subscribe(listener);

		store.set(transfer);
		expect(store.get()).toEqual(transfer);

		store.set(null);
		expect(store.get()).toBeNull();
		expect(listener).toHaveBeenCalledTimes(2);
	});

	it("stays quiet when the write leaves the answer alone", () => {
		const store = createDragTransferStore();
		const listener = vi.fn();
		store.subscribe(listener);

		store.set(null);
		expect(listener).not.toHaveBeenCalled();

		store.set(transfer);
		store.set({ ...transfer });
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("stops notifying once unsubscribed", () => {
		const store = createDragTransferStore();
		const listener = vi.fn();
		store.subscribe(listener)();

		store.set(transfer);
		expect(listener).not.toHaveBeenCalled();
	});
});
