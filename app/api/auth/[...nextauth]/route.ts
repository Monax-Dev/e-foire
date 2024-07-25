import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { email, password } = reqBody;

        // Vérifier si l'utilisateur existe
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 400 });
        }

        // Vérifier si le mot de passe est correct
        const validPassword: boolean = await bcryptjs.compare(password, user.password);
        if (!validPassword) {
            return NextResponse.json({ error: "Invalid Password" }, { status: 400 });
        }

        // Créer les données du token
        const tokenData = {
            id: user.id,
            username: user.username,
            email: user.email,
        };

        // Créer le token
        const token: string = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, { expiresIn: "1d" });

        // Envoyer le token dans les cookies de l'utilisateur
        const response = NextResponse.json({
            message: "Login successful",
            success: true,
        });
        response.cookies.set("token", token, {
            httpOnly: true,
        });
        return response;

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
