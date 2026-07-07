// Public Vercel Blob store hosting committed mock/template fixtures. Defaults
// to the repo's committed public bucket (not NEXT_PUBLIC_BLOB_URL, which is
// each deployer's own store) so these fixtures resolve regardless of env;
// override via NEXT_PUBLIC_MOCK_BLOB_URL only if you need your own fixtures.
export const BLOB_BASE_URL =
	process.env.NEXT_PUBLIC_MOCK_BLOB_URL ??
	"https://mqzeech9ugknls54.public.blob.vercel-storage.com";
