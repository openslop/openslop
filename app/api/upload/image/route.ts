import { NextResponse } from "next/server";
import { z } from "zod";
import { AssetBundle } from "@/lib/api/asset-bundle";
import { imageFile } from "@/lib/api/request-schema-fields";
import { createSessionFormRouteHandler } from "@/lib/api/route-handler";
import { MAX_IMAGE_UPLOAD_BYTES } from "@/lib/upload/imageFiles";

const UploadImageForm = z.object(
	{ file: imageFile(MAX_IMAGE_UPLOAD_BYTES) },
	{ error: "No file provided" },
);

function sanitizeFilename(name: string): string {
	const base = name.split(/[\\/]/).pop() ?? "";
	const cleaned = base.replace(/[^A-Za-z0-9._-]/g, "_").replace(/^\.+/, "");
	return cleaned.slice(0, 200) || "upload";
}

export const POST = createSessionFormRouteHandler({
	schema: UploadImageForm,
	label: "upload/image",
	handle: async ({ input: { file } }) => {
		const filename = sanitizeFilename(file.name);
		const buffer = Buffer.from(await file.arrayBuffer());
		const response = await AssetBundle.upload("upload", "user", [
			{
				key: "image",
				filename,
				data: buffer,
				contentType: file.type,
			},
		]);

		const url = AssetBundle.fromResponse(response).resolve("image");
		return NextResponse.json({ url });
	},
});
