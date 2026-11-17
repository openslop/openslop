import { randomUUID } from "node:crypto";
import { openAsBlob } from "node:fs";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
	openBrowser,
	renderMedia,
	selectComposition,
} from "@remotion/renderer";
import { putLocalObject } from "@/lib/api/local-storage";
import { requiredEnv } from "@/lib/env";
import { errorMessage } from "@/lib/errors";
import {
	LOCAL_RENDER_BUCKET,
	type RenderBackend,
	type RenderProgress,
	type RenderRequest,
} from "./render-api";
import { renderScale } from "./resolutions";
import { COMPOSITION_ID } from "./types";

// next dev loads each route's modules separately, so both render routes share this through globalThis
const renders = ((
	globalThis as { openslopRenders?: Map<string, RenderProgress> }
).openslopRenders ??= new Map());

export const localRender: RenderBackend = {
	// Returns at once; the render runs on and reports through `progress`
	start: async (request) => {
		const renderId = randomUUID();
		renders.set(renderId, { type: "progress", progress: 0 });
		render(renderId, request).catch((error) =>
			renders.set(renderId, { type: "error", message: errorMessage(error) }),
		);
		return { renderId, bucketName: LOCAL_RENDER_BUCKET };
	},

	progress: async ({ renderId }) =>
		renders.get(renderId) ?? { type: "error", message: "Unknown render" },
};

async function render(
	renderId: string,
	{ inputProps, resolution }: RenderRequest,
): Promise<void> {
	const serveUrl = requiredEnv(
		"REMOTION_SERVE_URL",
		process.env.REMOTION_SERVE_URL,
	);
	const browser = await openBrowser("chrome");
	const outputLocation = path.join(tmpdir(), `openslop-${renderId}.mp4`);
	try {
		const composition = await selectComposition({
			serveUrl,
			id: COMPOSITION_ID,
			inputProps,
			puppeteerInstance: browser,
		});
		await renderMedia({
			composition,
			serveUrl,
			codec: "h264",
			inputProps,
			scale: renderScale(resolution),
			outputLocation,
			puppeteerInstance: browser,
			onProgress: ({ progress }) =>
				renders.set(renderId, { type: "progress", progress }),
		});
		const video = await openAsBlob(outputLocation);
		const url = await putLocalObject(`renders/${renderId}/video.mp4`, video, {
			contentType: "video/mp4",
			overwrite: false,
		});
		renders.set(renderId, {
			type: "done",
			url: `${url}?download=video.mp4`,
			size: video.size,
		});
	} finally {
		await Promise.all([
			browser.close({ silent: true }),
			rm(outputLocation, { force: true }),
		]);
	}
}
