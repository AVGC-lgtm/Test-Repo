import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';
import { Prisma } from '@prisma/client'; 

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const inspectionTask = await prisma.inspectionTask.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    if (!inspectionTask) {
      return NextResponse.json({ error: 'Inspection task not found' }, { status: 404 })
    }

    return NextResponse.json(inspectionTask)
  } catch (error) {
    console.error('Error fetching inspection task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { officer, date, location, targetType, equipment, status } = body

    // Get existing task for audit log
    const existingTask = await prisma.inspectionTask.findUnique({
      where: { id: params.id }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Inspection task not found' }, { status: 404 })
    }

    const updatedTask = await prisma.inspectionTask.update({
      where: { id: params.id },
      data: {
        ...(officer && { officer }),
        ...(date && { date }),
        ...(location && { location }),
        ...(targetType && { targetType }),
        ...(equipment && { equipment }),
        ...(status && { status })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'InspectionTask',
        entityId: params.id,
        oldData: existingTask,
        newData: body,
        userId: session.user.id
      }
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error updating inspection task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get existing task for audit log
    const existingTask = await prisma.inspectionTask.findUnique({
      where: { id: params.id }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Inspection task not found' }, { status: 404 })
    }

    await prisma.inspectionTask.delete({
      where: { id: params.id }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'InspectionTask',
        entityId: params.id,
        oldData: existingTask,
        userId: session.user.id
      }
    })

    return NextResponse.json({ message: 'Inspection task deleted successfully' })
  } catch (error) {
    console.error('Error deleting inspection task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
