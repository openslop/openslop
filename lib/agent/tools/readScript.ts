import {
	VOICE_TRAITS,
	type Metadata,
	type MetadataVoice,
} from "@/lib/project/types";
import type { AgentToolContext } from "./context";

const UNSET = "unset";

function section(heading: string, lines: string[]): string {
	return [`## ${heading}`, ...lines].join("\n");
}

function voiceOf(voice: MetadataVoice): string {
	const traits = VOICE_TRAITS.map((trait) => voice[trait]).filter(Boolean);
	return traits.length > 0 ? traits.join(", ") : UNSET;
}

function charactersOf(metadata: Metadata): string[] {
	const entries = Object.entries(metadata.characters);
	if (entries.length === 0) return ["None yet."];
	return entries.map(
		([name, character]) =>
			`- ${name}: ${character.appearance || UNSET} (voice: ${voiceOf(character)})`,
	);
}

export async function readScript(ctx: AgentToolContext): Promise<string> {
	const metadata = ctx.readMetadata();
	const script = ctx.readScript().trim();

	return [
		section("Project", [
			`- title: ${metadata.title || UNSET}`,
			`- art style: ${metadata.style || UNSET}`,
			`- narrator voice: ${voiceOf(metadata.narration)}`,
		]),
		section("Characters", charactersOf(metadata)),
		section("Script", [
			script ? `\`\`\`osml\n${script}\n\`\`\`` : "The canvas is empty.",
		]),
	].join("\n\n");
}
