import type { TextTimestamp, VideoJob } from "@/lib/connectors/types";
import type { BundleFile } from "./asset-bundle";
import { withBlobStorage } from "./with-blob-storage";
import { RunwareImage } from "@/lib/providers/image/runware";
import { MockImage } from "@/lib/providers/image/mock";
import { RunwareVideo } from "@/lib/providers/video/runware";
import { MockVideo } from "@/lib/providers/video/mock";
import { ElevenLabsMusic } from "@/lib/providers/music/elevenlabs";
import { MockMusic } from "@/lib/providers/music/mock";
import { ElevenLabsSFX } from "@/lib/providers/sfx/elevenlabs";
import { MockSFX } from "@/lib/providers/sfx/mock";
import { AnthropicLLM } from "@/lib/providers/llm/anthropic";
import { MockLLM } from "@/lib/providers/llm/mock";
import { CartesiaTTS } from "@/lib/providers/tts/cartesia";
import { MockTTS } from "@/lib/providers/tts/mock";

function withMockFallback<TReal, TMock>(
  envVar: string,
  real: (apiKey: string) => TReal,
  mock: () => TMock,
): TReal | TMock {
  const apiKey = process.env[envVar];
  if (!apiKey) return mock();
  return real(apiKey);
}

const cache = new Map<string, unknown>();

function cached<T>(key: string, factory: () => T): T {
  if (!cache.has(key)) cache.set(key, factory());
  return cache.get(key) as T;
}

type RawTTSResult = { data: string; textTimestamps: TextTimestamp[] };

const imageToFiles = (r: { data: string; format: string }): BundleFile[] => [
  {
    key: "image",
    filename: `output.${r.format}`,
    data: Buffer.from(r.data, "base64"),
    contentType: `image/${r.format}`,
  },
];

const ttsToFiles =
  (contentType: string, ext: string) =>
  (r: RawTTSResult): BundleFile[] => [
    {
      key: "audio",
      filename: `output.${ext}`,
      data: Buffer.from(r.data, "base64"),
      contentType,
    },
    {
      key: "timestamps",
      filename: "timestamps.json",
      data: JSON.stringify(r.textTimestamps),
      contentType: "application/json",
    },
  ];

const audioToFiles =
  (contentType: string, ext: string) =>
  (r: ArrayBuffer): BundleFile[] => [
    { key: "audio", filename: `output.${ext}`, data: r, contentType },
  ];

const videoToFiles = (r: VideoJob): BundleFile[] => [
  { key: "video", url: r.url! },
];

export function getImageProvider() {
  return cached("image", () =>
    withMockFallback(
      "RUNWARE_API_KEY",
      (k) =>
        withBlobStorage(
          new RunwareImage(k),
          { type: "image", provider: "runware" },
          imageToFiles,
        ),
      () => new MockImage(),
    ),
  );
}

export function getVideoProvider() {
  return cached("video", () =>
    withMockFallback(
      "RUNWARE_API_KEY",
      (k) =>
        withBlobStorage(
          new RunwareVideo(k),
          { type: "video", provider: "runware" },
          videoToFiles,
        ),
      () => new MockVideo(),
    ),
  );
}

export function getMusicProvider() {
  return cached("music", () =>
    withMockFallback(
      "ELEVENLABS_API_KEY",
      (k) =>
        withBlobStorage(
          new ElevenLabsMusic(k),
          { type: "music", provider: "elevenlabs" },
          audioToFiles("audio/mpeg", "mp3"),
        ),
      () => new MockMusic(),
    ),
  );
}

export function getSFXProvider() {
  return cached("sfx", () =>
    withMockFallback(
      "ELEVENLABS_API_KEY",
      (k) =>
        withBlobStorage(
          new ElevenLabsSFX(k),
          { type: "sfx", provider: "elevenlabs" },
          audioToFiles("audio/mpeg", "mp3"),
        ),
      () => new MockSFX(),
    ),
  );
}

export function getLLMProvider() {
  return cached("llm", () =>
    withMockFallback(
      "ANTHROPIC_API_KEY",
      (k) => new AnthropicLLM(k),
      () => new MockLLM(),
    ),
  );
}

export function getTTSProvider() {
  return cached("tts", () =>
    withMockFallback(
      "CARTESIA_API_KEY",
      (k) =>
        withBlobStorage(
          new CartesiaTTS(k),
          { type: "tts", provider: "cartesia" },
          ttsToFiles("audio/wav", "wav"),
        ),
      () => new MockTTS(),
    ),
  );
}
