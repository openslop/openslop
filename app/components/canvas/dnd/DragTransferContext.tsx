import { createStoreContext } from "@/lib/store/createStoreContext";
import { createEmitter, type Emitter } from "@/lib/store/emitter";

export type DragTransfer = {
	itemId: string;
	fromSceneId: string;
	toSceneId: string;
	atIndex: number;
} | null;

export type DragTransferStore = {
	get: () => DragTransfer;
	set: (next: DragTransfer) => void;
	subscribe: Emitter["subscribe"];
};

/**
 * Every element card watches the drag transfer, but it drives a gap above
 * exactly one of them. Holding the value in the context would re-render all of
 * them on every drag-over; holding a store lets each card subscribe and
 * re-render only when its own answer flips.
 */
export function createDragTransferStore(): DragTransferStore {
	const { subscribe, notify } = createEmitter();
	let transfer: DragTransfer = null;
	return {
		get: () => transfer,
		set: (next) => {
			if (transfer === next) return;
			transfer = next;
			notify();
		},
		subscribe,
	};
}

export function dropIndexIn(
	transfer: DragTransfer,
	sceneId: string,
): number | null {
	if (!transfer) return null;
	if (transfer.toSceneId !== sceneId) return null;
	if (transfer.fromSceneId === sceneId) return null;
	return transfer.atIndex;
}

const [DragTransferContext, , useDragTransfer] =
	createStoreContext<DragTransferStore>("DragTransferContext");
export { DragTransferContext };

/** Where an incoming cross-scene drag would land in this scene, if anywhere. */
export function useDropIndex(sceneId: string): number | null {
	return useDragTransfer((store) => dropIndexIn(store.get(), sceneId));
}
