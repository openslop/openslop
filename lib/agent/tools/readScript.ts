import {
	voiceTraitEntries,
	type Metadata,
	type MetadataVoice,
} from "@/lib/project/types";
import type { AgentToolContext } from "./context";

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
export async function readScript(ctx: AgentToolContext): Promise<string> {
	const metadata = ctx.readMetadata();
	const script = ctx.readScript().trim();

	return [
		section("Characters", charactersOf(metadata)),
		section("Script", [
			script ? `\`\`\`osml\n${script}\n\`\`\`` : "The canvas is empty.",
		]),
	].join("\n\n");
}
