import type {
  TTSGenerateParams,
  TTSResult,
  VoiceInfo,
  VoiceSearchParams,
} from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { pickRandom, readMockFile } from "../mock-utils";

const MOCK_TTS_AUDIO = [
  "mock-tts-1.mp3",
  "mock-tts-2.m4a",
  "mock-tts-3.wav",
  "mock-tts-4.mp3",
  "mock-tts-5.wav",
  "mock-tts-6.m4a",
];

export class MockTTS extends BaseProvider<TTSGenerateParams, TTSResult> {
  async generate(params: TTSGenerateParams): Promise<TTSResult> {
    const data = readMockFile(pickRandom(MOCK_TTS_AUDIO)).toString("base64");
    const words = params.prompt.split(/\s+/);
    const wordDuration = 0.3;
    return {
      data,
      textTimestamps: words.map((word, i) => ({
        text: word,
        start: i * wordDuration,
        end: (i + 1) * wordDuration,
      })),
    };
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
