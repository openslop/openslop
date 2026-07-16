import { OpenSlopClient } from "@/lib/clients/openslop";
import { AssetGateway } from "../base";
import type { JobPoll, JobSubmission } from "../base";

export abstract class OpenSlopAssetGateway<
	TParams,
> extends AssetGateway<TParams> {
	protected client: OpenSlopClient;
	protected abstract readonly path: string;

	constructor(baseUrl?: string) {
		super();
		this.client = new OpenSlopClient(baseUrl);
	}

	async generate(params: TParams): Promise<JobSubmission> {
		return this.client.post<JobSubmission>(`/api/v1/${this.path}`, params);
	}

	async poll(jobId: string): Promise<JobPoll> {
		return this.client.get<JobPoll>(`/api/v1/${this.path}/${jobId}`);
	}
}
