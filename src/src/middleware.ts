import type { NextRequest } from "next/server";
import { applyMiddleware } from "./middlewares";
import { authMiddleware } from "./middlewares/auth";
import { RedirectDashboard } from "./middlewares/redirect";

export function middleware(request: NextRequest) {
  return applyMiddleware(request, [authMiddleware, RedirectDashboard]);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
