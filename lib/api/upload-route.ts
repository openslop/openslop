import { NextResponse } from "next/server";
import { z } from "zod";
import type { UploadKind } from "@/lib/upload/upload-files";
import { AssetBundle } from "./asset-bundle";
import { uploadedFile } from "./request-schema-fields";
import { createSessionFormRouteHandler } from "./route-handler";

function sanitizeFilename(name: string): string {
	const base = name.split(/[\\/]/).pop() ?? "";
	const cleaned = base.replace(/[^A-Za-z0-9._-]/g, "_").replace(/^\.+/, "");
	return cleaned.slice(0, 200) || "upload";
}

/** Stores a user's own file of `kind` and answers with its URL. */
export const createUploadRoute = (kind: UploadKind) =>
	createSessionFormRouteHandler({
		schema: z.object(
			{ file: uploadedFile(kind) },
			{ error: "No file provided" },
		),
		label: `upload/${kind}`,
		handle: async ({ input: { file } }) => {
			const response = await AssetBundle.upload("upload", "user", [
				{
					key: kind,
					filename: sanitizeFilename(file.name),
					data: Buffer.from(await file.arrayBuffer()),
					contentType: file.type,
				},
			]);

			const url = AssetBundle.fromResponse(response).resolve(kind);
			return NextResponse.json({ url });
		},
	});
