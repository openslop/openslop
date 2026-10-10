import type { Editor } from "slate";
import { beforeEach, describe, expect, it } from "vitest";
import {
	assetText,
	avatarNames,
	characterNames,
	findAsset,
	getAssets,
	getCanvasElements,
	NARRATOR,
	referenceUrls,
	voiceOf,
} from "@/lib/canvas/assets";
import { setAsset, setReferenceImages } from "@/lib/canvas/assetOps";
import { buildNode } from "@/lib/generation/generationGraph";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import { GenerationQueue } from "@/lib/generation/queue";
import { needsGeneration } from "@/lib/generation/staleness";
import { applyTemplate } from "@/lib/templates/applyTemplate";
import { getTemplate } from "@/lib/templates/templates";
import { createProjectStore, type ProjectStore } from "../store";
import { VoiceSchema } from "../types";
import { makeEditor } from "@/lib/canvas/__tests__/_assets";
import { buildCtx } from "@/lib/generation/__tests__/_context";

let editor: Editor;
let queue: GenerationQueue;
let store: ProjectStore;

const buildContext = () =>
	buildCtx(getCanvasElements(editor.children), { state: store.getState() });
const assets = () => getAssets(editor.children);
const settings = () => store.getState().scriptSettings;

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
		expect(assetText(assets(), "asset_avatar", "Protagonist")).toBe(appearance);
		expect(voiceOf(assets(), "Protagonist")).toMatchObject(voice);
	});

	it("gives the narrator the template's narration voice in place of the user's, and no avatar", () => {
		setAsset(editor, "asset_voice", NARRATOR, {
			attrs: { accent: "british", voiceId: "v-mine" },
		});

		apply("pov-life");

		expect(findAsset(assets(), "asset_avatar", NARRATOR)).toBeUndefined();
		expect(voiceOf(assets())).toEqual({
			...VoiceSchema.parse(getTemplate("pov-life").narration),
			...DEFAULT_MODELS.tts,
		});
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

	it("wipes the user's title and style, taking the template's style", () => {
		store.getState().setTitle("My Draft");
		setAsset(editor, "asset_style", undefined, { text: "noir" });
		apply("pov-life");

		expect(store.getState().title).toBe("");
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

	it("pins each prebuilt avatar on its avatar asset, fresh on arrival", () => {
		apply("pov-life");
		const avatar = findAsset(assets(), "asset_avatar", "Protagonist");
		if (!avatar) throw new Error("The template has no Protagonist");
		const node = buildNode(avatar, buildContext());
		const snapshot = queue.getElementSnapshot(node.id);

		expect(snapshot.result?.imageUrl).toBe(
			getTemplate("pov-life").characters?.Protagonist?.avatar,
		);
		expect(snapshot.pinned).toBe(true);
		expect(needsGeneration(node, queue)).toBe(false);
	});
});
