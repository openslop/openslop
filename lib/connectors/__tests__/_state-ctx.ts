import mapValues from "lodash/mapValues";
import type { CanvasElement, GeneratedElement } from "@/lib/canvas/types";
import type {
	AssetResult,
	ConnectorPlugin,
	PluginContext,
} from "@/lib/connectors/types";
import {
	pluginDependencies,
	pluginReads,
} from "@/lib/generation/generationGraph";
import { buildCtx } from "@/lib/generation/__tests__/_context";
import type { ProjectData } from "@/lib/project/store";

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
	state?: ProjectData,
) => pluginReads([plugin], element, buildCtx(canvas, { state }));

export const dependenciesOf = (
	plugin: ConnectorPlugin,
	element: GeneratedElement,
	canvas: CanvasElement[] = [],
) => mapValues(pluginDependencies([plugin], element, buildCtx(canvas)), "id");
