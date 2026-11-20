import { localBucket, localObjectUrl } from "@/lib/local-mode";
import { createServiceClient } from "@/lib/supabase/service";

const bucket = () => createServiceClient().storage.from(localBucket());

export type ObjectBody =
	| Buffer
	| ArrayBuffer
	| string
	| Blob
	| ReadableStream<Uint8Array>;

export async function putLocalObject(
	pathname: string,
	body: ObjectBody,
	{ contentType, overwrite }: { contentType: string; overwrite: boolean },
): Promise<string> {
	const { error } = await bucket().upload(pathname, body, {
		contentType,
		upsert: overwrite,
		duplex: "half",
	});
	if (error) throw new Error(`Failed to store ${pathname}: ${error.message}`);
	return localObjectUrl(pathname);
}

/** A token the browser uploads one file to `pathname` with, past the route body limit. */
export async function createLocalUploadToken(
	pathname: string,
): Promise<string> {
	const { data, error } = await bucket().createSignedUploadUrl(pathname);
	if (error) throw new Error(`Failed to sign ${pathname}: ${error.message}`);
	return data.token;
}
