import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.section.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, posX, posY, width, height, isCollapsed, color } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (posX !== undefined) updateData.posX = posX;
    if (posY !== undefined) updateData.posY = posY;
    if (width !== undefined) updateData.width = width;
    if (height !== undefined) updateData.height = height;
    if (isCollapsed !== undefined) updateData.isCollapsed = isCollapsed;
    if (color !== undefined) updateData.color = color;

    const section = await prisma.section.update({
      where: { id: params.id },
      data: updateData,
    });
    return NextResponse.json(section);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
  }
}
