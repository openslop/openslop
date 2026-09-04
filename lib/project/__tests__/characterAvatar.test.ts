import { describe, expect, it } from "vitest";
import type { ElementVersion } from "@/lib/generation/versions";
import { createProjectStore } from "../store";
import {
	characterAvatarElement,
	characterFromAvatarInputs,
} from "../characterAvatar";

const RUNWARE = { provider: "runware", model: "Seedream 5 Lite" } as const;

const version = (
	attributes: Record<string, string | number>,
): ElementVersion => ({
	elementId: "avatar:Alice",
	createdAt: "2026-01-01T00:00:00Z",
	connectorType: "image",
	inputs: { prompt: "", attributes, dependencies: {} },
	result: { imageUrl: "avatar.png", durationSec: 0 },
	pinned: false,
});

describe("characterAvatarElement", () => {
	it("carries the appearance and the picked model in its attributes", () => {
		const store = createProjectStore();
		store.getState().setCharacter("Alice", {
			appearance: "blue hair",
			avatarModel: RUNWARE,
		});
		expect(
			characterAvatarElement(store.getState(), "Alice").generationAttributes,
		).toEqual({ kind: "avatar", appearance: "blue hair", ...RUNWARE });
	});

	it("carries no model for a character created before models were stamped", () => {
		const store = createProjectStore();
		store.getState().setCharacter("Alice", { appearance: "blue hair" });
		expect(
			characterAvatarElement(store.getState(), "Alice").generationAttributes,
		).toEqual({ kind: "avatar", appearance: "blue hair" });
	});
});

describe("characterFromAvatarInputs", () => {
	it("restores the model a version generated on", () => {
		expect(
			characterFromAvatarInputs(
				version({ kind: "avatar", appearance: "blue hair", ...RUNWARE }),
			),
		).toEqual({
			appearance: "blue hair",
			avatarUploaded: false,
			avatarModel: RUNWARE,
		});
	});

	it("restores no model from a version that carried none", () => {
		expect(
			characterFromAvatarInputs(version({ appearance: "blue hair" })),
		).toMatchObject({ avatarModel: undefined });
	});
});
