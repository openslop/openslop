import dedent from "dedent";
import { z } from "zod";
import { History } from "@/components/ui/icon";
import type { ElementVersionSummary } from "../elementState";
import { defineTool, noSuchElement, seconds } from "./defineTool";
import { ELEMENT_ID } from "./inputs";

const attributesOf = (attributes: ElementVersionSummary["attributes"]) =>
	Object.entries(attributes)
		.map(([key, value]) => `${key}: ${value}`)
		.join(", ");

const line = (version: ElementVersionSummary) => {
	const attributes = attributesOf(version.attributes);
	const parts = [
		`v${version.index}${version.current ? " (on the canvas now)" : ""}`,
		`${version.pinned ? "uploaded" : "generated"} ${version.createdAt}`,
		`"${version.prompt}"${attributes ? ` (${attributes})` : ""}`,
		version.durationSec !== undefined && seconds(version.durationSec),
		version.changed.length > 0 &&
			`changed from v${version.index - 1}: ${version.changed.join(", ")}`,
	];
	return `- ${parts.filter(Boolean).join("; ")}`;
};

const headline = (id: string, versions: ElementVersionSummary[]) => {
	const current = versions.find((version) => version.current);
	const count = `${versions.length} version${versions.length === 1 ? "" : "s"}`;
	const showing = current
		? `v${current.index} is on the canvas now.`
		: "None of them is on the canvas now.";
	return `${id} has ${count}, oldest first. ${showing}`;
};

export const readElementHistory = defineTool({
	description: dedent`
	  List every take an element has produced: when each was made, the text and attributes
	  that made it, what changed from the take before, and which one is on the canvas now.
	  Take the id from read_script. Use it when the user asks about an earlier take, or
	  wants one back: restore_element_version takes the version number from here.
	`,
	input: z.object({ id: ELEMENT_ID }),
	output: z.string(),
	icon: History,
	label: ({ id }) =>
		id ? `Reading the history of ${id}` : "Reading an element's history",
	execute: async ({ id }, ctx) => {
		const read = await ctx.elementHistory(id);
		if (!read) throw noSuchElement(id);
		const { versions } = read;
		if (versions.length === 0)
			return `${id} has no versions yet: nothing has been generated or uploaded for it.`;
		return [headline(id, versions), ...versions.map(line)].join("\n");
	},
	snapshot: true,
});
