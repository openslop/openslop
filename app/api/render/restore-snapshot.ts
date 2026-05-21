import { get } from "@vercel/blob";
import { Sandbox } from "@vercel/sandbox";

const SANDBOX_TIMEOUT_MS = 120 * 60 * 1000;

const getSnapshotBlobKey = () =>
	`snapshot-cache/${process.env.VERCEL_DEPLOYMENT_ID ?? "local"}.json`;

export async function restoreSnapshot() {
	const blob = await get(getSnapshotBlobKey(), {
		access: "public",
		token: process.env.BLOB_READ_WRITE_TOKEN,
	});
	if (!blob) {
		throw new Error(
			"No sandbox snapshot found. Run `create-snapshot` as part of the build process.",
		);
	}

	const cache: { snapshotId: string } = await new Response(blob.stream).json();
	if (!cache.snapshotId) {
		throw new Error(
			"No sandbox snapshot found. Run `create-snapshot` as part of the build process.",
		);
	}

	return Sandbox.create({
		resources: { vcpus: 8 },
		source: { type: "snapshot", snapshotId: cache.snapshotId },
		timeout: SANDBOX_TIMEOUT_MS,
	});
}
