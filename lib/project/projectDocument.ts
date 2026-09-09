import type { Editor } from "slate";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import type { GenerationQueue } from "@/lib/generation/queue";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import { resolveDefaultModels } from "@/lib/connectors/models";
import type { AccountStore } from "@/lib/user/accountStore";
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
	accountStore,
}: {
	editor: Editor;
	store: ProjectStore;
	queue: GenerationQueue;
	accountStore: AccountStore;
}): ProjectDocument {
	return {
		read: () => ({
			script: serializeOSMLWithScenes(editor.children),
			store: extractStoreSnapshot(store),
			generation: queue.snapshot(),
		}),

		write: (content) => {
			const defaultModels = resolveDefaultModels({
				project: content.store.metadata.models,
				account: accountStore.getState().models,
			});
			applyScriptToEditor(editor, content.script, defaultModels);
			replaceStoreSnapshot(store, content.store);
			queue.replaceSnapshots(content.generation);
		},
	};
}
