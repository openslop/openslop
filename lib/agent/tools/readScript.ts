import dedent from "dedent";
import { z } from "zod";
import {
	voiceTraitEntries,
	type Metadata,
	type MetadataVoice,
} from "@/lib/project/types";
import { defineTool } from "./defineTool";

const UNSET = "unset";

function section(heading: string, lines: string[]): string {
	return [`## ${heading}`, ...lines].join("\n");
}

function voiceOf(voice: MetadataVoice): string {
	const values = voiceTraitEntries(voice).map(([, value]) => value);
	return values.length > 0 ? values.join(", ") : UNSET;
}

function charactersOf(metadata: Metadata): string[] {
	const entries = Object.entries(metadata.characters);
	if (entries.length === 0) return ["None yet."];
	return entries.map(
		([name, character]) =>
			`- ${name}: ${character.appearance || UNSET} (voice: ${voiceOf(character)})`,
	);
}

/** Settings live in the per-request context block; this reads what it cannot carry. */
export const readScript = defineTool({
	description: dedent`
	  Read the canvas: the project's characters, then the script as OSML with the \`id\` of
	  every element. The project's settings arrive with every request; this is the script.

	  Read before your first edit, and again after anything changed the script. Ids and text
	  move when a script is edited, so editing from a stale reading fails.
	`,
	input: z.object({}),
	output: z.string(),
	execute: async (_input, ctx) => {
		const metadata = ctx.readMetadata();
		const script = ctx.readScript().trim();

		return [
			section("Characters", charactersOf(metadata)),
			section("Script", [
				script ? `\`\`\`osml\n${script}\n\`\`\`` : "The canvas is empty.",
			]),
		].join("\n\n");
	},
	snapshot: true,
});
