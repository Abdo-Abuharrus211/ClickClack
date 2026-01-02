import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  const url = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  // console.log(`Middleware Request.cookies: ${request.cookies}`);
  console.log(`Middleware req Token value: ${token}`);

  // Allow auth routes and static assets (/_next, /favicon.ico) without token
  if (
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Redirect to home if no token and not already on home page
  if (!token && url.pathname !== '/') {
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (url.pathname === '/profile/admin') {
    if (!token) {
      url.pathname = 'error/forbidden/';
      return NextResponse.redirect(url);
    }

    try {
      const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
      const { payload } = await jwtVerify(token, SECRET_KEY);

      if (!payload.isAdmin) {
        url.pathname = '/auth/login';
        return NextResponse.redirect(url);
      }

      // return NextResponse.redirect(NextResponse.rewrite(url));
    } catch (err) {
      console.error('JWT verification failed:', err);
      url.pathname = 'error/forbidden/';
      return NextResponse.redirect(url);
    }
  }

  // Profile route protection
  if (url.pathname === '/profile') {
    if (!token) {
      url.pathname = 'error/forbidden/';
      return NextResponse.redirect(url);
    }

    try {
      const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
      const { payload } = await jwtVerify(token, SECRET_KEY);

      if (payload.isAdmin) {
        url.pathname = '/profile/admin';
      } else {
        url.pathname = '/profile/user';
      }

      // return NextResponse.redirect(NextResponse.rewrite(url));
      return NextResponse.redirect(url);
    } catch (err) {
      console.error('JWT verification failed:', err);
      url.pathname = 'error/forbidden/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};


/**
 * import { NextResponse } from 'next/server';

export async function middleware(request) {
  const url = request.nextUrl.clone();
  const protectedRoutes = ['/profile/admin', '/profile/user', '/typing/test'];

  // Check if the route is protected
  if (protectedRoutes.some((route) => url.pathname.startsWith(route))) {
    try {
      // Call the /auth/me endpoint to validate the user
      const response = await fetch('https://api.clickclack.aabuharrus.dev/api/v1/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include HTTP-only cookies
      });

      if (!response.ok) {
        // If the user is not authenticated, redirect to the home page
        url.pathname = '/';
        return NextResponse.redirect(url);
      }

      const authRes = await response.json();

      // Redirect based on user role
      if (url.pathname.startsWith('/profile/admin') && !authRes.data.isAdmin) {
        url.pathname = 'error/forbidden/'; // Forbidden page for non-admins
        return NextResponse.redirect(url);
      }

      if (url.pathname.startsWith('/profile/user') && authRes.data.isAdmin) {
        url.pathname = '/profile/admin'; // Redirect admin to admin profile
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Client Middleware error validating user:', error);
      url.pathname = '/';
      return NextResponse.redirect(url); // Redirect to home on error
    }
  }

  return NextResponse.next(); // Allow navigation for non-protected routes
}

export const config = {
  matcher: ['/profile/:path*', '/typing/test'], // Match protected routes
};
  
 */