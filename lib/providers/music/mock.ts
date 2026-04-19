import type { MusicGenerateParams } from "@/lib/connectors/types";
import { MockProvider } from "../mock-base";

const BLOB_BASE =
  "https://mqzeech9ugknls54.public.blob.vercel-storage.com/assets/music/mock";

export class MockMusic extends MockProvider<MusicGenerateParams> {
  protected readonly delayMs = 2000;
  protected readonly variants = [
    {
      id: "1",
      provider: "mock",
      result: { audio: `${BLOB_BASE}/1/output.mp3` },
      metadata: { durationSec: 30 },
    },
    {
      id: "2",
      provider: "mock",
      result: { audio: `${BLOB_BASE}/2/output.m4a` },
      metadata: { durationSec: 188 },
    },
    {
      id: "3",
      provider: "mock",
      result: { audio: `${BLOB_BASE}/3/output.wav` },
      metadata: { durationSec: 60 },
    },
  ];
}
