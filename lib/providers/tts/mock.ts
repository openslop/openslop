import type { BundleResponse } from "@/lib/api/asset-bundle";
import type {
  TTSGenerateParams,
  VoiceInfo,
  VoiceSearchParams,
} from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { pickRandom } from "../mock-utils";

const MOCK_VARIANTS: BundleResponse[] = [
  {
    id: "1",
    provider: "mock",
    result: { audio: "output.mp3", timestamps: "timestamps.json" },
  },
  {
    id: "2",
    provider: "mock",
    result: { audio: "output.m4a", timestamps: "timestamps.json" },
  },
  {
    id: "3",
    provider: "mock",
    result: { audio: "output.wav", timestamps: "timestamps.json" },
  },
  {
    id: "4",
    provider: "mock",
    result: { audio: "output.mp3", timestamps: "timestamps.json" },
  },
  {
    id: "5",
    provider: "mock",
    result: { audio: "output.wav", timestamps: "timestamps.json" },
  },
  {
    id: "6",
    provider: "mock",
    result: { audio: "output.m4a", timestamps: "timestamps.json" },
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
