import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';
import { Prisma } from '@prisma/client'; 

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    const where: Prisma.SeizureWhereInput = {}; 
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const seizures = await prisma.seizure.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        },
        scanResult: true,
        labSamples: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } }
          }
        },
        firCases: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(seizures);
  } catch (error) {
    console.error('Error fetching seizures:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      quantity,
      estimatedValue,
      witnessName,
      evidencePhotos,
      videoEvidence,
      scanResult
    } = body;

    if (!quantity || !estimatedValue || !witnessName || !scanResult) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

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
    });

    const seizure = await prisma.seizure.create({
      data: {
        quantity,
        estimatedValue,
        witnessName,
        evidencePhotos: evidencePhotos || [],
        videoEvidence,
        status: 'pending',
        userId: session.userId,
        scanResultId: createdScanResult.id
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        },
        scanResult: true
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Seizure',
        entityId: seizure.id,
        newData: { quantity, estimatedValue, witnessName, evidencePhotos, videoEvidence },
        userId: session.userId
      }
    });

    return NextResponse.json(seizure, { status: 201 });
  } catch (error) {
    console.error('Error creating seizure:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
