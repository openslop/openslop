import { useCallback, useSyncExternalStore } from "react";
import { getContentElements } from "@/lib/canvas/scenes";
import { getLayoutKey } from "@/lib/video/layoutKey";
import { useTransitionType } from "@/lib/video/useTransitionType";
import type { SignallingEditor } from "../plugins/withDocumentSignal";

/**
 * The layout key for the live document. Reading it through a subscription keeps
 * the editor view out of the typing path: edits that cannot change the key —
 * every text edit — resolve to the same string and re-render nothing.
 */
export function useLayoutKey(editor: SignallingEditor): string {
	const transitionType = useTransitionType();
	const read = useCallback(
		() => getLayoutKey(getContentElements(editor.children), transitionType),
		[editor, transitionType],
	);
	return useSyncExternalStore(editor.subscribeToDocument, read, read);
}
