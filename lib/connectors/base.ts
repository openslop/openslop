import type { BaseProvider } from "@/lib/providers/base";
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
  ModelInfo,
  PluginContext,
} from "./types";

export abstract class BaseConnector<
  TParams extends { prompt: string } = { prompt: string },
  TResult = unknown,
  TProvider extends BaseProvider<TParams, TResult> = BaseProvider<
    TParams,
    TResult
  >,
> implements Connector {
  abstract readonly type: ConnectorType;
  protected plugins: ConnectorPlugin[];
  protected provider: TProvider;

  constructor(provider: TProvider, config: ConnectorConfig) {
    this.provider = provider;
    this.plugins = config.plugins ?? [];
  }

  async init(): Promise<void> {}
  async validate(): Promise<boolean> {
    return true;
  }
  async destroy(): Promise<void> {}

  abstract listModels(): Promise<ModelInfo[]>;

  protected async prepareParams(
    params: TParams,
  ): Promise<{ params: TParams; ctx: PluginContext<TParams, TResult> }> {
    const ctx: PluginContext<TParams, TResult> = { provider: this.provider };
    const prompt = await runTransformPrompt(this.plugins, params.prompt, ctx);
    const transformed = await runBeforeGenerate(
      this.plugins,
      { ...params, prompt },
      ctx,
    );
    return { params: transformed, ctx };
  }

  async generate(params: TParams): Promise<TResult> {
    const ctx: PluginContext<TParams, TResult> = { provider: this.provider };
    try {
      const { params: prepared } = await this.prepareParams(params);
      let result = await this._generate(prepared);
      result = await runAfterGenerate(this.plugins, result, ctx);
      return result;
    } catch (error) {
      await runOnError(this.plugins, error as Error, ctx);
      throw error;
    }
  }

  protected async _generate(params: TParams): Promise<TResult> {
    return this.provider.generate(params);
  }
}
