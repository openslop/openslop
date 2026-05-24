import { deploySite, getOrCreateBucket } from "@remotion/lambda";
import path from "node:path";
import { REGION, SITE_NAME } from "../lib/video/lambda-config";
import { webpackOverride } from "../remotion/webpack-override";

const { bucketName } = await getOrCreateBucket({ region: REGION });
const { serveUrl } = await deploySite({
	bucketName,
	region: REGION,
	siteName: SITE_NAME,
	entryPoint: path.join(process.cwd(), "remotion/index.ts"),
	options: { webpackOverride },
});

console.log(`[deploy-remotion-site] ${SITE_NAME} → ${serveUrl}`);
