import type {
	TTSGenerateParams,
	VoiceInfo,
	VoiceSearchParams,
} from "@/lib/connectors/types";
import { MockProvider } from "../mock-base";

const BLOB_BASE =
	"https://mqzeech9ugknls54.public.blob.vercel-storage.com/assets/tts/mock";

export class MockTTS extends MockProvider<TTSGenerateParams> {
	protected readonly variants = [
		{
			id: "1",
			result: {
				audio: `${BLOB_BASE}/1/output.mp3`,
				timestamps: `${BLOB_BASE}/1/timestamps.json`,
			},
			metadata: { durationSec: 10 },
		},
		{
			id: "2",
			result: {
				audio: `${BLOB_BASE}/2/output.m4a`,
				timestamps: `${BLOB_BASE}/2/timestamps.json`,
			},
			metadata: { durationSec: 18 },
		},
		{
			id: "3",
			result: {
				audio: `${BLOB_BASE}/3/output.wav`,
				timestamps: `${BLOB_BASE}/3/timestamps.json`,
			},
			metadata: { durationSec: 25 },
		},
		{
			id: "4",
			result: {
				audio: `${BLOB_BASE}/4/output.mp3`,
				timestamps: `${BLOB_BASE}/4/timestamps.json`,
			},
			metadata: { durationSec: 8 },
		},
		{
			id: "5",
			result: {
				audio: `${BLOB_BASE}/5/output.wav`,
				timestamps: `${BLOB_BASE}/5/timestamps.json`,
			},
			metadata: { durationSec: 21 },
		},
		{
			id: "6",
			result: {
				audio: `${BLOB_BASE}/6/output.m4a`,
				timestamps: `${BLOB_BASE}/6/timestamps.json`,
			},
			metadata: { durationSec: 6 },
		},
	];

	async search(_params: VoiceSearchParams): Promise<VoiceInfo[]> {
		return [
			{
				id: "mock-voice-1",
				name: "Mock Voice",
				language: "en",
				gender: "feminine",
			},
		];
	}
}
