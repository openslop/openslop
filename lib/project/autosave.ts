import debounce from "lodash/debounce";
import isEqual from "lodash/isEqual";
import PQueue from "p-queue";
import { createEmitter } from "@/lib/store/emitter";
import { saveProject, type SaveProjectInput } from "./api";
import type { ProjectContent } from "./projectDocument";
import { deriveProjectName } from "./projectName";
import type { ProjectStore } from "./store";
import { pickThumbnailUrl } from "./thumbnail";

export const AUTOSAVE_DEBOUNCE_MS = 2000;

export function buildProjectSave(content: ProjectContent): SaveProjectInput {
	return {
		...content,
		name: deriveProjectName(content.store.metadata),
		thumbnail_url: pickThumbnailUrl(Object.entries(content.generation)),
	};
}

export interface AutosaverOptions {
	projectId: string;
	store: ProjectStore;
	/**
	 * Produces the content for the next save. Called when the debounce fires, so
	 * serializing stays off the per-keystroke path.
	 */
	read: () => ProjectContent;
	onSaved: () => void;
	onError: (error: unknown) => void;
}

export interface Autosaver {
	/** Coalesce this change with any others into one debounced save. */
	schedule: () => void;
	/** Run any pending save immediately. */
	flush: () => void;
	/** Treat the current state as the one the server already holds. */
	markSaved: () => void;
	/** Persist any pending edit, then hold every later save until {@link resume}. */
	suspend: () => void;
	/** Resume saving, with one save for whatever was dropped while suspended. */
	resume: () => void;
	onProjectSaved: (listener: (input: SaveProjectInput) => void) => () => void;
}

/**
 * Debounces edits into one save at a time. The queue keeps a slow save from
 * overlapping the next one, so the last scheduled state always lands last.
 *
 * A save whose payload matches the last one is dropped. Restoring the loaded
 * document into the empty editor is a Slate change like any other, so without
 * this an untouched project saves itself on open and reports "Saved".
 */
export function createAutosaver({
	projectId,
	store,
	read,
	onSaved,
	onError,
}: AutosaverOptions): Autosaver {
	const queue = new PQueue({ concurrency: 1 });
	const saved = createEmitter<SaveProjectInput>();

	const buildInput = (): SaveProjectInput => buildProjectSave(read());

	/** Null until the loaded state is known: an unknown baseline has to save. */
	let lastSaved: SaveProjectInput | null = null;
	let suspended = false;

	const persist = async (input: SaveProjectInput) => {
		if (isEqual(input, lastSaved)) return;
		try {
			await saveProject(projectId, input);
			lastSaved = input;
			onSaved();
			saved.notify(input);
		} catch (err) {
			console.error("Autosave failed", err);
			onError(err);
		}
	};

	/**
	 * Reads the payload as the debounce fires, not as the save runs, so a save
	 * queued behind a slow one still writes the state it was scheduled for.
	 */
	const schedule = debounce(() => {
		if (suspended) return;
		if (!store.getState().hydrated) {
			console.error("Autosave aborted: store not hydrated", { projectId });
			return;
		}
		const input = buildInput();
		queue.clear();
		void queue.add(() => persist(input));
	}, AUTOSAVE_DEBOUNCE_MS);

	return {
		schedule,
		flush: () => {
			schedule.flush();
		},
		markSaved: () => {
			lastSaved = buildInput();
		},
		suspend: () => {
			schedule.flush();
			suspended = true;
		},
		resume: () => {
			suspended = false;
			schedule();
		},
		onProjectSaved: saved.subscribe,
	};
}
