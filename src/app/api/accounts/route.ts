import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*\d)[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,}$/;

export async function GET(req: NextRequest) {
  const { search } = Object.fromEntries(req.nextUrl.searchParams);
  const q = search?.toString() || '';
  const users = await prisma.account.findMany({
    where: {
      OR: [
        { fname: { contains: q, mode: 'insensitive' } },
        { lname: { contains: q, mode: 'insensitive' } },
        { username: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ],
    },
    orderBy: { id: 'asc' },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const { fname, lname, username, email, password } = await req.json();

  if (!passwordRegex.test(password)) {
    return NextResponse.json({ error: 'Password does not meet security requirements.' }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.account.create({
      data: {
        fname,
        lname,
        username,
        email,
        password: { hash }, // wrapped in JSON object
      },
    });
    return NextResponse.json(user);
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create user.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { id, fname, lname, username, email, password } = await req.json();

  const updateData: any = { fname, lname, username, email };

  if (password) {
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ error: 'Password does not meet security requirements.' }, { status: 400 });
    }
    const hash = await bcrypt.hash(password, 10);
    updateData.password = { hash }; // wrap hash in JSON object
  }

  try {
    const user = await prisma.account.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update user.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = Object.fromEntries(req.nextUrl.searchParams);

  try {
    const user = await prisma.account.delete({ where: { id: Number(id) } });
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete user.' }, { status: 500 });
  }
}
