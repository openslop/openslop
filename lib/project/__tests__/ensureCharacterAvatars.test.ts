import { describe, expect, it, vi, beforeEach } from "vitest";
import type { AssetResult } from "@/lib/connectors/types";
import { getProjectStore } from "../store";

type GenerateFn = (...args: unknown[]) => Promise<AssetResult>;
let generateMock: ReturnType<typeof vi.fn<GenerateFn>>;

vi.mock("@/lib/generation/generateForElement", () => ({
	generateForElement: (...args: unknown[]) => generateMock(...args),
}));

const PROJECT_ID = "test-project";

const registry = {
	image: {
		openslop: {
			defaultModel: "test-model",
			models: ["test-model"],
			isDefault: true,
		},
	},
	llm: {
		openslop: {
			defaultModel: "m",
			models: ["m"],
			isDefault: true,
		},
	},
	tts: {
		openslop: {
			defaultModel: "m",
			models: ["m"],
			isDefault: true,
		},
	},
	video: {
		openslop: {
			defaultModel: "m",
			models: ["m"],
			isDefault: true,
		},
	},
	sfx: {
		openslop: {
			defaultModel: "m",
			models: ["m"],
			isDefault: true,
		},
	},
	music: {
		openslop: {
			defaultModel: "m",
			models: ["m"],
			isDefault: true,
		},
	},
};

describe("ensureCharacterAvatars", () => {
	beforeEach(() => {
		generateMock = vi.fn();
	});

	it("generates avatars for characters missing avatarUrl", async () => {
		const store = getProjectStore(PROJECT_ID);
		store
			.getState()
			.setMetadataCharacter("Alice", "A young girl with red hair");
		store.getState().setMetadataStyle("Watercolor illustration");

		generateMock.mockResolvedValue({
			url: "https://example.com/alice.png",
			durationSec: 0,
		});

		const { ensureCharacterAvatars } =
			await import("../ensureCharacterAvatars");
		await ensureCharacterAvatars(PROJECT_ID, registry);

		expect(generateMock).toHaveBeenCalledOnce();
		const prompt = generateMock.mock.calls[0][3] as string;
		expect(prompt).toContain("Character portrait of Alice");
		expect(prompt).toContain("A young girl with red hair");
		expect(prompt).toContain("Watercolor illustration");

		expect(store.getState().metadata.characters["Alice"].avatarUrl).toBe(
			"https://example.com/alice.png",
		);
	});

	it("skips characters that already have an avatarUrl", async () => {
		const store = getProjectStore(PROJECT_ID);
		store.getState().setMetadataCharacter("Bob", "A tall man");
		store
			.getState()
			.setCharacterAvatarUrl("Bob", "https://existing.com/bob.png");

		const { ensureCharacterAvatars } =
			await import("../ensureCharacterAvatars");
		await ensureCharacterAvatars(PROJECT_ID, registry);

		expect(generateMock).not.toHaveBeenCalled();
	});

	it("skips characters with empty description", async () => {
		const store = getProjectStore(PROJECT_ID);
		store.getState().setMetadataCharacter("Empty", "");

		const { ensureCharacterAvatars } =
			await import("../ensureCharacterAvatars");
		await ensureCharacterAvatars(PROJECT_ID, registry);

		expect(generateMock).not.toHaveBeenCalled();
	});

	it("generates avatars for multiple characters in parallel", async () => {
		const store = getProjectStore(PROJECT_ID);
		store.getState().setMetadataCharacter("Cat", "A fluffy orange cat");
		store.getState().setMetadataCharacter("Dog", "A big brown dog");

		generateMock.mockImplementation(
			async (_type, _provider, _config, prompt) => ({
				url: `https://example.com/${(prompt as string).includes("Cat") ? "cat" : "dog"}.png`,
				durationSec: 0,
			}),
		);

		const { ensureCharacterAvatars } =
			await import("../ensureCharacterAvatars");
		await ensureCharacterAvatars(PROJECT_ID, registry);

		expect(generateMock).toHaveBeenCalledTimes(2);
		expect(store.getState().metadata.characters["Cat"].avatarUrl).toBe(
			"https://example.com/cat.png",
		);
		expect(store.getState().metadata.characters["Dog"].avatarUrl).toBe(
			"https://example.com/dog.png",
		);
	});

	it("regenerates avatar when character description changes", async () => {
		const store = getProjectStore(PROJECT_ID);
		store
			.getState()
			.setMetadataCharacter("Alice", "A young girl with red hair");
		store
			.getState()
			.setCharacterAvatarUrl("Alice", "https://example.com/old-alice.png");

		// Change description — should clear avatarUrl
		store
			.getState()
			.setMetadataCharacter("Alice", "An old woman with grey hair");
		expect(
			store.getState().metadata.characters["Alice"].avatarUrl,
		).toBeUndefined();

		generateMock.mockResolvedValue({
			url: "https://example.com/new-alice.png",
			durationSec: 0,
		});

		const { ensureCharacterAvatars } =
			await import("../ensureCharacterAvatars");
		await ensureCharacterAvatars(PROJECT_ID, registry);

		expect(generateMock).toHaveBeenCalledOnce();
		expect(store.getState().metadata.characters["Alice"].avatarUrl).toBe(
			"https://example.com/new-alice.png",
		);
	});

	it("includes empty style segment when metadataStyle is empty", async () => {
		const store = getProjectStore(PROJECT_ID);
		store.getState().setMetadataCharacter("Eve", "A mysterious figure");
		store.getState().setMetadataStyle("");

		generateMock.mockResolvedValue({
			url: "https://example.com/eve.png",
			durationSec: 0,
		});

		const { ensureCharacterAvatars } =
			await import("../ensureCharacterAvatars");
		await ensureCharacterAvatars(PROJECT_ID, registry);

		const prompt = generateMock.mock.calls[0][3] as string;
		expect(prompt).toContain("Character portrait of Eve");
		expect(prompt).toContain("A mysterious figure");
	});
});
