import type { CanvasElement, GeneratedElement } from "@/lib/canvas/types";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import type {
	AssetResult,
	ConnectorPlugin,
	PluginContext,
} from "@/lib/connectors/types";
import {
	pluginDependencies,
	pluginReads,
} from "@/lib/generation/generationGraph";
import type { BuildContext } from "@/lib/generation/graph";
import { ProjectDataSchema, type ProjectData } from "@/lib/project/store";

export const projectState = (
	videoSettings: Partial<ProjectData["videoSettings"]> = {},
	scriptSettings: Partial<ProjectData["scriptSettings"]> = {},
): ProjectData => ProjectDataSchema.parse({ videoSettings, scriptSettings });

export const buildCtx = (
	canvas: CanvasElement[] = [],
	{
		state = projectState(),
		setAsset = () => {},
	}: Partial<Pick<BuildContext, "state" | "setAsset">> = {},
): BuildContext => ({
	state,
	canvas,
	registry: DEFAULT_CONNECTOR_REGISTRY,
	setAsset,
});

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
) =>
	Object.fromEntries(
		pluginDependencies([plugin], element, buildCtx(canvas)).map(
			([label, { id }]) => [label, id],
		),
	);
