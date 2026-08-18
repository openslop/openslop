import dedent from "dedent";
import { tool, type InferUITool, type ToolSet } from "ai";
import { z } from "zod";
import { CANVAS_ELEMENT_TYPES, DURATION_OPTIONS } from "@/lib/canvas/types";
import {
	TTS_ACCENTS,
	TTS_AGES,
	TTS_GENDERS,
	TTS_PITCHES,
} from "@/lib/connectors/tts/enums";
import { MusicLength } from "@/lib/connectors/music/enums";
import { refineOpSchema } from "@/lib/script/refine/types";
import { MOTION_EFFECTS } from "@/lib/video/motionEffectNames";

const ELEMENT_TYPES = [...CANVAS_ELEMENT_TYPES].join(", ");
const values = (e: Record<string, string>) => Object.values(e).join(", ");

const READ_SCRIPT = dedent`
  Read the canvas: the project's title, art style and narrator, then its characters, then
  the script as OSML with the \`id\` of every element.

  Read before your first edit, and again after anything changed the script. Ids and text
  move when a script is edited, so editing from a stale reading fails.
`;

const EDIT_SCRIPT = dedent`
  Change the script on the canvas: add, remove, rewrite, retype or reorder elements.
  Every element carries an \`id\`. Reference ids you read; never invent one.

  - insert: place a new element before or after \`anchor_id\`. Omit \`anchor_id\` to append,
    or to prepend with position "before". Each insert resolves independently, so several
    at one anchor must each repeat it; they stack in the order you emit them. Never send
    an \`id\` on an insert.
  - remove: delete the element with \`id\`.
  - set: change an element. Send only what changes, and the full replacement \`text\` when
    text changes. Set an attribute to null to drop it.

  To move an element, remove it and insert it again.

  Element types: ${ELEMENT_TYPES}

  Attributes by type, all string values:
  - narration: emotion
  - character: name, emotion
  - image: overlays, motion (${MOTION_EFFECTS.join(" | ")})
  - animated_image: videoPrompt, duration (${DURATION_OPTIONS.join(" | ")}), overlays, motion
  - sound: loops
  - music: length (${values(MusicLength)}), loops
  - clip: duration (${DURATION_OPTIONS.join(" | ")}), volume (0-10), motion

  Send the fewest operations that do the job. Write element text in the language of the
  surrounding script, whatever language the request is in. Image, animated_image
  (including videoPrompt), sound and music descriptions are always English.
`;

const WRITE_SCRIPT = dedent`
  Write a new script onto the canvas from a brief. This clears the canvas and starts from
  scratch. Use this to start a project, or when the user asks for a fresh
  start on a different idea. For any change to an existing script, however large, use
  edit_script.

  The brief carries what the story needs: premise, tone, characters, and the user's constraints.
`;

const SET_METADATA = dedent`
  Set the project's title, or the art style every visual follows. Send only what changes.
`;

const SET_NARRATOR = dedent`
  Set the voice the narrator reads in. Send only the traits that change.

  A voice is described, never picked: the traits resolve to a real voice when speech
  is generated.
`;

const SET_CHARACTER = dedent`
  Set what a character looks like or sounds like, creating it if the name is new.
  Reference a character by the exact \`name\` its lines use in the script.

  Send only what changes. \`appearance\` is what the character's avatar is drawn from, and
  is always English. The rest describe the voice it speaks in.
`;

/** Spread flat into a tool's input: a nested object is a shape models get wrong. */
const VOICE_TRAITS = {
	gender: z.enum(TTS_GENDERS).optional(),
	age: z.enum(TTS_AGES).optional(),
	pitch: z.enum(TTS_PITCHES).optional(),
	accent: z.enum(TTS_ACCENTS).optional(),
	description: z
		.string()
		.min(1)
		.optional()
		.describe("How the voice sounds, in a few words."),
};

const named = (what: string) => ({
	message: `name at least one ${what} to change`,
});
const notEmpty = (input: object) => Object.keys(input).length > 0;

const INPUTS = {
	read_script: z.object({}),
	edit_script: z.object({
		ops: z
			.array(refineOpSchema)
			.min(1)
			.describe("Operations to apply, in order."),
	}),
	write_script: z.object({
		brief: z
			.string()
			.min(1)
			.describe("What the video is about, in a sentence or a few."),
	}),
	set_metadata: z
		.object({
			title: z.string().min(1).optional(),
			style: z
				.string()
				.min(1)
				.optional()
				.describe("The art style every visual follows, in English."),
		})
		.refine(notEmpty, named("setting")),
	set_narrator: z.object({ ...VOICE_TRAITS }).refine(notEmpty, named("trait")),
	set_character: z.object({
		name: z.string().min(1),
		appearance: z
			.string()
			.min(1)
			.optional()
			.describe("What the character looks like, in English."),
		...VOICE_TRAITS,
	}),
};

/**
 * What the model is offered. Every tool runs against the Slate canvas, which
 * lives in the browser, so none of them declare an executor: the SDK surfaces
 * the call, the editor runs it, and the result comes back as the next request.
 */
export const SLOPPY_TOOLS = {
	read_script: tool({
		description: READ_SCRIPT,
		inputSchema: INPUTS.read_script,
		outputSchema: z.string(),
	}),
	edit_script: tool({
		description: EDIT_SCRIPT,
		inputSchema: INPUTS.edit_script,
		outputSchema: z.string(),
	}),
	write_script: tool({
		description: WRITE_SCRIPT,
		inputSchema: INPUTS.write_script,
		outputSchema: z.string(),
	}),
	set_metadata: tool({
		description: SET_METADATA,
		inputSchema: INPUTS.set_metadata,
		outputSchema: z.string(),
	}),
	set_narrator: tool({
		description: SET_NARRATOR,
		inputSchema: INPUTS.set_narrator,
		outputSchema: z.string(),
	}),
	set_character: tool({
		description: SET_CHARACTER,
		inputSchema: INPUTS.set_character,
		outputSchema: z.string(),
	}),
} satisfies ToolSet;

export type AgentToolName = keyof typeof SLOPPY_TOOLS;

/** Output that is only true until the next edit, so only its own turn keeps it. */
export const SNAPSHOT_TOOLS = new Set<string>([
	"read_script" satisfies AgentToolName,
]);

export type ToolInput<TName extends AgentToolName> = InferUITool<
	(typeof SLOPPY_TOOLS)[TName]
>["input"];

const call = <TName extends AgentToolName>(toolName: TName) =>
	z.object({ toolName: z.literal(toolName), input: INPUTS[toolName] });

/**
 * The SDK widens a tool call's name back to `string` on the way to the editor,
 * so the pair is read here and the executors get the input their tool takes.
 */
export const agentToolCallSchema = z.discriminatedUnion("toolName", [
	call("read_script"),
	call("edit_script"),
	call("write_script"),
	call("set_metadata"),
	call("set_narrator"),
	call("set_character"),
]);
