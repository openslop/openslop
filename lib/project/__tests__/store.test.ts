import { describe, expect, it } from "vitest";
import { createProjectStore } from "../store";
import { ScriptSettingsSchema } from "../types";
import { VideoSettingsSchema } from "../videoSettings";

const RUNWARE = { provider: "runware", model: "Seedream 5 Lite" } as const;
const SLOP = { provider: "openslop", model: "Slop Image v1" } as const;
const CLAUDE = { provider: "anthropic", model: "claude-sonnet" } as const;

describe("project store", () => {
	it("updateVideoSettings deep-merges, so sibling caption style fields are preserved", () => {
		const store = createProjectStore();
		const before = store.getState().videoSettings.captionStyle;
		store.getState().updateVideoSettings({ transitionType: "fade" });
		store.getState().updateVideoSettings({ captionStyle: { fontSize: 99 } });

		expect(store.getState().videoSettings).toMatchObject({
			transitionType: "fade",
			captionStyle: { ...before, fontSize: 99 },
		});
	});

	it("updateModels pins a connector's model and keeps the others", () => {
		const store = createProjectStore();
		store.getState().updateModels({ image: RUNWARE, llm: CLAUDE });
		store.getState().updateModels({ image: SLOP });

		expect(store.getState().models).toEqual({ image: SLOP, llm: CLAUDE });
	});

	it("updateScriptSettings changes the settings it names and keeps the others", () => {
		const store = createProjectStore();
		store
			.getState()
			.updateScriptSettings({ language: "fr", template: "pov-life" });
		store.getState().updateScriptSettings({ length: "under-1m" });

		expect(store.getState().scriptSettings).toEqual(
			ScriptSettingsSchema.parse({
				language: "fr",
				template: "pov-life",
				length: "under-1m",
			}),
		);
	});

	it("reset returns the store to a blank project", () => {
		const store = createProjectStore();
		store.getState().updateVideoSettings({
			aspectRatio: "9:16",
			captions: false,
		});
		store.getState().updateModels({ image: RUNWARE });
		store.getState().updateScriptSettings({ language: "fr" });

		store.getState().reset();

		expect(store.getState().videoSettings).toEqual(
			VideoSettingsSchema.parse({}),
		);
		expect(store.getState().scriptSettings).toEqual(
			ScriptSettingsSchema.parse({}),
		);
		expect(store.getState().models).toEqual({});
	});
});
