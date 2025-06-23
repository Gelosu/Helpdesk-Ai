import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

// Helper to convert the Web Request to Node-compatible stream
async function toNodeReadable(req) {
  const reader = req.body.getReader();
  return new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) {
        this.push(null);
      } else {
        this.push(Buffer.from(value));
      }
    },
  });
}

export async function POST(req) {
  await fs.mkdir('./public/uploads', { recursive: true });

  const headers = {};
  req.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const nodeReq = await toNodeReadable(req);
  nodeReq.headers = headers;

  const form = formidable({
    multiples: false,
    uploadDir: './public/uploads',
    keepExtensions: true,
  });

  return new Promise((resolve) => {
    form.parse(nodeReq, async (err, fields, files) => {
      if (err) {
        console.error('Formidable error:', err);
        return resolve(NextResponse.json({ error: 'File upload failed' }, { status: 500 }));
      }

      try {
        const user_id = parseInt(fields.user_id?.[0]);
        const content = fields.content?.[0];
        const badge = fields.badge?.[0] || null;
        const imageFile = files.image?.[0];
        const image_url = imageFile ? `/uploads/${path.basename(imageFile.filepath)}` : null;

        if (!user_id || !content) {
          return resolve(NextResponse.json({ error: 'Missing required fields.' }, { status: 400 }));
        }

        const post = await prisma.post.create({
          data: {
            user_id,
            content,
            badge,
            image_url,
          },
        });

        return resolve(NextResponse.json(post, { status: 201 }));
      } catch (err) {
        console.error('Database error:', err);
        return resolve(NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }));
      }
    });
  });
}
