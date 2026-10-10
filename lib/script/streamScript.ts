import type { Editor } from "slate";
import { getAssets } from "@/lib/canvas/assets";
import type { LLMConnector } from "@/lib/connectors/types";
import type { ScriptSettings } from "@/lib/project/types";
import { buildScriptPrompt, type ScriptSource } from "./prompt/build";
import { createScriptWriter } from "./scriptWriter";

/** Replaces the script on the canvas with one the model writes from `source`, against the assets already there. */
export async function streamScript(
	editor: Editor,
	settings: ScriptSettings,
	llm: LLMConnector,
	source: ScriptSource,
	signal?: AbortSignal,
): Promise<void> {
	const write = createScriptWriter(editor);
	const { system, prompt } = buildScriptPrompt(
		getAssets(editor.children),
		settings,
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
