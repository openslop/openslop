import { describe, expect, it } from "vitest";
import {
	DEFAULT_MODELS,
	defaultModelFor,
	differsFromRecommended,
	hasModel,
	listModels,
	MODELS,
	modalitiesFor,
	modelEntry,
	modelSourceFor,
	resolveDefaultModels,
	resolveModel,
} from "../models";
import { CONNECTOR_TYPES } from "../types";

const SEEDREAM = { provider: "runware", model: "Seedream 5 Lite" } as const;
const SLOP_IMAGE = DEFAULT_MODELS.image;

describe("DEFAULT_MODELS", () => {
	it("recommends a model every type actually offers", () => {
		for (const type of CONNECTOR_TYPES) {
			expect(hasModel(type, DEFAULT_MODELS[type]), type).toBe(true);
		}
	});
});

describe("hasModel", () => {
	it("is true only for a pair a provider lists", () => {
		expect(hasModel("image", SEEDREAM)).toBe(true);
		expect(hasModel("image", SLOP_IMAGE)).toBe(true);
	});

	// The same name means nothing on another provider.
	it("is false for a name under the wrong provider", () => {
		expect(
			hasModel("image", { provider: "openslop", model: "Seedream 5 Lite" }),
		).toBe(false);
		expect(
			hasModel("image", { provider: "runware", model: "Slop Image v1" }),
		).toBe(false);
	});

	it("is false for a half pair or nothing", () => {
		expect(hasModel("image", { model: "Slop Image v1" })).toBe(false);
		expect(hasModel("image", { provider: "openslop" })).toBe(false);
		expect(hasModel("image", undefined)).toBe(false);
	});

	it("is false for a provider or model outside the tables", () => {
		expect(
			hasModel("image", { provider: "nope", model: "Slop Image v1" }),
		).toBe(false);
		expect(
			hasModel("image", { provider: "openslop", model: "Retired v0" }),
		).toBe(false);
	});
});

describe("modelEntry", () => {
	it("reads the id the provider's own API takes", () => {
		expect(modelEntry("image", SEEDREAM).id).toBe(
			"bytedance:seedream@5.0-lite",
		);
	});

	it("throws for a pair nobody offers", () => {
		expect(() =>
			modelEntry("image", { provider: "anthropic", model: "Slop Image v1" }),
		).toThrow('"anthropic" has no image model "Slop Image v1"');
	});
});

describe("resolveModel", () => {
	it("takes the first candidate the type offers", () => {
		expect(
			resolveModel("image", { model: "Slop Image v1" }, SEEDREAM, SLOP_IMAGE),
		).toEqual(SEEDREAM);
	});

	it("falls back to the recommendation when no candidate resolves", () => {
		expect(
			resolveModel("image", undefined, {
				provider: "openslop",
				model: "Retired v0",
			}),
		).toEqual(SLOP_IMAGE);
		expect(resolveModel("image")).toEqual(SLOP_IMAGE);
	});
});

describe("listModels", () => {
	it("flattens every provider's table, each row naming its provider", () => {
		expect(listModels("image")).toEqual([
			{ ...SLOP_IMAGE, ...modelEntry("image", SLOP_IMAGE) },
			{ ...SEEDREAM, ...modelEntry("image", SEEDREAM) },
		]);
	});

	it("lists the video models for an animated image", () => {
		expect(listModels("animated_image")).toEqual(listModels("video"));
	});
});

describe("modalitiesFor", () => {
	it("names every type a provider has models for", () => {
		expect(modalitiesFor("runware").sort()).toEqual([
			"animated_image",
			"image",
			"video",
		]);
		expect(modalitiesFor("anthropic")).toEqual(["llm"]);
		expect(modalitiesFor("openslop")).toEqual([...CONNECTOR_TYPES]);
	});
});

describe("defaultModelFor", () => {
	it("takes the recommendation when no scope pins anything", () => {
		expect(defaultModelFor("image")).toEqual(SLOP_IMAGE);
	});

	it("takes the project's pick for that connector type", () => {
		expect(defaultModelFor("image", { project: { image: SEEDREAM } })).toEqual(
			SEEDREAM,
		);
	});

	it("takes the account's pick when the project pins nothing", () => {
		expect(defaultModelFor("image", { account: { image: SEEDREAM } })).toEqual(
			SEEDREAM,
		);
	});

	it("lets the project override the account", () => {
		expect(
			defaultModelFor("image", {
				project: { image: SLOP_IMAGE },
				account: { image: SEEDREAM },
			}),
		).toEqual(SLOP_IMAGE);
	});

	it("ignores a pick made for another connector type", () => {
		expect(
			defaultModelFor("image", { project: { video: DEFAULT_MODELS.video } }),
		).toEqual(SLOP_IMAGE);
	});

	// A project outlives the tables, so a retired pin must not reach a provider.
	it("falls back when the project pins a model the tables dropped", () => {
		expect(
			defaultModelFor("image", {
				project: { image: { provider: "openslop", model: "Retired v0" } },
			}),
		).toEqual(SLOP_IMAGE);
	});

	it("gives an animated image its video model, and the still its own", () => {
		expect(defaultModelFor("animated_image")).toEqual(DEFAULT_MODELS.video);
	});
});

describe("modelSourceFor", () => {
	it("reads as its own pick once it diverges from every scope", () => {
		expect(modelSourceFor("image", SEEDREAM)).toBe("element");
	});

	it("names the project when the project supplies it", () => {
		expect(
			modelSourceFor("image", SEEDREAM, {
				project: { image: SEEDREAM },
				account: { image: SLOP_IMAGE },
			}),
		).toBe("project");
	});

	it("names the account when only the account supplies it", () => {
		expect(
			modelSourceFor("image", SEEDREAM, { account: { image: SEEDREAM } }),
		).toBe("account");
	});

	it("names the recommendation when no scope pins anything", () => {
		expect(modelSourceFor("image", SLOP_IMAGE)).toBe("recommended");
	});

	it("ignores a scope pinning a model the tables dropped", () => {
		expect(
			modelSourceFor("image", SLOP_IMAGE, {
				project: { image: { provider: "openslop", model: "Retired v0" } },
			}),
		).toBe("recommended");
	});
});

describe("resolveDefaultModels", () => {
	it("answers for every connector type, so a creator never walks the chain", () => {
		expect(Object.keys(resolveDefaultModels()).sort()).toEqual(
			[...CONNECTOR_TYPES].sort(),
		);
	});

	it("resolves each type against the chain", () => {
		expect(
			resolveDefaultModels({ account: { image: SEEDREAM } }).image,
		).toEqual(SEEDREAM);
	});
});

describe("differsFromRecommended", () => {
	it("is false for a scope that pins nothing", () => {
		expect(differsFromRecommended({})).toBe(false);
	});

	// Picking the recommended model back is not a change to reset.
	it("is false when every pin is the recommendation", () => {
		expect(differsFromRecommended({ image: SLOP_IMAGE })).toBe(false);
	});

	it("is true once a pin names something else", () => {
		expect(differsFromRecommended({ image: SEEDREAM })).toBe(true);
	});

	// A dropped pin already resolves back to the default, so nothing is pinned.
	it("is false for a pin the tables dropped", () => {
		expect(
			differsFromRecommended({
				image: { provider: "openslop", model: "Retired v0" },
			}),
		).toBe(false);
	});

	it("ignores a key that is not a connector type", () => {
		expect(differsFromRecommended({ bogus: SEEDREAM })).toBe(false);
	});
});

describe("MODELS", () => {
	it("shares the video tables between clips and animated images", () => {
		expect(MODELS.animated_image).toBe(MODELS.video);
	});
});
