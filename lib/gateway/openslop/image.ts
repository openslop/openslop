import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { ImageGenerateParams } from "@/lib/connectors/types";
import { OpenSlopGatewayClient } from "./base";

export class OpenSlopImageGateway extends OpenSlopGatewayClient<
	ImageGenerateParams,
	BundleResponse
> {
	async generate(params: ImageGenerateParams): Promise<BundleResponse> {
		return this.client.post<BundleResponse>("/api/v1/image", params);
	}
}
