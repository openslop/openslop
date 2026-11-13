import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";
import type { BundleFileData } from "@/lib/api/asset-bundle";
import { hostedPicture } from "../hosted-picture";
import { spyAssetBundle } from "./_asset-bundle";

const { load, upload } = spyAssetBundle();

const ours = new URL("https://assets.test/assets/upload/user/a/photo.png");

const servePicture = async (width: number, height: number) => {
	const png = await sharp({
		create: { width, height, channels: 3, background: "#808080" },
	})
		.png()
		.toBuffer();
	vi.spyOn(globalThis, "fetch").mockResolvedValue(
		new Response(new Uint8Array(png)),
	);
};

const uploadedSize = async () => {
	const [file] = upload.mock.calls[0][2] as BundleFileData[];
	const { width, height } = await sharp(file.data as Buffer).metadata();
	return { width, height };
};

describe("hostedPicture", () => {
	it("hosts a copy that fits the edge, keeping the aspect", async () => {
		await servePicture(4000, 1000);

		const url = await hostedPicture("anthropic", ours, 3000);

		expect(await uploadedSize()).toEqual({ width: 3000, height: 750 });
		expect(url.href).toMatch(
			/^https:\/\/assets\.test\/assets\/picture\/anthropic\/[0-9a-f]{64}\/picture\.webp$/,
		);
	});

	it("never enlarges a small picture", async () => {
		await servePicture(400, 300);

		await hostedPicture("anthropic", ours, 3000);

		expect(await uploadedSize()).toEqual({ width: 400, height: 300 });
	});

	it("reuses a copy already made", async () => {
		load.mockResolvedValue({
			id: "made",
			type: "picture",
			provider: "anthropic",
			result: { picture: "picture.webp" },
		});

		const url = await hostedPicture("anthropic", ours, 3000);

		expect(upload).not.toHaveBeenCalled();
		expect(url.href).toBe(
			"https://assets.test/assets/picture/anthropic/made/picture.webp",
		);
	});

	it("shrinks a picture given inline as a data URI", async () => {
		const png = await sharp({
			create: { width: 4000, height: 1000, channels: 3, background: "#808080" },
		})
			.png()
			.toBuffer();
		const inline = new URL(`data:image/png;base64,${png.toString("base64")}`);

		await hostedPicture("anthropic", inline, 3000);

		expect(await uploadedSize()).toEqual({ width: 3000, height: 750 });
	});

	it("leaves a picture we don't host as it is", async () => {
		const elsewhere = new URL("https://elsewhere.test/photo.png");

		expect(await hostedPicture("anthropic", elsewhere, 3000)).toBe(elsewhere);
		expect(load).not.toHaveBeenCalled();
	});
});
