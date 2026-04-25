import { createStore, type StoreApi } from "zustand/vanilla";
import { useStore } from "zustand";

export type ProjectContext = {
	outline: string;
	characterBibleUrl: string;
	setOutline: (outline: string) => void;
	setCharacterBibleUrl: (url: string) => void;
};

export type ProjectStore = StoreApi<ProjectContext>;

const stores = new Map<string, ProjectStore>();

export function getProjectStore(projectId: string): ProjectStore {
	let store = stores.get(projectId);
	if (!store) {
		store = createStore<ProjectContext>((set) => ({
			outline: "",
			characterBibleUrl: "",
			setOutline: (outline) => set({ outline }),
			setCharacterBibleUrl: (characterBibleUrl) => set({ characterBibleUrl }),
		}));
		stores.set(projectId, store);
	}
	return store;
}

export function useProjectStore<T>(
	projectId: string,
	selector: (state: ProjectContext) => T,
): T {
	return useStore(getProjectStore(projectId), selector);
}
