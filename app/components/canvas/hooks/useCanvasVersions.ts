import { useEffect, useState } from "react";
import type { Editor } from "slate";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { CanvasHistory } from "@/lib/project/canvasHistory";
import { canvasVersionStorage } from "@/lib/project/canvasVersionStorage";
import { createProjectDocument } from "@/lib/project/projectDocument";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { toastError } from "@/lib/toastError";
import { useAutosave } from "./useAutosave";

export function useCanvasVersions(
	projectId: string,
	editor: Editor,
): { history: CanvasHistory; onDocumentChange: () => void } {
	const queue = useGenerationQueue();
	const store = useProjectStoreHandle();
	const { connectorConfig } = useConfig();

	const [document] = useState(() =>
		createProjectDocument({
			editor,
			store,
			queue,
			connectors: connectorConfig,
		}),
	);

	const autosaver = useAutosave(projectId, document.read);

	const [history] = useState(
		() =>
			new CanvasHistory(canvasVersionStorage(projectId), document, autosaver),
	);

	useEffect(
		() =>
			autosaver.onProjectSaved(({ script, store, generation }) => {
				history
					.record({ script, store, generation })
					.catch((err: unknown) =>
						toastError(err, "Saving this version failed"),
					);
			}),
		[autosaver, history],
	);

	return { history, onDocumentChange: autosaver.schedule };
}
