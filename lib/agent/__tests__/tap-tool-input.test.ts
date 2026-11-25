import { describe, expect, it } from "vitest";
import type { UIMessageChunk } from "ai";
import { tapToolInputText } from "../tap-tool-input";

/** Each opened sink as the text it was written, then "|" once flushed. */
const run = async (chunks: UIMessageChunk[]) => {
	const sinks: string[][] = [];
	const passed: UIMessageChunk[] = [];
	const stream = new ReadableStream<UIMessageChunk>({
		start(controller) {
			chunks.forEach((chunk) => controller.enqueue(chunk));
			controller.close();
		},
	}).pipeThrough(
		tapToolInputText(new Map([["write_script", "osml"]]), () => {
			const writes: string[] = [];
			sinks.push(writes);
			return {
				write: (chunk) => void writes.push(chunk),
				flush: () => void writes.push("|"),
			};
		}),
	);
	const reader = stream.getReader();
	for (let next = await reader.read(); !next.done; next = await reader.read()) {
		passed.push(next.value);
	}
	return { sinks, passed };
};

const start = (toolCallId: string, toolName = "write_script") =>
	({ type: "tool-input-start", toolCallId, toolName }) as const;

const delta = (toolCallId: string, inputTextDelta: string) =>
	({ type: "tool-input-delta", toolCallId, inputTextDelta }) as const;

const available = (
	toolCallId: string,
	osml: string,
	toolName = "write_script",
) =>
	({
		type: "tool-input-available",
		toolCallId,
		toolName,
		input: { osml },
	}) as const;

describe("tapToolInputText", () => {
	it("writes the field as it streams, unescaped, and flushes once the call is whole", async () => {
		const chunks = [
			start("w"),
			delta("w", '{"os'),
			delta("w", 'ml":"<speech>Hi'),
			delta("w", '\\n\\"there\\"'),
			delta("w", '</speech>"}'),
			available("w", '<speech>Hi\n"there"</speech>'),
		];

		const { sinks, passed } = await run(chunks);

		expect(sinks).toEqual([["<speech>Hi", '\n"there"', "</speech>", "|"]]);
		expect(passed).toEqual(chunks);
	});

	it("never writes a half-arrived escape", async () => {
		const { sinks } = await run([
			start("w"),
			delta("w", '{"osml":"a\\'),
			delta("w", 'nb"}'),
			available("w", "a\nb"),
		]);

		expect(sinks[0]?.join("")).toBe("a\nb|");
	});

	it("writes a call that arrives unstreamed whole", async () => {
		const { sinks } = await run([available("w", "<speech>Hi</speech>")]);

		expect(sinks).toEqual([["<speech>Hi</speech>", "|"]]);
	});

	it("leaves other tools' calls alone", async () => {
		const { sinks } = await run([
			start("e", "edit_script"),
			delta("e", '{"osml":"<speech>no</speech>"}'),
			available("e", "<speech>no</speech>", "edit_script"),
		]);

		expect(sinks).toEqual([]);
	});
});
