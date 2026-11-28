import { handleMcp } from "@/lib/agent/mcp/server";
import { localOnly } from "@/lib/api/local-only";

export const POST = localOnly(handleMcp);
