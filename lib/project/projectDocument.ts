import type { Editor } from "slate";
import { assetText } from "@/lib/canvas/assets";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import { getContentElements } from "@/lib/canvas/scenes";
import type { GenerationQueue } from "@/lib/generation/queue";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import { applyScriptToEditor } from "./applyScript";
import type { ProjectData, ProjectStore } from "./store";
import { deriveProjectName } from "./projectName";
import { extractStoreSnapshot } from "./storeSnapshot";
import { pickThumbnailUrl } from "./thumbnail";

export type ProjectContent = {
	script: string;
	store: ProjectData;
	generation: Record<string, ElementSnapshot>;
};

/** What the project row stores beside the content, derived from it. */
export type ProjectDetails = { name: string; thumbnail_url: string | null };

export interface ProjectDocument {
	read(): ProjectContent;
	write(content: ProjectContent): void;
	details(): ProjectDetails;
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
			applyScriptToEditor(editor, content.script);
			store.setState(content.store);
			queue.replaceSnapshots(content.generation);
		},

		details: () => ({
			name: deriveProjectName(assetText(editor.children, "title")),
			thumbnail_url: pickThumbnailUrl(
				getContentElements(editor.children),
				queue,
			),
		}),
	};
}
