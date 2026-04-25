import { createStore, type StoreApi } from "zustand/vanilla";
import { useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Metadata } from "./types";

export type ProjectContext = {
	metadata: Metadata;
	setMetadataStyle: (style: string) => void;
	setMetadataCharacter: (name: string, description: string) => void;
	setCharacterAvatarUrl: (name: string, url: string) => void;
};

export type ProjectStore = StoreApi<ProjectContext>;

const stores = new Map<string, ProjectStore>();

export function getProjectStore(projectId: string): ProjectStore {
	let store = stores.get(projectId);
	if (!store) {
		store = createStore<ProjectContext>()(
			immer((set) => ({
				metadata: { style: "", characters: {} },
				setMetadataStyle: (style) =>
					set((state) => {
						state.metadata.style = style;
					}),
				setMetadataCharacter: (name, description) =>
					set((state) => {
						state.metadata.characters[name] = { description };
					}),
				setCharacterAvatarUrl: (name, url) =>
					set((state) => {
						state.metadata.characters[name].avatarUrl = url;
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
