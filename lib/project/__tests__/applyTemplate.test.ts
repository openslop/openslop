import type { Editor } from "slate";
import { beforeEach, describe, expect, it } from "vitest";
import {
	assetText,
	avatarNames,
	characterNames,
	findAsset,
	getAssets,
	hasAvatar,
	NARRATOR,
	referenceUrls,
	voiceAttrs,
	voiceOf,
} from "@/lib/canvas/assets";
import {
	ensureSpeaker,
	setAsset,
	setReferenceImages,
} from "@/lib/canvas/assetOps";
import { buildNode } from "@/lib/generation/generationGraph";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import { getPromptText } from "@/lib/generation/inputs";
import { GenerationQueue } from "@/lib/generation/queue";
import { needsGeneration } from "@/lib/generation/staleness";
import { applyTemplate } from "@/lib/templates/applyTemplate";
import { getTemplate } from "@/lib/templates/templates";
import { createProjectStore, type ProjectStore } from "../store";
import { VoiceSchema } from "../types";
import { buildContextOf, makeEditor } from "./_canvas";

let editor: Editor;
let queue: GenerationQueue;
let store: ProjectStore;

const buildContext = () => buildContextOf(editor.children, store.getState());
const assets = () => getAssets(editor.children);
const settings = () => store.getState().settings;

const apply = (templateId: string) =>
	applyTemplate(editor, store, queue, buildContext, templateId);

describe("applyTemplate", () => {
	beforeEach(() => {
		editor = makeEditor();
		store = createProjectStore();
		queue = new GenerationQueue();
	});

	it("puts the template's characters on the canvas, each with their look and voice", () => {
		apply("pov-life");
		const {
			appearance,
			avatar: _,
			...voice
		} = getTemplate("pov-life").characters?.Protagonist ?? {};

		expect(avatarNames(assets())).toEqual(["Protagonist"]);
		const character = findAsset(assets(), "asset_character", "Protagonist");
		expect(character && getPromptText(character)).toBe(appearance);
		expect(voiceOf(assets(), "Protagonist")).toMatchObject(voice);
	});

	it("gives the narrator the template's narration voice and no avatar", () => {
		apply("pov-life");
		const narrator = findAsset(assets(), "asset_character", NARRATOR);

		expect(narrator && hasAvatar(narrator)).toBe(false);
		expect(voiceOf(assets())).toMatchObject(
			VoiceSchema.parse(getTemplate("pov-life").narration),
		);
	});

	it("does not leak characters from a previous template", () => {
		apply("pov-life");
		expect(characterNames(assets())).toContain("Protagonist");

		apply("sleep-story");
		expect(characterNames(assets())).toEqual([
			NARRATOR,
			...Object.keys(getTemplate("sleep-story").characters ?? {}),
		]);
	});

	it("records which template the project writes against", () => {
		apply("pov-life");
		expect(settings().template).toBe("pov-life");

		apply("sleep-story");
		expect(settings().template).toBe("sleep-story");
	});

	it("clears the template without disturbing what it applied", () => {
		apply("pov-life");
		store.getState().updateSettings({ template: undefined });

		expect(settings().template).toBeUndefined();
		expect(characterNames(assets())).toContain("Protagonist");
	});

	it("wipes the user's title and style, taking the template's style", () => {
		setAsset(editor, "asset_title", undefined, { text: "My Draft" });
		setAsset(editor, "asset_style", undefined, { text: "noir" });
		apply("pov-life");

		expect(assetText(editor.children, "asset_title")).toBe("");
		expect(assetText(assets(), "asset_style")).toBe(
			getTemplate("pov-life").style?.description,
		);
	});

	it("sets the video length the template is written for", () => {
		apply("pov-life");
		expect(settings().length).toBe(getTemplate("pov-life").length);
	});

	it("replaces any earlier reference images with the template's", () => {
		setReferenceImages(editor, ["user://a.png", "user://b.png"]);
		apply("pov-life");
		expect(referenceUrls(assets()).length).toBeGreaterThan(0);

		apply("sleep-story");
		expect(referenceUrls(assets())).toEqual(
			getTemplate("sleep-story").referenceImages,
		);
	});

	it("throws on an unknown template id instead of silently no-opping", () => {
		expect(() => apply("does-not-exist")).toThrow(/Unknown template id/);
	});

	it("wipes the user's narrator voice before applying", () => {
		setAsset(editor, "asset_character", ensureSpeaker(editor), {
			attrs: voiceAttrs({ accent: "british", voiceId: "v-mine" }),
		});

		apply("pov-life");
		expect(voiceOf(assets())).toEqual({
			...VoiceSchema.parse(getTemplate("pov-life").narration),
			...DEFAULT_MODELS.tts,
		});
	});

	it("resets the video settings the store holds", () => {
		store.getState().updateVideoSettings({ aspectRatio: "9:16" });

		apply("pov-life");

		expect(store.getState().videoSettings).toEqual(
			createProjectStore().getState().videoSettings,
		);
	});

	it("leaves the script's scenes where they are", () => {
		editor.children = [
			{
				id: "scene",
				type: "scene",
				children: [
					{
						id: "line",
						type: "narration",
						children: [{ id: "line-t", type: "narration", text: "hello" }],
					},
				],
			},
		];

		apply("pov-life");

		expect(editor.children.at(-1)).toMatchObject({ id: "scene" });
		expect(assets().length).toBe(editor.children.length - 1);
	});

	it("pins each prebuilt avatar on its character asset, fresh on arrival", () => {
		apply("pov-life");
		const character = findAsset(assets(), "asset_character", "Protagonist");
		if (!character) throw new Error("The template has no Protagonist");
		const node = buildNode(character, buildContext());
		const snapshot = queue.getElementSnapshot(node.id);

		expect(snapshot.result?.imageUrl).toBe(
			getTemplate("pov-life").characters?.Protagonist?.avatar,
		);
		expect(snapshot.pinned).toBe(true);
		expect(needsGeneration(node, queue)).toBe(false);
	});
});
