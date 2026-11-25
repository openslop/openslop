import { describe, expect, it } from "vitest";
import { createAssetPicturePlugin } from "@/lib/connectors/image/plugins/asset-picture";

describe("asset-picture plugin", () => {
	it("frames the character's appearance as their turnaround sheet, with no text drawn on it, beside the other params", () => {
		const { beforeGenerate } = createAssetPicturePlugin("character");
		const params = {
			prompt: "A young girl with red hair",
			name: "Alice",
			model: "Seedream 5 Lite",
		};
		expect(beforeGenerate?.(params, {})).toEqual({
			prompt:
				"Character turnaround sheet of Alice: a close-up of the face, plus full-body front, side and three-quarter views. A young girl with red hair. Same look and outfit in every view. Plain light gray background with nothing else on it. No text",
			model: "Seedream 5 Lite",
		});
	});

	it("frames a location as an empty establishing shot", () => {
		const { beforeGenerate } = createAssetPicturePlugin("location");
		expect(
			beforeGenerate?.({ prompt: "A thatched cottage", name: "Cottage" }, {}),
		).toEqual({
			prompt:
				"Wide establishing shot of Cottage. A thatched cottage. Empty of people and animals. No text",
		});
	});

	it("frames a prop as an isolated product shot", () => {
		const { beforeGenerate } = createAssetPicturePlugin("prop");
		expect(
			beforeGenerate?.({ prompt: "A silver sword", name: "Sword" }, {}),
		).toEqual({
			prompt:
				"Product shot of Sword. A silver sword. The whole object, alone and centered. Plain light gray background with nothing else on it. No text",
		});
	});

	it("refuses to draw a picture of nobody rather than one of 'undefined'", () => {
		const { beforeGenerate } = createAssetPicturePlugin("character");
		expect(() =>
			beforeGenerate?.({ prompt: "A young girl with red hair" }, {}),
		).toThrow("needs the character's name");
	});
});
