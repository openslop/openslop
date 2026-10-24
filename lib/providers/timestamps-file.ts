import { z } from "zod";
import type { AssetBundle, BundleFile } from "@/lib/api/asset-bundle";
import {
	TextTimestampSchema,
	type TextTimestamp,
} from "@/lib/connectors/types";

const KEY = "timestamps";

export const timestampsFile = (words: TextTimestamp[]): BundleFile => ({
	key: KEY,
	filename: "timestamps.json",
	data: JSON.stringify(words),
	contentType: "application/json",
});

export const readTimestamps = (bundle: AssetBundle): Promise<TextTimestamp[]> =>
	bundle.fetchJson(KEY, z.array(TextTimestampSchema));
