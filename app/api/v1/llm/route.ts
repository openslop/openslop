import { getLLMProvider } from "@/lib/api/providers";
import { LLM_MODELS } from "@/lib/connectors/llm/openslop/models";
import { createApiHandler, createModelValidator } from "@/lib/api/handler";

export const POST = createApiHandler({
  validations: [
    { field: "prompt", required: true, type: "string" },
    { field: "model", validator: createModelValidator(LLM_MODELS) },
  ],
  handler: async (body) => {
    const provider = getLLMProvider();
    return provider.generate({
      prompt: body.prompt as string,
      model: body.model as string | undefined,
      systemPrompt: body.systemPrompt as string | undefined,
      maxTokens: body.maxTokens as number | undefined,
      temperature: body.temperature as number | undefined,
    });
  },
  streamHandler: (body) => {
    const provider = getLLMProvider();
    return provider.stream({
      prompt: body.prompt as string,
      model: body.model as string | undefined,
      systemPrompt: body.systemPrompt as string | undefined,
      maxTokens: body.maxTokens as number | undefined,
      temperature: body.temperature as number | undefined,
    });
  },
  errorMessage: "LLM generation failed",
});
