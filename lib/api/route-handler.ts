import { NextRequest } from "next/server";
import { toError } from "@/lib/errors";
import { badRequest, serverError } from "./response";
import { logger } from "./logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RequestBody = any;

type RouteOptions<T> = {
	models: Record<string, string>;
	getProvider: () => T;
	label: string;
	extraValidation?: (body: RequestBody) => Response | null;
	handle: (provider: T, body: RequestBody) => Promise<Response>;
};

export function createRouteHandler<T>(options: RouteOptions<T>) {
	return async function POST(request: NextRequest) {
		try {
			const body = await request.json();
			const { prompt, model } = body;

			if (!prompt || typeof prompt !== "string") {
				logger.warn(`${options.label}: prompt is required`);
				return badRequest("prompt is required");
			}
			if (model) {
				const slug = options.models[model];
				if (!slug) {
					logger.warn(`${options.label}: invalid model "${model}"`);
					return badRequest(
						`Invalid model. Supported: ${Object.keys(options.models).join(", ")}`,
					);
				}
				body.model = slug;
			}

			if (options.extraValidation) {
				const validationError = options.extraValidation(body);
				if (validationError) {
					logger.warn(`${options.label}: validation failed`);
					return validationError;
				}
			}

			const provider = options.getProvider();
			return await options.handle(provider, body);
		} catch (error) {
			logger.error(error, `${options.label} failed`);
			return serverError(`${options.label} failed: ${toError(error).message}`);
		}
	};
}
