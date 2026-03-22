import type { SFXGenerateParams } from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { readMockFileAsArrayBuffer } from "../mock-utils";

export class MockSFX extends BaseProvider<SFXGenerateParams, ArrayBuffer> {
  async generate(): Promise<ArrayBuffer> {
    return readMockFileAsArrayBuffer("sfx-placeholder.mp3");
  }
}
