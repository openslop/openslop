import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { toastError } from "@/lib/toastError";
import { createAutosaver, type Autosaver } from "@/lib/project/autosave";
import type { ProjectContent } from "@/lib/project/projectDocument";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";

const TOAST_OPTIONS = {
	id: "autosave",
	position: "bottom-right" as const,
	className:
		"!bg-muted !border !border-border !text-muted-foreground !text-xs !shadow-none !rounded-md !py-1.5 !px-2.5 !min-h-0 !w-auto",
	unstyled: false,
	duration: 1500,
};

export function useAutosave(
	projectId: string,
	read: () => ProjectContent,
): Autosaver {
	const queue = useGenerationQueue();
	const store = useProjectStoreHandle();

	const autosaver = useMemo(
		() =>
			createAutosaver({
				projectId,
				store,
				read,
				onSaved: () => toast("Saved", TOAST_OPTIONS),
				onError: (err) =>
					toastError(err, "Save failed", {
						...TOAST_OPTIONS,
						duration: 4000,
					}),
			}),
		[projectId, store, read],
	);

	// Runs after the rehydration effect above it in useEditorSession, so the
	// loaded document is the baseline and reopening a project saves nothing.
	useEffect(() => autosaver.markSaved(), [autosaver]);

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

	return autosaver;
}
