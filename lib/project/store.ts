import merge from "lodash/merge";
import { z } from "zod";
import { immer } from "zustand/middleware/immer";
import { createStore, type StoreApi } from "zustand/vanilla";
import {
	connectorModelsSchema,
	type ConnectorModels,
} from "@/lib/connectors/models";
import {
	ScriptSettingsSchema,
	type DeepPartial,
	type ScriptSettings,
} from "./types";
import { VideoSettingsSchema, type VideoSettings } from "./videoSettings";

const orEmpty = (value: unknown) => value ?? {};

/** Everything else the project holds is on the canvas. Parsing fills every default. */
export const ProjectDataSchema = z.preprocess(
	orEmpty,
	z.object({
		title: z.string().default(""),
		videoSettings: VideoSettingsSchema,
		scriptSettings: z.preprocess(orEmpty, ScriptSettingsSchema),
		/** The models this project pins per connector type, ahead of the account's. */
		models: connectorModelsSchema.default({}),
	}),
);

export type ProjectData = z.infer<typeof ProjectDataSchema>;

export type ProjectContext = ProjectData & {
	setTitle: (title: string) => void;
	updateVideoSettings: (partial: DeepPartial<VideoSettings>) => void;
	updateScriptSettings: (settings: Partial<ScriptSettings>) => void;
	updateModels: (models: ConnectorModels) => void;
	reset: () => void;
};

export type ProjectStore = StoreApi<ProjectContext>;

const freshProject = (): ProjectData => ProjectDataSchema.parse({});

export const extractStoreSnapshot = (store: ProjectStore): ProjectData =>
	ProjectDataSchema.parse(store.getState());

export function createProjectStore(
	initial: ProjectData = freshProject(),
): ProjectStore {
	return createStore<ProjectContext>()(
		immer((set) => ({
			...initial,
			setTitle: (title) => set({ title }),
			updateVideoSettings: (partial) =>
				set((state) => {
					merge(state.videoSettings, partial);
				}),
			updateScriptSettings: (settings) =>
				set((state) => {
					Object.assign(state.scriptSettings, settings);
				}),
			updateModels: (models) =>
				set((state) => {
					Object.assign(state.models, models);
				}),
			reset: () => set(freshProject()),
		})),
	);
}
