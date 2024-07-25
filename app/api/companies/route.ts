import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();
//POST
export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { companyName, address,  email, password } = reqBody;
        //log à supprimer
        console.log(reqBody);

        // Check if Company already exists
        const existingCompany = await prisma.company.findUnique({
            where: {
                companyName,
                email,
            },
        });

        if (existingCompany) {
            return NextResponse.json({ error: 'Company Already Exists' }, { status: 400 });
        }

        // Hash the password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Create a new Company
        const newUser = await prisma.company.create({
            data: {
                companyName, 
                address,
                email,
                password: hashedPassword,
            },
        });

        // Returning the response
        return NextResponse.json({
            message: 'Company created successfully',
            success: true,
            savedUser: newUser,
        });
    } catch (error: any) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
//GET
export async function GET(request: NextRequest) {
    try {
        const companies = await prisma.company.findMany();

        return NextResponse.json({
            message: 'All Companies retrieved successfully',
            success: true,
            companies,
        });
    } catch (error: any) {
        console.error('Error retrieving companies:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}