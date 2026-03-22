import type { MusicGenerateParams } from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { readMockFileAsArrayBuffer } from "../mock-utils";

export class MockMusic extends BaseProvider<MusicGenerateParams, ArrayBuffer> {
  async generate(): Promise<ArrayBuffer> {
    return readMockFileAsArrayBuffer("music-placeholder.mp3");
  }
}
