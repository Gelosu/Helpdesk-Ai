// app/api/signup/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  const body = await req.json();
  const { firstName, lastName, username, email, password } = body;

  if (!firstName || !lastName || !username || !email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.account.create({
      data: {
        fname: firstName,
        lname: lastName,
        username,
        email,
        password: { hash: hashedPassword },
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Email or username may already exist' },
      { status: 500 }
    );
  }
}
