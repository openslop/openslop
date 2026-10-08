import { describe, expect, it, vi } from "vitest";
import { createEditor, Transforms, type Editor } from "slate";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { createCanvasElement } from "@/lib/canvas/createCanvasElement";
import { isContentElement } from "@/lib/canvas/guards";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import { SCENE_TYPE, type Scene } from "@/lib/canvas/types";
import type { LLMConnector } from "@/lib/connectors/types";
import { ScriptSettingsSchema } from "@/lib/project/types";
import { sleep } from "@/lib/utils";
import { streamScript } from "../streamScript";

const makeEditor = () => {
	const editor = createEditor();
	editor.defaultModels = () => ({});
	return editor;
};

const elements = (editor: Editor): [type: string, text: string][] =>
	editor.children
		.filter(isContentElement)
		.map((element) => [element.type, getElementBodyText(element)]);

const oldScene = (): Scene => ({
	id: "old-scene",
	type: SCENE_TYPE,
	children: [createCanvasElement("narration", { text: "the old script" })],
});

const topLevelTypes = (editor: Editor) =>
	editor.children.map((node) => "type" in node && node.type);

const nextTurn = () => sleep(0);

const DEFAULT_SETTINGS = ScriptSettingsSchema.parse({});

/** Streams each burst's chunks back to back, with a turn of the event loop between bursts. */
const llmStreaming = (bursts: string[][], failure?: Error) => {
	const prompts: string[] = [];
	const systems: (string | undefined)[] = [];
	const llm: LLMConnector = {
		type: "llm",
		generate: () => Promise.reject(new Error("streamScript only streams")),
		async *stream({ prompt, systemPrompt }) {
			prompts.push(prompt);
			systems.push(systemPrompt);
			for (const burst of bursts) {
				for (const text of burst) yield { text, done: false };
				await nextTurn();
			}
			if (failure) throw failure;
		},
	};
	return { llm, prompts, systems };
};

describe("streamScript", () => {
	const brief = { kind: "brief", brief: "a lighthouse" } as const;

	it("replaces what was on the canvas with the streamed script", async () => {
		const editor = makeEditor();
		Transforms.insertNodes(editor, oldScene(), { at: [0] });
		const { llm, prompts } = llmStreaming([
			["<narration>A new "],
			["story</narration>\n<image>a lighth"],
			["ouse at dusk</image>"],
		]);

		await streamScript(editor, DEFAULT_SETTINGS, llm, brief);

		expect(prompts).toHaveLength(1);
		expect(prompts[0]).toContain("a lighthouse");
		expect(topLevelTypes(editor)).toEqual(["narration", "image"]);
		expect(elements(editor)).toEqual([
			["narration", "A new story"],
			["image", "a lighthouse at dusk"],
		]);
	});

	it("keeps the assets on the canvas and writes the script against them", async () => {
		const editor = makeEditor();
		const assets = [
			asset("asset_style", { text: "muted watercolor" }),
			asset("asset_avatar", { name: "Lumi", text: "a small grey rabbit" }),
		];
		Transforms.insertNodes(editor, [...assets, oldScene()], {
			at: [0],
		});
		const { llm, prompts, systems } = llmStreaming([
			["<narration>A new story</narration>"],
		]);

		await streamScript(editor, DEFAULT_SETTINGS, llm, brief);

		expect(prompts).toEqual(["a lighthouse"]);
		expect(systems[0]).toContain("muted watercolor");
		expect(systems[0]).toContain("## Lumi");
		expect(editor.children.slice(0, 2)).toEqual(assets);
		expect(topLevelTypes(editor)).toEqual([
			"asset_style",
			"asset_avatar",
			"narration",
		]);
	});

	it("writes to the project's settings", async () => {
		const editor = makeEditor();
		const settings = ScriptSettingsSchema.parse({
			length: "1-3m",
			language: "es",
		});
		const { llm, systems } = llmStreaming([["<narration>Hola</narration>"]]);

		await streamScript(editor, settings, llm, brief);

		expect(systems[0]).toContain("# Length");
		expect(systems[0]).toContain("es (ISO 639-1)");
	});

	it("lands each burst of chunks as one change to the document", async () => {
		const editor = makeEditor();
		editor.onChange = vi.fn();
		const { llm } = llmStreaming([
			["<narration>", "Once", " upon", " a time"],
			[", far", " away", "</narration>"],
		]);

		await streamScript(editor, DEFAULT_SETTINGS, llm, brief);
		await nextTurn();

		expect(editor.onChange).toHaveBeenCalledTimes(2);
		expect(elements(editor)).toEqual([
			["narration", "Once upon a time, far away"],
		]);
	});

	it("lands what arrived before the stream failed", async () => {
		const editor = makeEditor();
		const { llm } = llmStreaming(
			[["<narration>", "Once upon a time"]],
			new Error("the connection dropped"),
		);

		await expect(
			streamScript(editor, DEFAULT_SETTINGS, llm, brief),
		).rejects.toThrow("the connection dropped");
		expect(elements(editor)).toEqual([["narration", "Once upon a time"]]);
	});

	it("rejects when a write fails mid-stream", async () => {
		const editor = makeEditor();
		vi.spyOn(editor, "apply").mockImplementation(() => {
			throw new Error("the document refused the write");
		});
		const { llm } = llmStreaming([
			["<narration>", "Once upon a time"],
			[", far away</narration>"],
		]);

		await expect(
			streamScript(editor, DEFAULT_SETTINGS, llm, brief),
		).rejects.toThrow("the document refused the write");
	});
});
