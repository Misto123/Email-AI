import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SITE_PASSWORD = 'rereeu';

export function middleware(request: NextRequest) {
  // Skip password check for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const authCookie = request.cookies.get('site_auth');
  
  if (authCookie?.value === SITE_PASSWORD) {
    return NextResponse.next();
  }

  // Check if this is a login attempt
  const password = request.nextUrl.searchParams.get('password');
  
  if (password === SITE_PASSWORD) {
    const response = NextResponse.redirect(new URL(request.nextUrl.pathname, request.url));
    response.cookies.set('site_auth', SITE_PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
    return response;
  }

  // Show login page
  return new NextResponse(
    `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Login Required</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      width: 100%;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 8px;
      color: #1a202c;
    }
    p {
      color: #718096;
      margin-bottom: 24px;
      font-size: 14px;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    input {
      padding: 12px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.2s;
    }
    input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    button {
      padding: 12px 16px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    button:hover {
      background: #5a67d8;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    button:active {
      transform: translateY(0);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔐 Login Required</h1>
    <p>Enter the password to access this site.</p>
    <form method="get">
      <input 
        type="password" 
        name="password" 
        placeholder="Enter password" 
        required 
        autofocus
      >
      <button type="submit">Login</button>
    </form>
  </div>
</body>
</html>`,
    {
      status: 401,
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
