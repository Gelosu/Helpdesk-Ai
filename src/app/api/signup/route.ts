// app/api/signup/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { writeFile } from 'fs/promises';
import path from 'path';

// Important: Disable Next.js body parser for multipart form
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const firstName = formData.get('fname') as string;
    const lastName = formData.get('lname') as string;
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const iconFile = formData.get('icon') as File | null;

    if (!firstName || !lastName || !username || !email || !password || !iconFile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle file saving
    const bytes = await iconFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}_${iconFile.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(process.cwd(), 'public/icon', fileName);

    await writeFile(filePath, buffer);
    const iconUrl = `/icon/${fileName}`;

    // Save to DB
    const user = await prisma.account.create({
      data: {
        fname: firstName,
        lname: lastName,
        username,
        email,
        password: { hash: hashedPassword },
        icons: iconUrl,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Email or username may already exist or file error occurred' },
      { status: 500 }
    );
  }
}
