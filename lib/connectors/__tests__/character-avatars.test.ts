import { describe, expect, it } from "vitest";
import {
	listCharacterAvatars,
	listUploadedCharacterAvatarUrls,
} from "@/lib/connectors/llm/plugins/character-avatars";
import type { MetadataCharacter } from "@/lib/project/types";

const characters: Record<string, MetadataCharacter> = {
	Uploaded: {
		appearance: "",
		avatarUrl: "https://example.com/uploaded.png",
		avatarUploaded: true,
	},
	Generated: {
		appearance: "green hair",
		avatarUrl: "https://example.com/generated.png",
		avatarUploaded: false,
	},
	LegacyGenerated: {
		appearance: "purple coat",
		avatarUrl: "https://example.com/legacy-generated.png",
	},
	MissingAvatar: { appearance: "blue hair" },
};

describe("character avatar plugin helpers", () => {
	it("classifies character avatar urls once for LLM plugins", () => {
		expect(listCharacterAvatars(characters)).toEqual([
			{
				name: "Uploaded",
				character: characters.Uploaded,
				url: "https://example.com/uploaded.png",
				source: "uploaded",
			},
			{
				name: "Generated",
				character: characters.Generated,
				url: "https://example.com/generated.png",
				source: "generated",
			},
			{
				name: "LegacyGenerated",
				character: characters.LegacyGenerated,
				url: "https://example.com/legacy-generated.png",
				source: "generated",
			},
		]);
	});

	it("exposes only uploaded avatars as global style references", () => {
		expect(listUploadedCharacterAvatarUrls(characters)).toEqual([
			"https://example.com/uploaded.png",
		]);
	});
});
