import { z } from "zod";
import type { IconComponent } from "@/components/ui/icon";
import { errorMessage } from "@/lib/errors";
import type { AgentToolContext } from "./context";
import type { Retention } from "./define-tool";
import { captionMedia } from "./caption-media";
import { estimateSpeechLengths } from "./estimate-speech-lengths";
import { estimateTotalLength } from "./estimate-total-length";
import { editScript } from "./edit-script";
import { fitDurations } from "./fit-durations";
import { generateCaptions } from "./generate-captions";
import { listModels } from "./list-models";
import { loadSkill } from "./load-skill";
import { readMedia } from "./read-media";
import { readGeneration } from "./read-generation";
import { readModelAttributes } from "./read-model-attributes";
import { readScript } from "./read-script";
import { readScriptSettings } from "./read-script-settings";
import { readTemplate } from "./read-template";
import { readTitle } from "./read-title";
import { readVideoSettings } from "./read-video-settings";
import { viewMedia } from "./view-media";
import { setDefaultModel } from "./set-default-model";
import { setElementResult } from "./set-element-result";
import { setTitle } from "./set-title";
import { updateScriptSettings } from "./update-script-settings";
import { updateVideoSettings } from "./update-video-settings";
import { viewResult } from "./view-result";
import { writeScript } from "./write-script";

/** Registration is the contract: one entry is a tool's whole definition. */
const TOOLS = {
	load_skill: loadSkill,
	read_script: readScript,
	read_generation: readGeneration,
	read_title: readTitle,
	read_script_settings: readScriptSettings,
	read_template: readTemplate,
	read_video_settings: readVideoSettings,
	edit_script: editScript,
	write_script: writeScript,
	update_script_settings: updateScriptSettings,
	update_video_settings: updateVideoSettings,
	generate_captions: generateCaptions,
	caption_media: captionMedia,
	view_result: viewResult,
	read_media: readMedia,
	view_media: viewMedia,
	set_element_result: setElementResult,
	estimate_total_length: estimateTotalLength,
	estimate_speech_lengths: estimateSpeechLengths,
	fit_durations: fitDurations,
	set_title: setTitle,
	list_models: listModels,
	read_model_attributes: readModelAttributes,
	set_default_model: setDefaultModel,
};

export type AgentToolName = keyof typeof TOOLS;

/** What the model is offered: every tool's spec, none with an executor. */
export const SLOPPY_TOOLS = Object.fromEntries(
	Object.entries(TOOLS).map(([name, def]) => [name, def.spec]),
) as { [TName in AgentToolName]: (typeof TOOLS)[TName]["spec"] };

export type ToolInput<TName extends AgentToolName> = z.output<
	(typeof TOOLS)[TName]["input"]
>;

export type ToolOutput<TName extends AgentToolName> = Awaited<
	ReturnType<(typeof TOOLS)[TName]["execute"]>
>;

/** How a call reads in the transcript. */
export type ToolPresentation = { icon: IconComponent; label: string };

// The record's inferred type does not correlate a name with its schema and
// executor, so calls go through this mapped view of the same object. The
// input is read as the SDK streams it, so each label reads its own fields
// optionally.
const BY_NAME = TOOLS as unknown as {
	[TName in AgentToolName]: {
		input: z.ZodType<ToolInput<TName>>;
		execute: (
			input: ToolInput<TName>,
			ctx: AgentToolContext,
		) => Promise<ToolOutput<TName>>;
		present: { icon: IconComponent; label: (input: unknown) => string };
	};
};

/** Any tool's output: what an executor hands back for the model to read. */
export type AgentToolOutput = {
	[TName in AgentToolName]: ToolOutput<TName>;
}[AgentToolName];

const isToolName = (name: string): name is AgentToolName => name in TOOLS;

/** Null for a tool this build no longer offers, which a stored transcript still holds. */
export function presentToolCall(
	toolName: string,
	input: unknown,
): ToolPresentation | null {
	if (!isToolName(toolName)) return null;
	const { icon, label } = BY_NAME[toolName].present;
	return { icon, label: label(input ?? {}) };
}

export const retentionOf = (toolName: string): Retention =>
	isToolName(toolName) ? TOOLS[toolName].retention : "always";

/** Calls that are part of writing the script, so what is rendered from the canvas is mid-change. */
export const DRAFTING_TOOLS: ReadonlySet<string> = new Set(
	Object.entries(TOOLS)
		.filter(([, def]) => def.draftsScript)
		.map(([name]) => name),
);

/** Each tool whose input streams onto the canvas, by name, with the field that holds the OSML. */
export const SCRIPT_STREAM_FIELDS: ReadonlyMap<string, string> = new Map(
	Object.entries(TOOLS).flatMap(([name, def]) =>
		def.scriptStreamField ? [[name, def.scriptStreamField]] : [],
	),
);

/** A failure is reported, not thrown: the model reads it as the next observation. */
export type ToolOutcome =
	| { ok: true; output: AgentToolOutput }
	| { ok: false; errorText: string };

const run = async <TName extends AgentToolName>(
	toolName: TName,
	input: unknown,
	ctx: AgentToolContext,
): Promise<ToolOutcome> => {
	const parsed = BY_NAME[toolName].input.safeParse(input);
	if (!parsed.success) {
		return {
			ok: false,
			errorText: `${toolName} cannot take that input: ${parsed.error.message}`,
		};
	}
	return {
		ok: true,
		output: await BY_NAME[toolName].execute(parsed.data, ctx),
	};
};

/**
 * The SDK widens a tool call's name back to `string` on the way to the editor,
 * so the name is read back against the registry and its own tool parses the input.
 */
export async function executeToolCall(
	call: { toolName: string; input: unknown },
	ctx: AgentToolContext,
): Promise<ToolOutcome> {
	if (!isToolName(call.toolName)) {
		return { ok: false, errorText: `${call.toolName} is not a tool.` };
	}

	try {
		return await run(call.toolName, call.input, ctx);
	} catch (error) {
		return { ok: false, errorText: errorMessage(error) };
	}
}
