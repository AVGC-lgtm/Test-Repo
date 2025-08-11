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

    const labSample = await prisma.labSample.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        seizure: {
          include: {
            scanResult: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        firCases: {
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
        }
      }
    })

    if (!labSample) {
      return NextResponse.json({ error: 'Lab sample not found' }, { status: 404 })
    }

    return NextResponse.json(labSample)
  } catch (error) {
    console.error('Error fetching lab sample:', error)
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
    const { sampleType, labDestination, status, labResult } = body

    // Get existing sample for audit log
    const existingSample = await prisma.labSample.findUnique({
      where: { id: params.id }
    })

    if (!existingSample) {
      return NextResponse.json({ error: 'Lab sample not found' }, { status: 404 })
    }

    const updatedSample = await prisma.labSample.update({
      where: { id: params.id },
      data: {
        ...(sampleType && { sampleType }),
        ...(labDestination && { labDestination }),
        ...(status && { status }),
        ...(labResult && { labResult })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        seizure: {
          include: {
            scanResult: true
          }
        }
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'LabSample',
        entityId: params.id,
        oldData: existingSample,
        newData: body,
        userId: session.user.id
      }
    })

    return NextResponse.json(updatedSample)
  } catch (error) {
    console.error('Error updating lab sample:', error)
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

    // Get existing sample for audit log
    const existingSample = await prisma.labSample.findUnique({
      where: { id: params.id }
    })

    if (!existingSample) {
      return NextResponse.json({ error: 'Lab sample not found' }, { status: 404 })
    }

    await prisma.labSample.delete({
      where: { id: params.id }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'LabSample',
        entityId: params.id,
        oldData: existingSample,
        userId: session.user.id
      }
    })

    return NextResponse.json({ message: 'Lab sample deleted successfully' })
  } catch (error) {
    console.error('Error deleting lab sample:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
