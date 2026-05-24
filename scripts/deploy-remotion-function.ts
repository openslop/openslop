import { deployFunction } from "@remotion/lambda";
import { DISK, RAM, REGION, TIMEOUT } from "../lib/video/lambda-config";

const { functionName, alreadyExisted } = await deployFunction({
	region: REGION,
	memorySizeInMb: RAM,
	diskSizeInMb: DISK,
	timeoutInSeconds: TIMEOUT,
	createCloudWatchLogGroup: true,
});

console.log(
	`[deploy-remotion-function] ${functionName} ${alreadyExisted ? "(already existed)" : "(created)"}`,
);
