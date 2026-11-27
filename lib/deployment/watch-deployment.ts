import { isOtherDeployment } from "./deployment-id";

export const DEPLOYMENT_CHECK_INTERVAL_MS = 10 * 60 * 1000;

type DeploymentCheck = {
	/** The deployment this tab's code came from. */
	own: string;
	/** The deployment the server runs now. */
	latest: () => Promise<string | null>;
	/** Told once for each newer deployment. */
	onNewDeployment: (deploymentId: string) => void;
};

/** Asks for the server's deployment, and reports each one this tab doesn't run, once. */
export function createDeploymentCheck({
	own,
	latest,
	onNewDeployment,
}: DeploymentCheck): () => Promise<void> {
	let reported: string | null = null;
	return async () => {
		const deploymentId = await latest();
		if (!isOtherDeployment(own, deploymentId) || deploymentId === reported)
			return;
		reported = deploymentId;
		onNewDeployment(deploymentId);
	};
}

/** Runs `check` when the tab comes back into view, and on an interval while it is in view. */
export function whileVisible(
	check: () => void,
	intervalMs = DEPLOYMENT_CHECK_INTERVAL_MS,
): () => void {
	const onVisibilityChange = () => {
		if (document.visibilityState === "visible") check();
	};
	const interval = setInterval(() => {
		if (document.visibilityState === "visible") check();
	}, intervalMs);
	document.addEventListener("visibilitychange", onVisibilityChange);
	return () => {
		clearInterval(interval);
		document.removeEventListener("visibilitychange", onVisibilityChange);
	};
}
