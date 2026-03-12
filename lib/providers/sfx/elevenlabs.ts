import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { SFXGenerateParams } from "@/lib/connectors/types";
import { BaseProvider } from "../base";

export class ElevenLabsSFX extends BaseProvider<
  SFXGenerateParams,
  ArrayBuffer
> {
  private client: ElevenLabsClient;

  constructor(apiKey: string) {
    super();
    this.client = new ElevenLabsClient({ apiKey });
  }

  async generate(params: SFXGenerateParams) {
    const stream = await this.client.textToSoundEffects.convert({
      text: params.prompt,
      durationSeconds: params.durationSeconds || 5,
      outputFormat: "mp3_22050_32",
    });

    const chunks: Uint8Array[] = [];
    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
    const buffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }

    return buffer.buffer as ArrayBuffer;
  }
}
