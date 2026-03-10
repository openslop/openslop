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
} from "./types";

export abstract class BaseConnector<
  TParams extends { prompt: string } = { prompt: string },
  TResult = unknown,
> implements Connector {
  abstract readonly type: ConnectorType;
  protected plugins: ConnectorPlugin[];

  constructor(protected config: ConnectorConfig) {
    this.plugins = config.plugins ?? [];
  }

  async init(): Promise<void> {}
  async validate(): Promise<boolean> {
    return true;
  }
  async destroy(): Promise<void> {}

  abstract listModels(): Promise<ModelInfo[]>;

  async generate(params: TParams): Promise<TResult> {
    try {
      const prompt = await runTransformPrompt(this.plugins, params.prompt);
      const transformed = await runBeforeGenerate(this.plugins, {
        ...params,
        prompt,
      });
      let result = await this._generate(transformed);
      result = await runAfterGenerate(this.plugins, result);
      return result;
    } catch (error) {
      await runOnError(this.plugins, error as Error);
      throw error;
    }
  }

  protected abstract _generate(params: TParams): Promise<TResult>;
}
