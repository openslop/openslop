import type { ConnectorPlugin, PluginContext } from "./types";

type TransformHook = "beforeGenerate" | "afterGenerate" | "transformPrompt";

/** Threads a value through every plugin that implements the hook, in order. */
async function fold<T>(
	plugins: ConnectorPlugin[],
	hook: TransformHook,
	value: T,
	ctx: PluginContext,
): Promise<T> {
	let current = value;
	for (const plugin of plugins) {
		const step = plugin[hook] as
			| ((value: T, ctx: PluginContext) => T | Promise<T>)
			| undefined;
		if (step) current = await step(current, ctx);
	}
	return current;
}

export function runBeforeGenerate<T>(
	plugins: ConnectorPlugin[],
	params: T,
	ctx: PluginContext,
): Promise<T> {
	return fold(plugins, "beforeGenerate", params, ctx);
}

export function runAfterGenerate<T>(
	plugins: ConnectorPlugin[],
	result: T,
	ctx: PluginContext,
): Promise<T> {
	return fold(plugins, "afterGenerate", result, ctx);
}

export function runTransformPrompt(
	plugins: ConnectorPlugin[],
	prompt: string,
	ctx: PluginContext,
): Promise<string> {
	return fold(plugins, "transformPrompt", prompt, ctx);
}

export async function runOnError(
	plugins: ConnectorPlugin[],
	error: string,
	ctx: PluginContext,
): Promise<void> {
	for (const plugin of plugins) {
		if (plugin.onError) {
			await plugin.onError(error, ctx);
		}
	}
}

/** Adds reference images after those the params already carry. */
export function withReferences<T extends { referenceImages?: string[] }>(
	params: T,
	urls: string[],
): T {
	return urls.length === 0
		? params
		: {
				...params,
				referenceImages: [...(params.referenceImages ?? []), ...urls],
			};
}
