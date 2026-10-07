import type { ScriptElement } from "@/lib/canvas/types";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import type { ConnectorPlugin, PluginContext } from "@/lib/connectors/types";
import mapValues from "lodash/mapValues";
import type { DependencyResults } from "@/lib/generation/dependency";
import type { BuildContext } from "@/lib/generation/graph";
import { ProjectDataSchema, type ProjectData } from "@/lib/project/store";

export const projectState = (
	videoSettings: Partial<ProjectData["videoSettings"]> = {},
	scriptSettings: Partial<ProjectData["scriptSettings"]> = {},
): ProjectData => ProjectDataSchema.parse({ videoSettings, scriptSettings });

export const buildCtx = (
	canvas: ScriptElement[] = [],
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
	dependencies?: DependencyResults;
} = {}): PluginContext => ({ reads, dependencies });

export const readsOf = (
	plugin: Pick<ConnectorPlugin, "reads">,
	element: ScriptElement,
	canvas: ScriptElement[] = [],
	state?: ProjectData,
) => plugin.reads?.(element, buildCtx(canvas, { state })) ?? {};

export const dependenciesOf = (
	plugin: Pick<ConnectorPlugin, "dependencies">,
	element: ScriptElement,
	canvas: ScriptElement[] = [],
) =>
	mapValues(
		plugin.dependencies?.(element, buildCtx(canvas)) ?? {},
		({ id }) => id,
	);
