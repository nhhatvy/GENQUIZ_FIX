import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, role } = await req.json();

    if (!firstName?.trim() || !email?.trim() || !password || !role) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = [firstName.trim(), lastName?.trim()].filter(Boolean).join(" ");

    const user = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName?.trim() ?? null,
        name: fullName,
        email: trimmedEmail,
        password: hashedPassword,
        role: role.toUpperCase(),
      }
    });

    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
