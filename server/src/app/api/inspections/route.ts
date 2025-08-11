
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';
import { Prisma } from '@prisma/client'; 

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (userId) {
      where.userId = userId
    }

    const inspectionTasks = await prisma.inspectionTask.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(inspectionTasks)
  } catch (error) {
    console.error('Error fetching inspection tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { officer, date, location, targetType, equipment } = body

    if (!officer || !date || !location || !targetType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const inspectionTask = await prisma.inspectionTask.create({
      data: {
        officer,
        date,
        location,
        targetType,
        equipment: equipment || [],
        status: 'scheduled',
        userId: session.userId 
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
        action: 'CREATE',
        entity: 'InspectionTask',
        entityId: inspectionTask.id,
        newData: { officer, date, location, targetType, equipment },
        userId: session.userId
      }
    })

    return NextResponse.json(inspectionTask, { status: 201 })
  } catch (error) {
    console.error('Error creating inspection task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
