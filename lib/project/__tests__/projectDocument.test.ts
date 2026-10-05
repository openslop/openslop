import { createEditor, type Editor } from "slate";
import { withHistory } from "slate-history";
import { describe, expect, it } from "vitest";
import type { SceneElement } from "@/lib/canvas/types";
import { GenerationQueue } from "@/lib/generation/queue";
import {
	resolveDefaultModels,
	type ConnectorModels,
} from "@/lib/connectors/models";
import { flatAttributes } from "@/lib/canvas/elementAttributes";
import { createProjectDocument, type ProjectContent } from "../projectDocument";
import { createProjectStore } from "../store";
import { ProjectSettingsSchema } from "../types";
import { VideoSettingsSchema } from "../videoSettings";
import { resultQueue } from "./_canvas";

const RECOMMENDED = { provider: "openslop", model: "Slop Image v1" } as const;
const BYOK = { provider: "runware", model: "Seedream 5 Lite" } as const;

// No provider, so the pair fails to parse and the element takes the default.
const UNPINNED = `<image model="Slop Image v1">a sunset</image>`;
const PINNED = `<image provider="openslop" model="Slop Image v1">a sunset</image>`;

const contentWith = (
	script: string,
	models: ConnectorModels = {},
): ProjectContent => ({
	script,
	store: {
		videoSettings: VideoSettingsSchema.parse({}),
		settings: ProjectSettingsSchema.parse({}),
		models,
	},
	generation: {},
});

const firstScene = (editor: Editor) => {
	const scene = editor.children.find(
		(node): node is SceneElement => "type" in node && node.type === "scene",
	);
	if (!scene) throw new Error("no scene");
	return scene;
};

const imageAttrs = (editor: Editor, index: number) =>
	flatAttributes(firstScene(editor).children[index]);

const setup = (
	accountModels: ConnectorModels = {},
	queue = new GenerationQueue(),
) => {
	const editor = withHistory(createEditor());
	const store = createProjectStore();
	editor.defaultModels = () =>
		resolveDefaultModels({
			project: store.getState().models,
			account: accountModels,
		});
	const document = createProjectDocument({ editor, store, queue });
	return { editor, store, document };
};

describe("createProjectDocument.write", () => {
	it("falls back to the account default, keeping an element's own pair", () => {
		const { editor, document } = setup({ image: BYOK });

		document.write(contentWith(`${UNPINNED}${PINNED}`));

		expect(imageAttrs(editor, 0)).toMatchObject(BYOK);
		expect(imageAttrs(editor, 1)).toMatchObject(RECOMMENDED);
	});

	it("resolves against the version's pins, not the live project's", () => {
		const { editor, store, document } = setup();
		store.getState().updateModels({ image: RECOMMENDED });

		document.write(contentWith(UNPINNED, { image: BYOK }));

		expect(imageAttrs(editor, 0)).toMatchObject(BYOK);
		expect(store.getState().models).toEqual({ image: BYOK });
	});
});

const ASSETS = `<style id="style">noir</style>\n<cast id="cast:Ada" voiceProvider="openslop" voiceModel="Slop TTS v1" name="Ada" provider="openslop" model="Slop Image v1">tall</cast>`;
const SCENE = `--- Scene 1 ---\n<narration id="line">hello</narration>\n<image id="shot">a sunset</image>`;

describe("createProjectDocument.read", () => {
	it("reads back the assets and scenes a version wrote", () => {
		const { document } = setup();

		document.write(contentWith(`${ASSETS}\n${SCENE}`));
		const { script } = document.read();

		expect(script.startsWith(`${ASSETS}\n\n--- Scene 1 ---\n<narration`)).toBe(
			true,
		);
		document.write(contentWith(script));
		expect(document.read().script).toBe(script);
	});
});

describe("createProjectDocument.details", () => {
	it.each([
		[
			"the script's first picture, never an avatar",
			{ shot: { imageUrl: "sunset.png" } },
			"sunset.png",
		],
		["null until the script has a picture", {}, null],
	])("its thumbnail is %s", (_, shots, thumbnail) => {
		const { document } = setup(
			{},
			resultQueue({ "cast:Ada": { imageUrl: "avatar.png" }, ...shots }),
		);
		document.write({
			...contentWith(`${ASSETS}\n${SCENE}`),
			generation: document.read().generation,
		});

		expect(document.details().thumbnail_url).toBe(thumbnail);
	});
});
