import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";
import type { BundleFileData } from "@/lib/api/asset-bundle";
import { resizedImage } from "../resized-image";
import { spyAssetBundle } from "./_asset-bundle";

const { load, upload } = spyAssetBundle();

const ours = new URL("https://assets.test/assets/upload/user/a/photo.png");

const serveImage = async (width: number, height: number) => {
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

describe("resizedImage", () => {
	it("hosts a copy that fits the edge, keeping the aspect", async () => {
		await serveImage(4000, 1000);

		const url = await resizedImage("anthropic", ours, 3000);

		expect(await uploadedSize()).toEqual({ width: 3000, height: 750 });
		expect(url.href).toMatch(
			/^https:\/\/assets\.test\/assets\/resized-image\/anthropic\/[0-9a-f]{64}\/image\.webp$/,
		);
	});

	it("never enlarges a small image", async () => {
		await serveImage(400, 300);

		await resizedImage("anthropic", ours, 3000);

		expect(await uploadedSize()).toEqual({ width: 400, height: 300 });
	});

	it("reuses a copy already made", async () => {
		load.mockResolvedValue({
			id: "made",
			type: "resized-image",
			provider: "anthropic",
			result: { image: "image.webp" },
		});

		const url = await resizedImage("anthropic", ours, 3000);

		expect(upload).not.toHaveBeenCalled();
		expect(url.href).toBe(
			"https://assets.test/assets/resized-image/anthropic/made/image.webp",
		);
	});

	it("resizes an image given inline as a data URI", async () => {
		const png = await sharp({
			create: { width: 4000, height: 1000, channels: 3, background: "#808080" },
		})
			.png()
			.toBuffer();
		const inline = new URL(`data:image/png;base64,${png.toString("base64")}`);

		await resizedImage("anthropic", inline, 3000);

		expect(await uploadedSize()).toEqual({ width: 3000, height: 750 });
	});

	it("leaves an image we don't host as it is", async () => {
		const elsewhere = new URL("https://elsewhere.test/photo.png");

		expect(await resizedImage("anthropic", elsewhere, 3000)).toBe(elsewhere);
		expect(load).not.toHaveBeenCalled();
	});
});
