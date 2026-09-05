import type { VideoJob, VideoProviderResponse } from "./base";
import { BaseVideoProvider, DEFAULT_VIDEO_DURATION_SEC } from "./base";
import { BLOB_BASE_URL } from "@/lib/blob";
import type { ValidationResult } from "@/lib/connectors/providerKey";
import { mockDelay, pickRandom } from "../mock-utils";

const BLOB_BASE = `${BLOB_BASE_URL}/assets/video/mock`;

const MOCK_VARIANTS = [
	{ url: `${BLOB_BASE}/1/output.mp4`, durationSec: 174 },
	{ url: `${BLOB_BASE}/2/output.mov`, durationSec: 30 },
	{ url: `${BLOB_BASE}/3/output.webm`, durationSec: 15 },
];

export class MockVideo extends BaseVideoProvider {
	protected readonly blobConfig = { type: "video", provider: "mock" };

	async validate(): Promise<ValidationResult> {
		return { ok: true };
	}

	protected async store(result: VideoJob): Promise<VideoProviderResponse> {
		return {
			id: result.metadata.jobId,
			type: this.blobConfig.type,
			provider: this.blobConfig.provider,
			result: {
				video: result.url ?? "",
			},
			metadata: result.metadata,
		};
	}

	protected async _generate(): Promise<VideoJob> {
		await mockDelay(2000);
		return {
			metadata: {
				jobId: "mock-job",
				status: "processing",
				durationSec: DEFAULT_VIDEO_DURATION_SEC,
			},
		};
	}

	protected async _poll(jobId: string): Promise<VideoJob> {
		if (Math.random() > 0.7) {
			return {
				metadata: {
					jobId: "mock-id",
					status: "processing",
				},
			};
		}
		const variant = pickRandom(MOCK_VARIANTS);
		return {
			url: variant.url,
			metadata: {
				jobId,
				status: "completed",
				durationSec: variant.durationSec,
			},
		};
	}
}
