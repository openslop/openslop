import { useEffect, useMemo } from "react";
import type { Editor } from "slate";
import { toast } from "sonner";
import { toastError } from "@/lib/toastError";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import { createAutosaver } from "@/lib/project/autosave";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { useScriptInitial } from "@/lib/script/ScriptProvider";

const TOAST_OPTIONS = {
	id: "autosave",
	position: "bottom-right" as const,
	className:
		"!bg-muted !border !border-border !text-muted-foreground !text-xs !shadow-none !rounded-md !py-1.5 !px-2.5 !min-h-0 !w-auto",
	unstyled: false,
	duration: 1500,
};

/** Returns the callback that schedules a save for a document change. */
export function useAutosave(projectId: string, editor: Editor): () => void {
	const queue = useGenerationQueue();
	const store = useProjectStoreHandle();
	const initialScript = useScriptInitial();

	const autosaver = useMemo(
		() =>
			createAutosaver({
				projectId,
				store,
				initialScript,
				getScript: () => serializeOSMLWithScenes(editor.children),
				getGeneration: () => queue.snapshot(),
				onSaved: () => toast("Saved", TOAST_OPTIONS),
				onError: (err) =>
					toastError(err, "Save failed", {
						...TOAST_OPTIONS,
						duration: 4000,
					}),
			}),
		[projectId, store, initialScript, queue, editor],
	);

	useEffect(() => () => autosaver.flush(), [autosaver]);

	useEffect(() => store.subscribe(autosaver.schedule), [store, autosaver]);

	useEffect(() => {
		let lastVersion = queue.getResultVersion();
		return queue.subscribe(() => {
			const v = queue.getResultVersion();
			if (v === lastVersion) return;
			lastVersion = v;
			autosaver.schedule();
		});
	}, [queue, autosaver]);

	return autosaver.schedule;
}
