import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const board = await prisma.board.findUnique({
      where: { id: params.id },
      include: {
        sections: true,
        cards: {
          include: {
            note: true, // Include the actual note content
          }
        },
        connections: true,
      },
    });

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    return NextResponse.json(board);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch board' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, viewport } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (viewport) {
      updateData.zoom = viewport.zoom;
      updateData.panX = viewport.panX;
      updateData.panY = viewport.panY;
    }

    const board = await prisma.board.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(board);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update board' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.board.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete board' }, { status: 500 });
  }
}
