import merge from "lodash/merge";
import { immer } from "zustand/middleware/immer";
import { createStore, type StoreApi } from "zustand/vanilla";
import type { DeepPartial } from "./types";
import { VideoSettingsSchema, type VideoSettings } from "./videoSettings";

/** Everything else the project holds is on the canvas. */
export type ProjectData = {
	videoSettings: VideoSettings;
};

export type ProjectContext = ProjectData & {
	updateVideoSettings: (partial: DeepPartial<VideoSettings>) => void;
	reset: () => void;
};

export type ProjectStore = StoreApi<ProjectContext>;

const freshProject = (): ProjectData => ({
	videoSettings: VideoSettingsSchema.parse({}),
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
			reset: () => set(freshProject()),
		})),
	);
}
