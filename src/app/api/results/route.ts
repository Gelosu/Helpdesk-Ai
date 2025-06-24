import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      username,
      total_questions,
      correct_answers,
      total_points,
      average_time_per_question,
      achievement
    } = body;

    const result = await prisma.result.create({
      data: {
        user_id: userId,
        username,
        total_questions,
        correct_answers,
        total_points,
        average_time_per_question,
        achievement,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving result:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET() {
  try {
    const results = await prisma.result.findMany({
      orderBy: { answered_at: 'desc' },
    });

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error fetching results:', error);
    return new NextResponse('Failed to fetch results', { status: 500 });
  }
}
