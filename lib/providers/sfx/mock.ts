import type { SFXGenerateParams } from "@/lib/connectors/types";
import { MockProvider } from "../mock-base";

const BLOB_BASE =
  "https://mqzeech9ugknls54.public.blob.vercel-storage.com/assets/sfx/mock";

export class MockSFX extends MockProvider<SFXGenerateParams> {
  protected readonly variants = [
    {
      id: "1",
      result: { audio: `${BLOB_BASE}/1/output.mp3` },
      metadata: { durationSec: 22 },
    },
    {
      id: "2",
      result: { audio: `${BLOB_BASE}/2/output.wav` },
      metadata: { durationSec: 19 },
    },
    {
      id: "3",
      result: { audio: `${BLOB_BASE}/3/output.m4a` },
      metadata: { durationSec: 2 },
    },
  ];
}
