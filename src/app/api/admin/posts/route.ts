// app/api/admin/posts/route.ts
import { NextResponse } from 'next/server';
import prisma  from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';

  const posts = await prisma.post.findMany({
    where: {
      OR: [
        {
          content: {
            contains: q,
            mode: 'insensitive',
          },
        },
        {
          Account: {
            fname: {
              contains: q,
              mode: 'insensitive',
            },
          },
        },
        {
          Account: {
            lname: {
              contains: q,
              mode: 'insensitive',
            },
          },
        },
      ],
    },
    orderBy: { created_at: 'desc' },
    include: {
      Account: {
        select: {
          fname: true,
          lname: true,
        },
      },
    },
  });

  return NextResponse.json(posts);
}



export async function POST(request: Request) {
  const { content, image_url, badge } = await request.json();
  const newPost = await prisma.post.create({
    data: { user_id: 1, content, image_url, badge },
  });
  return NextResponse.json(newPost);
}

export async function PUT(request: Request) {
  const { id, content, image_url, badge } = await request.json();
  const updated = await prisma.post.update({
    where: { id },
    data: { content, image_url, badge },
  });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
