import { stringifyError } from "../errors";
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

	protected async reportError(
		error: unknown,
		ctx: PluginContext<TParams, TResult>,
	): Promise<void> {
		await runOnError(this.plugins, stringifyError(error), ctx);
	}

	protected async withPlugins<T>(
		params: TParams,
		body: (
			prepared: TParams,
			ctx: PluginContext<TParams, TResult>,
		) => Promise<T>,
	): Promise<T> {
		const ctx = this.pluginContext();
		try {
			return await body(await this.prepareParams(params, ctx), ctx);
		} catch (error) {
			await this.reportError(error, ctx);
			throw error;
		}
	}

	async generate(params: TParams): Promise<TResult> {
		return this.withPlugins(params, async (prepared, ctx) => {
			const result = await this._generate(prepared);
			return runAfterGenerate(this.plugins, result, ctx);
		});
	}

	protected abstract _generate(params: TParams): Promise<TResult>;
}
