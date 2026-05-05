import { describe, expect, it } from "vitest";
import type { DeepPartial, Metadata } from "@/lib/project/types";
import { METADATA_TAG_CONFIGS } from "../config/metadataTags";

const apply = (
	tag: keyof typeof METADATA_TAG_CONFIGS,
	attrs: Record<string, string>,
	text: string,
): DeepPartial<Metadata> => {
	const partial: DeepPartial<Metadata> = {};
	METADATA_TAG_CONFIGS[tag].apply(partial, attrs, text);
	return partial;
};

describe("METADATA_TAG_CONFIGS", () => {
	describe("metadata_title", () => {
		it("sets title from text", () => {
			expect(apply("metadata_title", {}, "My Story")).toEqual({
				title: "My Story",
			});
		});

		it("ignores empty text so existing title is preserved on merge", () => {
			expect(apply("metadata_title", {}, "")).toEqual({});
		});
	});

	describe("metadata_style", () => {
		it("sets style from text", () => {
			expect(apply("metadata_style", {}, "noir")).toEqual({ style: "noir" });
		});

		it("ignores empty text", () => {
			expect(apply("metadata_style", {}, "")).toEqual({});
		});
	});

	describe("metadata_narration", () => {
		it("parses voice attrs into narration", () => {
			expect(
				apply(
					"metadata_narration",
					{ gender: "feminine", age: "adult", accent: "british" },
					"",
				),
			).toEqual({
				narration: {
					gender: "feminine",
					age: "adult",
					accent: "british",
				},
			});
		});

		it("drops invalid gender via schema catch", () => {
			expect(
				apply("metadata_narration", { gender: "invalid", age: "adult" }, ""),
			).toEqual({
				narration: { gender: undefined, age: "adult" },
			});
		});
	});

	describe("metadata_character", () => {
		it("requires a name attr; otherwise no-op", () => {
			expect(apply("metadata_character", {}, "tall and kind")).toEqual({});
		});

		it("uses text as appearance and parses voice attrs", () => {
			expect(
				apply(
					"metadata_character",
					{ name: "Alice", gender: "feminine", pitch: "high" },
					"red hair, freckles",
				),
			).toEqual({
				characters: {
					Alice: {
						appearance: "red hair, freckles",
						gender: "feminine",
						pitch: "high",
					},
				},
			});
		});

		it("supports multiple characters accumulating into the same partial", () => {
			const partial: DeepPartial<Metadata> = {};
			METADATA_TAG_CONFIGS.metadata_character.apply(
				partial,
				{ name: "Alice", gender: "feminine" },
				"a",
			);
			METADATA_TAG_CONFIGS.metadata_character.apply(
				partial,
				{ name: "Bob", gender: "masculine" },
				"b",
			);
			expect(partial.characters).toEqual({
				Alice: { appearance: "a", gender: "feminine" },
				Bob: { appearance: "b", gender: "masculine" },
			});
		});
	});
});
