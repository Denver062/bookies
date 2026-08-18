import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedPaths = ["/notes/new", "/favorites", "/folders", "/profile"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (pathname.startsWith("/notes/")) {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 3 && segments[2] === "edit") {
      // /notes/[id]/edit — protected
    } else if (segments.length === 2 && segments[1] === "new") {
      // /notes/new — handled by protectedPaths
    } else if (segments.length === 2 && segments[2] !== undefined) {
      // /notes/[id] — public
    }
  }

  if (isProtected && !user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // /notes/[id]/edit is also protected
  if (pathname.match(/^\/notes\/[^/]+\/edit/) && !user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/notes/new/:path*",
    "/notes/:id/edit/:path*",
    "/favorites/:path*",
    "/folders/:path*",
    "/profile/:path*",
    "/books/:path*",
  ],
};
