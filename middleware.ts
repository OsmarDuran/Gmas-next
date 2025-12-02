import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "secret-key-change-me";

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("auth_token")?.value;
    const { pathname } = request.nextUrl;
    console.log(`Middleware: ${pathname}, Token: ${token ? "Yes" : "No"}`);

    // Rutas públicas (no requieren auth)
    const publicRoutes = ["/login", "/register", "/api/auth/login", "/api/auth/register", "/", "/forgot-password", "/reset-password"];

    // Permitir acceso a recursos estáticos y api pública
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/static") ||
        pathname.includes(".") // archivos (imagenes, css)
    ) {
        return NextResponse.next();
    }

    if (publicRoutes.includes(pathname)) {
        // Si ya tiene sesión y va a login, redirigir al dashboard
        if (token) {
            try {
                const secret = new TextEncoder().encode(JWT_SECRET);
                await jwtVerify(token, secret);
                return NextResponse.redirect(new URL("/dashboard", request.url));
            } catch (e) {
                // Token inválido, dejar pasar a login
            }
        }
        return NextResponse.next();
    }

    // Rutas protegidas
    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        const rol = payload.rol as string;

        // RBAC: Control de acceso basado en roles

        // Rutas exclusivas de Admin/Master
        const adminRoutes = [
            "/dashboard",
            "/usuarios",
            "/catalogos",
            "/asignaciones" // Asignaciones completas
        ];

        // Si es empleado e intenta entrar a rutas de admin
        if (rol === "employee") {
            // Verificar si la ruta actual empieza con alguna ruta de admin
            const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

            if (isAdminRoute) {
                // Redirigir a su área personal
                return NextResponse.redirect(new URL("/mis-equipos", request.url));
            }
        }

        return NextResponse.next();

    } catch (error) {
        // Token inválido o expirado
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("auth_token");
        return response;
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
