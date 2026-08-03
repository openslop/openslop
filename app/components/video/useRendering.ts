"use client";

import { useCallback, useState } from "react";
import { errorMessage } from "@/lib/errors";
import { runRender } from "@/lib/video/render-client";
import type { VideoLayout } from "@/lib/video/types";

type RenderState =
	| { status: "idle" }
	| { status: "invoking" }
	| { status: "rendering"; progress: number }
	| { status: "done"; url: string; size: number }
	| { status: "error"; message: string };

export function useRendering() {
	const [state, setState] = useState<RenderState>({ status: "idle" });

	const render = useCallback(async (layout: VideoLayout, scale?: number) => {
		setState({ status: "invoking" });
		try {
			for await (const update of runRender(layout, scale)) setState(update);
		} catch (err) {
			setState({ status: "error", message: errorMessage(err) });
		}
	}, []);

	const reset = useCallback(() => setState({ status: "idle" }), []);

	return { state, render, reset };
}
