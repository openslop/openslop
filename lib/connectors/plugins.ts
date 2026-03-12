import type { ConnectorPlugin, PluginContext } from "./types";

export async function runBeforeGenerate<T>(
  plugins: ConnectorPlugin[],
  params: T,
  ctx?: PluginContext,
): Promise<T> {
  let result = params;
  for (const plugin of plugins) {
    if (plugin.beforeGenerate) {
      result = (await plugin.beforeGenerate(result, ctx)) as T;
    }
  }
  return result;
}

export async function runAfterGenerate<T>(
  plugins: ConnectorPlugin[],
  result: T,
  ctx?: PluginContext,
): Promise<T> {
  let current = result;
  for (const plugin of plugins) {
    if (plugin.afterGenerate) {
      current = (await plugin.afterGenerate(current, ctx)) as T;
    }
  }
  return current;
}

export async function runTransformPrompt(
  plugins: ConnectorPlugin[],
  prompt: string,
  ctx?: PluginContext,
): Promise<string> {
  let current = prompt;
  for (const plugin of plugins) {
    if (plugin.transformPrompt) {
      current = await plugin.transformPrompt(current, ctx);
    }
  }
  return current;
}

export async function runOnError(
  plugins: ConnectorPlugin[],
  error: Error,
  ctx?: PluginContext,
): Promise<void> {
  for (const plugin of plugins) {
    if (plugin.onError) {
      await plugin.onError(error, ctx);
    }
  }
}
