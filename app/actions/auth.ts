'use server';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * Register a new user
 */
export async function registerUser(name: string, email: string, password: string) {
    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return {
                success: false,
                error: 'Email already registered',
            };
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
            },
        });

        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        };
    } catch (error: any) {
        console.error('Error registering user:', error);
        return {
            success: false,
            error: error.message || 'Failed to register user',
        };
    }
}

/**
 * Get the currently authenticated user from session
 */
export async function getCurrentUser() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return null;
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });

        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}
