import type { VideoJob, VideoProviderResponse } from "./base";
import { BaseVideoProvider } from "./base";
import { BLOB_BASE_URL } from "@/lib/blob";
import { pickRandom } from "../mock-utils";

const BLOB_BASE = `${BLOB_BASE_URL}/assets/video/mock`;

const MOCK_VARIANTS = [
	{ url: `${BLOB_BASE}/1/output.mp4`, durationSec: 174 },
	{ url: `${BLOB_BASE}/2/output.mov`, durationSec: 30 },
	{ url: `${BLOB_BASE}/3/output.webm`, durationSec: 15 },
];

export class MockVideo extends BaseVideoProvider {
	protected readonly blobConfig = { type: "video", provider: "mock" };

	protected async store(result: VideoJob): Promise<VideoProviderResponse> {
		if (!result.url) return super.store(result);
		return {
			id: result.metadata?.jobId ?? "",
			provider: this.blobConfig.provider,
			result: { video: result.url },
			metadata: result.metadata,
		};
	}

	protected async _generate(): Promise<VideoJob> {
		await new Promise((r) => setTimeout(r, 2000 + Math.random() * 2000));
		return {
			metadata: { jobId: "mock-job", status: "processing", durationSec: 5 },
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
