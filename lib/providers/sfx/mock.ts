import type { SFXGenerateParams } from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { pickRandom, readMockFileAsArrayBuffer } from "../mock-utils";

const MOCK_SFX_AUDIO = ["mock-sfx.mp3", "mock-sfx.wav", "mock-sfx.m4a"];

export class MockSFX extends BaseProvider<SFXGenerateParams, ArrayBuffer> {
  async generate(): Promise<ArrayBuffer> {
    return readMockFileAsArrayBuffer(pickRandom(MOCK_SFX_AUDIO));
  }
}
