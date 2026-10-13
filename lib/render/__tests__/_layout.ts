import { VideoSettingsSchema } from "@/lib/project/video-settings";
import { buildRenderLayout, type BuildLayoutOptions } from "../scene-builder";
import type { RenderLayout, ResolvedElement } from "../types";

/** A layout under the project's default settings, each overridable. */
export const layoutOf = (
	elements: ResolvedElement[],
	options?: Partial<BuildLayoutOptions>,
): RenderLayout =>
	buildRenderLayout(elements, { ...VideoSettingsSchema.parse({}), ...options });
