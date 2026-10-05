import { NextResponse, type NextRequest } from "next/server";
import { clearSession } from "@/lib/session";

// Route Handler: limpia la cookie cuando la API responde 401 (token vencido/revocado).
export async function GET(request: NextRequest) {
  await clearSession();
  return NextResponse.redirect(new URL("/login?expired=1", request.url));
}
