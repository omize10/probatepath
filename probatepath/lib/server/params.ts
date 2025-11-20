export type HandlerContext<P extends Record<string, string>> =
  | { params: P }
  | { params: Promise<P> };

export async function resolveContextParams<P extends Record<string, string>>(context: HandlerContext<P>) {
  return await context.params;
}
