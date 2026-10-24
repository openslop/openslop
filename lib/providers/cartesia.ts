import { validateByProbe } from "./validate";

/** Listing one voice is the cheapest call the API authenticates. */
export const validateCartesiaKey = (apiKey: string) =>
	validateByProbe("https://api.cartesia.ai/voices/?limit=1", {
		headers: {
			"X-API-Key": apiKey,
			"Cartesia-Version": "2024-11-13",
		},
	});
