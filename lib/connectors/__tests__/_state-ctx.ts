import mapValues from "lodash/mapValues";
import type { CanvasElement, GeneratedElement } from "@/lib/canvas/types";
import type {
	AssetResult,
	ConnectorPlugin,
	PluginContext,
} from "@/lib/connectors/types";
import type { BuildContext } from "@/lib/generation/graph";
import { pluginRecords } from "@/lib/generation/generation-graph";
import { buildCtx } from "@/lib/generation/__tests__/_context";

export const pluginCtx = ({
	reads = {},
	dependencies = {},
}: {
	reads?: Record<string, string>;
	dependencies?: Record<string, AssetResult>;
} = {}): PluginContext => ({ reads, dependencies });

export const readsOf = (
	plugin: ConnectorPlugin,
	element: GeneratedElement,
	canvas: CanvasElement[] = [],
	settings?: BuildContext["settings"],
) => pluginRecords([plugin], "reads", element, buildCtx(canvas, { settings }));

export const dependenciesOf = (
	plugin: ConnectorPlugin,
	element: GeneratedElement,
	canvas: CanvasElement[] = [],
) =>
	mapValues(
		pluginRecords([plugin], "dependencies", element, buildCtx(canvas)),
		"id",
	);
