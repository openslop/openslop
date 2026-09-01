import { describe, expect, it } from "vitest";
import { IMAGE_MODELS } from "@/lib/connectors/image/models";
import { VIDEO_MODELS } from "@/lib/connectors/video/models";
import { ANIMATED_IMAGE_ATTRIBUTES } from "../attributes";

describe("ANIMATED_IMAGE_ATTRIBUTES", () => {
	const badges = ANIMATED_IMAGE_ATTRIBUTES.badgeAttributes;

	it("offers a model per generation: the animation's and the still's", () => {
		expect(Object.keys(badges)).toEqual(["model", "stillModel"]);
		expect(badges.model?.label).toBe("Video model");
		expect(badges.stillModel?.label).toBe("Image model");
	});

	it("picks each from its own connector's models", () => {
		expect(badges.model?.edit).toEqual({
			kind: "model",
			connector: "animated_image",
			options: VIDEO_MODELS.names,
		});
		expect(badges.stillModel?.edit).toEqual({
			kind: "model",
			connector: "image",
			options: IMAGE_MODELS.names,
		});
	});

	it("defaults both, so a new element names the model each generation runs on", () => {
		expect(ANIMATED_IMAGE_ATTRIBUTES.defaultAttributes).toMatchObject({
			model: VIDEO_MODELS.defaultModel,
			stillModel: IMAGE_MODELS.defaultModel,
		});
	});
});
