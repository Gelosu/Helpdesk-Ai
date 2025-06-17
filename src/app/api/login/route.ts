import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user by username
    const user = await prisma.account.findFirst({
      where: { username },
    });

    if (!user) {
      console.log('❌ User not found:', username);
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 401 }
      );
    }

    // Extract hash from JSON field
    let hash = '';

if (
  user.password &&
  typeof user.password === 'object' &&
  'hash' in user.password &&
  typeof user.password.hash === 'string'
) {
  hash = user.password.hash;
} else {
  console.log('⚠️ Password format is invalid:', user.password);
  return NextResponse.json(
    { success: false, message: 'Invalid password format' },
    { status: 500 }
  );
}


    // Log values for debug
    console.log('🔑 Input password:', password);
    console.log('🔒 Stored hash:', hash);

    const isMatch = await bcrypt.compare(password, hash);

    if (!isMatch) {
      console.log('❌ Password mismatch');
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }

    console.log('✅ Login successful for:', username);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
