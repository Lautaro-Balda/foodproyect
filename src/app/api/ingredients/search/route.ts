import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  try {
    const ingredients = await prisma.ingredient.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
      },
      take: 10,
    });

    return NextResponse.json(ingredients);
  } catch (error) {
    console.error('Error searching ingredients:', error);
    return NextResponse.json(
      { error: 'Failed to search ingredients' },
      { status: 500 }
    );
  }
}
