/**
 * Plugin pipeline runners used by `BaseConnector`.
 *
 * Each chain hook (`beforeGenerate`, `afterGenerate`, `transformPrompt`) is a
 * sequential reducer: every plugin that defines the hook receives the previous
 * plugin's output and returns the next value. `onError` is fan-out — every
 * plugin observes the failure but cannot mutate it.
 */
import type { ConnectorPlugin, PluginContext } from "./types";

type ChainHook<TIn, TOut, TParams, TResult> = (
	input: TIn,
	ctx?: PluginContext<TParams, TResult>,
) => TOut | Promise<TOut>;

async function chain<T, TParams = unknown, TResult = unknown>(
	plugins: ConnectorPlugin<TParams, TResult>[],
	pick: (
		plugin: ConnectorPlugin<TParams, TResult>,
	) => ChainHook<T, T, TParams, TResult> | undefined,
	initial: T,
	ctx?: PluginContext<TParams, TResult>,
): Promise<T> {
	let current = initial;
	for (const plugin of plugins) {
		const hook = pick(plugin);
		if (hook) current = await hook(current, ctx);
	}
	return current;
}

export function runBeforeGenerate<T>(
	plugins: ConnectorPlugin[],
	params: T,
	ctx?: PluginContext,
): Promise<T> {
	return chain(
		plugins,
		(p) => p.beforeGenerate as ChainHook<T, T, unknown, unknown> | undefined,
		params,
		ctx,
	);
}

export function runAfterGenerate<T>(
	plugins: ConnectorPlugin[],
	result: T,
	ctx?: PluginContext,
): Promise<T> {
	return chain(
		plugins,
		(p) => p.afterGenerate as ChainHook<T, T, unknown, unknown> | undefined,
		result,
		ctx,
	);
}

export function runTransformPrompt(
	plugins: ConnectorPlugin[],
	prompt: string,
	ctx?: PluginContext,
): Promise<string> {
	return chain(plugins, (p) => p.transformPrompt, prompt, ctx);
}

export async function runOnError(
	plugins: ConnectorPlugin[],
	error: Error,
	ctx?: PluginContext,
): Promise<void> {
	for (const plugin of plugins) {
		if (plugin.onError) await plugin.onError(error, ctx);
	}
}
