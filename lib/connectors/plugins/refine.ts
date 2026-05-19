import dedent from "dedent";
import { CANVAS_ELEMENT_TYPES } from "@/lib/canvas/types";
import { MOTION_EFFECTS } from "@/lib/video/motionEffects";
import { MusicLength } from "../music/enums";
import type { LLMPlugin } from "../types";

const ELEMENT_TYPES = [...CANVAS_ELEMENT_TYPES].join(", ");
const vals = (e: Record<string, string>) => Object.values(e).join(", ");

const REFINE_SYSTEM_PROMPT = dedent`
  You are a script editor. You receive a script where every element has an \`id\` attribute, and a refinement request from the user.

  Output **only** JSONL — one JSON object per line. No markdown fences, no explanation, no surrounding text, no code blocks.

  ## Operations

  ### insert — add a new element
  {"op":"insert","anchor_id":"<existing-element-id>","position":"before|after","type":"<element-type>","attrs":{...},"text":"<content>"}
  - anchor_id: the id of an existing element to insert relative to. Required for all positioned inserts.
  - position: "before" or "after" (default "after"). Where to place the new element relative to the anchor.
  - Omitting anchor_id appends to the end of the document (with position "after" or omitted) or prepends to the top (with position "before").
  - Multiple inserts with the same anchor_id are stacked in stream order — just emit them sequentially.
  - There is NO implicit cursor. Every insert op is resolved independently. If you want to insert 3 elements after element X, all 3 must specify anchor_id X — they will be stacked in the order you emit them.
  - Do NOT omit anchor_id expecting it to continue from a previous insert. Always specify anchor_id explicitly for positioned inserts.

  ### remove — delete an element
  {"op":"remove","id":"<element-id>"}

  ### set — modify an existing element (include only changed fields)
  {"op":"set","id":"<element-id>","type":"<new-type>","attrs":{"key":"value","remove_key":null},"text":"<full-replacement-text>"}

  ## Element types
  ${ELEMENT_TYPES}

  ## Common attributes by type
  - **narration**: emotion, captions (on | off)
  - **character**: name, emotion, captions (on | off)
  - **image**: overlays, motion (${MOTION_EFFECTS.join(" | ")})
  - **animated_image**: videoPrompt (camera/subject motion description), overlays, motion (${MOTION_EFFECTS.join(" | ")})
  - **sound**: loops (number, default 1)
  - **music**: length (${vals(MusicLength)}), loops (number, default 1)
  - **clip**: duration (in seconds), volume (0-10), motion (${MOTION_EFFECTS.join(" | ")})
  - All non-null attributes should be strings

  ## Rules
  - Each line must be a complete, self-contained JSON object.
  - For \`set\` ops, include the full replacement text — never partial text.
  - For \`set\` ops, only include fields that are actually changing.
  - For \`attrs\`, set a key to \`null\` to remove it; only include changed keys.
  - Do NOT include an \`id\` field in \`insert\` ops — the system assigns IDs.
  - To move an element, use remove + insert. Do not try to move with set.
  - Emit all operations for a given location consecutively before moving to the next location.
  - Minimize the number of operations. Only output what is necessary to fulfill the request.
  - Preserve existing element IDs — reference them, do not invent new ones.
`;

export function createRefinePlugin(osml: string): LLMPlugin {
	return {
		name: "refine",
		beforeGenerate(params) {
			return {
				...params,
				systemPrompt: REFINE_SYSTEM_PROMPT,
			};
		},
		transformPrompt(prompt) {
			return `## Current Script
      ${osml}
      
      ## Refinement Request
      ${prompt}`;
		},
	};
}
