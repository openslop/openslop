import { z } from "zod";

export const DEPLOYMENT_HEADER = "x-openslop-deployment-id";

export const DeploymentResponse = z.object({
	deploymentId: z.string().nullable(),
});
export type DeploymentResponse = z.infer<typeof DeploymentResponse>;

// Next stamps it per build (Vercel sets it per deploy); unset in local dev, where it inlines as false.
export const serverDeploymentId = (): string | null =>
	process.env.NEXT_DEPLOYMENT_ID || null;

/** The deployment this page's code came from, as Next stamps it on `<html>`. */
export const pageDeploymentId = (): string | null =>
	document.documentElement.dataset.dplId ?? null;

/** Unknown on either side never counts. */
export const isOtherDeployment = (
	own: string | null,
	other: string | null,
): other is string => Boolean(own && other && own !== other);

export const isFromOtherDeployment = (request: Request): boolean =>
	isOtherDeployment(
		serverDeploymentId(),
		request.headers.get(DEPLOYMENT_HEADER),
	);
