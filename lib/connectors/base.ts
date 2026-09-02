import { AttributeSchema } from "./attributes/schema";
import { stringifyError } from "../errors";
import {
	runAfterGenerate,
	runBeforeGenerate,
	runOnError,
	runTransformPrompt,
} from "./plugins";
import type {
	Connector,
	ConnectorPlugin,
	ConnectorType,
	GenerationContext,
	ModelRef,
	PluginContext,
	ResolvedConnectorConfig,
} from "./types";

export abstract class BaseConnector<
	TParams extends { prompt: string } = { prompt: string },
	TResult = unknown,
> implements Connector {
	abstract readonly type: ConnectorType;
	protected plugins: ConnectorPlugin[];
	protected readonly model: ModelRef;

	/**
	 * Attribute schema for this connector type and model. Types with no
	 * element-settings UI (e.g. llm) inherit this empty default. For per-model
	 * sets, override and branch on the provider and model.
	 */
	static attributesFor(_model: ModelRef): AttributeSchema {
		return AttributeSchema.from([]);
	}

	constructor(config: ResolvedConnectorConfig) {
		this.plugins = config.plugins ?? [];
		this.model = config.model;
	}

	protected pluginContext(): PluginContext<TParams, TResult> {
		return {};
	}

	protected async prepareParams(
		params: TParams,
		ctx: PluginContext<TParams, TResult>,
	): Promise<TParams> {
		const prompt = await runTransformPrompt(this.plugins, params.prompt, ctx);
		return runBeforeGenerate(
			this.plugins,
			{ ...params, ...this.model, prompt },
			ctx,
		);
	}

	async generate(
		params: TParams,
		context?: GenerationContext,
	): Promise<TResult> {
		const ctx = { ...this.pluginContext(), ...context };
		try {
			const prepared = await this.prepareParams(params, ctx);
			let result = await this._generate(prepared);
			result = await runAfterGenerate(this.plugins, result, ctx);
			return result;
		} catch (error) {
			await runOnError(this.plugins, stringifyError(error), ctx);
			throw error;
		}
	}

	protected abstract _generate(params: TParams): Promise<TResult>;
}
