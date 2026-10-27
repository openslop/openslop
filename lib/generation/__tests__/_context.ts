import type { CanvasElement } from "@/lib/canvas/types";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { ProjectDataSchema, type ProjectStore } from "@/lib/project/store";
import { buildSettings, type BuildContext } from "../graph";

export const projectSettings = (
	overrides: Partial<BuildContext["settings"]> = {},
): BuildContext["settings"] => ({
	...buildSettings(ProjectDataSchema.parse({})),
	...overrides,
});

export const buildCtx = (
	canvas: CanvasElement[] = [],
	{
		settings = projectSettings(),
		registry = DEFAULT_CONNECTOR_REGISTRY,
	}: Partial<Omit<BuildContext, "canvas">> = {},
): BuildContext => ({ settings, canvas, registry });

export const storeCtx = (
	store: ProjectStore,
	canvas: CanvasElement[] = [],
): BuildContext =>
	buildCtx(canvas, { settings: buildSettings(store.getState()) });

export const EMPTY_CONTEXT = buildCtx();
