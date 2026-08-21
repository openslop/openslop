import compact from "lodash/compact";
import type { Metadata } from "@/lib/project/types";
import { ADAPT_GUIDELINES, notesSection } from "./adapt";
import { INPUT_LANGUAGE, spokenLanguage } from "./language";
import { osmlSpec } from "./osml";
import { lengthSection, projectPreamble } from "./project";
import { templatePrompt } from "./template";

/** What the user gave us: an idea to write from, or text to convert as it stands. */
export type ScriptSource =
	| { kind: "brief"; brief: string }
	| { kind: "adapt"; script: string; notes?: string };

export const sourceText = (source: ScriptSource) =>
	source.kind === "adapt" ? source.script : source.brief;

export type ScriptPrompt = { system: string; prompt: string };

/**
 * The length budget is a story's shape, not a transcription's: adapting text the
 * user wrote must not talk the model into padding or cutting it.
 */
async function promptParts(
	source: ScriptSource,
	metadata: Metadata,
): Promise<{ guidance: string[]; instruction: string }> {
	if (source.kind === "adapt")
		return {
			guidance: compact([
				ADAPT_GUIDELINES,
				source.notes && notesSection(source.notes),
			]),
			instruction: source.script,
		};

	const { templateId } = metadata;
	if (templateId) {
		// The example story is two orders of magnitude larger than the catalog
		// entry, so it loads here rather than riding the editor's first paint.
		const { getTemplatePrompt } =
			await import("@/lib/templates/templatePrompts");
		const { system, exampleStory } = getTemplatePrompt(templateId);
		return {
			guidance: [lengthSection(metadata), system],
			instruction: templatePrompt(
				exampleStory,
				source.brief,
				spokenLanguage(metadata, "the same language that the user_input is in"),
			),
		};
	}

	return { guidance: [lengthSection(metadata)], instruction: source.brief };
}

export async function buildScriptPrompt(
	metadata: Metadata,
	source: ScriptSource,
): Promise<ScriptPrompt> {
	const { guidance, instruction } = await promptParts(source, metadata);
	return {
		system: compact([
			...guidance,
			projectPreamble(metadata),
			osmlSpec(spokenLanguage(metadata, INPUT_LANGUAGE)),
		]).join("\n\n"),
		prompt: instruction,
	};
}
