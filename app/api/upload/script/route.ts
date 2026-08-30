import { NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import { z } from "zod";
import { pdfFile } from "@/lib/api/request-schema-fields";
import { badRequest } from "@/lib/api/response";
import { createSessionFormRouteHandler } from "@/lib/api/route-handler";
import { MAX_SCRIPT_UPLOAD_BYTES } from "@/lib/upload/scriptPdf";

const UploadScriptForm = z.object(
	{ file: pdfFile(MAX_SCRIPT_UPLOAD_BYTES) },
	{ error: "No file provided" },
);

export const POST = createSessionFormRouteHandler({
	schema: UploadScriptForm,
	label: "upload/script",
	handle: async ({ input: { file } }) => {
		const pdf = await getDocumentProxy(
			new Uint8Array(await file.arrayBuffer()),
		);
		const { text } = await extractText(pdf, { mergePages: true });
		const script = text.trim();
		if (!script)
			return badRequest(
				"No text found in that PDF. Scanned or image-only pages can't be read.",
			);
		return NextResponse.json({ text: script });
	},
});
