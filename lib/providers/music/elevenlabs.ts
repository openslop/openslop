import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export class ElevenLabsMusic {
  private client: ElevenLabsClient;

  constructor(apiKey: string) {
    this.client = new ElevenLabsClient({ apiKey });
  }

  async generate(params: {
    prompt: string;
    durationSeconds?: number;
    model?: string;
  }) {
    const stream = await this.client.music.compose({
      prompt: params.prompt,
      musicLengthMs: (params.durationSeconds || 30) * 1000,
      modelId: (params.model as "music_v1") || "music_v1",
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

    return {
      data: Buffer.from(buffer).toString("base64"),
      format: "mp3" as const,
      durationSeconds: params.durationSeconds || 30,
    };
  }
}
