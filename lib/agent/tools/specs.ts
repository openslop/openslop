import dedent from "dedent";
import { z } from "zod";
import { CANVAS_ELEMENT_TYPES, DURATION_OPTIONS } from "@/lib/canvas/types";
import { MusicLength } from "@/lib/connectors/music/enums";
import { refineOpSchema } from "@/lib/script/refine/types";
import { MOTION_EFFECTS } from "@/lib/video/motionEffectNames";

/**
 * What the model is told a tool can do. Declared apart from the executors
 * because the route only needs this half, and the executors reach the Slate
 * canvas and the connector factory, which have no business in a server bundle.
 */
export type AgentToolSpec<TSchema extends z.ZodType = z.ZodType> = {
	name: string;
	description: string;
	inputSchema: TSchema;
};

const ELEMENT_TYPES = [...CANVAS_ELEMENT_TYPES].join(", ");
const values = (e: Record<string, string>) => Object.values(e).join(", ");

const EDIT_SCRIPT = dedent`
  Change the script on the canvas: add, remove, rewrite, retype or reorder elements.
  Every element you were given carries an \`id\`. Reference those ids; never invent one.

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
  surrounding script, whatever language the request is in.
`;

export const editScriptSpec = {
	name: "edit_script",
	description: EDIT_SCRIPT,
	inputSchema: z.object({
		ops: z
			.array(refineOpSchema)
			.min(1)
			.describe("Operations to apply, in order."),
	}),
} as const satisfies AgentToolSpec;

const WRITE_SCRIPT = dedent`
  Write a new script onto the canvas from a brief, replacing what is there. Use this to
  start a project, or when the user asks for a fresh start on a different idea. For any
  change to an existing script, however large, use edit_script.

  The brief carries what the story needs: premise, tone, characters, and the user's constraints.
`;

export const writeScriptSpec = {
	name: "write_script",
	description: WRITE_SCRIPT,
	inputSchema: z.object({
		brief: z
			.string()
			.min(1)
			.describe("What the video is about, in a sentence or a few."),
	}),
} as const satisfies AgentToolSpec;

export const AGENT_TOOL_SPECS = [editScriptSpec, writeScriptSpec] as const;

export type AgentToolName = (typeof AGENT_TOOL_SPECS)[number]["name"];
