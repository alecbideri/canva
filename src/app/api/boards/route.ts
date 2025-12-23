import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const boards = await prisma.board.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { cards: true }
        }
      }
    });
    return NextResponse.json(boards);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch boards' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    const board = await prisma.board.create({
      data: {
        name,
        // Set default viewport
        zoom: 1,
        panX: 0,
        panY: 0,
      },
    });

    return NextResponse.json(board);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create board' }, { status: 500 });
  }
}
