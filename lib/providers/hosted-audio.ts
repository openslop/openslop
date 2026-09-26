import { createHash } from "node:crypto";
import { AssetBundle } from "@/lib/api/asset-bundle";
import type { HostedVoicePreview } from "@/lib/connectors/types";
import { audioDurationSec } from "./audio-duration";

export type AudioBytes = { data: ArrayBuffer; contentType: string };

export async function audioOf(
	response: Response,
	label: string,
): Promise<AudioBytes> {
	if (!response.ok) throw new Error(`${label} (${response.status})`);
	return {
		data: await response.arrayBuffer(),
		contentType:
			response.headers.get("Content-Type") ?? "application/octet-stream",
	};
}

const TYPE = "preview";

async function ingest(
	provider: string,
	id: string,
	produce: () => Promise<AudioBytes>,
) {
	const { data, contentType } = await produce();
	const durationSec = await audioDurationSec(data);
	return AssetBundle.upload(
		TYPE,
		provider,
		[{ key: "audio", filename: "audio", data, contentType }],
		{ durationSec },
		{ id },
	);
}

/**
 * Audio in our own store, produced and measured on first ask. Keyed by
 * `key`, so everyone asking for the same audio shares one copy.
 */
export async function hostedAudio(
	provider: string,
	key: string,
	produce: () => Promise<AudioBytes>,
): Promise<HostedVoicePreview> {
	const id = createHash("sha256").update(key).digest("hex");
	const response =
		(await AssetBundle.load(TYPE, provider, id)) ??
		(await ingest(provider, id, produce));
	const bundle = AssetBundle.fromResponse(response);
	return { url: bundle.resolve("audio"), durationSec: bundle.durationSec };
}
