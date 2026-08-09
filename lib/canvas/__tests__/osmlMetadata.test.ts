import { describe, expect, it } from "vitest";
import { MetadataSchema } from "@/lib/project/types";
import { collectMetadata, collectWritableMetadata } from "../osmlMetadata";
import type { ParsedElement } from "../types";

const node = (
	type: string,
	attrs: Record<string, string> = {},
	text = "",
): ParsedElement => ({
	id: `${type}-${text}`,
	type,
	customAttributes: attrs,
	children: [{ id: `${type}-text`, type, text }],
});

describe("collectMetadata", () => {
	it("ignores canvas element nodes", () => {
		expect(collectMetadata([node("image", {}, "a wolf")])).toEqual({});
	});

	describe("metadata_title", () => {
		it("sets title from text", () => {
			expect(collectMetadata([node("metadata_title", {}, "My Story")])).toEqual(
				{
					title: "My Story",
				},
			);
		});

		it("ignores empty text so existing title is preserved on merge", () => {
			expect(collectMetadata([node("metadata_title")])).toEqual({});
		});
	});

	describe("metadata_style", () => {
		it("sets style from text", () => {
			expect(collectMetadata([node("metadata_style", {}, "noir")])).toEqual({
				style: "noir",
			});
		});

		it("ignores empty text", () => {
			expect(collectMetadata([node("metadata_style")])).toEqual({});
		});
	});

	describe("metadata_narration", () => {
		it("parses voice attrs into narration", () => {
			expect(
				collectMetadata([
					node("metadata_narration", {
						gender: "feminine",
						age: "adult",
						accent: "british",
					}),
				]),
			).toEqual({
				narration: { gender: "feminine", age: "adult", accent: "british" },
			});
		});

		it("drops invalid gender via schema catch", () => {
			expect(
				collectMetadata([
					node("metadata_narration", { gender: "invalid", age: "adult" }),
				]),
			).toEqual({ narration: { gender: undefined, age: "adult" } });
		});
	});

	describe("metadata_character", () => {
		it("requires a name attr; otherwise no-op", () => {
			expect(
				collectMetadata([node("metadata_character", {}, "tall and kind")]),
			).toEqual({});
		});

		it("uses text as appearance and parses voice attrs", () => {
			expect(
				collectMetadata([
					node(
						"metadata_character",
						{ name: "Alice", gender: "feminine", pitch: "high" },
						"red hair, freckles",
					),
				]),
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

		it("accumulates multiple characters", () => {
			const metadata = collectMetadata([
				node("metadata_character", { name: "Alice", gender: "feminine" }, "a"),
				node("metadata_character", { name: "Bob", gender: "masculine" }, "b"),
			]);
			expect(metadata.characters).toEqual({
				Alice: { appearance: "a", gender: "feminine" },
				Bob: { appearance: "b", gender: "masculine" },
			});
		});
	});

	it("collects every tag from one mixed node list", () => {
		expect(
			collectMetadata([
				node("metadata_title", {}, "Little Red"),
				node("metadata_style", {}, "watercolor"),
				node("metadata_narration", { gender: "feminine" }),
				node("metadata_character", { name: "Red" }, "a red cloak"),
				node("narration", {}, "Once upon a time"),
			]),
		).toEqual({
			title: "Little Red",
			style: "watercolor",
			narration: { gender: "feminine" },
			characters: { Red: { appearance: "a red cloak" } },
		});
	});
});

describe("collectWritableMetadata", () => {
	const stored = (style: string) => MetadataSchema.parse({ style });
	const script = [
		node("metadata_title", {}, "Little Red"),
		node("metadata_style", {}, "watercolor"),
	];

	it("fills in an art style when the project has none", () => {
		expect(collectWritableMetadata(script, stored(""))).toEqual({
			title: "Little Red",
			style: "watercolor",
		});
	});

	it("keeps a stored art style while still applying the rest", () => {
		expect(
			collectWritableMetadata(script, stored("Oil painting --ar 16:9")),
		).toEqual({ title: "Little Red" });
	});

	it("treats a whitespace-only stored style as none", () => {
		expect(collectWritableMetadata(script, stored("   "))).toEqual({
			title: "Little Red",
			style: "watercolor",
		});
	});
});
