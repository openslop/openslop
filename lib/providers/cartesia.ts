import type { Caption } from "@remotion/captions";
import { validateByProbe } from "./validate";

/** Cartesia times bare words in seconds, so each one starts a word. */
export const cartesiaCaptions = (
	words: { text: string; start: number; end: number }[],
): Caption[] =>
	words.map(({ text, start, end }) => ({
		text: ` ${text}`,
		startMs: start * 1000,
		endMs: end * 1000,
		timestampMs: null,
		confidence: null,
	}));

/** Listing one voice is the cheapest call the API authenticates. */
export const validateCartesiaKey = (apiKey: string) =>
	validateByProbe("https://api.cartesia.ai/voices/?limit=1", {
		headers: {
			"X-API-Key": apiKey,
			"Cartesia-Version": "2024-11-13",
		},
	});
