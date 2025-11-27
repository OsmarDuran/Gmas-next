import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "secret-key-change-me";

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) return null;

    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return {
            id: Number(payload.userId),
            email: payload.email as string,
            nombre: payload.nombre as string,
            rol: payload.rol as string
        };
    } catch (error) {
        return null;
    }
}
