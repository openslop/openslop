import { createContext, use } from "react";

export type DragTransfer = {
	itemId: string;
	fromSceneId: string;
	toSceneId: string;
	atIndex: number;
} | null;

export const DragTransferContext = createContext<DragTransfer>(null);

export function useDragTransfer(): DragTransfer {
	return use(DragTransferContext);
}
