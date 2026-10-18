import { assetUrlField } from "@/lib/connectors/asset-url";
import type { AssetResult } from "@/lib/connectors/types";
import type { UploadKind } from "./upload-files";

async function videoDurationSec(videoUrl: string): Promise<number> {
	const { ALL_FORMATS, Input, UrlSource } = await import("mediabunny");
	const input = new Input({
		source: new UrlSource(videoUrl),
		formats: ALL_FORMATS,
	});
	try {
		return (
			(await input.getDurationFromMetadata()) ?? (await input.computeDuration())
		);
	} finally {
		input.dispose();
	}
}

const READ_DURATION: Record<UploadKind, (url: string) => Promise<number>> = {
	image: async () => 0,
	video: videoDurationSec,
};

/** Browser only. The result an element shows for media the user supplied. */
export async function uploadedResult(
	kind: UploadKind,
	url: string,
): Promise<AssetResult> {
	return {
		[assetUrlField(kind)]: url,
		durationSec: await READ_DURATION[kind](url),
	};
}
