import { NextResponse } from "next/server";
import {
	serverDeploymentId,
	type DeploymentResponse,
} from "@/lib/deployment/deployment-id";

/** The deployment serving requests now, for open tabs to compare with their own. */
export function GET() {
	return NextResponse.json<DeploymentResponse>(
		{ deploymentId: serverDeploymentId() },
		{ headers: { "Cache-Control": "no-store" } },
	);
}
