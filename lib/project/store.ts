import merge from "lodash/merge";
import { useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createStore, type StoreApi } from "zustand/vanilla";
import type {
	DeepPartial,
	Metadata,
	MetadataCharacter,
	MetadataVoice,
} from "./types";

export type ProjectContext = {
	hydrated: boolean;
	metadata: Metadata;
	referenceImages: string[];
	updateMetadata: (partial: DeepPartial<Metadata>) => void;
	setCharacter: (name: string, character: MetadataCharacter) => void;
	updateCharacter: (name: string, partial: Partial<MetadataCharacter>) => void;
	removeCharacter: (name: string) => void;
	setNarration: (narration: MetadataVoice) => void;
	setReferenceImages: (urls: string[]) => void;
	addReferenceImages: (urls: string[]) => void;
	removeReferenceImage: (index: number) => void;
	markHydrated: () => void;
	reset: () => void;
};

export type ProjectStore = StoreApi<ProjectContext>;

const initialState = {
	hydrated: false,
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
				setCharacter: (name, character) =>
					set((state) => {
						state.metadata.characters[name] = character;
					}),
				updateCharacter: (name, partial) =>
					set((state) => {
						const character = state.metadata.characters[name];
						if (!character)
							throw new Error(`Cannot update unknown character "${name}"`);
						Object.assign(character, partial);
					}),
				removeCharacter: (name) =>
					set((state) => {
						delete state.metadata.characters[name];
					}),
				setNarration: (narration) =>
					set((state) => {
						state.metadata.narration = narration;
					}),
				setReferenceImages: (urls) =>
					set((state) => {
						state.referenceImages = urls;
					}),
				addReferenceImages: (urls) =>
					set((state) => {
						state.referenceImages.push(...urls);
					}),
				removeReferenceImage: (index) =>
					set((state) => {
						state.referenceImages.splice(index, 1);
					}),
				markHydrated: () =>
					set((state) => {
						state.hydrated = true;
					}),
				reset: () =>
					set((state) => {
						state.metadata = structuredClone(initialState.metadata);
						state.referenceImages = [];
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
