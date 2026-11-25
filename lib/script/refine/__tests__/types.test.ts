import { describe, expect, it } from "vitest";
import { z } from "zod";
import { attributeSchemaFor } from "@/lib/canvas/element-connector";
import { connectorOf, ContentTypeSchema } from "@/lib/canvas/types";
import { resolveAttributeSchema } from "@/lib/connectors/factory";
import { listModels } from "@/lib/connectors/models";
import { TTS_GENDERS, TTS_LANGUAGES } from "@/lib/connectors/tts/enums";
import { refineOpSchema } from "../types";

type Attrs = Record<string, unknown>;

const insert = (type: string, attrs: Attrs) =>
	refineOpSchema.safeParse({
		op: "insert",
		elements: [{ type, text: "A prompt", attrs }],
	});

const insertMusic = (attrs: Attrs) => insert("music", attrs);

const set = (type: string, attrs: Attrs, drop?: string[]) =>
	refineOpSchema.safeParse({
		op: "set",
		id: "e1",
		element: { type, attrs },
		drop,
	});

const asset = (type: string, attrs: Attrs) =>
	refineOpSchema.safeParse({ op: "asset", element: { type, attrs } });

const voice = (attrs: Attrs) => asset("asset_voice", attrs);

const problems = ({ error }: z.ZodSafeParseResult<unknown>) =>
	error?.issues.map(({ message }) => message).join("\n");

describe("refine op attributes", () => {
	it("rejects numbers for options, naming the values allowed", () => {
		const parsed = insertMusic({ loops: 1, volume: 10 });

		expect(parsed.success).toBe(false);
		expect(problems(parsed)).toContain("expected string, received number");
		expect(problems(parsed)).toContain('expected one of "0"|"1"');
	});

	it("rejects a loop count that is not a whole number from 1, saying so", () => {
		const parsed = set("music", { loops: "0" });

		expect(parsed.success).toBe(false);
		expect(problems(parsed)).toContain("A whole number, 1 or more.");
	});

	it("rejects a value outside an attribute's options, naming the values allowed", () => {
		const parsed = set("music", { volume: "11" });

		expect(parsed.success).toBe(false);
		expect(problems(parsed)).toContain('"9"|"10"');
	});

	it("rejects a key no element has", () => {
		expect(set("music", { tempo: "fast" }).success).toBe(false);
	});

	it("rejects an attribute only another type has", () => {
		expect(insert("video", { name: "x" }).success).toBe(false);
		expect(asset("asset_style", { name: "x" }).success).toBe(false);
		expect(set("video", { name: "x" }).success).toBe(false);
	});

	it("takes what each type offers, in seconds, frames and a model's own options", () => {
		expect(
			insertMusic({ loops: "2", volume: "4", lyrics: "true" }).success,
		).toBe(true);
		expect(
			set("video", {
				trimStart: "1.5",
				startFrame: "previous",
				continuity: "true",
				resolution: "1080p",
			}).success,
		).toBe(true);
		expect(
			set("video", { startFrame: "https://example.com/a.png" }).success,
		).toBe(true);
		expect(set("video", { trimStart: "soon" }).success).toBe(false);
		expect(set("video", { startFrame: "elsewhere" }).success).toBe(false);
	});

	it("sets a voice's traits from their options", () => {
		expect(
			voice({ name: "Mia", gender: TTS_GENDERS[0], language: TTS_LANGUAGES[1] })
				.success,
		).toBe(true);
		expect(voice({ name: "Mia", gender: "robot" }).success).toBe(false);
	});

	it("sets what the user would otherwise pick or upload", () => {
		expect(
			set("video", {
				referenceImagesOverride: "https://a.test/1.png,https://a.test/2.png",
				uploadedFrame: "https://a.test/frame.png",
			}).success,
		).toBe(true);
		expect(voice({ name: "Mia", pickedVoiceId: "v1" }).success).toBe(true);
		expect(
			asset("asset_references", { images: "https://a.test/1.png" }).success,
		).toBe(true);
	});

	it("clears an attribute through drop, never through null", () => {
		expect(set("video", {}, ["trimEnd"]).success).toBe(true);
		expect(set("video", { trimEnd: null }).success).toBe(false);
		expect(voice({ name: null }).success).toBe(false);
	});

	it("takes every key a type's models carry, from its default model", () => {
		for (const type of ContentTypeSchema.options) {
			const connector = connectorOf(type);
			const keys = attributeSchemaFor(type).keys;
			for (const model of listModels(connector))
				expect(keys).toEqual(
					expect.arrayContaining(resolveAttributeSchema(connector, model).keys),
				);
		}
	});
});
