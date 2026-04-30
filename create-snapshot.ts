import { put } from "@vercel/blob";
import { addBundleToSandbox, createSandbox } from "@remotion/vercel";
import { bundleRemotionProject } from "./app/api/render/helpers";

const getSnapshotBlobKey = () =>
	`snapshot-cache/${process.env.VERCEL_DEPLOYMENT_ID ?? "local"}.json`;

const sandbox = await createSandbox({
	resources: { vcpus: 8 },
	timeoutInMilliseconds: 15 * 60 * 1000,
	onProgress: ({ progress, message }) => {
		console.log(
			`[create-snapshot] ${message} (${Math.round(progress * 100)}%)`,
		);
	},
});

console.log("[create-snapshot] Adding Remotion bundle...");
bundleRemotionProject(".remotion");
await addBundleToSandbox({ sandbox, bundleDir: ".remotion" });

console.log("[create-snapshot] Taking snapshot...");
const snapshot = await sandbox.snapshot({ expiration: 0 });

await put(
	getSnapshotBlobKey(),
	JSON.stringify({ snapshotId: snapshot.snapshotId }),
	{
		access: "public",
		contentType: "application/json",
		addRandomSuffix: false,
	},
);

console.log(`[create-snapshot] Snapshot saved: ${snapshot.snapshotId}`);
