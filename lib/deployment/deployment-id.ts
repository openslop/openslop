import { z } from "zod";

/** Carries the client's deployment ID on requests that break when client and server disagree. */
export const DEPLOYMENT_HEADER = "x-openslop-deployment-id";

export const DEPLOYMENT_PATH = "/api/deployment";

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

/** Whether `other` is a different deployment from `own`; unknown on either side never counts. */
export const isOtherDeployment = (
	own: string | null | undefined,
	other: string | null | undefined,
): other is string => Boolean(own && other && own !== other);

/** Whether `request` came from a tab on another deployment; one that names none never counts. */
export const isFromOtherDeployment = (request: Request): boolean =>
	isOtherDeployment(
		serverDeploymentId(),
		request.headers.get(DEPLOYMENT_HEADER),
	);
