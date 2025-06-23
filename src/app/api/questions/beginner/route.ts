import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Fetch all beginner questions
export async function GET() {
  try {
    const questions = await prisma.beginnerQuestion.findMany({
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(questions);
  } catch (err) {
    console.error('❌ Failed to fetch beginner questions:', err);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

// POST: Create a new question
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, options, answer } = body;

    if (
      typeof question !== 'string' ||
      !Array.isArray(options) ||
      typeof answer !== 'number' ||
      options.length < 2 ||
      answer < 0 ||
      answer >= options.length
    ) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const newQuestion = await prisma.beginnerQuestion.create({
      data: {
        question,
        options,
        answer,
      },
    });

    return NextResponse.json(newQuestion);
  } catch (err) {
    console.error('❌ Failed to create question:', err);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}

// PUT: Update a question
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, question, options, answer } = body;

    if (
      typeof id !== 'number' ||
      typeof question !== 'string' ||
      !Array.isArray(options) ||
      typeof answer !== 'number' ||
      options.length < 2 ||
      answer < 0 ||
      answer >= options.length
    ) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const updated = await prisma.beginnerQuestion.update({
      where: { id },
      data: { question, options, answer },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('❌ Failed to update question:', err);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a question
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const deleted = await prisma.beginnerQuestion.delete({
      where: { id },
    });

    return NextResponse.json(deleted);
  } catch (err) {
    console.error('❌ Failed to delete question:', err);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}
