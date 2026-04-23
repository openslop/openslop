import type { VideoJob } from "@/lib/connectors/types";
import type { VideoProviderResponse } from "./base";
import { BaseVideoProvider } from "./base";
import { pickRandom } from "../mock-utils";

const BLOB_BASE =
	"https://mqzeech9ugknls54.public.blob.vercel-storage.com/assets/video/mock";

const MOCK_VARIANTS = [
	{ url: `${BLOB_BASE}/1/output.mp4`, durationSec: 174 },
	{ url: `${BLOB_BASE}/2/output.mov`, durationSec: 30 },
	{ url: `${BLOB_BASE}/3/output.webm`, durationSec: 15 },
];

export class MockVideo extends BaseVideoProvider {
	protected readonly blobConfig = { type: "video", provider: "mock" };

	protected async store(result: VideoJob): Promise<VideoProviderResponse> {
		return {
			id: result.metadata?.jobId ?? "",
			provider: this.blobConfig.provider,
			result: {
				video: result.url ?? "",
			},
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
