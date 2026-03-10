import Cartesia from "@cartesia/cartesia-js";
import type { VoiceInfo } from "@/lib/connectors/types";

export class CartesiaTTS {
  private client: Cartesia;

  constructor(apiKey: string) {
    this.client = new Cartesia({ apiKey });
  }

  async search(params: {
    query?: string;
    gender?: string;
    language?: string;
    limit?: number;
  }): Promise<VoiceInfo[]> {
    const page = await this.client.voices.list({
      q: params.query || undefined,
      gender: params.gender as
        | "masculine"
        | "feminine"
        | "gender_neutral"
        | undefined,
      limit: params.limit || 20,
    });

    return page.data.map((voice) => ({
      id: voice.id,
      name: voice.name,
      language: voice.language,
      gender: voice.gender ?? undefined,
      description: voice.description,
      previewUrl: voice.preview_file_url ?? undefined,
    }));
  }

  async generate(params: { prompt: string; voiceId: string; model?: string }) {
    const ws = await this.client.tts.websocket();
    await ws.connect();

    try {
      const audioChunks: Buffer[] = [];
      const wordTimestamps: {
        words: string[];
        start: number[];
        end: number[];
      } = { words: [], start: [], end: [] };

      for await (const response of ws.generate({
        model_id: params.model || "sonic-3",
        transcript: params.prompt,
        voice: { mode: "id", id: params.voiceId },
        output_format: {
          container: "raw",
          encoding: "pcm_f32le",
          sample_rate: 44100,
        },
        add_timestamps: true,
      })) {
        if (response.type === "chunk" && response.audio) {
          audioChunks.push(
            Buffer.isBuffer(response.audio)
              ? response.audio
              : Buffer.from(response.audio),
          );
        }
        if (response.type === "timestamps" && response.word_timestamps) {
          wordTimestamps.words.push(...response.word_timestamps.words);
          wordTimestamps.start.push(...response.word_timestamps.start);
          wordTimestamps.end.push(...response.word_timestamps.end);
        }
      }

      const combined = Buffer.concat(audioChunks);
      const durationSeconds = combined.length / (44100 * 4); // 32-bit float = 4 bytes per sample

      return {
        data: combined.toString("base64"),
        format: "raw" as const,
        durationSeconds,
        wordTimestamps,
      };
    } finally {
      ws.close();
    }
  }
}
