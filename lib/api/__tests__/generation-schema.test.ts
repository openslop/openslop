import { describe, expect, it } from "vitest";
import { AssetBundle } from "../asset-bundle";
import {
	bodySchema,
	byokModel,
	hostedModel,
	LLM_FIELDS,
	STT_FIELDS,
	VIDEO_FIELDS,
} from "../generation-schema";

const STORE = "https://assets.test";
AssetBundle.baseUrl = STORE;

describe("bodySchema with a hosted model", () => {
	const schema = bodySchema(hostedModel("image"), {});

	it("takes the model alone and records the provider as ours", () => {
		expect(schema.parse({ prompt: "a cat", model: "Slop Image v1" })).toEqual({
			prompt: "a cat",
			provider: "openslop",
			model: "Slop Image v1",
		});
	});

	it("requires a model", () => {
		expect(schema.safeParse({ prompt: "a cat" }).success).toBe(false);
	});

	it("refuses a model another provider serves", () => {
		expect(
			schema.safeParse({ prompt: "a cat", model: "Seedream 5 Lite" }).success,
		).toBe(false);
	});

	it("refuses a caller claiming another provider", () => {
		expect(
			schema.safeParse({
				prompt: "a cat",
				provider: "runware",
				model: "Slop Image v1",
			}).success,
		).toBe(false);
	});
});

describe("bodySchema with BYOK models", () => {
	const schema = bodySchema(byokModel("image"), {});

	it("takes the provider and model pair as named", () => {
		expect(
			schema.parse({
				prompt: "a cat",
				provider: "runware",
				model: "Seedream 5 Lite",
			}),
		).toEqual({
			prompt: "a cat",
			provider: "runware",
			model: "Seedream 5 Lite",
		});
	});

	it("requires the provider", () => {
		expect(
			schema.safeParse({ prompt: "a cat", model: "Seedream 5 Lite" }).success,
		).toBe(false);
	});

	it("refuses a model the named provider does not serve", () => {
		expect(
			schema.safeParse({
				prompt: "a cat",
				provider: "runware",
				model: "Slop Image v1",
			}).success,
		).toBe(false);
	});

	it("refuses a provider the route does not serve", () => {
		expect(
			schema.safeParse({
				prompt: "a cat",
				provider: "openslop",
				model: "Slop Image v1",
			}).success,
		).toBe(false);
	});
});

describe("LLM fields", () => {
	const schema = bodySchema(hostedModel("llm"), LLM_FIELDS);
	const withMaxTokens = (maxTokens: unknown) =>
		schema.safeParse({ prompt: "hi", model: "Slop LLM v1", maxTokens });

	it("takes a positive whole maxTokens", () => {
		expect(withMaxTokens(4096).data?.maxTokens).toBe(4096);
	});

	it.each([0, 1.5, "4096"])("refuses maxTokens %j", (maxTokens) => {
		expect(withMaxTokens(maxTokens).error?.issues[0]?.message).toBe(
			"maxTokens must be a positive integer",
		);
	});
});

describe("video fields", () => {
	const schema = bodySchema(hostedModel("video"), VIDEO_FIELDS);
	const video = (fields: Record<string, unknown>) =>
		schema.safeParse({
			prompt: "they talk",
			model: "Slop Video v2",
			...fields,
		});

	it("takes named characters, with avatars and voices", () => {
		const characterAssets = [
			{
				name: "Sol",
				avatarUrl: "https://img/sol.png",
				voice: {
					url: `${STORE}/assets/preview/voice/sol/audio`,
					durationSec: 6,
				},
			},
			{ name: "Mira" },
		];

		expect(video({ characterAssets }).data).toMatchObject({ characterAssets });
	});

	it("refuses a character whose avatar is not an image source", () => {
		expect(
			video({ characterAssets: [{ name: "Sol", avatarUrl: "not a url" }] })
				.success,
		).toBe(false);
	});

	it("refuses a character whose voice is outside our store", () => {
		const voice = { url: "https://audio/sol.mp3", durationSec: 6 };
		expect(
			video({ characterAssets: [{ name: "Sol", voice }] }).error?.issues[0]
				?.message,
		).toBe("A character voice must be a file in our store");
	});
});

describe("STT fields", () => {
	const schema = bodySchema(hostedModel("stt"), STT_FIELDS);
	const stt = (mediaUrl: unknown) =>
		schema.safeParse({ model: "Slop STT v1", mediaUrl });

	it("takes a clip from our store, with no prompt", () => {
		const mediaUrl = `${STORE}/assets/upload/user/abc/clip.mp4`;
		expect(stt(mediaUrl).data).toMatchObject({ prompt: "", mediaUrl });
	});

	it.each([
		"http://169.254.169.254/latest/meta-data",
		"https://assets.test.evil.com/assets/video/mock/1/video.mp4",
		`${STORE}/other/clip.mp4`,
	])("refuses to transcribe media outside our store: %s", (mediaUrl) => {
		expect(stt(mediaUrl).error?.issues[0]?.message).toBe(
			"mediaUrl must be a file in our store",
		);
	});

	it("refuses media that is not a URL", () => {
		expect(stt("clip.mp4").error?.issues[0]?.message).toBe(
			"mediaUrl must be an HTTP(S) URL",
		);
	});
});
