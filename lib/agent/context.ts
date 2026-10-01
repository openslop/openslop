import dedent from "dedent";
import type { AspectRatio } from "@/lib/project/aspectRatio";
import type { CharacterAvatarState } from "@/lib/project/characterAvatar";
import { languageLabel, type LanguageChoice } from "@/lib/project/language";
import { type MetadataVoice, voiceTraitEntries } from "@/lib/project/types";
import { type VideoLength, videoLengthBudget } from "@/lib/project/videoLength";
import { type VideoFormat, videoFormatLabel } from "@/lib/project/videoFormat";

const UNSET = "not set";

/** The project as it stands, in the terms the model reasons about. */
export type AgentContext = {
	title: string;
	style: string;
	language: LanguageChoice;
	length: VideoLength;
	format: VideoFormat;
	aspectRatio: AspectRatio;
	templateName?: string;
	narration: MetadataVoice;
	characters: {
		name: string;
		hasAppearance: boolean;
		avatar: CharacterAvatarState;
	}[];
	referenceImageCount: number;
	scriptIsEmpty: boolean;
};

function renderNarrator(narration: AgentContext["narration"]): string {
	const traits = voiceTraitEntries(narration).map(
		([trait, value]) => `${trait}: ${value}`,
	);
	return traits.length > 0 ? traits.join(", ") : UNSET;
}

const AVATAR_NOTES: Record<
	AgentContext["characters"][number]["avatar"],
	string
> = {
	none: "no avatar",
	generated: "avatar generated",
	uploaded: "avatar uploaded by the user",
};

function renderCharacters(characters: AgentContext["characters"]): string {
	if (characters.length === 0) return "none yet";
	return characters
		.map(({ name, hasAppearance, avatar }) => {
			const notes = [
				hasAppearance ? "appearance set" : "no appearance",
				AVATAR_NOTES[avatar],
			];
			return `${name} (${notes.join(", ")})`;
		})
		.join("; ");
}

export function renderAgentContext(settings: AgentContext): string {
	const budget = videoLengthBudget(settings.length);
	const length = budget
		? `${settings.length} (${budget.minWords} to ${budget.maxWords} spoken words)`
		: "auto (no target; write to fit the material)";
	const format =
		settings.format === "auto"
			? "auto (pick the one that fits the brief)"
			: videoFormatLabel(settings.format);

	return dedent`
		# The project

		Settings as of this reading. The script itself is not here; read_script is the
		only way to see it.

		- title: ${settings.title || UNSET}
		- art style: ${settings.style || UNSET}
		- language: ${languageLabel(settings.language)}
		- target length: ${length}
		- format: ${format}
		- aspect ratio: ${settings.aspectRatio}
		- template: ${settings.templateName ?? "none"}
		- narrator voice: ${renderNarrator(settings.narration)}
		- reference images: ${settings.referenceImageCount}
		- characters: ${renderCharacters(settings.characters)}
		- canvas: ${settings.scriptIsEmpty ? "empty" : "has a script on it"}`;
}
