import { useEffect, useState } from "react";
import type { Editor } from "slate";
import { useGenerationQueue } from "@/lib/generation/generation-queue-provider";
import { CanvasHistory } from "@/lib/project/canvas-history";
import { canvasVersionStorage } from "@/lib/project/canvas-version-storage";
import { createProjectDocument } from "@/lib/project/project-document";
import { useProjectStoreHandle } from "@/lib/project/project-store-provider";
import { toastError } from "@/lib/toast-error";
import { useAutosave } from "./use-autosave";

export function useCanvasVersions(
	projectId: string,
	editor: Editor,
): { history: CanvasHistory; onDocumentChange: () => void } {
	const queue = useGenerationQueue();
	const store = useProjectStoreHandle();

	const [document] = useState(() =>
		createProjectDocument({ editor, store, queue }),
	);

	const autosaver = useAutosave(projectId, document);

	const [history] = useState(
		() =>
			new CanvasHistory(canvasVersionStorage(projectId), document, autosaver),
	);

	useEffect(
		() =>
			autosaver.onProjectSaved(({ script, store, generation }) => {
				history
					.record({ script, store, generation })
					.catch((error: unknown) =>
						toastError(error, "Saving this version failed"),
					);
			}),
		[autosaver, history],
	);

	return { history, onDocumentChange: autosaver.schedule };
}
