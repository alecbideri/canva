import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { boardId, fromCardId, toCardId, fromAnchor, toAnchor, color, label } = body;

    const connection = await prisma.connection.create({
      data: {
        boardId,
        fromCardId,
        toCardId,
        fromAnchor: fromAnchor || 'bottom',
        toAnchor: toAnchor || 'top',
        color,
        label,
      },
    });

    return NextResponse.json(connection);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 });
  }
}
