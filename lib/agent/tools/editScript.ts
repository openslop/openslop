import dedent from "dedent";
import { z } from "zod";
import { CANVAS_ELEMENT_TYPES, DURATION_OPTIONS } from "@/lib/canvas/types";
import { MusicLength } from "@/lib/connectors/music/enums";
import { refineOpSchema } from "@/lib/script/refine/types";
import { MOTION_EFFECTS } from "@/lib/video/motionEffectNames";
import { Pencil } from "@/components/ui/icon";
import { defineTool } from "./defineTool";

const ELEMENT_TYPES = [...CANVAS_ELEMENT_TYPES].join(", ");
const MUSIC_LENGTHS = Object.values(MusicLength).join(", ");

export const editScript = defineTool({
	description: dedent`
	  Change the script on the canvas: add, remove, rewrite, retype or reorder elements.
	  Every element carries an \`id\`. Reference ids you read; never invent one.

	  - insert: place a new element before or after \`anchor_id\`. Omit \`anchor_id\` to append,
	    or to prepend with position "before". Each insert resolves independently, so several
	    at one anchor must each repeat it; they stack in the order you emit them. Never send
	    an \`id\` on an insert.
	  - remove: delete the element with \`id\`.
	  - set: change an element. Send only what changes, and the full replacement \`text\` when
	    text changes. Set an attribute to null to drop it.

	  \`deps\` goes on a \`set\` and reuses a result the element already has, instead of
	  throwing it away. Send it whenever you retype an element into one built on what it
	  already made: an image becoming an animated_image sends
	  \`deps: {"still": "<the image's id>"}\`, so the animation opens on the picture that
	  image already made instead of generating a new one. Retyping keeps the id, so that is
	  the id you already read. \`still\` is the only name \`deps\` takes today.

	  To move an element, remove it and insert it again.

	  Element types: ${ELEMENT_TYPES}

	  Attributes by type, all string values:
	  - narration: emotion
	  - character: name, emotion
	  - image: overlays, motion (${MOTION_EFFECTS.join(" | ")})
	  - animated_image: videoPrompt, duration (${DURATION_OPTIONS.join(" | ")}), overlays, motion
	  - sound: loops
	  - music: length (${MUSIC_LENGTHS}), loops
	  - clip: duration (${DURATION_OPTIONS.join(" | ")}), volume (0-10), motion

	  Send the fewest operations that do the job. Write element text in the language of the
	  surrounding script, whatever language the request is in. Image, animated_image
	  (including videoPrompt), sound and music descriptions are always English.
	`,
	input: z.object({
		ops: z
			.array(refineOpSchema)
			.min(1)
			.describe("Operations to apply, in order."),
	}),
	output: z.string(),
	icon: Pencil,
	label: ({ ops }) =>
		`Editing the script (${ops?.length ?? 0} change${ops?.length === 1 ? "" : "s"})`,
	execute: async ({ ops }, ctx) => {
		const { applied, failures } = ctx.editScript(ops);
		if (failures.length === 0) {
			return `Applied ${applied} operation${applied === 1 ? "" : "s"}. The script has changed; read it again before editing further.`;
		}
		return [
			`Applied ${applied} of ${ops.length} operations.`,
			`Failed: ${failures.join("; ")}.`,
			"Read the script again before retrying; the ids you used may be stale.",
		].join(" ");
	},
	rewritesCanvas: true,
});
