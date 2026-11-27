"use client";

import { useEffect } from "react";
import { apiJson, UnreachableError } from "@/lib/clients/http";
import {
	DEPLOYMENT_PATH,
	DeploymentResponse,
	pageDeploymentId,
} from "@/lib/deployment/deployment-id";
import { toastNewVersion } from "@/lib/deployment/new-version-toast";
import {
	createDeploymentCheck,
	whileVisible,
} from "@/lib/deployment/watch-deployment";

// Offline or mid-deploy, the next check asks again.
const latestDeployment = () =>
	apiJson(DEPLOYMENT_PATH, DeploymentResponse).then(
		({ deploymentId }) => deploymentId,
		(error: unknown) => {
			if (error instanceof UnreachableError) return null;
			throw error;
		},
	);

/** Offers a reload when the server runs a newer deployment than this tab; off when the page has none (local dev). */
export function NewVersionWatcher() {
	useEffect(() => {
		const own = pageDeploymentId();
		if (!own) return;
		const check = createDeploymentCheck({
			own,
			latest: latestDeployment,
			onNewDeployment: toastNewVersion,
		});
		return whileVisible(() => void check());
	}, []);

	return null;
}
