import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { SFXGenerateParams } from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { streamToBuffer } from "../stream";

type SFXResult = {
  data: ArrayBuffer;
  metadata: { durationSec: number };
};

export class ElevenLabsSFX extends BaseProvider<SFXGenerateParams, SFXResult> {
  private client: ElevenLabsClient;

  constructor(apiKey: string) {
    super();
    this.client = new ElevenLabsClient({ apiKey });
  }

  async generate(params: SFXGenerateParams) {
    const durationSeconds = params.durationSeconds ?? 5;
    const stream = await this.client.textToSoundEffects.convert({
      text: params.prompt,
      durationSeconds,
      outputFormat: "mp3_22050_32",
    });

    return {
      data: await streamToBuffer(stream),
      metadata: { durationSec: durationSeconds },
    };
  }
}
