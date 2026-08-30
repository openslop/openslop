import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
} from "@/lib/connectors/types";
import { stubAvatarResults } from "@/lib/connectors/__tests__/_node-results";
import {
	artStyleReferences,
	deriveArtStyle,
	uploadedAvatarUrls,
} from "../deriveArtStyle";
import { createProjectStore, type ProjectStore } from "../store";

let store: ProjectStore;
const project = () => store.getState();

beforeEach(() => {
	store = createProjectStore();
});

describe("artStyleReferences", () => {
	it("combines reference images with uploaded avatars, excluding generated ones", () => {
		project().setReferenceImages(["https://example.com/reference.jpg"]);
		project().setCharacter("Mira", {
			appearance: "blue hair",
			avatarUploaded: true,
		});
		project().setCharacter("Generated", {
			appearance: "green hair",
			avatarUploaded: false,
		});

		expect(
			artStyleReferences(
				project(),
				stubAvatarResults({
					Mira: "https://example.com/uploaded.jpg",
					Generated: "https://example.com/generated.jpg",
				}),
			),
		).toEqual([
			"https://example.com/reference.jpg",
			"https://example.com/uploaded.jpg",
		]);
	});

	it("is empty when nothing has been uploaded", () => {
		expect(artStyleReferences(project(), stubAvatarResults({}))).toEqual([]);
	});
});

// The two halves live in different stores, so a caller that wants to react to a
// change needs to subscribe to each one.
describe("uploadedAvatarUrls", () => {
	it("leaves out reference images, which the project store owns", () => {
		project().setReferenceImages(["https://example.com/reference.jpg"]);
		project().setCharacter("Mira", {
			appearance: "blue hair",
			avatarUploaded: true,
		});

		expect(
			uploadedAvatarUrls(
				project(),
				stubAvatarResults({ Mira: "https://example.com/uploaded.jpg" }),
			),
		).toEqual(["https://example.com/uploaded.jpg"]);
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

		const style = await deriveArtStyle(model, project(), stubAvatarResults({}));

		expect(style).toBe("");
		expect(model.generate).not.toHaveBeenCalled();
	});

	it("describes the references and trims the result", async () => {
		project().setReferenceImages(["https://example.com/a.jpg"]);
		const model = llm("  Soft watercolor, pastel palette.  ");

		const style = await deriveArtStyle(model, project(), stubAvatarResults({}));

		expect(style).toBe("Soft watercolor, pastel palette.");
		expect(model.generate.mock.calls[0][0]).toMatchObject({
			referenceImages: ["https://example.com/a.jpg"],
		});
	});
});
