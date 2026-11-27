import { describe, expect, it } from "vitest";
import { createConnector, resolveAttributeSchema } from "../factory";
import { DEFAULT_MODELS } from "../models";
import { CONTENT_TYPES, ownsModel } from "@/lib/canvas/types";
import { keysOf } from "@/lib/utils";
import type { ConnectorType } from "../types";

const stubConfig = {};

describe("createConnector", () => {
	it("creates all connector types, each reporting the type it was registered under", () => {
		const types: ConnectorType[] = [
			"llm",
			"music",
			"sfx",
			"image",
			"tts",
			"video",
		];
		for (const type of types) {
			const connector = createConnector(
				type,
				DEFAULT_MODELS[type],
				"project-1",
				stubConfig,
			);
			expect(connector.type).toBe(type);
		}
	});
});

describe("resolveAttributeSchema", () => {
	it("resolves the connector type's base schema, keyed by connector type not element type", () => {
		expect(resolveAttributeSchema("tts", DEFAULT_MODELS.tts).keys).toEqual([
			"name",
			"emotion",
			"speed",
			"volume",
			"trimStart",
			"trimEnd",
		]);
	});

	it("resolves distinct schemas for image vs video", () => {
		expect(resolveAttributeSchema("image", DEFAULT_MODELS.image).keys).toEqual([
			"provider",
			"model",
			"referenceImagesOverride",
			"resolution",
			"format",
			"motion",
		]);
		expect(resolveAttributeSchema("video", DEFAULT_MODELS.video).keys).toEqual([
			"provider",
			"model",
			"startFrame",
			"continuity",
			"uploadedFrame",
			"referenceImagesOverride",
			"resolution",
			"duration",
			"loop",
			"volume",
			"motion",
			"trimStart",
			"trimEnd",
		]);
	});

	it("carries the model pair exactly on the content types that own a model", () => {
		for (const type of keysOf(CONTENT_TYPES)) {
			const { connector } = CONTENT_TYPES[type];
			const { keys } = resolveAttributeSchema(
				connector,
				DEFAULT_MODELS[connector],
			);
			expect(keys.includes("provider")).toBe(ownsModel(type));
			expect(keys.includes("model")).toBe(ownsModel(type));
		}
	});

	it("llm has no element-settings attributes, inherited empty from the base connector", () => {
		expect(resolveAttributeSchema("llm", DEFAULT_MODELS.llm).keys).toEqual([]);
	});
});
