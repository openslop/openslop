import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stringifyError } from "../errors";
import { getUser } from "./auth";
import { badRequest, serverError, unauthorized } from "./response";
import { logger } from "./logger";

type RouteOptions<
	TSchema extends z.ZodType,
	TProvider extends {
		generate: (params: z.infer<TSchema>) => Promise<unknown>;
	},
> = {
	schema: TSchema;
	getProvider: () => TProvider;
	label: string;
	handle?: (provider: TProvider, body: z.infer<TSchema>) => Promise<Response>;
};

export function createRouteHandler<
	TSchema extends z.ZodType,
	TProvider extends {
		generate: (params: z.infer<TSchema>) => Promise<unknown>;
	},
>(options: RouteOptions<TSchema, TProvider>) {
	const handle =
		options.handle ??
		(async (provider, body) =>
			NextResponse.json(await provider.generate(body)));

	return async function POST(request: NextRequest) {
		try {
			const user = await getUser();
			if (!user) return unauthorized();

			const parsed = options.schema.safeParse(await request.json());
			if (!parsed.success) {
				const message =
					parsed.error.issues[0]?.message ?? "Invalid request body";
				logger.warn(`${options.label}: ${message}`);
				return badRequest(message);
			}
			return await handle(options.getProvider(), parsed.data);
		} catch (error) {
			logger.error(error, `${options.label} failed`);
			return serverError(`${options.label} failed: ${stringifyError(error)}`);
		}
	};
}

export function modelField(models: Record<string, string>) {
	const names = Object.keys(models);
	return z
		.string()
		.optional()
		.refine((v) => v === undefined || names.includes(v), {
			message: `Invalid model. Supported: ${names.join(", ")}`,
		})
		.transform((v) => (v === undefined ? undefined : models[v]));
}

export function bodySchema<TShape extends z.ZodRawShape>(
	models: Record<string, string>,
	shape: TShape,
) {
	return z.object(
		{
			prompt: z.string({ error: "prompt is required" }).min(1, {
				message: "prompt is required",
			}),
			model: modelField(models),
			...shape,
		},
		"Request body must be a JSON object",
	);
}
