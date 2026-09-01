import { describe, expect, it } from "vitest";
import { CAPABILITIES } from "../capabilities";
import { searchConnectors } from "../providerSearch";

const all = CAPABILITIES[0];
const capability = (key: string) =>
	CAPABILITIES.find((entry) => entry.key === key) ?? all;
const names = (query: string, cap = all) =>
	searchConnectors(query, cap).map((match) => match.provider);

describe("searchConnectors", () => {
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
		expect(searchConnectors("claude", all)).toEqual([
			{
				provider: "anthropic",
				models: ["Claude Opus 5", "Claude Sonnet 5", "Claude Haiku 4.5"],
			},
		]);
	});

	it("names no models when the provider itself was the match", () => {
		expect(searchConnectors("runware", all)).toEqual([
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
});
