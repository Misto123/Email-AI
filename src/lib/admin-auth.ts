import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from './admin-session';

/**
 * Check if request has valid admin credentials
 * Supports both API key and session cookie
 */
export async function isAdminRequest(request: Request): Promise<boolean> {
  // Check API key header first
  const apiKey = request.headers.get("x-admin-key");
  const expectedApiKey = process.env.ADMIN_API_KEY;
  if (expectedApiKey && apiKey === expectedApiKey) {
    return true;
  }
  
  // Check session cookie from request headers (for API routes)
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const sessionToken = cookies[ADMIN_SESSION_COOKIE];
    if (sessionToken && isValidAdminSession(sessionToken)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Require admin authentication
 * Returns NextResponse with 401 if not authenticated
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const isAdmin = await isAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Valid admin session or API key required' },
      { status: 401 }
    );
  }
  return null;
}

/**
 * Admin API response helpers
 */
export function adminSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function adminError(message: string, status: number = 400, code?: string) {
  return NextResponse.json(
    { success: false, error: { message, code } },
    { status }
  );
}

/**
 * Wrap admin API handler with authentication
 */
export function withAdmin<Context = { params: Promise<Record<never, never>> }>(
  handler: (request: NextRequest, context: Context) => Promise<Response>
) {
  return async (request: NextRequest, context: Context): Promise<Response> => {
    const authError = await requireAdmin(request);
    if (authError) return authError;
    
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('Admin API error:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      return adminError(message, 500, 'INTERNAL_ERROR');
    }
  };
}

export function withAdminAuth<Context = { params: Promise<Record<never, never>> }>(
  handler: (request: NextRequest, context: Context) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: Context): Promise<NextResponse> => {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    try {
      return await handler(request, context);
    } catch (error) {
      console.error('Admin API error:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      return adminError(message, 500, 'INTERNAL_ERROR');
    }
  };
}
