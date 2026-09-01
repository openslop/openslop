import { describe, expect, it } from "vitest";
import { ModelCatalog } from "../modelCatalog";

const catalog = ModelCatalog.from(
	{
		openslop: {
			"Slop Image v1": "slop:image@1",
			"Bytedance Seedream 2.0": "bytedance:2.0",
		},
		runware: { "Seedream 5 Lite": "bytedance:seedream@5.0-lite" },
	},
	"Slop Image v1",
);

describe("ModelCatalog", () => {
	it("offers every model it holds, in declaration order", () => {
		expect(catalog.names).toEqual([
			"Slop Image v1",
			"Bytedance Seedream 2.0",
			"Seedream 5 Lite",
		]);
	});

	// Every model is tagged with the provider whose map it came from, so a
	// catalog spanning providers routes each pick to its own connector.
	it("resolves the connector a model runs on", () => {
		expect(catalog.providerFor("Bytedance Seedream 2.0")).toBe("openslop");
	});

	it("falls back to the default model's connector for an unnamed model", () => {
		expect(catalog.providerFor(undefined)).toBe("openslop");
	});

	// A saved project can name a model that has since been retired.
	it("falls back for a model it does not know", () => {
		expect(catalog.providerFor("Retired v0")).toBe("openslop");
	});

	it("carries the id the serving provider's own API takes", () => {
		expect(catalog.idFor("Seedream 5 Lite")).toBe(
			"bytedance:seedream@5.0-lite",
		);
	});

	// A retired pick must not be forwarded as an id the vendor never had.
	it("falls back to the default's id for a model it does not know", () => {
		expect(catalog.idFor("Retired v0")).toBe("slop:image@1");
	});

	it("lists every provider serving it, once each", () => {
		expect(catalog.providers).toEqual(["openslop", "runware"]);
	});

	it("lists the names one provider serves", () => {
		expect(catalog.namesFor("runware")).toEqual(["Seedream 5 Lite"]);
	});

	it("refuses a default that is not in the catalog", () => {
		expect(() => ModelCatalog.from({ openslop: { a: "a" } }, "b")).toThrow(
			/not in the catalog/,
		);
	});
});
