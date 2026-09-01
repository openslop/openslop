import { NextResponse } from "next/server";
import { ttsProviderFor } from "@/lib/api/providers";
import { byokProviderField } from "@/lib/api/request-schema-fields";
import { createSessionQueryRouteHandler } from "@/lib/api/route-handler";
import { voiceSearchParamsSchema } from "@/lib/project/types";

const schema = voiceSearchParamsSchema.extend({ provider: byokProviderField });

export const GET = createSessionQueryRouteHandler({
	schema,
	label: "Voice search",
	handle: async ({ user, input }) => {
		const { provider, ...params } = input;
		const tts = await ttsProviderFor({ userId: user.id, provider });
		return NextResponse.json({ voices: await tts.search(params) });
	},
});
