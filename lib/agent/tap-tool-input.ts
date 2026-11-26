import get from "lodash/get";
import isString from "lodash/isString";
import { parsePartialJson, type UIMessageChunk } from "ai";
import type { ScriptSink } from "@/lib/script/script-writer";

type Call = {
	id: string;
	field: string;
	sink: ScriptSink;
	json: string;
	written: number;
};

const writeNewText = (call: Call, input: unknown) => {
	const text: unknown = get(input, call.field);
	// A repaired partial escape can parse shorter than the last read, so never rewind.
	if (!isString(text) || text.length <= call.written) return;
	call.sink.write(text.slice(call.written));
	call.written = text.length;
};

/** Passes chunks through, writing each tapped tool's `fields` entry to a sink as its input streams in; tapped calls come one at a time. */
export function tapToolInputText(
	fields: ReadonlyMap<string, string>,
	open: () => ScriptSink,
): TransformStream<UIMessageChunk, UIMessageChunk> {
	let call: Call | undefined;
	const start = (id: string, field: string): Call => ({
		id,
		field,
		sink: open(),
		json: "",
		written: 0,
	});

	return new TransformStream({
		async transform(chunk, controller) {
			controller.enqueue(chunk);
			switch (chunk.type) {
				case "tool-input-start": {
					const field = fields.get(chunk.toolName);
					if (field) call = start(chunk.toolCallId, field);
					return;
				}
				case "tool-input-delta": {
					if (call?.id !== chunk.toolCallId) return;
					call.json += chunk.inputTextDelta;
					writeNewText(call, (await parsePartialJson(call.json)).value);
					return;
				}
				case "tool-input-available": {
					const field = fields.get(chunk.toolName);
					if (!field) return;
					const done =
						call?.id === chunk.toolCallId
							? call
							: start(chunk.toolCallId, field);
					call = undefined;
					writeNewText(done, chunk.input);
					done.sink.flush();
				}
			}
		},
	});
}
