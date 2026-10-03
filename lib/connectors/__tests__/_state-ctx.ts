import type { ScriptElement } from "@/lib/canvas/types";
import { DEFAULT_MODELS } from "@/lib/connectors/models";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import type {
	ConnectorPlugin,
	ModelRef,
	PluginContext,
} from "@/lib/connectors/types";
import type {
	DependencyDeclaration,
	DependencyResults,
} from "@/lib/generation/dependency";
import type { BuildContext } from "@/lib/generation/graph";
import type { ProjectData } from "@/lib/project/store";
import { VideoSettingsSchema } from "@/lib/project/videoSettings";

export const projectState = (
	videoSettings: Partial<ProjectData["videoSettings"]> = {},
): ProjectData => ({ videoSettings: VideoSettingsSchema.parse(videoSettings) });

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
	model = DEFAULT_MODELS.tts,
}: {
	reads?: Record<string, string>;
	dependencies?: DependencyResults;
	model?: ModelRef;
} = {}): PluginContext => ({ reads, dependencies, model });

export const readsOf = (
	plugin: Pick<ConnectorPlugin, "reads">,
	element: ScriptElement,
	canvas: ScriptElement[] = [],
	state?: ProjectData,
) => plugin.reads?.(element, buildCtx(canvas, { state })) ?? {};

export const edgesOf = (
	declaration: DependencyDeclaration,
	element: ScriptElement,
	canvas: ScriptElement[] = [],
) =>
	declaration
		.edges(element, buildCtx(canvas))
		.map(([key, target, label]) => [key, target.id, label]);
