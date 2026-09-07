import { describe, expect, it } from "vitest";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import { animatedImageAttributesFor } from "../attributes";

describe("animatedImageAttributesFor", () => {
	const schema = animatedImageAttributesFor(DEFAULT_MODELS.animated_image);
	const badges = schema.badgeAttributes;

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
		expect(schema.settingsAttributes.imageProvider).toBeUndefined();
	});

	it("defaults the still's pair, so a new element names the model it runs on", () => {
		expect(schema.defaultAttributes).toMatchObject({
			imageProvider: DEFAULT_MODELS.image.provider,
			imageModel: DEFAULT_MODELS.image.model,
		});
	});

	it("loops new animations by default", () => {
		expect(schema.defaultAttributes).toMatchObject({ loop: "true" });
	});

	it("offers the resolutions the animation's own model renders at", () => {
		expect(
			animatedImageAttributesFor({
				provider: "runware",
				model: "Kling 3 Turbo",
			}).settingsAttributes.resolution?.edit,
		).toEqual({ kind: "enum", options: ["720p", "1080p"] });
	});
});
