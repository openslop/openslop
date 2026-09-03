import { deployFunction } from "@remotion/lambda";
import { LAMBDA_FUNCTION_SPEC, REGION } from "../lib/video/lambda-config";

const { functionName, alreadyExisted } = await deployFunction({
	region: REGION,
	...LAMBDA_FUNCTION_SPEC,
	createCloudWatchLogGroup: true,
});

console.log(
	`[deploy-remotion-function] ${functionName} ${alreadyExisted ? "(already existed)" : "(created)"}`,
);
