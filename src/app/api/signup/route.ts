import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { writeFile } from 'fs/promises';
import path from 'path';

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

    // Basic validation
    if (!firstName || !lastName || !username || !email || !password || !iconFile) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // File validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(iconFile.type)) {
      return NextResponse.json(
        { error: 'Invalid image type. Use JPG, PNG, WEBP, or GIF.' },
        { status: 400 }
      );
    }

    if (iconFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Image file too large. Max 2MB allowed.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the image to /public/icon
    const bytes = await iconFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = iconFile.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.]/g, '');
    const fileName = `${Date.now()}_${safeName}`;
    const filePath = path.join(process.cwd(), 'public/icon', fileName);

    await writeFile(filePath, buffer);
    const iconUrl = `/icon/${fileName}`;

    // Save user to DB
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
      { error: 'Signup failed. Email or username might already exist or file error occurred.' },
      { status: 500 }
    );
  }
}