// middleware/index.ts
import { NextRequest, NextResponse } from "next/server";

type MiddlewareFn = (
  req: NextRequest,
  res: NextResponse | null,
  next: () => NextResponse
) => NextResponse;

export function applyMiddleware(req: NextRequest, middlewares: MiddlewareFn[]) {
  let i = 0;

  const next = (): NextResponse => {
    const middleware = middlewares[i++];
    return middleware ? middleware(req, null, next) : NextResponse.next();
  };

  return next();
}
