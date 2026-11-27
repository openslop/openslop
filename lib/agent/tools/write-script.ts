import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { Film } from "@/components/ui/icon";
import { defineTool } from "./define-tool";

export const writeScript = defineTool({
	description: dedent`
	  Put a new script on the canvas, from an idea or from a script the user wrote. This clears
	  the script and starts from scratch, and the canvas fills in as you write. For any change to
	  an existing script, however large, use edit_script.
	`,
	input: z.object({
		osml: z
			.string()
			.min(1)
			.describe("The whole script as OSML: raw XML, no code fences."),
	}),
	output: z.string(),
	icon: Film,
	label: "Writing script",
	execute: async () =>
		"Wrote a new script onto the canvas. Read it to see what landed.",
	draftsScript: true,
	scriptStreamField: "osml",
});
