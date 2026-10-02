import { describe, expect, it, vi } from "vitest";
import { createEditor, Transforms, type Editor } from "slate";
import { createCanvasNode } from "@/lib/canvas/createCanvasNode";
import { isContentElement } from "@/lib/canvas/guards";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import type { LLMConnector } from "@/lib/connectors/types";
import { createProjectStore } from "@/lib/project/store";
import { sleep } from "@/lib/utils";
import { streamScript } from "../streamScript";

const makeCanvas = () => {
	const editor = createEditor();
	editor.defaultModels = () => ({});
	return { editor, store: createProjectStore() };
};

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

	it("rejects when a write fails mid-stream", async () => {
		const canvas = makeCanvas();
		vi.spyOn(canvas.editor, "apply").mockImplementation(() => {
			throw new Error("the document refused the write");
		});
		const { llm } = llmStreaming([
			["<narration>", "Once upon a time"],
			[", far away</narration>"],
		]);

		await expect(streamScript(canvas, llm, brief)).rejects.toThrow(
			"the document refused the write",
		);
	});
});
