import type { SourcedSTTParams } from "@/lib/connectors/types";
import { BLOB_BASE_URL } from "@/lib/blob";
import { MockProvider } from "../mock-base";
import type { STTProvider } from "../types";

const BLOB_BASE = `${BLOB_BASE_URL}/assets/stt/mock`;

const DURATIONS_SEC = [5, 8, 12, 15, 20, 24, 30, 10];

export class MockSTT
	extends MockProvider<SourcedSTTParams>
	implements STTProvider
{
	protected readonly variants = DURATIONS_SEC.map((durationSec, index) => ({
		id: `${index + 1}`,
		result: { timestamps: `${BLOB_BASE}/${index + 1}/transcript.json` },
		metadata: { durationSec },
	}));
}
