import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

        // Send email using Resend
        try {
            await resend.emails.send({
                from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
                to: email,
                subject: 'Restablecer Contraseña - GMAS',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #2563eb;">Restablecer Contraseña</h1>
                        <p>Has solicitado restablecer tu contraseña para tu cuenta en GMAS.</p>
                        <p>Haz clic en el siguiente botón para continuar:</p>
                        <a href="${resetLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                            Restablecer Contraseña
                        </a>
                        <p style="color: #666; font-size: 14px;">Si no solicitaste esto, puedes ignorar este correo.</p>
                        <p style="color: #666; font-size: 14px;">El enlace expirará en 1 hora.</p>
                    </div>
                `
            });
            console.log(`Email sent to ${email}`);
        } catch (emailError) {
            console.error("Error sending email:", emailError);
            // We still return success to the client, but log the error
            // In a production critical system, you might want to handle this differently
        }

        // Keep logging for dev purposes if needed, or remove
        if (process.env.NODE_ENV === 'development') {
            console.log("---------------------------------------------------");
            console.log(`PASSWORD RESET LINK FOR ${email}:`);
            console.log(resetLink);
            console.log("---------------------------------------------------");
        }

        return NextResponse.json({ message: "Reset link sent" });

    } catch (error: any) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
