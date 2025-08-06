import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
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

    const labSamples = await prisma.labSample.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(labSamples)
  } catch (error) {
    console.error('Error fetching lab samples:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sampleType, labDestination, seizureId } = body

    if (!sampleType || !labDestination || !seizureId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify seizure exists
    const seizure = await prisma.seizure.findUnique({
      where: { id: seizureId }
    })

    if (!seizure) {
      return NextResponse.json({ error: 'Seizure not found' }, { status: 404 })
    }

    const labSample = await prisma.labSample.create({
      data: {
        sampleType,
        labDestination,
        status: 'in-transit',
        userId: session.user.id,
        seizureId
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
        action: 'CREATE',
        entity: 'LabSample',
        entityId: labSample.id,
        newData: { sampleType, labDestination, seizureId },
        userId: session.user.id
      }
    })

    return NextResponse.json(labSample, { status: 201 })
  } catch (error) {
    console.error('Error creating lab sample:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
