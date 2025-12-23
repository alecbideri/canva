import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      boardId,
      sectionId,
      posX,
      posY,
      noteId,
      // If creating new note
      title,
      content,
      tags,
      color
    } = body;

    let finalNoteId = noteId;

    // If no noteId provided, create a new note/thought
    if (!finalNoteId) {
      const note = await prisma.note.create({
        data: {
          title: title || 'New Note',
          content: content || '',
          tags: tags || [],
          color: color,
        },
      });
      finalNoteId = note.id;
    }

    // Create the card placement on the board
    const card = await prisma.card.create({
      data: {
        boardId,
        sectionId,
        noteId: finalNoteId,
        posX,
        posY,
      },
      include: {
        note: true, // Return the note data with the card
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error('Error creating card:', error);
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, posX, posY, sectionId } = body;

    const card = await prisma.card.update({
      where: { id },
      data: {
        posX,
        posY,
        sectionId,
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update card' }, { status: 500 });
  }
}
