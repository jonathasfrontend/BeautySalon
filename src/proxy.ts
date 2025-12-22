import { NextResponse, type NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

const PUBLIC_ROUTES = ['/login'];
const LOGIN_ROUTE = '/login';
const DASHBOARD_ROUTE = '/dashboard';

export default function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const authToken = request.cookies.get('auth_token');
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    // Rota pública sem autenticação -> Permite
    if (!authToken && isPublicRoute) {
        return NextResponse.next();
    }

    // Rota privada sem autenticação -> Redireciona para login
    if (!authToken && !isPublicRoute) {
        return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
    }

    // Rota pública com autenticação (ex: /login) -> Redireciona para dashboard
    if (authToken && isPublicRoute) {
        return NextResponse.redirect(new URL(DASHBOARD_ROUTE, request.url));
    }

    // Rota privada com autenticação -> Valida token
    if (authToken && !isPublicRoute) {
        try {
            const decoded: { exp: number } = jwtDecode(authToken.value);
            
            // Token expirado -> Limpa e redireciona
            if (decoded.exp < Date.now() / 1000) {
                const response = NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
                response.cookies.delete('auth_token');
                return response;
            }

            return NextResponse.next();
        } catch {
            // Token inválido -> Limpa e redireciona
            const response = NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
            response.cookies.delete('auth_token');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
            * Match all request paths except for the ones starting with:
            * - api (API routes)
            * - _next/static (static files)
            * - _next/image (image optimization files)
            * - favicon.ico, sitemap.xml, robots.txt (metadata files)
        */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
