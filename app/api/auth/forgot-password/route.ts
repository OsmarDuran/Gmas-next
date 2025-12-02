import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.usuario.findUnique({
            where: { email }
        });

        if (!user) {
            // Return success even if user not found to prevent enumeration
            return NextResponse.json({ message: "If email exists, reset link sent" });
        }

        const token = uuidv4();
        const expiry = new Date(Date.now() + 3600000); // 1 hour

        await prisma.usuario.update({
            where: { id: user.id },
            data: {
                resetToken: token,
                resetTokenExpiry: expiry
            }
        });

        // In a real app, send email here.
        // For now, log the link to console.
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
        console.log("---------------------------------------------------");
        console.log(`PASSWORD RESET LINK FOR ${email}:`);
        console.log(resetLink);
        console.log("---------------------------------------------------");

        return NextResponse.json({ message: "Reset link sent" });

    } catch (error: any) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
