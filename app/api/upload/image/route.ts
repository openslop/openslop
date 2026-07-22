import { NextResponse, type NextRequest } from "next/server";
import { AssetBundle } from "@/lib/api/asset-bundle";
import { badRequest } from "@/lib/api/response";
import { withSession } from "@/lib/api/with-auth";

const MAX_SIZE = 10 * 1024 * 1024;

function sanitizeFilename(name: string): string {
	const base = name.split(/[\\/]/).pop() ?? "";
	const cleaned = base.replace(/[^A-Za-z0-9._-]/g, "_").replace(/^\.+/, "");
	return cleaned.slice(0, 200) || "upload";
}

export function POST(request: NextRequest) {
	return withSession("upload/image", async () => {
		let formData: FormData;
		try {
			formData = await request.formData();
		} catch {
			return badRequest("Invalid form data");
		}
		const file = formData.get("file");

		if (!(file instanceof File)) return badRequest("No file provided");
		if (!file.type.startsWith("image/")) {
			return badRequest("File must be an image");
		}
		if (file.size > MAX_SIZE) return badRequest("File must be under 10 MB");

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

		const url = `${AssetBundle.buildUrl("upload", "user", response.id)}/${encodeURIComponent(filename)}`;
		return NextResponse.json({ url });
	});
}
