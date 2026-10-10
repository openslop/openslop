import { describe, expect, it, vi } from "vitest";
import { asset, references } from "@/lib/canvas/__tests__/_assets";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
} from "@/lib/connectors/types";
import { resultQueue } from "./_canvas";
import { artStyleReferences, deriveArtStyle } from "../derive-art-style";

const avatar = (name: string) => asset("asset_avatar", { name });

describe("artStyleReferences", () => {
	it("combines reference images with uploaded avatars, excluding generated ones", () => {
		const mira = avatar("Mira");
		const generated = avatar("Generated");
		expect(
			artStyleReferences(
				[references("https://example.com/reference.jpg"), mira, generated],
				resultQueue({
					[mira.id]: {
						imageUrl: "https://example.com/uploaded.jpg",
						pinned: true,
					},
					[generated.id]: {
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
		expect(artStyleReferences([avatar("Mira")], resultQueue({}))).toEqual([]);
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

	it("describes the references and trims the result", async () => {
		const model = llm("  Soft watercolor, pastel palette.  ");

		const style = await deriveArtStyle(model, ["https://example.com/a.jpg"]);

		expect(style).toBe("Soft watercolor, pastel palette.");
		expect(model.generate.mock.calls[0][0]).toMatchObject({
			referenceImages: ["https://example.com/a.jpg"],
		});
	});

	it("throws when the model describes nothing", async () => {
		await expect(
			deriveArtStyle(llm("  "), ["https://example.com/a.jpg"]),
		).rejects.toThrow("The model described no art style");
	});
});
