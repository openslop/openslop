import { NextResponse } from "next/server";
import { z } from "zod";
import { isLocalMode } from "@/lib/local-mode";
import {
	LocalUploadGrant,
	LocalUploadRequest,
	UPLOAD_KINDS,
	UPLOAD_PATHNAME,
	type UploadKind,
} from "@/lib/upload/upload-files";
import { createLocalUploadToken } from "./local-storage";
import { createSessionRouteHandler } from "./route-handler";

const ClientTokenRequestSchema = z.object({
	type: z.literal("blob.generate-client-token"),
	payload: z.object({
		pathname: z.string().regex(UPLOAD_PATHNAME, "Invalid upload path"),
		clientPayload: z.string().nullable(),
		multipart: z.boolean(),
	}),
});

/** Lets the browser upload a file of `kind` straight to the blob store, past the function body limit. */
export const createUploadRoute = (kind: UploadKind) =>
	isLocalMode() ? createLocalUploadRoute(kind) : createBlobUploadRoute(kind);

const createLocalUploadRoute = (kind: UploadKind) =>
	createSessionRouteHandler({
		schema: LocalUploadRequest,
		label: `upload/${kind}`,
		handle: async ({ input }) =>
			NextResponse.json<LocalUploadGrant>({
				token: await createLocalUploadToken(input.pathname),
			}),
	});

const createBlobUploadRoute = (kind: UploadKind) =>
	createSessionRouteHandler({
		schema: ClientTokenRequestSchema,
		label: `upload/${kind}`,
		handle: async ({ input, request }) => {
			const { handleUpload } = await import("@vercel/blob/client");
			const response = await handleUpload({
				body: input,
				request,
				onBeforeGenerateToken: async () => ({
					allowedContentTypes: [...UPLOAD_KINDS[kind].contentTypes],
					maximumSizeInBytes: UPLOAD_KINDS[kind].maxBytes,
					addRandomSuffix: false,
				}),
			});
			return NextResponse.json(response);
		},
	});
