import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Group by user_id and get max total_points and average_time_per_question
    const groupedResults = await prisma.result.groupBy({
      by: ['user_id'],
      _max: {
        total_points: true,
        average_time_per_question: true,
      },
    });

    // Extract user IDs
    const userIds = groupedResults.map((g) => g.user_id);

    // Get account details (username, icons)
    const accounts = await prisma.account.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        icons: true,
      },
    });

    // Merge data
    const leaderboard = groupedResults.map((entry) => {
      const account = accounts.find((acc) => acc.id === entry.user_id);
      return {
        id: entry.user_id,
        username: account?.username || 'Unknown',
        icon: account?.icons || '/icon/defaulticon.jpg',
        overallPoints: entry._max.total_points ?? 0,
        averageSpeed: Number(entry._max.average_time_per_question ?? 0).toFixed(2),
      };
    });

    // Sort by overallPoints descending
    leaderboard.sort((a, b) => b.overallPoints - a.overallPoints);

    // Add rank field
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return NextResponse.json(rankedLeaderboard);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json({ error: 'Failed to generate leaderboard' }, { status: 500 });
  }
}
