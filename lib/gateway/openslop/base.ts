import { OpenSlopClient } from "@/lib/clients/openslop";
import type { AssetGateway, JobPoll, JobStatus } from "../base";
import { GatewayClient } from "../base";

export abstract class OpenSlopGatewayClient<
	TParams = unknown,
	TResult = unknown,
> extends GatewayClient<TParams, TResult> {
	protected client: OpenSlopClient;

	constructor(baseUrl?: string) {
		super();
		this.client = new OpenSlopClient(baseUrl);
	}
}

export abstract class OpenSlopAssetGateway<TParams>
	extends OpenSlopGatewayClient<TParams, { jobId: string; status: JobStatus }>
	implements AssetGateway<TParams>
{
	protected abstract readonly path: string;

	async generate(
		params: TParams,
	): Promise<{ jobId: string; status: JobStatus }> {
		return this.client.post<{ jobId: string; status: JobStatus }>(
			`/api/v1/${this.path}`,
			params,
		);
	}

	async poll(jobId: string): Promise<JobPoll> {
		return this.client.get<JobPoll>(`/api/v1/${this.path}/${jobId}`);
	}
}
