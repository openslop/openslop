import { describe, expect, it } from "vitest";
import { MODEL_GROUPS } from "../modelGroups";
import { searchProviders } from "../providerSearch";
import type { ConnectorType } from "../types";

/** No capability asked for: the "All" filter. */
const all: ConnectorType[] | null = null;
const capability = (key: string) =>
	MODEL_GROUPS.find((group) => group.key === key)?.types ?? all;
const names = (query: string, cap: ConnectorType[] | null = all) =>
	searchProviders(query, cap).map((match) => match.provider);

describe("searchProviders", () => {
	// The hosted provider is listed too: it is what a new account already runs on.
	it("offers every connector when nothing is typed, hosted first", () => {
		expect(names("")).toEqual([
			"openslop",
			"anthropic",
			"runware",
			"cartesia",
			"elevenlabs",
		]);
	});

	it("matches a provider by name, case and spacing aside", () => {
		expect(names("  ELEVEN ")).toEqual(["elevenlabs"]);
		expect(names("eleven")).toEqual(["elevenlabs"]);
	});

	// Knowing the model you want should be enough to find who serves it.
	it("matches a provider by a model it serves", () => {
		expect(names("claude opus")).toEqual(["anthropic"]);
		expect(names("seedream")).toEqual(["runware"]);
	});

	it("says which models matched, so a row can explain itself", () => {
		expect(searchProviders("claude", all)).toEqual([
			{
				provider: "anthropic",
				models: ["Claude Opus 5", "Claude Sonnet 5", "Claude Haiku 4.5"],
			},
		]);
	});

	it("names no models when the provider itself was the match", () => {
		expect(searchProviders("runware", all)).toEqual([
			{ provider: "runware", models: [] },
		]);
	});

	it("narrows to the capability being browsed", () => {
		expect(names("", capability("videos"))).toEqual(["openslop", "runware"]);
		expect(names("", capability("voice"))).toEqual(["openslop", "cartesia"]);
	});

	// A model can only be reached through a provider the filter still allows.
	it("keeps the capability filter over a model match", () => {
		expect(names("seedream", capability("voice"))).toEqual([]);
	});

	it("finds nothing for a query no one matches", () => {
		expect(names("midjourney")).toEqual([]);
	});

	// Under a capability tab, a provider can appear only via a model the user
	// is actually browsing — never via a model in a modality the filter selects
	// out. The "All" tab is the one place cross-capability matching lives.
	describe("with a capability filter active", () => {
		it("ignores an off-capability model match", () => {
			// openslop serves tts, but "image" names its image model only, so it
			// must not surface under Voice.
			expect(searchProviders("image", capability("voice"))).toEqual([]);
		});

		it("lists only the browsed-capability models as the reason", () => {
			// Before the fix every "Slop *" model across all modalities surfaced.
			expect(searchProviders("slop", capability("voice"))).toEqual([
				{ provider: "openslop", models: ["Slop TTS v1"] },
			]);
		});

		it("drops a video model from the Images tab", () => {
			// "Seedance 2 Fast" is a video model; under Images, only the image
			// model "Seedream 5 Lite" matches.
			expect(searchProviders("seed", capability("images"))).toEqual([
				{ provider: "runware", models: ["Seedream 5 Lite"] },
			]);
		});

		it("drops an image model from the Videos tab", () => {
			// "Seedream 5 Lite" is an image model; under Videos, only the video
			// model "Seedance 2 Fast" matches.
			expect(searchProviders("seed", capability("videos"))).toEqual([
				{ provider: "runware", models: ["Seedance 2 Fast"] },
			]);
		});

		it("drops a provider whose only model match is off-capability", () => {
			// "seedream" matches only runware's image model; runware's video
			// models do not contain it, so under Videos it is dropped entirely.
			expect(searchProviders("seedream", capability("videos"))).toEqual([]);
		});

		it("still surfaces a provider by name with no model reason", () => {
			expect(searchProviders("runware", capability("images"))).toEqual([
				{ provider: "runware", models: [] },
			]);
		});
	});

	describe("with no capability filter (the All tab)", () => {
		it("still matches models across every modality a provider serves", () => {
			// The cross-capability discovery path the All tab exists for.
			expect(searchProviders("slop", all)).toEqual([
				{
					provider: "openslop",
					models: [
						"Slop Music v1",
						"Slop SFX v1",
						"Slop Image v1",
						"Slop Video v1",
						"Slop Video v1 Fast",
						"Slop TTS v1",
						"Slop LLM v1",
					],
				},
			]);
		});
	});
});
