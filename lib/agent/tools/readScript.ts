import dedent from "dedent";
import { z } from "zod";
import { Eye } from "@/components/ui/icon";
import { deriveProjectName } from "@/lib/project/projectName";
import type { ElementState } from "../elementState";
import { defineTool } from "./defineTool";

function section(heading: string, lines: string[]): string {
	return [`## ${heading}`, ...lines].join("\n");
}

function statesOf(states: ElementState[]): string[] {
	if (states.length === 0) return ["None yet."];
	return states.map(
		({ id, state, detail }) =>
			`- ${id}: ${state}${detail ? ` (${detail})` : ""}`,
	);
}

export const readScript = defineTool({
	description: dedent`
	  Read the project: the canvas as XML with the \`id\` of every element, first the assets
	  (each speaker's asset_voice, each character's asset_avatar, the art style and the reference
	  images), then the script scene by scene. After it, the project: its title, script
	  settings (language, target length, format, template) and aspect ratio. Last, where each
	  generated element stands: ungenerated, queued, generating, generated, stale (and why),
	  failed (and the error), or pinned to an upload.

	  Read before your first edit, and again after anything changed the canvas. Ids and text
	  move when it is edited, so editing from a stale reading fails.
	`,
	input: z.object({}),
	output: z.string(),
	icon: Eye,
	label: "Reading the script",
	execute: async (_input, ctx) => {
		const script = ctx.readScript().trim();
		const { title, scriptSettings, videoSettings } = ctx.readProject();
		return [
			section("Script", [
				script ? `\`\`\`xml\n${script}\n\`\`\`` : "The canvas is empty.",
			]),
			section("Project", [
				`- title: ${deriveProjectName(title)}`,
				`- language: ${scriptSettings.language}`,
				`- length: ${scriptSettings.length}`,
				`- format: ${scriptSettings.format}`,
				`- template: ${scriptSettings.template ?? "none"}`,
				`- aspect ratio: ${videoSettings.aspectRatio}`,
			]),
			section("Generation state", statesOf(ctx.elementStates())),
		].join("\n\n");
	},
	snapshot: true,
});
