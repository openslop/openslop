import type { ConnectorPlugin, PluginContext } from "./types";

type ReducibleHook = "beforeGenerate" | "afterGenerate" | "transformPrompt";

async function reducePlugins<T>(
	plugins: ConnectorPlugin[],
	hook: ReducibleHook,
	value: T,
	ctx?: PluginContext,
): Promise<T> {
	let current = value;
	for (const plugin of plugins) {
		const fn = plugin[hook] as
			| ((v: unknown, c?: PluginContext) => unknown)
			| undefined;
		if (fn) current = (await fn.call(plugin, current, ctx)) as T;
	}
	return current;
}

export async function runBeforeGenerate<T>(
	plugins: ConnectorPlugin[],
	params: T,
	ctx?: PluginContext,
): Promise<T> {
	return reducePlugins(plugins, "beforeGenerate", params, ctx);
}

export async function runAfterGenerate<T>(
	plugins: ConnectorPlugin[],
	result: T,
	ctx?: PluginContext,
): Promise<T> {
	return reducePlugins(plugins, "afterGenerate", result, ctx);
}

export async function runTransformPrompt(
	plugins: ConnectorPlugin[],
	prompt: string,
	ctx?: PluginContext,
): Promise<string> {
	return reducePlugins(plugins, "transformPrompt", prompt, ctx);
}

export async function runOnError(
	plugins: ConnectorPlugin[],
	error: string,
	ctx?: PluginContext,
): Promise<void> {
	for (const plugin of plugins) {
		await plugin.onError?.(error, ctx);
	}
}
