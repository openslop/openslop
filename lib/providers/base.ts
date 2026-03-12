export abstract class BaseProvider<TParams = unknown, TResult = unknown> {
  abstract generate(params: TParams): Promise<TResult>;
}
