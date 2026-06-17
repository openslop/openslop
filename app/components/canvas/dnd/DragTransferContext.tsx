import { createRequiredContext } from "@/lib/components/createRequiredContext";

export type DragTransfer = {
	itemId: string;
	fromSceneId: string;
	toSceneId: string;
	atIndex: number;
} | null;

const [DragTransferContext, useDragTransfer] =
	createRequiredContext<DragTransfer>("DragTransferContext");
export { DragTransferContext, useDragTransfer };
