import dedent from "dedent";
import { tool, type InferUITool, type ToolSet } from "ai";
import { z } from "zod";
import { CANVAS_ELEMENT_TYPES, DURATION_OPTIONS } from "@/lib/canvas/types";
import { LANGUAGE_CHOICES, languageLabel } from "@/lib/project/language";
import { TEMPLATE_IDS } from "@/lib/templates/templates";
import { ASPECT_RATIOS } from "@/lib/video/aspectRatio";
import { VIDEO_LENGTHS, VIDEO_LENGTH_SPECS } from "@/lib/video/videoLength";
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
  Read the canvas: the project's characters, then the script as OSML with the \`id\` of
  every element. The project's settings arrive with every request; this is the script.

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
  Write a new script onto the canvas from a brief. This clears the canvas and starts
  from scratch. Use this to start a project, or when the user asks for a fresh start on
  a different idea. For any change to an existing script, however large, use edit_script.

  The brief is the writer's whole instruction: anything from a one-line premise to a
  full treatment, carrying the genre, tone, characters, structure and constraints the
  video needs. For an invented narrative, outline_story first and fold the outline in;
  for non-story videos, write the brief directly.

  When the user gave you the actual text they want on the canvas, rather than an idea to
  write from, use adapt_script instead.
`;

const ADAPT_SCRIPT = dedent`
  Put text the user wrote onto the canvas, keeping their words. This clears the canvas and
  starts from scratch. Use it whenever the message carries the script itself: a screenplay,
  a draft, prose, a transcript, lyrics, anything already written.

  Pass their text through EXACTLY as they gave it. Never summarize it, rewrite it, shorten
  it, or describe it, however long it is. Passing a summary here destroys the user's work,
  because nothing downstream can recover the original.

  If the message mixes their text with instructions about it ("make this shorter, here it
  is: ..."), adapt the text as written, then edit_script to carry out the instruction.
`;

const VIEW_REFERENCE_IMAGES = dedent`
  Look at the images the user uploaded as project references. You receive the images
  themselves, so use your own eyes: judge the art style, subjects, and mood directly.

  Use this before setting an art style when references exist and the style is unset,
  or whenever the user asks about their uploads. What you see is gone next turn, so
  act on it in this one (for a style: set_metadata).
`;

const VIEW_AVATAR = dedent`
  Look at a character's avatar image. You receive the image itself.

  Use it to write an appearance for a character whose avatar was uploaded by the user:
  look, then persist what you see with set_character so every future script keeps it.
  What you see is gone next turn, so act on it in this one.
`;

const OUTLINE_STORY = dedent`
  Develop a brief into a full story outline: a high-concept premise, characters, themes,
  conflict, twists, and a resolution. A dedicated pass at structure produces noticeably
  better stories than writing straight from an idea, so the outline comes back to you to
  review and fold into a write_script brief.

  Reach for it when inventing a narrative: fiction, a fable, a character-driven piece.
  Skip it when the user's request is not story-shaped (a documentary, an explainer, a
  listicle, an ambient piece) or when they already supplied the structure.
`;

const COUNT_WORDS = dedent`
  Count the spoken words on the canvas (narration and dialogue only; descriptions and
  attributes are silent) and estimate the video's runtime against the project's target
  length.

  You cannot judge length by looking at a script, so run this after writing or editing
  whenever length matters, and edit until the count lands in the target range.
`;

const SET_METADATA = dedent`
  Set the project's title, or the art style every visual follows. Send only what changes.
`;

const SET_VIDEO_SETTINGS = dedent`
  Set how long the finished video runs, or the shape it is framed in. Send only what changes.

  Length is a budget the next written script is held to; it does not resize a script already
  on the canvas. To change what is there, set the length and then edit_script.

  Lengths, with the spoken-word budget each carries:
${VIDEO_LENGTHS.map((l) => `  - ${l}: ${VIDEO_LENGTH_SPECS[l].minWords} to ${VIDEO_LENGTH_SPECS[l].maxWords} words`).join("\n")}
`;

const SET_LANGUAGE = dedent`
  Set the language narration and dialogue are written in. "auto" follows whatever language
  the user writes in.

  This applies to scripts written from here on. It does not translate what is on the canvas.

  Languages: ${LANGUAGE_CHOICES.map((c) => `${c} (${languageLabel(c)})`).join(", ")}
