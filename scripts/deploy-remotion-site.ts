import { deploySite, getOrCreateBucket } from "@remotion/lambda";
import path from "node:path";
import { getSiteName, REGION } from "../lib/video/lambda-config";
import { webpackOverride } from "../remotion/webpack-override";

const siteName = getSiteName();
const { bucketName } = await getOrCreateBucket({ region: REGION });
const { serveUrl } = await deploySite({
	bucketName,
	region: REGION,
	siteName,
	entryPoint: path.join(process.cwd(), "remotion/index.ts"),
	options: { webpackOverride },
});

console.log(`[deploy-remotion-site] ${siteName} → ${serveUrl}`);
