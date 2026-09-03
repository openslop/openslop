import { describe, expect, it } from "vitest";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import { ANIMATED_IMAGE_ATTRIBUTES } from "../attributes";

describe("ANIMATED_IMAGE_ATTRIBUTES", () => {
	const badges = ANIMATED_IMAGE_ATTRIBUTES.badgeAttributes;

	it("offers the still's model beside the element's own", () => {
		expect(Object.keys(badges)).toEqual(["imageModel"]);
		expect(badges.imageModel?.label).toBe("Image model");
	});

	it("picks the still from the image models, writing its own provider", () => {
		expect(badges.imageModel?.edit).toEqual({
			kind: "model",
			type: "image",
			providerAttr: "imageProvider",
		});
	});

	it("keeps the still's provider off the settings popover", () => {
		expect(
			ANIMATED_IMAGE_ATTRIBUTES.settingsAttributes.imageProvider,
		).toBeUndefined();
	});

	it("defaults the still's pair, so a new element names the model it runs on", () => {
		expect(ANIMATED_IMAGE_ATTRIBUTES.defaultAttributes).toMatchObject({
			imageProvider: DEFAULT_MODELS.image.provider,
			imageModel: DEFAULT_MODELS.image.model,
		});
	});
});
