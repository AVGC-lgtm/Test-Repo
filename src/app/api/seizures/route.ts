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

    const seizures = await prisma.seizure.findMany({
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
        scanResult: true,
        labSamples: {
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

    return NextResponse.json(seizures)
  } catch (error) {
    console.error('Error fetching seizures:', error)
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
    const { 
      quantity, 
      estimatedValue, 
      witnessName, 
      evidencePhotos, 
      videoEvidence,
      scanResult 
    } = body

    if (!quantity || !estimatedValue || !witnessName || !scanResult) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create scan result first
    const createdScanResult = await prisma.scanResult.create({
      data: {
        company: scanResult.company,
        product: scanResult.product,
        batchNumber: scanResult.batchNumber,
        authenticityScore: scanResult.authenticityScore,
        issues: scanResult.issues || [],
        recommendation: scanResult.recommendation,
        geoLocation: scanResult.geoLocation,
        timestamp: scanResult.timestamp
      }
    })

    // Create seizure
    const seizure = await prisma.seizure.create({
      data: {
        quantity,
        estimatedValue,
        witnessName,
        evidencePhotos: evidencePhotos || [],
        videoEvidence,
        status: 'pending',
        userId: session.user.id,
        scanResultId: createdScanResult.id
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
        scanResult: true
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Seizure',
        entityId: seizure.id,
        newData: { quantity, estimatedValue, witnessName, evidencePhotos, videoEvidence },
        userId: session.user.id
      }
    })

    return NextResponse.json(seizure, { status: 201 })
  } catch (error) {
    console.error('Error creating seizure:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
