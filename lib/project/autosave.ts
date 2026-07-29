import debounce from "lodash/debounce";
import PQueue from "p-queue";
import type { ElementSnapshot } from "@/lib/generation/queue";
import { saveProject, type SaveProjectInput } from "./api";
import { deriveProjectName } from "./projectName";
import { getProjectStore } from "./store";
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
	getGeneration: () => GenerationSnapshot;
	onSaved: () => void;
	onError: (error: unknown) => void;
}

export interface Autosaver {
	/**
	 * How to produce the script for the next save. Called only when a save
	 * runs, so serializing stays off the per-keystroke path.
	 */
	setScriptSource: (getScript: () => string) => void;
	/** Coalesce this change with any others into one debounced save. */
	schedule: () => void;
	/** Run any pending save immediately. */
	flush: () => void;
}

/**
 * Debounces edits into one save at a time. The queue keeps a slow save from
 * overlapping the next one, so the last scheduled state always lands last.
 */
export function createAutosaver({
	projectId,
	getGeneration,
	onSaved,
	onError,
}: AutosaverOptions): Autosaver {
	const queue = new PQueue({ concurrency: 1 });
	let getScript: (() => string) | null = null;

	const save = async () => {
		const store = getProjectStore(projectId);
		if (!store.getState().hydrated) {
			console.error("Autosave aborted: store not hydrated", { projectId });
			return;
		}
		try {
			if (!getScript) throw new Error("Autosave has no script source");
			const input = buildProjectSave(
				extractStoreSnapshot(store),
				getScript(),
				getGeneration(),
			);
			await saveProject(projectId, input);
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
		setScriptSource: (next) => {
			getScript = next;
		},
		schedule,
		flush: () => {
			schedule.flush();
		},
	};
}
