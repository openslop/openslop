import Cartesia from "@cartesia/cartesia-js";
import type {
  TextTimestamp,
  TTSGenerateParams,
  VoiceInfo,
  VoiceSearchParams,
} from "@/lib/connectors/types";

export class CartesiaTTS {
  private client: Cartesia;

  constructor(apiKey: string) {
    this.client = new Cartesia({ apiKey });
  }

  async search(
    params: VoiceSearchParams & { limit?: number },
  ): Promise<VoiceInfo[]> {
    const page = await this.client.voices.list({
      q: params.query || undefined,
      gender: params.gender as
        | "masculine"
        | "feminine"
        | "gender_neutral"
        | undefined,
      limit: params.limit || 20,
    });

    return page.data
      .map((voice) => ({
        id: voice.id,
        name: voice.name,
        language: voice.language,
        gender: voice.gender ?? undefined,
        description: voice.description,
        previewUrl: voice.preview_file_url ?? undefined,
      }))
      .filter((voice) => voice.language === params.language);
  }

  async generate(params: TTSGenerateParams) {
    const ws = await this.client.tts.websocket();
    await ws.connect();

    try {
      const audioChunks: Buffer[] = [];
      const textTimestamps: TextTimestamp[] = [];

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
        ...(params.speed !== undefined && {
          speed: params.speed as "slow" | "normal" | "fast",
        }),
      })) {
        if (response.type === "chunk" && response.audio) {
          audioChunks.push(
            Buffer.isBuffer(response.audio)
              ? response.audio
              : Buffer.from(response.audio),
          );
        }
        if (response.type === "timestamps" && response.word_timestamps) {
          const { words, start, end } = response.word_timestamps;
          for (let i = 0; i < words.length; i++) {
            textTimestamps.push({
              text: words[i],
              start: start[i],
              end: end[i],
            });
          }
        }
      }

      const combined = Buffer.concat(audioChunks);

      return {
        data: combined.toString("base64"),
        textTimestamps,
      };
    } finally {
      ws.close();
    }
  }
}
