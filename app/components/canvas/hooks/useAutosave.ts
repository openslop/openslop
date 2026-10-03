import { useEffect, useState } from "react";
import { toast } from "sonner";
import { toastError } from "@/lib/toastError";
import { createAutosaver, type Autosaver } from "@/lib/project/autosave";
import type { ProjectDocument } from "@/lib/project/projectDocument";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";

const TOAST_OPTIONS = {
	id: "autosave",
	position: "bottom-right" as const,
	className:
		"!bg-muted !border !border-border !text-muted-foreground !text-label !shadow-none !rounded-md !py-1.5 !px-2.5 !min-h-0 !w-auto",
	duration: 1500,
};

export function useAutosave(
	projectId: string,
	document: ProjectDocument,
): Autosaver {
	const queue = useGenerationQueue();
	const store = useProjectStoreHandle();

	const [autosaver] = useState(() =>
		createAutosaver({
			projectId,
			read: document.read,
			details: document.details,
			onSaved: () => toast("Saved", TOAST_OPTIONS),
			onError: (error) =>
				toastError(error, "Save failed", {
					...TOAST_OPTIONS,
					duration: 4000,
				}),
		}),
	);

	useEffect(() => () => autosaver.flush(), [autosaver]);

	useEffect(() => store.subscribe(autosaver.schedule), [store, autosaver]);

	useEffect(() => {
		let lastVersion = queue.getResultVersion();
		return queue.subscribe(() => {
			const version = queue.getResultVersion();
			if (version === lastVersion) return;
			lastVersion = version;
			autosaver.schedule();
		});
	}, [queue, autosaver]);

	return autosaver;
}
