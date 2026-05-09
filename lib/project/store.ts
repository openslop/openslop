import merge from "lodash/merge";
import { useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createStore, type StoreApi } from "zustand/vanilla";
import type { DeepPartial, Metadata } from "./types";

export type ProjectContext = {
	metadata: Metadata;
	referenceImages: string[];
	updateMetadata: (partial: DeepPartial<Metadata>) => void;
	setReferenceImages: (urls: string[]) => void;
	reset: () => void;
};

export type ProjectStore = StoreApi<ProjectContext>;

const initialState = {
	metadata: { title: "", style: "", narration: {}, characters: {} } as Metadata,
	referenceImages: [] as string[],
};

const stores = new Map<string, ProjectStore>();

export function getProjectStore(projectId: string): ProjectStore {
	let store = stores.get(projectId);
	if (!store) {
		store = createStore<ProjectContext>()(
			immer((set) => ({
				...structuredClone(initialState),
				updateMetadata: (partial) =>
					set((state) => {
						merge(state.metadata, partial);
					}),
				setReferenceImages: (urls) =>
					set((state) => {
						state.referenceImages = urls;
					}),
				reset: () =>
					set((state) => {
						Object.assign(state, structuredClone(initialState));
					}),
			})),
		);
		stores.set(projectId, store);
	}
	return store;
}

export function clearProjectStore(projectId: string) {
	stores.delete(projectId);
}

export function useProjectStore<T>(
	projectId: string,
	selector: (state: ProjectContext) => T,
): T {
	return useStore(getProjectStore(projectId), selector);
}
