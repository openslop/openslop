import { useCallback, useSyncExternalStore } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";

export type DragTransfer = {
	itemId: string;
	fromSceneId: string;
	toSceneId: string;
	atIndex: number;
} | null;

export type DragTransferStore = {
	get: () => DragTransfer;
	set: (next: DragTransfer) => void;
	subscribe: (onChange: () => void) => () => void;
};

/**
 * Every element card watches the drag transfer, but it drives a gap above
 * exactly one of them. Holding the value in the context would re-render all of
 * them on every drag-over; holding a store lets each card subscribe and
 * re-render only when its own answer flips.
 */
export function createDragTransferStore(): DragTransferStore {
	let transfer: DragTransfer = null;
	const listeners = new Set<() => void>();
	return {
		get: () => transfer,
		set: (next) => {
			transfer = next;
			for (const listener of listeners) listener();
		},
		subscribe: (onChange) => {
			listeners.add(onChange);
			return () => {
				listeners.delete(onChange);
			};
		},
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

const [DragTransferContext, useDragTransferStore] =
	createRequiredContext<DragTransferStore>("DragTransferContext");
export { DragTransferContext };

const noDrop = () => null;

/** Where an incoming cross-scene drag would land in this scene, if anywhere. */
export function useDropIndex(sceneId: string): number | null {
	const store = useDragTransferStore();
	const getSnapshot = useCallback(
		() => dropIndexIn(store.get(), sceneId),
		[store, sceneId],
	);
	return useSyncExternalStore(store.subscribe, getSnapshot, noDrop);
}
