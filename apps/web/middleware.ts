import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  // Intentionally keep the /project hub free from implicit redirects.
  return NextResponse.next();
}

export const config = {
  matcher: ['/project']
};
