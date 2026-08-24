import debounce from "lodash/debounce";
import isEqual from "lodash/isEqual";
import PQueue from "p-queue";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import { saveProject, type SaveProjectInput } from "./api";
import { deriveProjectName } from "./projectName";
import type { ProjectStore } from "./store";
import {
	extractStoreSnapshot,
	type ProjectStoreSnapshot,
} from "./storeSnapshot";
import { pickThumbnailUrl } from "./thumbnail";

export const AUTOSAVE_DEBOUNCE_MS = 2000;

export type GenerationSnapshot = Record<string, ElementSnapshot>;

export function buildProjectSave(
	snapshot: ProjectStoreSnapshot,
	script: string,
	generation: GenerationSnapshot,
): SaveProjectInput {
	return {
		name: deriveProjectName(snapshot.metadata),
		script,
		store: snapshot,
		generation,
		thumbnail_url: pickThumbnailUrl(Object.entries(generation)),
	};
}

export interface AutosaverOptions {
	projectId: string;
	store: ProjectStore;
	/**
	 * Produces the script for the next save. Called only when a save runs, so
	 * serializing stays off the per-keystroke path.
	 */
	getScript: () => string;
	getGeneration: () => GenerationSnapshot;
	onSaved: () => void;
	onError: (error: unknown) => void;
}

export interface Autosaver {
	/** Coalesce this change with any others into one debounced save. */
	schedule: () => void;
	/** Run any pending save immediately. */
	flush: () => void;
}

/**
 * Debounces edits into one save at a time. The queue keeps a slow save from
 * overlapping the next one, so the last scheduled state always lands last.
 *
 * A save whose payload matches the last one is dropped. Hydration emits three
 * store updates before the user touches anything, and the metadata sync writes
 * identical content back on mount, so without this an untouched project saves
 * itself on open and tells the user it was "Saved".
 */
export function createAutosaver({
	projectId,
	store,
	getScript,
	getGeneration,
	onSaved,
	onError,
}: AutosaverOptions): Autosaver {
	const queue = new PQueue({ concurrency: 1 });

	const buildInput = (): SaveProjectInput =>
		buildProjectSave(extractStoreSnapshot(store), getScript(), getGeneration());

	/**
	 * Payload of the last save known to be on the server. Seeded from the loaded
	 * state so the hydration echo has something to match; ProjectEditor hydrates
	 * the store before the editor renders, so that state is available here.
	 *
	 * Left null while the store is unhydrated: an unknown baseline must save
	 * rather than skip, so the worst case is a redundant write, never a lost edit.
	 */
	let lastSaved: SaveProjectInput | null = store.getState().hydrated
		? buildInput()
		: null;

	const save = async () => {
		if (!store.getState().hydrated) {
			console.error("Autosave aborted: store not hydrated", { projectId });
			return;
		}
		try {
			const input = buildInput();
			// Nothing changed since the last save: skip the write and the toast.
			if (lastSaved !== null && isEqual(input, lastSaved)) return;
			await saveProject(projectId, input);
			lastSaved = input;
			onSaved();
		} catch (err) {
			console.error("Autosave failed", err);
			onError(err);
		}
	};

	const schedule = debounce(() => {
		queue.clear();
		void queue.add(save);
	}, AUTOSAVE_DEBOUNCE_MS);

	return {
		schedule,
		flush: () => {
			schedule.flush();
		},
	};
}
