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
	/** Treat the current state as the one the server already holds. */
	markSaved: () => void;
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
	getScript,
	getGeneration,
	onSaved,
	onError,
}: AutosaverOptions): Autosaver {
	const queue = new PQueue({ concurrency: 1 });

	const buildInput = (): SaveProjectInput =>
		buildProjectSave(extractStoreSnapshot(store), getScript(), getGeneration());

	/** Null until the loaded state is known: an unknown baseline has to save. */
	let lastSaved: SaveProjectInput | null = null;

	const save = async () => {
		if (!store.getState().hydrated) {
			console.error("Autosave aborted: store not hydrated", { projectId });
			return;
		}
		try {
			const input = buildInput();
			if (isEqual(input, lastSaved)) return;
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
		markSaved: () => {
			lastSaved = buildInput();
		},
	};
}
