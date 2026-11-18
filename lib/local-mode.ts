import { requiredEnv } from "./env";

/** Set by `npm run local`: the hosted queue, blob store and Lambda give way to in-process and local Supabase stand-ins. */
export const isLocalMode = () => process.env.NEXT_PUBLIC_OPENSLOP_LOCAL === "1";

export const localBucket = () =>
	requiredEnv("NEXT_PUBLIC_LOCAL_BUCKET", process.env.NEXT_PUBLIC_LOCAL_BUCKET);

export const localObjectUrl = (pathname: string) =>
	`${requiredEnv("NEXT_PUBLIC_BLOB_URL", process.env.NEXT_PUBLIC_BLOB_URL)}/${pathname}`;
