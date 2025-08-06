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
    const reportType = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let report: any = {}

    switch (reportType) {
      case 'dashboard':
        report = await getDashboardReport(startDate, endDate)
        break
      case 'inspections':
        report = await getInspectionsReport(startDate, endDate)
        break
      case 'seizures':
        report = await getSeizuresReport(startDate, endDate)
        break
      case 'lab-samples':
        report = await getLabSamplesReport(startDate, endDate)
        break
      case 'fir-cases':
        report = await getFIRCasesReport(startDate, endDate)
        break
      default:
        report = await getDashboardReport(startDate, endDate)
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getDashboardReport(startDate?: string | null, endDate?: string | null) {
  const dateFilter = getDateFilter(startDate, endDate)

  const [
    totalInspections,
    totalSeizures,
    totalLabSamples,
    totalFIRCases,
    inspectionsByStatus,
    seizuresByStatus,
    labSamplesByStatus,
    firCasesByStatus,
    recentActivity
  ] = await Promise.all([
    prisma.inspectionTask.count({ where: dateFilter }),
    prisma.seizure.count({ where: dateFilter }),
    prisma.labSample.count({ where: dateFilter }),
    prisma.fIRCase.count({ where: dateFilter }),
    
    prisma.inspectionTask.groupBy({
      by: ['status'],
      _count: { status: true },
      where: dateFilter
    }),
    
    prisma.seizure.groupBy({
      by: ['status'],
      _count: { status: true },
      where: dateFilter
    }),
    
    prisma.labSample.groupBy({
      by: ['status'],
      _count: { status: true },
      where: dateFilter
    }),
    
    prisma.fIRCase.groupBy({
      by: ['status'],
      _count: { status: true },
      where: dateFilter
    }),

    prisma.auditLog.findMany({
      where: dateFilter,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ])

  return {
    summary: {
      totalInspections,
      totalSeizures,
      totalLabSamples,
      totalFIRCases
    },
    statusBreakdown: {
      inspections: inspectionsByStatus,
      seizures: seizuresByStatus,
      labSamples: labSamplesByStatus,
      firCases: firCasesByStatus
    },
    recentActivity
  }
}

async function getInspectionsReport(startDate?: string | null, endDate?: string | null) {
  const dateFilter = getDateFilter(startDate, endDate)

  const [inspections, statusBreakdown, userBreakdown] = await Promise.all([
    prisma.inspectionTask.findMany({
      where: dateFilter,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),

    prisma.inspectionTask.groupBy({
      by: ['status'],
      _count: { status: true },
      where: dateFilter
    }),

    prisma.inspectionTask.groupBy({
      by: ['userId'],
      _count: { userId: true },
      where: dateFilter
    })
  ])

  return {
    inspections,
    statusBreakdown,
    userBreakdown
  }
}

async function getSeizuresReport(startDate?: string | null, endDate?: string | null) {
  const dateFilter = getDateFilter(startDate, endDate)

  const [seizures, statusBreakdown, valueAnalysis] = await Promise.all([
    prisma.seizure.findMany({
      where: dateFilter,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        },
        scanResult: true
      },
      orderBy: { createdAt: 'desc' }
    }),

    prisma.seizure.groupBy({
      by: ['status'],
      _count: { status: true },
      where: dateFilter
    }),

    prisma.seizure.aggregate({
      where: dateFilter,
      _sum: {
        estimatedValue: true
      },
      _avg: {
        estimatedValue: true
      }
    })
  ])

  return {
    seizures,
    statusBreakdown,
    valueAnalysis
  }
}

async function getLabSamplesReport(startDate?: string | null, endDate?: string | null) {
  const dateFilter = getDateFilter(startDate, endDate)

  const [labSamples, statusBreakdown, resultBreakdown] = await Promise.all([
    prisma.labSample.findMany({
      where: dateFilter,
      include: {
        user: {
          select: {
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
      },
      orderBy: { createdAt: 'desc' }
    }),

    prisma.labSample.groupBy({
      by: ['status'],
      _count: { status: true },
      where: dateFilter
    }),

    prisma.labSample.groupBy({
      by: ['labResult'],
      _count: { labResult: true },
      where: {
        ...dateFilter,
        labResult: { not: null }
      }
    })
  ])

  return {
    labSamples,
    statusBreakdown,
    resultBreakdown
  }
}

async function getFIRCasesReport(startDate?: string | null, endDate?: string | null) {
  const dateFilter = getDateFilter(startDate, endDate)

  const [firCases, statusBreakdown, violationBreakdown] = await Promise.all([
    prisma.fIRCase.findMany({
      where: dateFilter,
      include: {
        user: {
          select: {
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
        labSample: true
      },
      orderBy: { createdAt: 'desc' }
    }),

    prisma.fIRCase.groupBy({
      by: ['status'],
      _count: { status: true },
      where: dateFilter
    }),

    prisma.fIRCase.groupBy({
      by: ['violationType'],
      _count: { violationType: true },
      where: dateFilter
    })
  ])

  return {
    firCases,
    statusBreakdown,
    violationBreakdown
  }
}

function getDateFilter(startDate?: string | null, endDate?: string | null) {
  const filter: any = {}
  
  if (startDate || endDate) {
    filter.createdAt = {}
    
    if (startDate) {
      filter.createdAt.gte = new Date(startDate)
    }
    
    if (endDate) {
      filter.createdAt.lte = new Date(endDate)
    }
  }
  
  return filter
}
