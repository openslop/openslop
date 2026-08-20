import { z } from "zod";
import { errorMessage } from "@/lib/errors";
import type { AgentToolContext } from "./context";
import { adaptScript } from "./adaptScript";
import { countWords } from "./countWords";
import { editScript } from "./editScript";
import { outlineStory } from "./outlineStory";
import { readScript } from "./readScript";
import { setCharacter } from "./setCharacter";
import { setLanguage } from "./setLanguage";
import { setMetadata } from "./setMetadata";
import { setNarrator } from "./setNarrator";
import { setVideoSettings } from "./setVideoSettings";
import { viewAvatar } from "./viewAvatar";
import { viewReferenceImages } from "./viewReferenceImages";
import { writeScript } from "./writeScript";

/** Registration is the contract: one entry is a tool's whole definition. */
const TOOLS = {
	read_script: readScript,
	edit_script: editScript,
	write_script: writeScript,
	adapt_script: adaptScript,
	set_video_settings: setVideoSettings,
	set_language: setLanguage,
	view_reference_images: viewReferenceImages,
	view_avatar: viewAvatar,
	outline_story: outlineStory,
	count_words: countWords,
	set_metadata: setMetadata,
	set_narrator: setNarrator,
	set_character: setCharacter,
};

export type AgentToolName = keyof typeof TOOLS;

/** What the model is offered: every tool's spec, none with an executor. */
export const SLOPPY_TOOLS = Object.fromEntries(
	Object.entries(TOOLS).map(([name, def]) => [name, def.spec]),
) as { [TName in AgentToolName]: (typeof TOOLS)[TName]["spec"] };

export type ToolInput<TName extends AgentToolName> = z.output<
	(typeof TOOLS)[TName]["input"]
>;

// The record's inferred type does not correlate a name with its executor's
// signature, so calls go through this mapped view of the same object.
const EXECUTORS = TOOLS as unknown as {
	[TName in AgentToolName]: {
		execute: (
			input: ToolInput<TName>,
			ctx: AgentToolContext,
		) => Promise<ToolOutput<TName>>;
	};
};

export type ToolOutput<TName extends AgentToolName> = Awaited<
	ReturnType<(typeof TOOLS)[TName]["execute"]>
>;

/** Any tool's output: what an executor hands back for the model to read. */
export type AgentToolOutput = {
	[TName in AgentToolName]: ToolOutput<TName>;
}[AgentToolName];

/** Output that is only true until the next edit, so only its own turn keeps it. */
export const SNAPSHOT_TOOLS = new Set<string>([
	"read_script" satisfies AgentToolName,
	"view_reference_images" satisfies AgentToolName,
	"view_avatar" satisfies AgentToolName,
]);

/** Calls that rewrite the canvas, so what is rendered from it is mid-change. */
export const SCRIPT_TOOLS = new Set<string>([
	"write_script" satisfies AgentToolName,
	"adapt_script" satisfies AgentToolName,
	"edit_script" satisfies AgentToolName,
]);

const call = <TName extends AgentToolName>(toolName: TName) =>
	z.object({ toolName: z.literal(toolName), input: TOOLS[toolName].input });

/**
 * The SDK widens a tool call's name back to `string` on the way to the editor,
 * so the pair is read here and the executors get the input their tool takes.
 */
export const agentToolCallSchema = z.discriminatedUnion("toolName", [
	call("read_script"),
	call("edit_script"),
	call("write_script"),
	call("adapt_script"),
	call("set_video_settings"),
	call("set_language"),
	call("view_reference_images"),
	call("view_avatar"),
	call("outline_story"),
	call("count_words"),
	call("set_metadata"),
	call("set_narrator"),
	call("set_character"),
]);

/** A failure is reported, not thrown: the model reads it as the next observation. */
export type ToolOutcome =
	| { ok: true; output: AgentToolOutput }
	| { ok: false; errorText: string };

const run = <TName extends AgentToolName>(
	call: { toolName: TName; input: ToolInput<TName> },
	ctx: AgentToolContext,
): Promise<ToolOutput<TName>> =>
	EXECUTORS[call.toolName].execute(call.input, ctx);

export async function executeToolCall(
	call: { toolName: string; input: unknown },
	ctx: AgentToolContext,
): Promise<ToolOutcome> {
	const parsed = agentToolCallSchema.safeParse(call);
	if (!parsed.success) {
		return {
			ok: false,
			errorText: `${call.toolName} cannot take that input: ${parsed.error.message}`,
		};
	}

	try {
		return { ok: true, output: await run(parsed.data, ctx) };
	} catch (error) {
		return { ok: false, errorText: errorMessage(error) };
	}
}
