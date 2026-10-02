import { clearEditor } from "@/lib/canvas/editorOps";
import type { LLMConnector } from "@/lib/connectors/types";
import { buildScriptPrompt, type ScriptSource } from "./prompt/build";
import { createScriptWriter, type ScriptCanvas } from "./scriptWriter";

/** Replaces the canvas with a script the model writes from `source`. */
export async function streamScript(
	canvas: ScriptCanvas,
	llm: LLMConnector,
	source: ScriptSource,
	signal?: AbortSignal,
): Promise<void> {
	clearEditor(canvas.editor);
	const write = createScriptWriter(canvas);
	const { system, prompt } = buildScriptPrompt(
		canvas.store.getState().metadata,
		source,
	);

	// One document change per token re-runs every subscriber and falls behind
	// the stream, so chunks from one turn of the event loop land together.
	// A write that throws inside the timer would escape the caller, so the
	// error is held and rethrown from here.
	const pending: string[] = [];
	let failure: unknown;
	const flush = () => {
		try {
			pending.splice(0).forEach(write);
		} catch (error) {
			failure ??= error;
		}
	};
	try {
		for await (const { text } of llm.stream(
			{ prompt, systemPrompt: system },
			signal,
		)) {
			if (failure) throw failure;
			if (!text) continue;
			if (pending.length === 0) setTimeout(flush);
			pending.push(text);
		}
	} finally {
		flush();
	}
	if (failure) throw failure;
}
