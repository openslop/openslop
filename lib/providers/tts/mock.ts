import type { BundleResponse } from "@/lib/api/asset-bundle";
import type {
  TTSGenerateParams,
  VoiceInfo,
  VoiceSearchParams,
} from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { pickRandom } from "../mock-utils";

const P = "mock";
const TS = "timestamps.json";

const MOCK_VARIANTS: BundleResponse[] = [
  { id: "1", provider: P, result: { audio: "output.mp3", timestamps: TS } },
  { id: "2", provider: P, result: { audio: "output.m4a", timestamps: TS } },
  { id: "3", provider: P, result: { audio: "output.wav", timestamps: TS } },
  { id: "4", provider: P, result: { audio: "output.mp3", timestamps: TS } },
  { id: "5", provider: P, result: { audio: "output.wav", timestamps: TS } },
  { id: "6", provider: P, result: { audio: "output.m4a", timestamps: TS } },
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
