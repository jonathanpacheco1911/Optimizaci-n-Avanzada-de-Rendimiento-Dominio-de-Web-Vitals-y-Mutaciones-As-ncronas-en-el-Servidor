import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

// Next.js 16: "proxy" reemplaza al antiguo "middleware".
// Primera barrera: redirige antes de renderizar. La validez real del token
// la comprueba la API (401) y cada página protegida.
export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const { pathname, search } = request.nextUrl;

  const isProtected = pathname.startsWith("/orders") || pathname.startsWith("/checkout");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (isAuthPage && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/products";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/orders/:path*", "/checkout/:path*", "/login", "/register"],
};
