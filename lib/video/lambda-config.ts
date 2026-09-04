import { type AwsRegion, speculateFunctionName } from "@remotion/lambda/client";

export const REGION: AwsRegion = "us-east-1";
const RAM = 3008;
const DISK = 10240;
const TIMEOUT = 240;

/** The deployed function is named from this spec, so deploys and callers share it. */
export const LAMBDA_FUNCTION_SPEC = {
	memorySizeInMb: RAM,
	diskSizeInMb: DISK,
	timeoutInSeconds: TIMEOUT,
} as const;

export function getFunctionName(): string {
	return speculateFunctionName(LAMBDA_FUNCTION_SPEC);
}

export function getSiteName(): string {
	if (process.env.VERCEL_ENV === "production") return "openslop";
	const ref = process.env.VERCEL_GIT_COMMIT_REF ?? "local";
	const slug = ref.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 40);
	return `openslop-${slug}`;
}
