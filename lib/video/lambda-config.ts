import type { AwsRegion } from "@remotion/lambda/client";

export const REGION: AwsRegion = "us-east-1";
export const RAM = 3008;
export const DISK = 10240;
export const TIMEOUT = 240;

export function getSiteName(): string {
	if (process.env.VERCEL_ENV === "production") return "openslop";
	const ref = process.env.VERCEL_GIT_COMMIT_REF ?? "local";
	const slug = ref.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 40);
	return `openslop-${slug}`;
}
