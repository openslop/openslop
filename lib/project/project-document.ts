import type { Editor } from "slate";
import { serializeOSMLWithScenes } from "@/lib/canvas/osml-serializer";
import { getContentElements } from "@/lib/canvas/scenes";
import type { GenerationQueue } from "@/lib/generation/queue";
import { applyScriptToEditor } from "./apply-script";
import type { SavedProject } from "./saved-project";
import { extractStoreSnapshot, type ProjectStore } from "./store";
import { pickThumbnailUrl } from "./thumbnail";

/** What the project row stores beside the content, derived from it. */
export type ProjectMeta = { name: string; thumbnail_url: string | null };

export interface ProjectDocument {
	read(): SavedProject;
	write(content: SavedProject): void;
	meta(): ProjectMeta;
}

/** The canvas, settings and results move as one unit, so a version is never half applied. */
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
			// The script is read on the project's pinned models, so they land first.
			store.setState(content.store);
			applyScriptToEditor(editor, content.script);
			queue.replaceSnapshots(content.generation);
		},

		meta: () => ({
			name: store.getState().title.trim() || "Untitled",
			thumbnail_url: pickThumbnailUrl(
				getContentElements(editor.children),
				queue,
			),
		}),
	};
}
