import type { SourcedSTTParams } from "@/lib/connectors/types";
import { MockProvider } from "../mock-base";
import { BLOB_BASE as TTS_MOCK } from "../tts/mock";
import type { STTProvider } from "../types";

/** Any word timings will do, so the mock reads the ones mock speech already serves. */
export class MockSTT
	extends MockProvider<SourcedSTTParams>
	implements STTProvider
{
	protected readonly variants = [
		{
			id: "1",
			result: { timestamps: `${TTS_MOCK}/1/timestamps.json` },
			metadata: { durationSec: 10 },
		},
		{
			id: "2",
			result: { timestamps: `${TTS_MOCK}/2/timestamps.json` },
			metadata: { durationSec: 18 },
		},
	];
}
