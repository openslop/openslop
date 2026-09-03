import { cosineSimilarity } from "ai";
import sortBy from "lodash/sortBy";
import type { VoiceInfo, VoiceSearchParams } from "@/lib/connectors/types";
import { embedText, embedTexts } from "../embed";

const SEMANTIC_FIELDS = [
	"query",
	"description",
	"accent",
	"pitch",
	"age",
] as const satisfies ReadonlyArray<keyof VoiceSearchParams>;

export function buildQueryText(params: VoiceSearchParams): string {
	return SEMANTIC_FIELDS.map((k) => params[k])
		.filter((v): v is string => Boolean(v))
		.join(" ")
		.trim();
}

export async function rankBySimilarity(
	voices: VoiceInfo[],
	queryText: string,
): Promise<VoiceInfo[]> {
	if (voices.length === 0) return [];

	const [query, voiceVecs] = await Promise.all([
		embedText(queryText),
		embedTexts(voices.map((v) => `${v.name} ${v.description ?? ""}`)),
	]);

	const scored = voices.map((voice, i) => ({
		voice,
		score: cosineSimilarity(query, voiceVecs[i]),
	}));
	return sortBy(scored, (s) => -s.score).map((s) => s.voice);
}
