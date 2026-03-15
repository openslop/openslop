import { NextRequest, NextResponse } from "next/server";
import { badRequest, serverError } from "./response";
import { validateModel } from "./validate-model";
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

      if (!prompt || typeof prompt !== "string")
        return badRequest("prompt is required");
      const modelError = validateModel(model, options.models);
      if (modelError) return modelError;

      if (options.extraValidation) {
        const validationError = options.extraValidation(body);
        if (validationError) return validationError;
      }

      const provider = options.getProvider();
      return await options.handle(provider, body);
    } catch (error) {
      logger.error(error, `${options.label} failed`);
      return serverError(`${options.label} failed`);
    }
  };
}

export function jsonResponse(data: unknown) {
  return NextResponse.json(data);
}

export function audioResponse(buffer: ArrayBuffer) {
  return new Response(buffer, {
    headers: { "content-type": "audio/mpeg" },
  });
}
