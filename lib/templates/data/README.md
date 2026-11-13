Each template has three files:

- `template.json`: display metadata and project seeds, parsed by `TemplateSchema` in `../templates.ts`. Image fields are asset names under the public Blob store's `/assets/upload/template/` directory.
- `system-prompt.md`: instructions for script generation.
- `example.md`: the example story used to build the script prompt.

Register new metadata in `../templates.ts` and statically import its Markdown in `../prompts.ts`. Client components import only `templates.ts`; script generation loads the prompt builder on demand, which imports `prompts.ts`.

Markdown is imported as raw text by Next.js and Vitest. Remotion does not import template data. Template prose is trimmed at load.
