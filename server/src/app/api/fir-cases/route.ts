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

    const firCases = await prisma.fIRCase.findMany({
      where,
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
        labSample: {
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(firCases)
  } catch (error) {
    console.error('Error fetching FIR cases:', error)
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
    const { 
      labReportId, 
      violationType, 
      accused, 
      location, 
      caseNotes, 
      courtDate, 
      seizureId, 
      labSampleId 
    } = body

    if (!labReportId || !violationType || !accused || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify seizure exists if provided
    if (seizureId) {
      const seizure = await prisma.seizure.findUnique({
        where: { id: seizureId }
      })
      if (!seizure) {
        return NextResponse.json({ error: 'Seizure not found' }, { status: 404 })
      }
    }

    // Verify lab sample exists if provided
    if (labSampleId) {
      const labSample = await prisma.labSample.findUnique({
        where: { id: labSampleId }
      })
      if (!labSample) {
        return NextResponse.json({ error: 'Lab sample not found' }, { status: 404 })
      }
    }

    const firCase = await prisma.fIRCase.create({
      data: {
        labReportId,
        violationType,
        accused,
        location,
        status: 'draft',
        caseNotes,
        courtDate,
        userId: session.userId,
        seizureId,
        labSampleId
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
        },
        labSample: {
          include: {
            seizure: {
              include: {
                scanResult: true
              }
            }
          }
        }
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'FIRCase',
        entityId: firCase.id,
        newData: { labReportId, violationType, accused, location, caseNotes, courtDate },
        userId: session.userId
      }
    })

    return NextResponse.json(firCase, { status: 201 })
  } catch (error) {
    console.error('Error creating FIR case:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
