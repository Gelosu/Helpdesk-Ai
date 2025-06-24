import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';

export const config = {
  api: {
    bodyParser: false,
  },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const passwordRegex =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*\d)[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,}$/;

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const fname = formData.get('fname') as string;
    const lname = formData.get('lname') as string;
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const iconFile = formData.get('icon') as File | null;

    if (!fname || !lname || !username || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!passwordRegex.test(password)) {
      return NextResponse.json({ error: 'Password must be 8+ characters, include uppercase, number, and symbol.' }, { status: 400 });
    }

    if (iconFile) {
      if (!ALLOWED_TYPES.includes(iconFile.type)) {
        return NextResponse.json({ error: 'Only JPG, PNG, or GIF files are allowed.' }, { status: 400 });
      }

      if (iconFile.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'File size must not exceed 2MB.' }, { status: 400 });
      }
    }

    const hash = await bcrypt.hash(password, 10);

    let iconUrl = '/icon/defaulticon.jpg';

    if (iconFile && iconFile.name) {
      const arrayBuffer = await iconFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploaded = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'home/icons',
            public_id: `${username}_icon`,
            overwrite: true,
          },
          (err, result) => {
            if (err || !result) return reject(err);
            resolve(result as { secure_url: string });
          }
        ).end(buffer);
      });

      iconUrl = uploaded.secure_url;
    }

    const user = await prisma.account.create({
      data: {
        fname,
        lname,
        username,
        email,
        password: { hash },
        icons: iconUrl,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Signup error:', error);
    const isConflict = error.code === 'P2002';
    return NextResponse.json(
      { error: isConflict ? 'Email or username already exists.' : 'Signup failed.' },
      { status: isConflict ? 409 : 500 }
    );
  }
}
