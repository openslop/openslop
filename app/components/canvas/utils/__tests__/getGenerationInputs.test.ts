import { describe, expect, it } from "vitest";
import type { Metadata } from "@/lib/project/types";
import { LAYOUT_ATTRIBUTE_KEYS } from "@/lib/video/elementAttributes";
import type { CanvasContentElement, CanvasElementType } from "../../types";
import { getGenerationInputs } from "../getGenerationInputs";

const emptyMetadata: Metadata = {
	title: "",
	style: "",
	narration: {},
	characters: {},
};

const element = (
	customAttributes: Record<string, string>,
	type: CanvasElementType = "clip",
	text = "a dragon flying",
): CanvasContentElement => ({
	id: "el-1",
	type,
	customAttributes,
	children: [{ id: "t-1", type, text }],
});

describe("getGenerationInputs", () => {
	it("keeps generation-affecting attributes", () => {
		const { prompt, attributes } = getGenerationInputs(
			element({ model: "Slop Video v1", duration: "5", provider: "openslop" }),
			emptyMetadata,
		);
		expect(prompt).toBe("a dragon flying");
		expect(attributes).toEqual({
			model: "Slop Video v1",
			duration: "5",
			provider: "openslop",
		});
	});

	it("strips exactly the centralized LAYOUT_ATTRIBUTE_KEYS contract", () => {
		const layoutOnly = Object.fromEntries(
			LAYOUT_ATTRIBUTE_KEYS.map((k) => [k, "1"]),
		);
		const { attributes } = getGenerationInputs(
			element({ ...layoutOnly, model: "Slop Video v1" }),
			emptyMetadata,
		);
		for (const key of LAYOUT_ATTRIBUTE_KEYS) {
			expect(attributes).not.toHaveProperty(key);
		}
		expect(attributes).toEqual({ model: "Slop Video v1" });
	});

	it("adds characterAvatars on image elements via contributor", () => {
		const metadata: Metadata = {
			...emptyMetadata,
			characters: {
				Alice: { appearance: "tall", avatarUrl: "https://a/img.png" },
				Bob: { appearance: "short", avatarUrl: "https://b/img.png" },
				Eve: { appearance: "missing" },
			},
		};
		const { attributes } = getGenerationInputs(
			element({ characters: "Bob, Alice, Eve" }, "image"),
			metadata,
		);
		expect(attributes.characterAvatars).toBe(
			"Alice:https://a/img.png,Bob:https://b/img.png",
		);
	});

	it("adds voiceId on character elements via contributor", () => {
		const metadata: Metadata = {
			...emptyMetadata,
			characters: {
				Alice: { appearance: "tall", voiceId: "voice-1" },
			},
		};
		const { attributes } = getGenerationInputs(
			element({ name: "Alice" }, "character"),
			metadata,
		);
		expect(attributes.voiceId).toBe("voice-1");
	});

	it("skips contributors whose appliesTo excludes the type", () => {
		const metadata: Metadata = {
			...emptyMetadata,
			characters: {
				Alice: { appearance: "tall", voiceId: "voice-1" },
			},
		};
		const { attributes } = getGenerationInputs(
			element({ name: "Alice" }, "clip"),
			metadata,
		);
		expect(attributes).not.toHaveProperty("voiceId");
		expect(attributes).not.toHaveProperty("characterAvatars");
	});
});
