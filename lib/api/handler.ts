import { NextRequest, NextResponse } from "next/server";
import { badRequest, serverError } from "./response";
import { logger } from "./logger";

type ValidationRule<T> = {
  field: keyof T;
  required?: boolean;
  type?: "string" | "number" | "boolean";
  validator?: (value: unknown) => string | null;
};

type HandlerOptions<TBody, TResult> = {
  validations: ValidationRule<TBody>[];
  handler: (body: TBody) => Promise<TResult>;
  errorMessage: string;
  streamHandler?: (
    body: TBody,
  ) => AsyncGenerator<unknown, void, unknown> | ReadableStream;
};

export function createApiHandler<TBody extends Record<string, unknown>, TResult>(
  options: HandlerOptions<TBody, TResult>,
) {
  return async (request: NextRequest) => {
    try {
      const body = (await request.json()) as TBody;

      // Run validations
      for (const rule of options.validations) {
        const value = body[rule.field];

        if (rule.required && (value === undefined || value === null)) {
          return badRequest(`${String(rule.field)} is required`);
        }

        if (
          value !== undefined &&
          rule.type &&
          typeof value !== rule.type &&
          !(rule.type === "string" && typeof value === "string")
        ) {
          return badRequest(
            `${String(rule.field)} must be a ${rule.type}`,
          );
        }

        if (rule.validator && value !== undefined) {
          const error = rule.validator(value);
          if (error) return badRequest(error);
        }
      }

      // Handle streaming if requested and supported
      if (
        body.stream &&
        options.streamHandler
      ) {
        const encoder = new TextEncoder();
        const streamSource = options.streamHandler(body);

        const readable = new ReadableStream({
          async start(controller) {
            try {
              if (Symbol.asyncIterator in streamSource) {
                for await (const chunk of streamSource as AsyncGenerator) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`),
                  );
                }
              }
              controller.close();
            } catch (error) {
              logger.error(error, `${options.errorMessage} (stream)`);
              controller.error(error);
            }
          },
        });

        return new Response(readable, {
          headers: {
            "content-type": "text/event-stream",
            "cache-control": "no-cache",
            connection: "keep-alive",
          },
        });
      }

      // Handle normal request
      const result = await options.handler(body);
      return NextResponse.json(result);
    } catch (error) {
      logger.error(error, options.errorMessage);
      return serverError(options.errorMessage);
    }
  };
}

// Helper to create model validator
export function createModelValidator(models: readonly string[]) {
  return (value: unknown) => {
    if (typeof value !== "string" || !models.includes(value)) {
      return `Invalid model. Supported: ${models.join(", ")}`;
    }
    return null;
  };
}
