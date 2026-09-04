import merge from "lodash/merge";
import { immer } from "zustand/middleware/immer";
import { createStore, type StoreApi } from "zustand/vanilla";
import {
	MetadataSchema,
	type DeepPartial,
	type Metadata,
	type MetadataCharacter,
	type MetadataVoice,
} from "./types";

/** What gets saved to the project row. */
export type ProjectPersisted = {
	metadata: Metadata;
	referenceImages: string[];
};

/** What a project holds. Generation reads this; only the UI calls the setters. */
export type ProjectData = ProjectPersisted & {
	hydrated: boolean;
};

export type ProjectContext = ProjectData & {
	updateMetadata: (partial: DeepPartial<Metadata>) => void;
	setCharacter: (name: string, character: MetadataCharacter) => void;
	updateCharacter: (name: string, partial: Partial<MetadataCharacter>) => void;
	removeCharacter: (name: string) => void;
	setNarration: (narration: MetadataVoice) => void;
	setTemplate: (templateId: string | undefined) => void;
	setReferenceImages: (urls: string[]) => void;
	addReferenceImages: (urls: string[]) => void;
	removeReferenceImage: (index: number) => void;
	reset: () => void;
};

export type ProjectStore = StoreApi<ProjectContext>;

const freshPersisted = (): ProjectPersisted => ({
	metadata: MetadataSchema.parse({}),
	referenceImages: [],
});

export function createProjectStore(): ProjectStore {
	return createStore<ProjectContext>()(
		immer((set) => ({
			hydrated: false,
			...freshPersisted(),
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
			setTemplate: (templateId) =>
				set((state) => {
					state.metadata.templateId = templateId;
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
			reset: () => set(freshPersisted()),
		})),
	);
}
