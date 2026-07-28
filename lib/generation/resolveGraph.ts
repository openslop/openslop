import omit from "lodash/omit";
import { resolveElementConnector } from "@/lib/canvas/elementConnector";
import { ELEMENT_TYPES, type CanvasContentElement } from "@/lib/canvas/types";
import { getDefaultConnector } from "@/lib/connectors/registry";
import type {
	AssetConnectorType,
	ConnectorPlugin,
} from "@/lib/connectors/types";
import { LAYOUT_ATTRIBUTE_KEYS } from "@/lib/video/elementAttributes";
import { getPromptText } from "./inputs";
import type {
	GenerationNode,
	GraphContext,
	GraphResolveContext,
} from "./graph";

function buildNode(
	element: CanvasContentElement,
	connectorType: AssetConnectorType,
	pluginOverride: ConnectorPlugin[] | undefined,
	ctx: GraphContext,
): GenerationNode {
	// Derived nodes (avatars, stills) are not authored elements, so they take the
	// registry default for their connector type rather than resolving a pin.
	const { provider, config } = pluginOverride
		? getDefaultConnector(ctx.registry, connectorType)
		: resolveElementConnector(element, ctx.registry);
	const attributes = element.customAttributes ?? {};
	const plugins = pluginOverride ?? config.plugins ?? [];
	const job = {
		elementId: element.id,
		connectorType,
		provider,
		config: pluginOverride ? { ...config, plugins: pluginOverride } : config,
		projectId: ctx.projectId,
		element,
		state: ctx.state,
	};
	return {
		id: element.id,
		inputs: {
			prompt: getPromptText(element),
			attributes: omit(attributes, LAYOUT_ATTRIBUTE_KEYS),
		},
		dependsOn: plugins.flatMap(
			(plugin) => plugin.dependencies?.(element, ctx) ?? [],
		),
		buildJob: () => job,
	};
}

/**
 * Build `element`'s node and every node it transitively depends on. Edges come
 * from the plugin chain each node runs, so the same declaration drives what a
 * job reads, what it waits for, and what makes it stale.
 */
export function resolveGraph(
	element: CanvasContentElement,
	{ projectId, registry, state }: GraphResolveContext,
	rootPlugins?: ConnectorPlugin[],
): GenerationNode {
	const resolved = new Map<string, GenerationNode>();
	const resolving = new Set<string>();
	const ctx: GraphContext = {
		projectId,
		registry,
		state,
		resolve(el, connectorType, plugins) {
			const existing = resolved.get(el.id);
			if (existing) return existing;
			if (resolving.has(el.id))
				throw new Error(`Cyclic generation dependency at "${el.id}"`);
			resolving.add(el.id);
			const node = buildNode(el, connectorType, plugins, ctx);
			resolving.delete(el.id);
			resolved.set(el.id, node);
			return node;
		},
	};
	return ctx.resolve(
		element,
		ELEMENT_TYPES[element.type].connector,
		rootPlugins,
	);
}
