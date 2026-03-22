import type {
  TTSGenerateParams,
  TTSResult,
  VoiceInfo,
  VoiceSearchParams,
} from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { readMockFile } from "../mock-utils";

export class MockTTS extends BaseProvider<TTSGenerateParams, TTSResult> {
  async generate(params: TTSGenerateParams): Promise<TTSResult> {
    const data = readMockFile("tts-placeholder.mp3").toString("base64");
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
