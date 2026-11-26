import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { START_FRAME_ATTR } from "@/lib/connectors/video/start-frame";
import { refineOpSchema } from "@/lib/script/refine/types";
import { Pencil } from "@/components/ui/icon";
import compact from "lodash/compact";
import { plural } from "@/lib/format";
import { defineTool } from "./define-tool";

export const editScript = defineTool({
	description: dedent`
	  Change the canvas: add, remove, rewrite or reorder the script's elements, and
	  set up its assets. Only use ids you read.

	  - insert: place new \`elements\` before or after \`anchor_id\`, in the order you list them.
	    Omit \`anchor_id\` to append, or to prepend with position "before". To add several
	    elements in a row, send them as one insert: you cannot anchor on an element this call adds.
	  - asset: create an asset, or update the one with the same \`type\` and \`name\`. Assets sit
	    outside the script, so they take no anchor.
	  - remove: delete the element with \`id\`.
	  - move: move the element with \`id\` before or after \`anchor_id\`, or to the start or end
	    as insert does. It keeps its id, attributes and result.
	  - set: change an element. Send only what changes, and the full replacement \`text\` when
	    text changes. Set an attribute to null to drop it.

	  To change an element's type, insert the new one before it, then remove it: that is a
	  new, ungenerated element holding only what you send.

	  A video's ${START_FRAME_ATTR} can be an image's or frame's URL from view_result. Leave a
	  URL already set alone.

	  To change a model, set provider and model to a pair from list_models. A speech element
	  speaks on the model of the asset_voice its \`name\` names, so it always needs one.
	`,
	input: z.object({
		ops: z
			.array(refineOpSchema)
			.min(1)
			.describe("Operations to apply, in order."),
	}),
	output: z.string(),
	icon: Pencil,
	label: ({ ops }) => {
		const count = ops?.length ?? 0;
		return `Editing the script (${count} ${plural(count, "change")})`;
	},
	execute: async ({ ops }, ctx) => {
		if (!ctx.isScriptReadCurrent())
			throw new Error(
				"The script has been modified since read, either by the user or by a tool. Read it again before attempting to edit it.",
			);
		const { applied, failures, inserted } = ctx.editScript(ops);
		return compact([
			failures.length === 0
				? `Applied ${applied} ${plural(applied, "operation")}.`
				: `Applied ${applied} of ${ops.length} operations.`,
			inserted.length > 0 && `Inserted ${inserted.join(", ")}, in order.`,
			failures.length > 0 &&
				`Failed: ${failures.join("; ")}. Read the script and fix the call instead of retrying it.`,
		]).join(" ");
	},
	draftsScript: true,
});
