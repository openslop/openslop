import debounce from "lodash/debounce";
import isEqual from "lodash/isEqual";
import PQueue from "p-queue";
import { createEmitter } from "@/lib/store/emitter";
import { saveProject, type SaveProjectInput } from "./api";
import type { SavedProject, ProjectDetails } from "./projectDocument";

export const AUTOSAVE_DEBOUNCE_MS = 2000;

export interface AutosaverOptions {
	projectId: string;
	/**
	 * Produces the content to save. Called once at construction for the baseline
	 * and then when the debounce fires, so serializing stays off the per-keystroke path.
	 */
	read: () => SavedProject;
	details: () => ProjectDetails;
	onSaved: () => void;
	onError: (error: unknown) => void;
}

export interface Autosaver {
	/** Coalesce this change with any others into one debounced save. */
	schedule: () => void;
	/** Run any pending save immediately. */
	flush: () => void;
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
 * The document it is built from counts as saved, and a save whose payload
 * matches the last one is dropped, so an untouched project never saves itself
 * on open or reports "Saved" for an echo of what it loaded.
 */
export function createAutosaver({
	projectId,
	read,
	details,
	onSaved,
	onError,
}: AutosaverOptions): Autosaver {
	const queue = new PQueue({ concurrency: 1 });
	const saved = createEmitter<SaveProjectInput>();

	const buildInput = (): SaveProjectInput => ({ ...read(), ...details() });

	let lastSaved = buildInput();
	let suspended = false;

	const persist = async (input: SaveProjectInput) => {
		if (isEqual(input, lastSaved)) return;
		try {
			await saveProject(projectId, input);
			lastSaved = input;
			onSaved();
			saved.notify(input);
		} catch (error) {
			console.error("Autosave failed", error);
			onError(error);
		}
	};

	/**
	 * Reads the payload as the debounce fires, not as the save runs, so a save
	 * queued behind a slow one still writes the state it was scheduled for.
	 */
	const schedule = debounce(() => {
		if (suspended) return;
		const input = buildInput();
		queue.clear();
		void queue.add(() => persist(input));
	}, AUTOSAVE_DEBOUNCE_MS);

	return {
		schedule,
		flush: () => {
			schedule.flush();
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
