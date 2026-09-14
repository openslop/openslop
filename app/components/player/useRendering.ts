"use client";

import { useCallback, useState } from "react";
import { errorMessage } from "@/lib/errors";
import { runRender, type RenderUpdate } from "@/lib/render/render-client";
import type { RenderLayout } from "@/lib/render/types";

type RenderState =
	| { status: "idle" }
	| { status: "invoking" }
	| RenderUpdate
	| { status: "error"; message: string };

export function useRendering() {
	const [state, setState] = useState<RenderState>({ status: "idle" });

	const render = useCallback(async (layout: RenderLayout, scale?: number) => {
		setState({ status: "invoking" });
		try {
			for await (const update of runRender(layout, scale)) setState(update);
		} catch (error) {
			setState({ status: "error", message: errorMessage(error) });
		}
	}, []);

	const reset = useCallback(() => setState({ status: "idle" }), []);

	return { state, render, reset };
}
