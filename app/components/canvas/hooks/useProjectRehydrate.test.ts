import { createEditor } from "slate";
import { withHistory } from "slate-history";
import { describe, expect, it } from "vitest";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import { SCENE_TYPE, type SceneElement } from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { rehydrateProjectEditor } from "./useProjectRehydrate";

const connector = {
	openslop: { defaultModel: "m", models: ["m"], isDefault: true, apiKey: "" },
};

const connectors: ConnectorRegistry = {
	llm: connector,
	tts: connector,
	image: connector,
	animated_image: connector,
	video: connector,
	sfx: connector,
	music: connector,
};

const scene: SceneElement = {
	id: "scene-id",
	type: SCENE_TYPE,
	children: [
		{
			id: "narration-id",
			type: "narration",
			children: [{ id: "text-id", type: "narration", text: "hello" }],
		},
	],
};

describe("rehydrateProjectEditor", () => {
	it("does not save project load operations to undo history", () => {
		const editor = withHistory(createEditor());
		const osml = serializeOSMLWithScenes([scene]);

		rehydrateProjectEditor(editor, osml, connectors);

		expect(editor.children).toHaveLength(1);
		expect(editor.history.undos).toEqual([]);
	});
});
