import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { boardId, name, posX, posY, width, height, color } = body;

    const section = await prisma.section.create({
      data: {
        boardId,
        name,
        posX,
        posY,
        width: width || 400,
        height: height || 300,
        color,
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, posX, posY, width, height, isCollapsed, color } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (posX !== undefined) updateData.posX = posX;
    if (posY !== undefined) updateData.posY = posY;
    if (width !== undefined) updateData.width = width;
    if (height !== undefined) updateData.height = height;
    if (isCollapsed !== undefined) updateData.isCollapsed = isCollapsed;
    if (color !== undefined) updateData.color = color;

    const section = await prisma.section.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(section);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
  }
}
