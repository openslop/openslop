import { errorMessage } from "@/lib/errors";
import type { AgentToolContext } from "./context";
import { adaptScript } from "./adaptScript";
import { applyTemplate } from "./applyTemplate";
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
import {
	agentToolCallSchema,
	type AgentToolName,
	type AgentToolOutput,
	type ToolInput,
	type ToolOutput,
} from "./specs";

/** A failure is reported, not thrown: the model reads it as the next observation. */
export type ToolOutcome =
	| { ok: true; output: AgentToolOutput }
	| { ok: false; errorText: string };

/** Registration is the contract: each executor must return its tool's declared output. */
const HANDLERS: {
	[K in AgentToolName]: (
		input: ToolInput<K>,
		ctx: AgentToolContext,
	) => Promise<ToolOutput<K>>;
} = {
	read_script: (_input, ctx) => readScript(ctx),
	edit_script: editScript,
	write_script: writeScript,
	adapt_script: adaptScript,
	set_metadata: setMetadata,
	set_narrator: setNarrator,
	set_character: setCharacter,
	set_video_settings: setVideoSettings,
	set_language: setLanguage,
	apply_template: applyTemplate,
	count_words: (_input, ctx) => countWords(ctx),
	outline_story: outlineStory,
	view_reference_images: (_input, ctx) => viewReferenceImages(ctx),
	view_avatar: viewAvatar,
};

const run = <K extends AgentToolName>(
	call: { toolName: K; input: ToolInput<K> },
	ctx: AgentToolContext,
): Promise<ToolOutput<K>> => HANDLERS[call.toolName](call.input, ctx);

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
