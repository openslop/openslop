import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { Eye } from "@/components/ui/icon";
import { defineTool } from "./define-tool";

export const readScript = defineTool({
	description: dedent`
	  Read the canvas as XML with the \`id\` of every element: first the assets, then the
	  script scene by scene. It's the only way to see the canvas, so read it before your first
	  edit. Your own edit_script changes keep it current; edit_script tells you when something
	  else changed the canvas.
	`,
	input: z.object({}),
	output: z.string(),
	icon: Eye,
	label: "Reading the script",
	execute: async (_input, ctx) => {
		ctx.markScriptRead();
		const script = ctx.readScript().trim();
		return script ? `\`\`\`xml\n${script}\n\`\`\`` : "The canvas is empty.";
	},
	retention: "latest",
});
