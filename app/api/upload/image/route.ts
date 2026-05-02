import { NextResponse, type NextRequest } from "next/server";
import { AssetBundle } from "@/lib/api/asset-bundle";
import { getUser } from "@/lib/api/auth";
import { unauthorized } from "@/lib/api/response";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function sanitizeFilename(name: string): string {
	const base = name.split(/[\\/]/).pop() ?? "";
	const cleaned = base.replace(/[^A-Za-z0-9._-]/g, "_").replace(/^\.+/, "");
	return cleaned.slice(0, 200) || "upload";
}

export async function POST(request: NextRequest) {
	const user = await getUser();
	if (!user) return unauthorized();

	const formData = await request.formData();
	const file = formData.get("file");

	if (!(file instanceof File)) {
		return NextResponse.json({ error: "No file provided" }, { status: 400 });
	}

	if (!file.type.startsWith("image/")) {
		return NextResponse.json(
			{ error: "File must be an image" },
			{ status: 400 },
		);
	}

	if (file.size > MAX_SIZE) {
		return NextResponse.json(
			{ error: "File must be under 10 MB" },
			{ status: 400 },
		);
	}

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
}
