import compact from "lodash/compact";
import type { AssetElement } from "@/lib/canvas/types";
import type { ProjectSettings } from "@/lib/project/types";
import { getTemplateById } from "@/lib/templates/templates";
import { ADAPT_GUIDELINES, notesSection } from "./adapt";
import { INPUT_LANGUAGE, spokenLanguage } from "./language";
import { osmlSpec } from "./osml";
import { formatSection, lengthSection, projectPreamble } from "./project";
import { templatePrompt } from "./template";

/** What the user gave us: an idea to write from, or text to convert as it stands. */
export type ScriptSource =
	| { kind: "brief"; brief: string }
	| { kind: "adapt"; script: string; notes?: string };

export type ScriptPrompt = { system: string; prompt: string };

/**
 * The length budget is a story's shape, not a transcription's: adapting text the
 * user wrote must not talk the model into padding or cutting it.
 */
function promptParts(
	source: ScriptSource,
	settings: ProjectSettings,
): { guidance: string[]; instruction: string } {
	if (source.kind === "adapt")
		return {
			guidance: compact([
				ADAPT_GUIDELINES,
				source.notes && notesSection(source.notes),
			]),
			instruction: source.script,
		};

	const template = getTemplateById(settings.template);
	if (template)
		return {
			guidance: [
				formatSection(settings),
				lengthSection(settings),
				template.systemPrompt,
			],
			instruction: templatePrompt(
				template,
				source.brief,
				spokenLanguage(settings, "the same language that the user_input is in"),
			),
		};

	return {
		guidance: [formatSection(settings), lengthSection(settings)],
		instruction: source.brief,
	};
}

/**
 * Also the review's system prompt. What only one source contributes (a length
 * budget, a template, a pasted script's notes) stays with that source.
 */
export function scriptRules(
	assets: AssetElement[],
	settings: ProjectSettings,
): string {
	return compact([
		projectPreamble(assets),
		osmlSpec(spokenLanguage(settings, INPUT_LANGUAGE)),
	]).join("\n\n");
}

export function buildScriptPrompt(
	assets: AssetElement[],
	settings: ProjectSettings,
	source: ScriptSource,
): ScriptPrompt {
	const { guidance, instruction } = promptParts(source, settings);
	return {
		system: compact([...guidance, scriptRules(assets, settings)]).join("\n\n"),
		prompt: instruction,
	};
}
