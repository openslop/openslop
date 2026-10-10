import type { CanvasElement } from "@/lib/canvas/types";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { ProjectDataSchema, type ProjectData } from "@/lib/project/store";
import type { BuildContext } from "../graph";

export const projectState = (
	videoSettings: Partial<ProjectData["videoSettings"]> = {},
	scriptSettings: Partial<ProjectData["scriptSettings"]> = {},
): ProjectData => ProjectDataSchema.parse({ videoSettings, scriptSettings });

export const buildCtx = (
	canvas: CanvasElement[] = [],
	{
		state = projectState(),
		registry = DEFAULT_CONNECTOR_REGISTRY,
	}: Partial<Omit<BuildContext, "canvas">> = {},
): BuildContext => ({ state, canvas, registry });

export const EMPTY_CONTEXT = buildCtx();
