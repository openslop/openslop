import { NextResponse, type NextRequest } from "next/server";
import { AssetBundle } from "@/lib/api/asset-bundle";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
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

	const buffer = Buffer.from(await file.arrayBuffer());
	const response = await AssetBundle.upload("upload", "user", [
		{
			key: "image",
			filename: file.name,
			data: buffer,
			contentType: file.type,
		},
	]);

	const url = `${AssetBundle.buildUrl("upload", "user", response.id)}/${encodeURIComponent(file.name)}`;
	return NextResponse.json({ url });
}
