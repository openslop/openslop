import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { SFXGenerateParams } from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { streamToBuffer } from "../stream";

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

    return streamToBuffer(stream);
  }
}
