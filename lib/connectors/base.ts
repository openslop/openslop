import { toError } from "@/lib/errors";
import {
	runAfterGenerate,
	runBeforeGenerate,
	runOnError,
	runTransformPrompt,
} from "./plugins";
import type {
	Connector,
	ConnectorConfig,
	ConnectorPlugin,
	ConnectorType,
	PluginContext,
} from "./types";

export abstract class BaseConnector<
	TParams extends { prompt: string } = { prompt: string },
	TResult = unknown,
> implements Connector {
	abstract readonly type: ConnectorType;
	protected plugins: ConnectorPlugin[];

	constructor(config: ConnectorConfig) {
		this.plugins = config.plugins ?? [];
	}

	async init(): Promise<void> {}
	async validate(): Promise<boolean> {
		return true;
	}
	async destroy(): Promise<void> {}

	protected pluginContext(): PluginContext<TParams, TResult> {
		return {};
	}

	protected async prepareParams(
		params: TParams,
		ctx: PluginContext<TParams, TResult>,
	): Promise<TParams> {
		const prompt = await runTransformPrompt(this.plugins, params.prompt, ctx);
		return runBeforeGenerate(this.plugins, { ...params, prompt }, ctx);
	}

	async generate(params: TParams): Promise<TResult> {
		const ctx = this.pluginContext();
		try {
			const prepared = await this.prepareParams(params, ctx);
			let result = await this._generate(prepared);
			result = await runAfterGenerate(this.plugins, result, ctx);
			return result;
		} catch (error) {
			await runOnError(this.plugins, toError(error), ctx);
			throw error;
		}
	}

	protected abstract _generate(params: TParams): Promise<TResult>;
}
