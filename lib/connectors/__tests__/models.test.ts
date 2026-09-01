import { describe, expect, it } from "vitest";
import {
	defaultModelFor,
	differsFromRecommended,
	MODEL_CATALOGS,
	modelSourceFor,
	resolveDefaultModels,
} from "../models";
import { MODEL_META } from "../modelMeta";
import { PROVIDER_CATALOG } from "../providerCatalog";
import { CONNECTOR_TYPES } from "../types";

describe("defaultModelFor", () => {
	it("takes the catalog's default when no scope pins anything", () => {
		expect(defaultModelFor("image")).toBe(MODEL_CATALOGS.image.defaultModel);
	});

	it("takes the project's pick for that connector type", () => {
		expect(
			defaultModelFor("image", { project: { image: "Seedream 5 Lite" } }),
		).toBe("Seedream 5 Lite");
	});

	it("takes the account's pick when the project pins nothing", () => {
		expect(
			defaultModelFor("image", { account: { image: "Seedream 5 Lite" } }),
		).toBe("Seedream 5 Lite");
	});

	it("lets the project override the account", () => {
		expect(
			defaultModelFor("image", {
				project: { image: "Slop Image v1" },
				account: { image: "Seedream 5 Lite" },
			}),
		).toBe("Slop Image v1");
	});

	it("ignores a pick made for another connector type", () => {
		expect(
			defaultModelFor("image", { project: { video: "Slop Video v1" } }),
		).toBe(MODEL_CATALOGS.image.defaultModel);
	});

	// A project outlives the catalog, so a retired pin must not reach a provider.
	it("falls back when the project pins a model the catalog dropped", () => {
		expect(defaultModelFor("image", { project: { image: "Retired v0" } })).toBe(
			MODEL_CATALOGS.image.defaultModel,
		);
	});

	it("gives an animated image its video model, and the still its own", () => {
		expect(defaultModelFor("animated_image")).toBe(
			MODEL_CATALOGS.video.defaultModel,
		);
	});
});

describe("modelSourceFor", () => {
	it("reads as its own pick once it diverges from every scope", () => {
		expect(modelSourceFor("image", "Seedream 5 Lite")).toBe("element");
	});

	it("names the project when the project supplies it", () => {
		expect(
			modelSourceFor("image", "Seedream 5 Lite", {
				project: { image: "Seedream 5 Lite" },
				account: { image: "Slop Image v1" },
			}),
		).toBe("project");
	});

	it("names the account when only the account supplies it", () => {
		expect(
			modelSourceFor("image", "Seedream 5 Lite", {
				account: { image: "Seedream 5 Lite" },
			}),
		).toBe("account");
	});

	it("names the recommendation when no scope pins anything", () => {
		expect(modelSourceFor("image", MODEL_CATALOGS.image.defaultModel)).toBe(
			"recommended",
		);
	});

	it("ignores a scope pinning a model the catalog dropped", () => {
		expect(
			modelSourceFor("image", MODEL_CATALOGS.image.defaultModel, {
				project: { image: "Retired v0" },
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
			resolveDefaultModels({ account: { image: "Seedream 5 Lite" } }).image,
		).toBe("Seedream 5 Lite");
	});
});

describe("differsFromRecommended", () => {
	it("is false for a scope that pins nothing", () => {
		expect(differsFromRecommended({})).toBe(false);
	});

	// Picking the recommended model back is not a change to reset.
	it("is false when every pin is the recommendation", () => {
		expect(
			differsFromRecommended({ image: MODEL_CATALOGS.image.defaultModel }),
		).toBe(false);
	});

	it("is true once a pin names something else", () => {
		expect(differsFromRecommended({ image: "Seedream 5 Lite" })).toBe(true);
	});

	// A dropped pin already resolves back to the default, so nothing is pinned.
	it("is false for a pin the catalog no longer offers", () => {
		expect(differsFromRecommended({ image: "Retired v0" })).toBe(false);
	});

	it("ignores keys that are not connector types", () => {
		expect(differsFromRecommended({ nonsense: "whatever" })).toBe(false);
	});
});

describe("catalog coverage", () => {
	it("annotates every model the catalogs offer", () => {
		const missing = CONNECTOR_TYPES.flatMap((type) =>
			MODEL_CATALOGS[type].names.filter((name) => !MODEL_META[name]),
		);
		expect(missing).toEqual([]);
	});

	it("declares a modality for every type a provider serves models in", () => {
		const undeclared = CONNECTOR_TYPES.flatMap((type) =>
			MODEL_CATALOGS[type].providers
				.filter(
					(provider) => !PROVIDER_CATALOG[provider].modalities.includes(type),
				)
				.map((provider) => `${provider}:${type}`),
		);
		expect(undeclared).toEqual([]);
	});
});
