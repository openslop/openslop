import merge from "lodash/merge";
import { immer } from "zustand/middleware/immer";
import { createStore, type StoreApi } from "zustand/vanilla";
import type {
	DeepPartial,
	Metadata,
	MetadataCharacter,
	MetadataVoice,
} from "./types";

/** What a project holds. Generation reads this; only the UI calls the setters. */
export type ProjectData = {
	hydrated: boolean;
	metadata: Metadata;
	referenceImages: string[];
};

export type ProjectContext = ProjectData & {
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

export function createProjectStore(): ProjectStore {
	return createStore<ProjectContext>()(
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
}
