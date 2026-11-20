import { isLocalMode } from "@/lib/local-mode";
import type { RenderBackend } from "./render-api";

// Imported lazily so a hosted server never loads @remotion/renderer, and local mode never loads Lambda
export const renderBackend = async (): Promise<RenderBackend> =>
	isLocalMode()
		? (await import("./local-render")).localRender
		: (await import("./lambda-render")).lambdaRender;
