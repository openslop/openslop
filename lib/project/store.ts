import { enableMapSet } from "immer";
import merge from "lodash/merge";
import { useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createStore, type StoreApi } from "zustand/vanilla";
import type { DeepPartial, Metadata } from "./types";

enableMapSet();

export type ProjectContext = {
	metadata: Metadata;
	referenceImages: string[];
	generatingAvatars: ReadonlySet<string>;
	updateMetadata: (partial: DeepPartial<Metadata>) => void;
	setReferenceImages: (urls: string[]) => void;
	setAvatarGenerating: (name: string, generating: boolean) => void;
};

export type ProjectStore = StoreApi<ProjectContext>;

const stores = new Map<string, ProjectStore>();

export function getProjectStore(projectId: string): ProjectStore {
	let store = stores.get(projectId);
	if (!store) {
		store = createStore<ProjectContext>()(
			immer((set) => ({
				metadata: { title: "", style: "", narration: {}, characters: {} },
				referenceImages: [],
				generatingAvatars: new Set(),
				updateMetadata: (partial) =>
					set((state) => {
						merge(state.metadata, partial);
					}),
				setReferenceImages: (urls) =>
					set((state) => {
						state.referenceImages = urls;
					}),
				setAvatarGenerating: (name, generating) =>
					set((state) => {
						if (generating) state.generatingAvatars.add(name);
						else state.generatingAvatars.delete(name);
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
