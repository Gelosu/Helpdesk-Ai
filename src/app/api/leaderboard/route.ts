import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
 
    const groupedResults = await prisma.result.groupBy({
      by: ['user_id'],
      _max: {
        total_points: true,
        average_time_per_question: true,
      },
    });

    const userIds = groupedResults.map((g) => g.user_id);

    // Step 2: Get usernames and icons from the account table
    const accounts = await prisma.account.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        icons: true,
      },
    });

    // Step 3: Merge account data with results
    const leaderboard = groupedResults.map((entry) => {
      const account = accounts.find((acc) => acc.id === entry.user_id);
      return {
        id: entry.user_id,
        username: account?.username || 'Unknown',
        icon: account?.icons || '',
        overallPoints: entry._max.total_points ?? 0,
        averageSpeed: (entry._max.average_time_per_question ?? 0).toFixed(2),
      };
    });

    // Step 4: Sort by points descending
    leaderboard.sort((a, b) => b.overallPoints - a.overallPoints);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json({ error: 'Failed to generate leaderboard' }, { status: 500 });
  }
}
