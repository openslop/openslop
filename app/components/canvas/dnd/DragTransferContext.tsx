import type { DragTransfer } from "@/lib/canvas/dragOps";
import { createStoreContext } from "@/lib/store/createStoreContext";
import { createEmitter, type Emitter } from "@/lib/store/emitter";

export type DragTransferStore = {
	get: () => DragTransfer | null;
	set: (next: DragTransfer | null) => void;
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
	let transfer: DragTransfer | null = null;
	return {
		get: () => transfer,
		set: (next) => {
			if (
				next?.sceneId === transfer?.sceneId &&
				next?.atIndex === transfer?.atIndex
			)
				return;
			transfer = next;
			notify();
		},
		subscribe,
	};
}

const [DragTransferContext, , useDragTransfer] =
	createStoreContext<DragTransferStore>("DragTransferContext");
export { DragTransferContext };

/** Where an incoming cross-scene drag would land in this scene, if anywhere. */
export function useDropIndex(sceneId: string): number | null {
	return useDragTransfer((store) => {
		const transfer = store.get();
		return transfer?.sceneId === sceneId ? transfer.atIndex : null;
	});
}
