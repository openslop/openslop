import type { MusicGenerateParams } from "@/lib/connectors/types";
import { BLOB_BASE_URL } from "@/lib/blob";
import { MockProvider } from "../mock-base";
import type { MusicProvider } from "./base";

const BLOB_BASE = `${BLOB_BASE_URL}/assets/music/mock`;

export class MockMusic
	extends MockProvider<MusicGenerateParams>
	implements MusicProvider
{
	protected readonly delayMs = 2000;
	protected readonly variants = [
		{
			id: "1",
			result: { audio: `${BLOB_BASE}/1/output.mp3` },
			metadata: { durationSec: 30 },
		},
		{
			id: "2",
			result: { audio: `${BLOB_BASE}/2/output.m4a` },
			metadata: { durationSec: 188 },
		},
		{
			id: "3",
			result: { audio: `${BLOB_BASE}/3/output.wav` },
			metadata: { durationSec: 60 },
		},
	];
}
