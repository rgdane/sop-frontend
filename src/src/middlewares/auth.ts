import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/dashboard"];

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString("utf-8")
    );
    const exp = payload.exp;
    if (!exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return now >= exp;
  } catch (err) {
    return true;
  }
}

export function authMiddleware(
  req: NextRequest,
  res: NextResponse | null = null,
  next: () => NextResponse
) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  const isLoginPage = pathname === "/auth/login";

  // 1. Di login page + sudah ada token → redirect ke dashboard atau URL yang dituju
  if (isLoginPage && token) {
    const redirectUrl = req.nextUrl.searchParams.get("redirect");
    const destination = redirectUrl || "/dashboard";
    return NextResponse.redirect(new URL(destination, req.url));
  }

  // 2. Halaman protected + belum ada token → redirect ke login dengan menyimpan URL tujuan
  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return next();
}
