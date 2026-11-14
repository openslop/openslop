import { createHash } from "node:crypto";
import PQueue from "p-queue";
import { AssetBundle, fetchOk } from "@/lib/api/asset-bundle";

const BUNDLE_TYPE = "resized-image";
const FILE_KEY = "image";

/** Ours to fetch server side: in our store, or inline bytes. */
const fetchable = (url: URL) =>
	url.protocol === "data:" || AssetBundle.holds(url.href);

// Each resize holds a whole source image in memory.
const resizeQueue = new PQueue({ concurrency: 4 });

async function resizeToWebp(url: URL, maxEdgePx: number): Promise<Buffer> {
	const response = await fetchOk(url.href, "image");
	const { default: sharp } = await import("sharp");
	return (
		sharp(await response.arrayBuffer())
			// Bakes in the camera's EXIF orientation, which webp drops
			.rotate()
			.resize(maxEdgePx, maxEdgePx, { fit: "inside", withoutEnlargement: true })
			.webp()
			.toBuffer()
	);
}

/**
 * A copy of an image, at most `maxEdgePx` on either side, in our store. Made on
 * first ask and shared after. An image we can't fetch safely comes back as is.
 */
export async function resizedImage(
	provider: string,
	url: URL,
	maxEdgePx: number,
): Promise<URL> {
	if (!fetchable(url)) return url;
	const id = createHash("sha256")
		.update(`${url.href} ${maxEdgePx}`)
		.digest("hex");
	const response =
		(await AssetBundle.load(BUNDLE_TYPE, provider, id)) ??
		(await AssetBundle.upload(
			BUNDLE_TYPE,
			provider,
			[
				{
					key: FILE_KEY,
					filename: "image.webp",
					contentType: "image/webp",
					data: await resizeQueue.add(() => resizeToWebp(url, maxEdgePx)),
				},
			],
			undefined,
			{ id },
		));
	return new URL(AssetBundle.fromResponse(response).resolve(FILE_KEY));
}
