import type { Editor } from "slate";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import type { GenerationQueue } from "@/lib/generation/queue";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import { applyScriptToEditor } from "./applyScript";
import type { ProjectStore } from "./store";
import {
	extractStoreSnapshot,
	replaceStoreSnapshot,
	type ProjectStoreSnapshot,
} from "./storeSnapshot";

export type ProjectContent = {
	script: string;
	store: ProjectStoreSnapshot;
	generation: Record<string, ElementSnapshot>;
};

export interface ProjectDocument {
	read(): ProjectContent;
	write(content: ProjectContent): void;
}

/**
 * The live project as one readable, writable unit: script, metadata and
 * generated results move together, so a version is never half applied.
 */
export function createProjectDocument({
	editor,
	store,
	queue,
}: {
	editor: Editor;
	store: ProjectStore;
	queue: GenerationQueue;
}): ProjectDocument {
	return {
		read: () => ({
			script: serializeOSMLWithScenes(editor.children),
			store: extractStoreSnapshot(store),
			generation: queue.snapshot(),
		}),

		write: (content) => {
			applyScriptToEditor(
				editor,
				content.script,
				store.getState().metadata.connectorModels,
			);
			replaceStoreSnapshot(store, content.store);
			queue.replaceSnapshots(content.generation);
		},
	};
}
