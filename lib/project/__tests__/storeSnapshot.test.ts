import { describe, expect, it } from "vitest";
import { DEFAULT_CAPTION_STYLE } from "@/lib/captions/captionStyle";
import {
	createProjectStore,
	extractStoreSnapshot,
	ProjectDataSchema,
} from "../store";
import { ScriptSettingsSchema } from "../types";
import { VideoSettingsSchema } from "../videoSettings";

const parse = (raw: unknown) => ProjectDataSchema.parse(raw);

const RUNWARE = { provider: "runware", model: "Seedream 5 Lite" } as const;

describe("storeSnapshot", () => {
	it("extracts a method-free snapshot, detached from its store", () => {
		const store = createProjectStore();
		const snap = extractStoreSnapshot(store);

		store.getState().updateVideoSettings({ aspectRatio: "9:16" });
		store.getState().updateModels({ image: RUNWARE });
		store.getState().updateScriptSettings({ language: "fr" });

		expect(snap).toEqual({
			title: "",
			videoSettings: VideoSettingsSchema.parse({}),
			scriptSettings: ScriptSettingsSchema.parse({}),
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
		src
			.getState()
			.updateScriptSettings({ language: "fr", template: "pov-life" });
		src.getState().setTitle("Moon Cat");

		const after = createProjectStore(extractStoreSnapshot(src)).getState();
		expect(after.videoSettings).toEqual(src.getState().videoSettings);
		expect(after.scriptSettings).toEqual(src.getState().scriptSettings);
		expect(after.models).toEqual({ image: RUNWARE });
		expect(after.title).toBe("Moon Cat");
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
			title: "",
			videoSettings: VideoSettingsSchema.parse({}),
			scriptSettings: ScriptSettingsSchema.parse({}),
			models: {},
		});
		expect(
			parse({ videoSettings: { aspectRatio: "9:16" } }).videoSettings,
		).toEqual(VideoSettingsSchema.parse({ aspectRatio: "9:16" }));
		expect(
			parse({ scriptSettings: { length: "under-1m" } }).scriptSettings,
		).toEqual(ScriptSettingsSchema.parse({ length: "under-1m" }));
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

	it("keeps only the title, video settings, script settings and models of a row that carries other fields", () => {
		expect(
			parse({
				videoSettings: { aspectRatio: "9:16", length: "60s", format: "x" },
				metadata: { title: "T" },
				referenceImages: ["a.png"],
			}),
		).toEqual({
			title: "",
			videoSettings: VideoSettingsSchema.parse({ aspectRatio: "9:16" }),
			scriptSettings: ScriptSettingsSchema.parse({}),
			models: {},
		});
	});

	it("throws on a structurally invalid row", () => {
		expect(() => parse({ videoSettings: { aspectRatio: 42 } })).toThrow();
	});
});
