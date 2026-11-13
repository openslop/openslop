import { createHash } from "node:crypto";
import { AssetBundle, fetchOk } from "@/lib/api/asset-bundle";

const BUNDLE_TYPE = "picture";

/** Ours to fetch server side: in our store, or inline bytes. */
const fetchable = (url: URL) =>
	url.protocol === "data:" || AssetBundle.holds(url.href);

async function shrink(url: URL, maxEdge: number): Promise<Buffer> {
	const response = await fetchOk(url.href, "picture");
	const { default: sharp } = await import("sharp");
	return (
		sharp(await response.arrayBuffer())
			// Bakes in the camera's EXIF orientation, which webp drops
			.rotate()
			.resize(maxEdge, maxEdge, { fit: "inside", withoutEnlargement: true })
			.webp()
			.toBuffer()
	);
}

/**
 * A copy of a picture, at most `maxEdge` px on either side, in our store. Made on
 * first ask and shared after. A picture we can't fetch safely comes back as is.
 */
export async function hostedPicture(
	provider: string,
	url: URL,
	maxEdge: number,
): Promise<URL> {
	if (!fetchable(url)) return url;
	const id = createHash("sha256")
		.update(`${url.href} ${maxEdge}`)
		.digest("hex");
	const response =
		(await AssetBundle.load(BUNDLE_TYPE, provider, id)) ??
		(await AssetBundle.upload(
			BUNDLE_TYPE,
			provider,
			[
				{
					key: "picture",
					filename: "picture.webp",
					contentType: "image/webp",
					data: await shrink(url, maxEdge),
				},
			],
			undefined,
			{ id },
		));
	return new URL(AssetBundle.fromResponse(response).resolve("picture"));
}
