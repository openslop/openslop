import { z } from "zod";
import type { IconComponent } from "@/components/ui/icon";
import { errorMessage } from "@/lib/errors";
import type { AgentToolContext } from "./context";
import { adaptScript } from "./adapt-script";
import { measureElementLengths } from "./measure-element-lengths";
import { measureTotalLength } from "./measure-total-length";
import { editScript } from "./edit-script";
import { fitDurations } from "./fit-durations";
import { outlineStory } from "./outline-story";
import { readScript } from "./read-script";
import { reviewScript } from "./review-script";
import { setTitle } from "./set-title";
import { updateScriptSettings } from "./update-script-settings";
import { updateVideoSettings } from "./update-video-settings";
import { viewImage } from "./view-image";
import { writeScript } from "./write-script";

/** Registration is the contract: one entry is a tool's whole definition. */
const TOOLS = {
	read_script: readScript,
	edit_script: editScript,
	write_script: writeScript,
	adapt_script: adaptScript,
	review_script: reviewScript,
	update_script_settings: updateScriptSettings,
	update_video_settings: updateVideoSettings,
	view_image: viewImage,
	outline_story: outlineStory,
	measure_total_length: measureTotalLength,
	measure_element_lengths: measureElementLengths,
	fit_durations: fitDurations,
	set_title: setTitle,
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

type ToolFlag = "snapshot" | "draftsScript";

const namesFlagged = (flag: ToolFlag): ReadonlySet<string> =>
	new Set(
		Object.entries(TOOLS)
			.filter(([, def]) => def[flag])
			.map(([name]) => name),
	);

/** Output that is only true until the next edit, so only its own turn keeps it. */
export const SNAPSHOT_TOOLS = namesFlagged("snapshot");

/** Calls that are part of writing the script, so what is rendered from the canvas is mid-change. */
export const SCRIPT_TOOLS = namesFlagged("draftsScript");

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
