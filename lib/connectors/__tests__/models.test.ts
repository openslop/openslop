import { describe, expect, it } from "vitest";
import { defaultModelFor, MODEL_CATALOGS } from "../models";

describe("defaultModelFor", () => {
	it("takes the catalog's default when the project pins nothing", () => {
		expect(defaultModelFor("image")).toBe(MODEL_CATALOGS.image.defaultModel);
	});

	it("takes the project's pick for that connector type", () => {
		expect(defaultModelFor("image", { image: "Slop Image v1" })).toBe(
			"Slop Image v1",
		);
	});

	it("ignores a pick made for another connector type", () => {
		expect(defaultModelFor("image", { video: "Slop Video v1" })).toBe(
			MODEL_CATALOGS.image.defaultModel,
		);
	});

	// A project outlives the catalog, so a retired pin must not reach a provider.
	it("falls back when the project pins a model the catalog dropped", () => {
		expect(defaultModelFor("image", { image: "Retired v0" })).toBe(
			MODEL_CATALOGS.image.defaultModel,
		);
	});

	it("gives an animated image its video model, and the still its own", () => {
		expect(defaultModelFor("animated_image")).toBe(
			MODEL_CATALOGS.video.defaultModel,
		);
	});
});
