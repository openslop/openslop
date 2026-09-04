import type { GatewayClient } from "@/lib/gateway/base";
import type { ProjectData } from "@/lib/project/store";
import type { ConnectorPlugin, ModelRef, PluginContext } from "./types";

/** Assert the plugin was given a gateway, returning the narrowed dependency. */
export function requireGateway<P, R>(
	ctx: PluginContext<P, R> | undefined,
	plugin: string,
): GatewayClient<P, R> {
	if (!ctx?.gateway)
		throw new Error(`${plugin} plugin requires gateway context`);
	return ctx.gateway;
}

/** Assert the plugin was given project state, returning it narrowed. */
export function requireState<P, R>(
	ctx: PluginContext<P, R> | undefined,
	plugin: string,
): ProjectData {
	if (!ctx?.state) throw new Error(`${plugin} plugin requires project state`);
	return ctx.state;
}

/** Assert the plugin was told the pair its connector runs on. */
export function requireModel<P, R>(
	ctx: PluginContext<P, R> | undefined,
	plugin: string,
): ModelRef {
	if (!ctx?.model) throw new Error(`${plugin} plugin requires a model`);
	return ctx.model;
}

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
	error: string,
	ctx?: PluginContext,
): Promise<void> {
	for (const plugin of plugins) {
		if (plugin.onError) {
			await plugin.onError(error, ctx);
		}
	}
}
