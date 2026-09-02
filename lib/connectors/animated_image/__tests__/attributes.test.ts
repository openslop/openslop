import { describe, expect, it } from "vitest";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import { ANIMATED_IMAGE_ATTRIBUTES } from "../attributes";

describe("ANIMATED_IMAGE_ATTRIBUTES", () => {
	const badges = ANIMATED_IMAGE_ATTRIBUTES.badgeAttributes;

	it("offers a model per generation: the animation's and the still's", () => {
		expect(Object.keys(badges)).toEqual(["model", "stillModel"]);
		expect(badges.model?.label).toBe("Video model");
		expect(badges.stillModel?.label).toBe("Image model");
	});

	it("picks each from its own connector's models, writing its own provider", () => {
		expect(badges.model?.edit).toEqual({
			kind: "model",
			connector: "animated_image",
			providerAttr: "provider",
		});
		expect(badges.stillModel?.edit).toEqual({
			kind: "model",
			connector: "image",
			providerAttr: "stillProvider",
		});
	});

	it("keeps both providers off the settings popover", () => {
		const settings = ANIMATED_IMAGE_ATTRIBUTES.settingsAttributes;
		expect(settings.provider).toBeUndefined();
		expect(settings.stillProvider).toBeUndefined();
	});

	it("defaults both pairs, so a new element names the model each generation runs on", () => {
		expect(ANIMATED_IMAGE_ATTRIBUTES.defaultAttributes).toMatchObject({
			provider: DEFAULT_MODELS.video.provider,
			model: DEFAULT_MODELS.video.model,
			stillProvider: DEFAULT_MODELS.image.provider,
			stillModel: DEFAULT_MODELS.image.model,
		});
	});
});
