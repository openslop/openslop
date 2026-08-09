import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { stubAvatarResults } from "@/lib/connectors/__tests__/_node-results";
import { artStyleReferences } from "../artStyleReferences";
import { clearProjectStore, getProjectStore } from "../store";

const projectId = "art-style-references-project";
const project = () => getProjectStore(projectId).getState();

beforeEach(() => {
	clearProjectStore(projectId);
});

afterEach(() => {
	clearProjectStore(projectId);
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
