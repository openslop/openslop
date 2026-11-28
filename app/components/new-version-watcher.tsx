"use client";

import { useEffect } from "react";
import { apiJson, UnreachableError } from "@/lib/clients/http";
import {
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
	apiJson("/api/deployment", DeploymentResponse).then(
		({ deploymentId }) => deploymentId,
		(error: unknown) => {
			if (error instanceof UnreachableError) return null;
			throw error;
		},
	);

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
