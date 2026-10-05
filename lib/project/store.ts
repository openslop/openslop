import merge from "lodash/merge";
import { immer } from "zustand/middleware/immer";
import { createStore, type StoreApi } from "zustand/vanilla";
import type { ConnectorModels } from "@/lib/connectors/models";
import {
	ProjectSettingsSchema,
	type DeepPartial,
	type ProjectSettings,
} from "./types";
import { VideoSettingsSchema, type VideoSettings } from "./videoSettings";

/** Everything else the project holds is on the canvas. */
export type ProjectData = {
	videoSettings: VideoSettings;
	settings: ProjectSettings;
	/** The models this project pins per connector type, ahead of the account's. */
	models: ConnectorModels;
};

export type ProjectContext = ProjectData & {
	updateVideoSettings: (partial: DeepPartial<VideoSettings>) => void;
	updateSettings: (settings: Partial<ProjectSettings>) => void;
	updateModels: (models: ConnectorModels) => void;
	reset: () => void;
};

export type ProjectStore = StoreApi<ProjectContext>;

const freshProject = (): ProjectData => ({
	videoSettings: VideoSettingsSchema.parse({}),
	settings: ProjectSettingsSchema.parse({}),
	models: {},
});

export function createProjectStore(
	initial: ProjectData = freshProject(),
): ProjectStore {
	return createStore<ProjectContext>()(
		immer((set) => ({
			...initial,
			updateVideoSettings: (partial) =>
				set((state) => {
					merge(state.videoSettings, partial);
				}),
			updateSettings: (settings) =>
				set((state) => {
					Object.assign(state.settings, settings);
				}),
			updateModels: (models) =>
				set((state) => {
					Object.assign(state.models, models);
				}),
			reset: () => set(freshProject()),
		})),
	);
}
