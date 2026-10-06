import { describe, expect, it, vi } from "vitest";
import { assetId } from "@/lib/canvas/types";
import { REFERENCE_URLS_ATTR } from "@/lib/canvas/assets";
import { createCanvasNode } from "@/lib/canvas/createCanvasNode";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
} from "@/lib/connectors/types";
import { resultQueue } from "./_canvas";
import {
	artStyleReferences,
	deriveArtStyle,
	uploadedAvatarUrls,
} from "../deriveArtStyle";

const references = (...urls: string[]) =>
	createCanvasNode("asset_references", {
		id: assetId("asset_references"),
		attrs: { [REFERENCE_URLS_ATTR]: urls.join(",") },
	});

const character = (name: string) =>
	createCanvasNode("asset_character", {
		id: assetId("asset_character", name),
		attrs: { name },
	});

describe("artStyleReferences", () => {
	it("combines reference images with uploaded avatars, excluding generated ones", () => {
		expect(
			artStyleReferences(
				[
					references("https://example.com/reference.jpg"),
					character("Mira"),
					character("Generated"),
				],
				resultQueue({
					[assetId("asset_character", "Mira")]: {
						imageUrl: "https://example.com/uploaded.jpg",
						pinned: true,
					},
					[assetId("asset_character", "Generated")]: {
						imageUrl: "https://example.com/generated.jpg",
					},
				}),
			),
		).toEqual([
			"https://example.com/reference.jpg",
			"https://example.com/uploaded.jpg",
		]);
	});

	it("is empty when nothing has been uploaded", () => {
		expect(artStyleReferences([character("Mira")], resultQueue({}))).toEqual(
			[],
		);
	});
});

describe("uploadedAvatarUrls", () => {
	it("leaves out the reference images", () => {
		expect(
			uploadedAvatarUrls(
				[references("https://example.com/reference.jpg"), character("Mira")],
				resultQueue({
					[assetId("asset_character", "Mira")]: {
						imageUrl: "https://example.com/uploaded.jpg",
						pinned: true,
					},
				}),
			),
		).toEqual(["https://example.com/uploaded.jpg"]);
	});

	it("leaves out an upload held for a character no longer among the characters", () => {
		expect(
			uploadedAvatarUrls(
				[character("Mira")],
				resultQueue({
					[assetId("asset_character", "Gone")]: {
						imageUrl: "https://example.com/gone.jpg",
						pinned: true,
					},
				}),
			),
		).toEqual([]);
	});
});

describe("deriveArtStyle", () => {
	const llm = (text: string) => ({
		generate: vi.fn(
			async (_params: LLMGenerateParams): Promise<LLMGenerateResult> => ({
				text,
				model: "test",
			}),
		),
	});

	it("returns nothing and skips the model when there is nothing to read", async () => {
		const model = llm("unused");

		const style = await deriveArtStyle(model, [], resultQueue({}));

		expect(style).toBe("");
		expect(model.generate).not.toHaveBeenCalled();
	});

	it("describes the references and trims the result", async () => {
		const model = llm("  Soft watercolor, pastel palette.  ");

		const style = await deriveArtStyle(
			model,
			[references("https://example.com/a.jpg")],
			resultQueue({}),
		);

		expect(style).toBe("Soft watercolor, pastel palette.");
		expect(model.generate.mock.calls[0][0]).toMatchObject({
			referenceImages: ["https://example.com/a.jpg"],
		});
	});
});
