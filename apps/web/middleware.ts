import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = new URL(request.url);
  if (url.pathname === '/projects' || url.pathname.startsWith('/projects/')) {
    url.pathname = url.pathname.replace(/^\/projects/, '/project');
    return NextResponse.redirect(url, 308);
  }

  // Intentionally keep the /project hub free from implicit redirects.
  return NextResponse.next();
}

export const config = {
  matcher: ['/project', '/projects/:path*']
};
