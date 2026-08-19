import { z } from "zod";
import dedent from "dedent";
import { languageLabel, LANGUAGE_CHOICES } from "@/lib/project/language";
import { MetadataVoiceSchema, voiceTraitEntries } from "@/lib/project/types";
import { ASPECT_RATIOS } from "@/lib/video/aspectRatio";
import { VIDEO_LENGTHS, VIDEO_LENGTH_SPECS } from "@/lib/video/videoLength";

const UNSET = "not set";

/**
 * The project as it stands when the turn starts. Sent with every request rather
 * than read through a tool: it is small, and it is what the model needs before
 * deciding whether it needs anything else.
 */
export const agentContextSchema = z.object({
	title: z.string(),
	style: z.string(),
	language: z.enum(LANGUAGE_CHOICES),
	length: z.enum(VIDEO_LENGTHS),
	aspectRatio: z.enum(ASPECT_RATIOS),
	templateName: z.string().optional(),
	narration: MetadataVoiceSchema,
	characters: z.array(
		z.object({
			name: z.string(),
			hasAppearance: z.boolean(),
			avatar: z.enum(["none", "generated", "uploaded"]),
		}),
	),
	referenceImageCount: z.number().int().min(0),
	scriptIsEmpty: z.boolean(),
});

export type AgentContext = z.infer<typeof agentContextSchema>;

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
	const { minWords, maxWords } = VIDEO_LENGTH_SPECS[ctx.length];

	return dedent`
		# The project

		Settings as of your latest request. The script itself is not here; read_script is
		the only way to see it.

		- title: ${ctx.title || UNSET}
		- art style: ${ctx.style || UNSET}
		- language: ${languageLabel(ctx.language)}
		- video length: ${ctx.length} (${minWords} to ${maxWords} spoken words)
		- aspect ratio: ${ctx.aspectRatio}
		- template: ${ctx.templateName ?? "none"}
		- narrator voice: ${renderNarrator(ctx.narration)}
		- reference images: ${ctx.referenceImageCount}
		- characters: ${renderCharacters(ctx.characters)}
		- canvas: ${ctx.scriptIsEmpty ? "empty" : "has a script on it"}`;
}
