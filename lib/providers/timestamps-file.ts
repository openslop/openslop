import type { Caption } from "@remotion/captions";
import { z } from "zod";
import type { AssetBundle, BundleFile } from "@/lib/api/asset-bundle";
import { CaptionSchema } from "@/lib/connectors/types";

const KEY = "timestamps";

export const timestampsFile = (captions: Caption[]): BundleFile => ({
	key: KEY,
	filename: "timestamps.json",
	data: JSON.stringify(captions),
	contentType: "application/json",
});

export const readTimestamps = (bundle: AssetBundle): Promise<Caption[]> =>
	bundle.fetchJson(KEY, z.array(CaptionSchema));