`;

const APPLY_TEMPLATE = dedent`
  Adopt a template: a story format the next script is written to pastiche, along with its
  art style, characters, narrator and length.

  This RESETS the project, discarding the current art style, characters, narrator, reference
  images and settings. Only use it on an empty canvas, or when the user asks for the template
  by name knowing their setup goes with it.
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

/** A tool-result image, handed to the model by URL for the provider to fetch. */
const imagePart = (url: string) => ({
	type: "file" as const,
	mediaType: "image",
	data: { type: "url" as const, url: new URL(url) },
});

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
	adapt_script: z.object({
		script: z
			.string()
			.min(1)
			.describe("The user's own text, verbatim and complete."),
	}),
	set_video_settings: z
		.object({
			length: z.enum(VIDEO_LENGTHS).optional(),
			aspect_ratio: z.enum(ASPECT_RATIOS).optional(),
		})
		.refine(notEmpty, named("setting")),
	set_language: z.object({ language: z.enum(LANGUAGE_CHOICES) }),
	apply_template: z.object({
		template_id: z.enum(TEMPLATE_IDS),
	}),
	view_reference_images: z.object({}),
	view_avatar: z.object({
		name: z
			.string()
			.min(1)
			.describe(
				"The exact character name, as the script and characters list use it.",
			),
	}),
	outline_story: z.object({
		brief: z
			.string()
			.min(1)
			.describe(
				"The story idea to develop, with any constraints worth keeping.",
			),
	}),
	count_words: z.object({}),
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
	adapt_script: tool({
		description: ADAPT_SCRIPT,
		inputSchema: INPUTS.adapt_script,
		outputSchema: z.string(),
	}),
	set_video_settings: tool({
		description: SET_VIDEO_SETTINGS,
		inputSchema: INPUTS.set_video_settings,
		outputSchema: z.string(),
	}),
	set_language: tool({
		description: SET_LANGUAGE,
		inputSchema: INPUTS.set_language,
		outputSchema: z.string(),
	}),
	apply_template: tool({
		description: APPLY_TEMPLATE,
		inputSchema: INPUTS.apply_template,
		outputSchema: z.string(),
	}),
	view_reference_images: tool({
		description: VIEW_REFERENCE_IMAGES,
		inputSchema: INPUTS.view_reference_images,
		outputSchema: z.object({ urls: z.array(z.string()) }),
		toModelOutput: ({ output }) => ({
			type: "content",
			value: [
				{
					type: "text",
					text: `${output.urls.length} reference image(s), in upload order:`,
				},
				...output.urls.map((url) => imagePart(url)),
			],
		}),
	}),
	view_avatar: tool({
		description: VIEW_AVATAR,
		inputSchema: INPUTS.view_avatar,
		outputSchema: z.object({ name: z.string(), url: z.string() }),
		toModelOutput: ({ output }) => ({
			type: "content",
			value: [
				{ type: "text", text: `${output.name}'s avatar:` },
				imagePart(output.url),
			],
		}),
	}),
	outline_story: tool({
		description: OUTLINE_STORY,
		inputSchema: INPUTS.outline_story,
		outputSchema: z.string(),
	}),
	count_words: tool({
		description: COUNT_WORDS,
		inputSchema: INPUTS.count_words,
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
	"view_reference_images" satisfies AgentToolName,
	"view_avatar" satisfies AgentToolName,
]);

/** Calls that rewrite the canvas, so what is rendered from it is mid-change. */
export const SCRIPT_TOOLS = new Set<string>([
	"write_script" satisfies AgentToolName,
	"adapt_script" satisfies AgentToolName,
	"edit_script" satisfies AgentToolName,
]);

export type ToolInput<TName extends AgentToolName> = InferUITool<
	(typeof SLOPPY_TOOLS)[TName]
>["input"];

export type ToolOutput<TName extends AgentToolName> = InferUITool<
	(typeof SLOPPY_TOOLS)[TName]
>["output"];

/** Any tool's output: what an executor hands back for the model to read. */
export type AgentToolOutput = {
	[TName in AgentToolName]: ToolOutput<TName>;
}[AgentToolName];

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
	call("adapt_script"),
	call("set_video_settings"),
	call("set_language"),
	call("apply_template"),
	call("view_reference_images"),
	call("view_avatar"),
	call("outline_story"),
	call("count_words"),
	call("set_metadata"),
	call("set_narrator"),
	call("set_character"),
]);
