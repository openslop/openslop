import type { BundleResponse } from "@/lib/api/asset-bundle";
import type {
  TTSGenerateParams,
  VoiceInfo,
  VoiceSearchParams,
} from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { pickRandom } from "../mock-utils";

const BLOB_BASE =
  "https://mqzeech9ugknls54.public.blob.vercel-storage.com/assets/tts/mock";

const MOCK_VARIANTS: BundleResponse[] = [
  {
    id: "1",
    provider: "mock",
    result: {
      audio: `${BLOB_BASE}/1/output.mp3`,
      timestamps: `${BLOB_BASE}/1/timestamps.json`,
    },
  },
  {
    id: "2",
    provider: "mock",
    result: {
      audio: `${BLOB_BASE}/2/output.m4a`,
      timestamps: `${BLOB_BASE}/2/timestamps.json`,
    },
  },
  {
    id: "3",
    provider: "mock",
    result: {
      audio: `${BLOB_BASE}/3/output.wav`,
      timestamps: `${BLOB_BASE}/3/timestamps.json`,
    },
  },
  {
    id: "4",
    provider: "mock",
    result: {
      audio: `${BLOB_BASE}/4/output.mp3`,
      timestamps: `${BLOB_BASE}/4/timestamps.json`,
    },
  },
  {
    id: "5",
    provider: "mock",
    result: {
      audio: `${BLOB_BASE}/5/output.wav`,
      timestamps: `${BLOB_BASE}/5/timestamps.json`,
    },
  },
  {
    id: "6",
    provider: "mock",
    result: {
      audio: `${BLOB_BASE}/6/output.m4a`,
      timestamps: `${BLOB_BASE}/6/timestamps.json`,
    },
  },
];

export class MockTTS extends BaseProvider<TTSGenerateParams, BundleResponse> {
  async generate(): Promise<BundleResponse> {
    return pickRandom(MOCK_VARIANTS);
  }

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
