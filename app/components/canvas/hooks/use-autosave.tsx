import { useEffect, useState } from "react";
import { toast } from "sonner";
import { toastError } from "@/lib/toast-error";
import { onPageHidden } from "@/lib/components/on-page-hidden";
import { createAutosaver, type Autosaver } from "@/lib/project/autosave";
import type { ProjectDocument } from "@/lib/project/project-document";
import { useProjectStoreHandle } from "@/lib/project/project-store-provider";
import { useGenerationQueue } from "@/lib/generation/generation-queue-provider";
import { SavedToast } from "../saved-toast";

const AUTOSAVE_TOAST = { id: "autosave", position: "bottom-right" as const };

export function useAutosave(
	projectId: string,
	document: ProjectDocument,
): Autosaver {
	const queue = useGenerationQueue();
	const store = useProjectStoreHandle();

	const [autosaver] = useState(() =>
		createAutosaver({
			projectId,
			document,
			onSaved: () =>
				toast.custom(() => <SavedToast />, {
					...AUTOSAVE_TOAST,
					duration: 1500,
				}),
			onError: (error) => toastError(error, "Save failed", AUTOSAVE_TOAST),
		}),
	);

	useEffect(() => () => autosaver.flush(), [autosaver]);

	useEffect(() => onPageHidden(autosaver.flush), [autosaver]);

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
