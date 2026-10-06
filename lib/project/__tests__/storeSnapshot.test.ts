import { describe, expect, it } from "vitest";
import { DEFAULT_CAPTION_STYLE } from "@/lib/captions/captionStyle";
import {
	createProjectStore,
	extractStoreSnapshot,
	ProjectDataSchema,
} from "../store";
import { ProjectSettingsSchema } from "../types";
import { VideoSettingsSchema } from "../videoSettings";

const parse = (raw: unknown) => ProjectDataSchema.parse(raw);

const RUNWARE = { provider: "runware", model: "Seedream 5 Lite" } as const;

describe("storeSnapshot", () => {
	it("extracts a method-free snapshot, detached from its store", () => {
		const store = createProjectStore();
		const snap = extractStoreSnapshot(store);

		store.getState().updateVideoSettings({ aspectRatio: "9:16" });
		store.getState().updateModels({ image: RUNWARE });
		store.getState().updateSettings({ language: "fr" });

		expect(snap).toEqual({
			videoSettings: VideoSettingsSchema.parse({}),
			settings: ProjectSettingsSchema.parse({}),
			models: {},
		});
	});

	it("round-trips through createProjectStore", () => {
		const src = createProjectStore();
		src.getState().updateVideoSettings({
			aspectRatio: "9:16",
			transitionType: "fade",
			captions: false,
		});

		src.getState().updateModels({ image: RUNWARE });
		src.getState().updateSettings({ language: "fr", template: "pov-life" });

		const after = createProjectStore(extractStoreSnapshot(src)).getState();
		expect(after.videoSettings).toEqual(src.getState().videoSettings);
		expect(after.settings).toEqual(src.getState().settings);
		expect(after.models).toEqual({ image: RUNWARE });
	});

	it("creates the same store from an empty parsed snapshot as from nothing", () => {
		expect(extractStoreSnapshot(createProjectStore(parse(null)))).toEqual(
			extractStoreSnapshot(createProjectStore()),
		);
	});
});

describe("ProjectDataSchema", () => {
	it("fills defaults for absent and partial rows", () => {
		expect(parse(null)).toEqual({
			videoSettings: VideoSettingsSchema.parse({}),
			settings: ProjectSettingsSchema.parse({}),
			models: {},
		});
		expect(
			parse({ videoSettings: { aspectRatio: "9:16" } }).videoSettings,
		).toEqual(VideoSettingsSchema.parse({ aspectRatio: "9:16" }));
		expect(parse({ settings: { length: "under-1m" } }).settings).toEqual(
			ProjectSettingsSchema.parse({ length: "under-1m" }),
		);
	});

	it("keeps a stored row intact and completes its video settings", () => {
		const videoSettings = {
			aspectRatio: "9:16" as const,
			transitionType: "fade" as const,
		};

		expect(parse({ videoSettings }).videoSettings).toEqual({
			...videoSettings,
			captions: true,
			captionStyle: DEFAULT_CAPTION_STYLE,
		});
	});

	it("keeps only the video settings, settings and models of a row that carries other fields", () => {
		expect(
			parse({
				videoSettings: { aspectRatio: "9:16", length: "60s", format: "x" },
				metadata: { title: "T" },
				referenceImages: ["a.png"],
			}),
		).toEqual({
			videoSettings: VideoSettingsSchema.parse({ aspectRatio: "9:16" }),
			settings: ProjectSettingsSchema.parse({}),
			models: {},
		});
	});

	it("throws on a structurally invalid row", () => {
		expect(() => parse({ videoSettings: { aspectRatio: 42 } })).toThrow();
	});
});
