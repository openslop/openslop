import { cosineSimilarity } from "ai";
import compact from "lodash/compact";
import sortBy from "lodash/sortBy";
import zipWith from "lodash/zipWith";
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
	return compact(SEMANTIC_FIELDS.map((field) => params[field]))
		.join(" ")
		.trim();
}

export async function rankBySimilarity(
	voices: VoiceInfo[],
	queryText: string,
): Promise<VoiceInfo[]> {
	if (voices.length === 0) return [];

	const [queryEmbedding, voiceEmbeddings] = await Promise.all([
		embedText(queryText),
		embedTexts(voices.map((v) => `${v.name} ${v.description ?? ""}`)),
	]);

	const scored = zipWith(voices, voiceEmbeddings, (voice, embedding) => ({
		voice,
		score: cosineSimilarity(queryEmbedding, embedding),
	}));
	return sortBy(scored, ({ score }) => -score).map(({ voice }) => voice);
}
