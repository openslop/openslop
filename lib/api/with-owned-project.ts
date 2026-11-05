import { ownsProject } from "./projects";
import { notFound } from "./response";

/** A request may only name a project its caller can see: anyone else's is not there. */
export const withOwnedProject =
	<TContext extends { input: { projectId?: string } }>(
		handle: (ctx: TContext) => Promise<Response>,
	) =>
	async (ctx: TContext): Promise<Response> =>
		ctx.input.projectId && !(await ownsProject(ctx.input.projectId))
			? notFound()
			: handle(ctx);
