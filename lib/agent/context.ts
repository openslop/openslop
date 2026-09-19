import dedent from "dedent";
import type { AspectRatio } from "@/lib/project/aspectRatio";
import type { CharacterAvatarState } from "@/lib/project/characterAvatar";
import { languageLabel, type LanguageChoice } from "@/lib/project/language";
import { type MetadataVoice, voiceTraitEntries } from "@/lib/project/types";
import { type VideoLength, videoLengthBudget } from "@/lib/project/videoLength";

const UNSET = "not set";

/** The project as it stands, in the terms the model reasons about. */
export type AgentContext = {
	title: string;
	style: string;
	language: LanguageChoice;
	length: VideoLength;
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

export function renderAgentContext(ctx: AgentContext): string {
	const budget = videoLengthBudget(ctx.length);
	const length = budget
		? `${ctx.length} (${budget.minWords} to ${budget.maxWords} spoken words)`
		: "auto (no target; write to fit the material)";

	return dedent`
		# The project

		Settings as of this reading. The script itself is not here; read_script is the
		only way to see it.

		- title: ${ctx.title || UNSET}
		- art style: ${ctx.style || UNSET}
		- language: ${languageLabel(ctx.language)}
		- target length: ${length}
		- aspect ratio: ${ctx.aspectRatio}
		- template: ${ctx.templateName ?? "none"}
		- narrator voice: ${renderNarrator(ctx.narration)}
		- reference images: ${ctx.referenceImageCount}
		- characters: ${renderCharacters(ctx.characters)}
		- canvas: ${ctx.scriptIsEmpty ? "empty" : "has a script on it"}`;
}
