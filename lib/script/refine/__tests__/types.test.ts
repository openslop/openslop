import groupBy from "lodash/groupBy";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { attributeSchemaFor } from "@/lib/canvas/element-connector";
import { ElementTypeSchema, isMediaDraftType } from "@/lib/canvas/types";
import { TTS_GENDERS, TTS_LANGUAGES } from "@/lib/connectors/tts/enums";
import { refineOpSchema } from "../types";

const insertMusic = (attrs: Record<string, unknown>) =>
	refineOpSchema.safeParse({
		op: "insert",
		elements: [{ type: "music", text: "A calm piano cue", attrs }],
	});

const setAttrs = (attrs: Record<string, unknown>) =>
	refineOpSchema.safeParse({ op: "set", id: "e1", attrs });

const voice = (attrs: Record<string, unknown>) =>
	refineOpSchema.safeParse({ op: "asset", type: "asset_voice", attrs });

const problems = ({ error }: z.ZodSafeParseResult<unknown>) =>
	error?.issues.map(({ message }) => message).join("\n");

describe("refine op attributes", () => {
	it("rejects numbers for options, naming the values allowed", () => {
		const parsed = insertMusic({ loops: 1, volume: 10 });

		expect(parsed.success).toBe(false);
		expect(problems(parsed)).toContain('expected one of "1"|"2"');
		expect(problems(parsed)).toContain('expected one of "0"|"1"');
	});

	it("rejects a value outside an attribute's options, naming the values allowed", () => {
		const parsed = setAttrs({ volume: "11" });

		expect(parsed.success).toBe(false);
		expect(problems(parsed)).toContain('"9"|"10"');
	});

	it("rejects a key no element has", () => {
		expect(setAttrs({ tempo: "fast" }).success).toBe(false);
	});

	it("takes what each type offers, in seconds, frames and a model's own options", () => {
		expect(
			insertMusic({ loops: "2", volume: "4", lyrics: "true" }).success,
		).toBe(true);
		expect(
			setAttrs({
				trimStart: "1.5",
				startFrame: "previous",
				continuity: "true",
				resolution: "1080p",
			}).success,
		).toBe(true);
		expect(setAttrs({ startFrame: "https://example.com/a.png" }).success).toBe(
			true,
		);
		expect(setAttrs({ trimStart: "soon" }).success).toBe(false);
		expect(setAttrs({ startFrame: "elsewhere" }).success).toBe(false);
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
			setAttrs({
				referenceImagesOverride: "https://a.test/1.png,https://a.test/2.png",
				uploadedFrame: "https://a.test/frame.png",
			}).success,
		).toBe(true);
		expect(voice({ name: "Mia", pickedVoiceId: "v1" }).success).toBe(true);
		expect(
			refineOpSchema.safeParse({
				op: "asset",
				type: "asset_references",
				attrs: { images: "https://a.test/1.png" },
			}).success,
		).toBe(true);
	});

	it("takes null for an attribute only on a set", () => {
		expect(setAttrs({ trimEnd: null }).success).toBe(true);
		expect(voice({ name: null }).success).toBe(false);
	});

	it("gives a key the same values on every type that shares it", () => {
		const defs = ElementTypeSchema.options
			.filter((type) => !isMediaDraftType(type))
			.flatMap((type) => attributeSchemaFor(type).baseDefs);
		const byKey = groupBy(defs, (def) => def.key);

		for (const shared of Object.values(byKey)) {
			const domains = new Set(
				shared.map(({ edit }) =>
					JSON.stringify(edit?.value && z.toJSONSchema(edit.value)),
				),
			);
			expect(domains.size).toBe(1);
		}
	});
});
