export const runtime = "nodejs";
export const maxDuration = 800;

import {
	addBundleToSandbox,
	createSandbox,
	renderMediaOnVercel,
	uploadToVercelBlob,
} from "@remotion/vercel";
import { getUser } from "@/lib/api/auth";
import { logger } from "@/lib/api/logger";
import { unauthorized } from "@/lib/api/response";
import { createSSEResponse, type SSEMessage } from "@/lib/api/sse";
import { stringifyError } from "@/lib/errors";
import { COMPOSITION_ID } from "@/lib/video/types";
import { bundleRemotionProject } from "./helpers";
import { restoreSnapshot } from "./restore-snapshot";

const STAGE_LABELS: Record<string, string> = {
	"opening-browser": "Opening browser...",
	"selecting-composition": "Selecting composition...",
	"render-progress": "Rendering video...",
};

export async function POST(req: Request) {
	const user = await getUser();
	if (!user) return unauthorized();

	const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
	if (!blobToken) {
		logger.error("render: BLOB_READ_WRITE_TOKEN is not set");
		return new Response(
			JSON.stringify({ error: "BLOB_READ_WRITE_TOKEN is not set" }),
			{ status: 500 },
		);
	}

	let payload: { inputProps?: unknown };
	try {
		payload = await req.json();
	} catch {
		logger.warn("render: invalid JSON body");
		return new Response(JSON.stringify({ error: "Invalid JSON" }), {
			status: 400,
		});
	}

	if (!payload.inputProps) {
		logger.warn("render: missing inputProps");
		return new Response(JSON.stringify({ error: "Missing inputProps" }), {
			status: 400,
		});
	}

	return createSSEResponse(async (send) => {
		try {
			await send({ type: "phase", phase: "Creating sandbox...", progress: 0 });

			const sandbox = process.env.VERCEL
				? await restoreSnapshot()
				: await createSandbox({
						resources: { vcpus: 8 },
						timeoutInMilliseconds: 120 * 60 * 1000,
						onProgress: async ({ progress, message }) => {
							await send({
								type: "phase",
								phase: message,
								progress,
								subtitle: "This is only needed during development.",
							} satisfies SSEMessage);
						},
					});

			try {
				if (!process.env.VERCEL) {
					bundleRemotionProject(".remotion");
					await addBundleToSandbox({ sandbox, bundleDir: ".remotion" });
				}

				const { sandboxFilePath, contentType } = await renderMediaOnVercel({
					concurrency: "50%",
					sandbox,
					compositionId: COMPOSITION_ID,
					inputProps: payload.inputProps as Record<string, unknown>,
					onProgress: async (update) => {
						const label = STAGE_LABELS[update.stage];
						if (label) {
							await send({
								type: "phase",
								phase: label,
								progress: update.overallProgress,
							});
						}
					},
				});

				await send({
					type: "phase",
					phase: "Uploading video...",
					progress: 1,
				});

				const { url, size } = await uploadToVercelBlob({
					sandbox,
					sandboxFilePath,
					contentType,
					blobToken,
					access: "public",
				});

				await send({ type: "done", url, size });
			} finally {
				await sandbox?.stop().catch(() => {});
			}
		} catch (err) {
			logger.error(err, "render: failed");
			await send({
				type: "error",
				message: stringifyError(err),
			});
		}
	});
}
