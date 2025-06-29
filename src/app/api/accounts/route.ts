import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const passwordRegex =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*\d)[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,}$/;

// 🔍 GET: Search users OR get specific user by ID
export async function GET(req: NextRequest) {
  const searchParams = Object.fromEntries(req.nextUrl.searchParams);
  const { search, id } = searchParams;

  if (id) {
    try {
      const user = await prisma.account.findUnique({
        where: { id: Number(id) },
        select: {
          id: true,
          username: true,
          icons: true,
        },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json(user);
    } catch (err) {
      console.error('Fetch user by ID failed:', err);
      return NextResponse.json({ error: 'Failed to fetch user.' }, { status: 500 });
    }
  }

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

// ➕ POST: Create new user
export async function POST(req: NextRequest) {
  const { fname, lname, username, email, password, icons = '/icon/defaulticon.jpg' } = await req.json();

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
        password: { hash },
        icons,
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

// 🔁 PUT: Update user
export async function PUT(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const id = Number(formData.get('id'));
    const fname = formData.get('fname')?.toString() || '';
    const lname = formData.get('lname')?.toString() || '';
    const username = formData.get('username')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const password = formData.get('password')?.toString() || '';
    const file = formData.get('icon') as File | null;

    const updateData: any = { fname, lname, username, email };

    if (file && file.name) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploaded = await new Promise<{ secure_url: string }>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: 'home/icons', // ✅ Your updated folder
              public_id: `${username}_icon`, // Optional: make image names clearer
              overwrite: true,
            },
            (err, result) => {
              if (err || !result) return reject(err);
              resolve(result as { secure_url: string });
            }
          ).end(buffer);
        });

        updateData.icons = uploaded.secure_url;
      } catch (error) {
        console.error('Cloudinary upload failed:', error);
        return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 });
      }
    }

    if (password && password !== '••••••••') {
      if (!passwordRegex.test(password)) {
        return NextResponse.json({ error: 'Password does not meet security requirements.' }, { status: 400 });
      }
      const hash = await bcrypt.hash(password, 10);
      updateData.password = { hash };
    }

    try {
      const user = await prisma.account.update({
        where: { id },
        data: updateData,
      });
      return NextResponse.json(user);
    } catch (err) {
      console.error('Update failed:', err);
      return NextResponse.json({ error: 'Failed to update user.' }, { status: 500 });
    }
  }

  // JSON fallback
  const { id, fname, lname, username, email, password, icons } = await req.json();
  const updateData: any = { fname, lname, username, email };

  if (icons) updateData.icons = icons;

  if (password && password !== '••••••••') {
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ error: 'Password does not meet security requirements.' }, { status: 400 });
    }
    const hash = await bcrypt.hash(password, 10);
    updateData.password = { hash };
  }

  try {
    const user = await prisma.account.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(user);
  } catch (err) {
    console.error('Update failed:', err);
    return NextResponse.json({ error: 'Failed to update user.' }, { status: 500 });
  }
}

// ❌ DELETE: Remove user
export async function DELETE(req: NextRequest) {
  const { id } = Object.fromEntries(req.nextUrl.searchParams);

  try {
    const user = await prisma.account.delete({ where: { id: Number(id) } });
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete user.' }, { status: 500 });
  }
}
