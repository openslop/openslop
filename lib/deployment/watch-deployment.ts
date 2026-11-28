import { isOtherDeployment } from "./deployment-id";

export const DEPLOYMENT_CHECK_INTERVAL_MS = 10 * 60 * 1000;

type DeploymentCheck = {
	own: string;
	latest: () => Promise<string | null>;
	onNewDeployment: () => void;
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
		onNewDeployment();
	};
}

/** Runs `check` when the tab comes back into view, and on an interval while it is in view. */
export function whileVisible(check: () => void): () => void {
	const checkIfVisible = () => {
		if (document.visibilityState === "visible") check();
	};
	const interval = setInterval(checkIfVisible, DEPLOYMENT_CHECK_INTERVAL_MS);
	document.addEventListener("visibilitychange", checkIfVisible);
	return () => {
		clearInterval(interval);
		document.removeEventListener("visibilitychange", checkIfVisible);
	};
}
