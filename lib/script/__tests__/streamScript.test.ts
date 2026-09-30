import { describe, expect, it, vi } from "vitest";
import { createEditor, Transforms, type Editor } from "slate";
import { createCanvasNode } from "@/lib/canvas/createCanvasNode";
import { isContentElement } from "@/lib/canvas/guards";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import type { LLMConnector } from "@/lib/connectors/types";
import { createProjectStore } from "@/lib/project/store";
import { sleep } from "@/lib/utils";
import { createScriptWriter, streamScript } from "../streamScript";

const makeCanvas = () => ({
	editor: createEditor(),
	store: createProjectStore(),
	defaultModels: () => ({}),
});

const elements = (editor: Editor): [type: string, text: string][] =>
	editor.children
		.filter(isContentElement)
		.map((element) => [element.type, getElementBodyText(element)]);

const nextTurn = () => sleep(0);

/** Streams each burst's chunks back to back, with a turn of the event loop between bursts. */
const llmStreaming = (bursts: string[][], failure?: Error) => {
	const prompts: string[] = [];
	const llm: LLMConnector = {
		type: "llm",
		generate: () => Promise.reject(new Error("streamScript only streams")),
		async *stream({ prompt }) {
			prompts.push(prompt);
			for (const burst of bursts) {
				for (const text of burst) yield { text, done: false };
				await nextTurn();
			}
			if (failure) throw failure;
		},
	};
	return { llm, prompts };
};

describe("createScriptWriter", () => {
	it("grows an element in the document as its text arrives", () => {
		const canvas = makeCanvas();
		const write = createScriptWriter(canvas);

		write("<narration>");
		write("Once upon");
		expect(elements(canvas.editor)).toEqual([["narration", "Once upon"]]);

		write(" a time, far away");
		expect(elements(canvas.editor)).toEqual([
			["narration", "Once upon a time, far away"],
		]);
	});

	it("writes later text through the editor, never into the node it inserted", () => {
		const canvas = makeCanvas();
		const write = createScriptWriter(canvas);
		write("<narration>");
		write("Once upon");
		const inserted = canvas.editor.children[0];

		write(" a time, far away");

		expect(canvas.editor.children[0]).not.toBe(inserted);
		expect(inserted).toMatchObject({
			children: [{}, { text: "Once upon" }],
		});
	});

	it("holds an element back until it has text", () => {
		const canvas = makeCanvas();
		const write = createScriptWriter(canvas);

		write("<image>a wolf</image>\n<narration>");
		expect(elements(canvas.editor)).toEqual([["image", "a wolf"]]);

		write("The wolf howled at the moon");
		expect(elements(canvas.editor)).toEqual([
			["image", "a wolf"],
			["narration", "The wolf howled at the moon"],
		]);
	});

	it("writes every element of a chunk, however many it carries", () => {
		const canvas = makeCanvas();
		const lines = ["one", "two", "three", "four", "five"];

		createScriptWriter(canvas)(
			lines.map((line) => `<narration>${line}</narration>`).join("\n"),
		);

		expect(elements(canvas.editor)).toEqual(
			lines.map((line) => ["narration", line]),
		);
	});

	it("patches the project from metadata tags and keeps them off the canvas", () => {
		const canvas = makeCanvas();
		const write = createScriptWriter(canvas);

		write("<metadata_title>The Wolf</metadata_title>\n");
		write('<metadata_character name="Ayla" gender="feminine">A tall ');
		write("hunter in furs</metadata_character>\n");
		write("<narration>Snow fell.</narration>");

		const { metadata } = canvas.store.getState();
		expect(metadata.title).toBe("The Wolf");
		expect(metadata.characters.Ayla).toMatchObject({
			appearance: "A tall hunter in furs",
			gender: "feminine",
		});
		expect(elements(canvas.editor)).toEqual([["narration", "Snow fell."]]);
	});
});

describe("streamScript", () => {
	const brief = { kind: "brief", brief: "a lighthouse" } as const;

	it("replaces what was on the canvas with the streamed script", async () => {
		const canvas = makeCanvas();
		Transforms.insertNodes(
			canvas.editor,
			createCanvasNode("narration", { text: "the old script" }),
			{ at: [0] },
		);
		const { llm, prompts } = llmStreaming([
			["<narration>A new "],
			["story</narration>\n<image>a lighth"],
			["ouse at dusk</image>"],
		]);

		await streamScript(canvas, llm, brief);

		expect(prompts).toHaveLength(1);
		expect(prompts[0]).toContain("a lighthouse");
		expect(elements(canvas.editor)).toEqual([
			["narration", "A new story"],
			["image", "a lighthouse at dusk"],
		]);
	});

	it("lands each burst of chunks as one change to the document", async () => {
		const canvas = makeCanvas();
		canvas.editor.onChange = vi.fn();
		const { llm } = llmStreaming([
			["<narration>", "Once", " upon", " a time"],
			[", far", " away", "</narration>"],
		]);

		await streamScript(canvas, llm, brief);
		await nextTurn();

		expect(canvas.editor.onChange).toHaveBeenCalledTimes(2);
		expect(elements(canvas.editor)).toEqual([
			["narration", "Once upon a time, far away"],
		]);
	});

	it("lands what arrived before the stream failed", async () => {
		const canvas = makeCanvas();
		const { llm } = llmStreaming(
			[["<narration>", "Once upon a time"]],
			new Error("the connection dropped"),
		);

		await expect(streamScript(canvas, llm, brief)).rejects.toThrow(
			"the connection dropped",
		);
		expect(elements(canvas.editor)).toEqual([
			["narration", "Once upon a time"],
		]);
	});
});
