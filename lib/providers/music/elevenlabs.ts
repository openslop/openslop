import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { MusicGenerateParams } from "@/lib/connectors/types";
import { BaseProvider } from "../base";
import { streamToBuffer } from "../stream";

type MusicResult = {
  data: ArrayBuffer;
  metadata: { durationSec: number };
};

export class ElevenLabsMusic extends BaseProvider<
  MusicGenerateParams,
  MusicResult
> {
  private client: ElevenLabsClient;

  constructor(apiKey: string) {
    super();
    this.client = new ElevenLabsClient({ apiKey });
  }

  async generate(params: MusicGenerateParams) {
    const durationSeconds = params.durationSeconds ?? 30;
    const stream = await this.client.music.compose({
      prompt: params.prompt,
      musicLengthMs: durationSeconds * 1000,
      modelId: (params.model as "music_v1") || "music_v1",
      outputFormat: "mp3_22050_32",
    });

    return {
      data: await streamToBuffer(stream),
      metadata: { durationSec: durationSeconds },
    };
  }
}
