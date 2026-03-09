import type { ConnectorPlugin } from "./types";

export async function runBeforeGenerate<T>(
  plugins: ConnectorPlugin[],
  params: T,
): Promise<T> {
  let result = params;
  for (const plugin of plugins) {
    if (plugin.beforeGenerate) {
      result = (await plugin.beforeGenerate(result)) as T;
    }
  }
  return result;
}

export async function runAfterGenerate<T>(
  plugins: ConnectorPlugin[],
  result: T,
): Promise<T> {
  let current = result;
  for (const plugin of plugins) {
    if (plugin.afterGenerate) {
      current = (await plugin.afterGenerate(current)) as T;
    }
  }
  return current;
}

export async function runTransformPrompt(
  plugins: ConnectorPlugin[],
  prompt: string,
): Promise<string> {
  let current = prompt;
  for (const plugin of plugins) {
    if (plugin.transformPrompt) {
      current = await plugin.transformPrompt(current);
    }
  }
  return current;
}

export async function runOnError(
  plugins: ConnectorPlugin[],
  error: Error,
): Promise<void> {
  for (const plugin of plugins) {
    if (plugin.onError) {
      await plugin.onError(error);
    }
  }
}
