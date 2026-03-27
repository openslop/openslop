import type { MusicGenerateParams } from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { pickRandom, readMockFileAsArrayBuffer } from "../mock-utils";

const MOCK_AUDIO = [
  { file: "mock-1.mp3" },
  { file: "mock-2.m4a" },
  { file: "mock-3.wav" },
];

export class MockMusic extends BaseProvider<MusicGenerateParams, ArrayBuffer> {
  async generate(): Promise<ArrayBuffer> {
    await new Promise((r) => setTimeout(r, 2000 + Math.random() * 2000));
    const pick = pickRandom(MOCK_AUDIO);
    return readMockFileAsArrayBuffer(pick.file);
  }
}
