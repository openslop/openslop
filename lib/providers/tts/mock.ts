import type {
	TTSGenerateParams,
	VoiceInfo,
	VoiceSearchParams,
} from "@/lib/connectors/types";
import { MockProvider } from "../mock-base";

const BLOB_BASE =
	"https://mqzeech9ugknls54.public.blob.vercel-storage.com/assets/tts/mock";

const PREVIEW_HOST = new URL(BLOB_BASE).hostname;

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

	private readonly voices: VoiceInfo[] = [
		{
			id: "mock-voice-aria",
			name: "Aria",
			language: "en",
			gender: "feminine",
			accent: "american",
			description: "Warm, conversational American narrator",
			previewUrl: `${BLOB_BASE}/1/output.mp3`,
		},
		{
			id: "mock-voice-finn",
			name: "Finn",
			language: "en",
			gender: "masculine",
			accent: "british",
			description: "Calm, measured British storyteller",
			previewUrl: `${BLOB_BASE}/2/output.m4a`,
		},
		{
			id: "mock-voice-luna",
			name: "Luna",
			language: "en",
			gender: "feminine",
			accent: "australian",
			description: "Bright, energetic Australian voice",
			previewUrl: `${BLOB_BASE}/3/output.wav`,
		},
		{
			id: "mock-voice-marcus",
			name: "Marcus",
			language: "en",
			gender: "masculine",
			accent: "american",
			description: "Deep, authoritative American baritone",
			previewUrl: `${BLOB_BASE}/4/output.mp3`,
		},
		{
			id: "mock-voice-claire",
			name: "Claire",
			language: "fr",
			gender: "feminine",
			accent: "french",
			description: "Soft, articulate French speaker",
			previewUrl: `${BLOB_BASE}/5/output.wav`,
		},
		{
			id: "mock-voice-takeshi",
			name: "Takeshi",
			language: "ja",
			gender: "masculine",
			accent: "japanese",
			description: "Crisp Japanese newsreader",
			previewUrl: `${BLOB_BASE}/6/output.m4a`,
		},
		{
			id: "mock-voice-sofia",
			name: "Sofia",
			language: "es",
			gender: "feminine",
			accent: "spanish",
			description: "Animated Spanish presenter",
			previewUrl: `${BLOB_BASE}/1/output.mp3`,
		},
		{
			id: "mock-voice-otto",
			name: "Otto",
			language: "de",
			gender: "masculine",
			accent: "german",
			description: "Precise German baritone",
			previewUrl: `${BLOB_BASE}/2/output.m4a`,
		},
		{
			id: "mock-voice-pip",
			name: "Pip",
			language: "en",
			gender: "feminine",
			accent: "british",
			description: "Cheerful child-like British voice",
			previewUrl: `${BLOB_BASE}/3/output.wav`,
		},
		{
			id: "mock-voice-rex",
			name: "Rex",
			language: "en",
			gender: "masculine",
			accent: "southern",
			description: "Gritty Southern drawl",
			previewUrl: `${BLOB_BASE}/4/output.mp3`,
		},
	];

	async search(params: VoiceSearchParams): Promise<VoiceInfo[]> {
		const shuffled = [...this.voices].sort(() => Math.random() - 0.5);
		return params.limit ? shuffled.slice(0, params.limit) : shuffled;
	}

	async fetchVoicePreview(url: string): Promise<Response> {
		if (new URL(url).hostname !== PREVIEW_HOST) {
			throw new Error(`Voice preview host not allowed: ${url}`);
		}
		return fetch(url);
	}
}
