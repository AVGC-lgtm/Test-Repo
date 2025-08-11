// ===============================
// File: /app/api/reports/route.ts
// Enhanced Reports API with comprehensive functionality
// ===============================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'dashboard';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const officer = searchParams.get('officer');
    const district = searchParams.get('district');
    const keyword = searchParams.get('keyword');
    const auditId = searchParams.get('auditId');

    console.log('Report request:', { reportType, startDate, endDate, officer, district, keyword });

    let report: any = {};

    switch (reportType) {
      case 'dashboard':
        report = await getDashboardReport(startDate, endDate, officer, district, keyword);
        break;
      case 'inspections':
        report = await getInspectionsReport(startDate, endDate, officer, district, keyword);
        break;
      case 'seizures':
        report = await getSeizuresReport(startDate, endDate, officer, district, keyword);
        break;
      case 'lab-samples':
        report = await getLabSamplesReport(startDate, endDate, officer, district, keyword);
        break;
      case 'fir-cases':
        report = await getFIRCasesReport(startDate, endDate, officer, district, keyword);
        break;
      default:
        report = await getDashboardReport(startDate, endDate, officer, district, keyword);
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}

// Enhanced Dashboard Report
async function getDashboardReport(
  startDate?: string | null, 
  endDate?: string | null,
  officer?: string | null,
  district?: string | null,
  keyword?: string | null
) {
  const dateFilter = getDateFilter(startDate, endDate);
  const userFilter = getUserFilter(officer);
  const locationFilter = getLocationFilter(district);
  const keywordFilter = getKeywordFilter(keyword);

  const [
    totalInspections,
    totalSeizures,
    totalLabSamples,
    totalFIRCases,
    inspectionsByStatus,
    seizuresByStatus,
    labSamplesByStatus,
    firCasesByStatus,
    recentActivity,
    topOfficers,
    topDistricts
  ] = await Promise.all([
    // Counts with filters
    prisma.inspectionTask.count({ 
      where: { 
        ...dateFilter, 
        ...userFilter,
        ...locationFilter,
        ...keywordFilter?.inspections 
      } 
    }),
    prisma.seizure.count({ 
      where: { 
        ...dateFilter, 
        ...userFilter,
        ...keywordFilter?.seizures 
      } 
    }),
    prisma.labSample.count({ 
      where: { 
        ...dateFilter, 
        ...userFilter,
        ...keywordFilter?.labSamples 
      } 
    }),
    prisma.fIRCase.count({ 
      where: { 
        ...dateFilter, 
        ...userFilter,
        ...locationFilter,
        ...keywordFilter?.firCases 
      } 
    }),

    // Status breakdowns
    prisma.inspectionTask.groupBy({
      by: ['status'],
      _count: { status: true },
      where: { 
        ...dateFilter, 
        ...userFilter,
        ...locationFilter,
        ...keywordFilter?.inspections 
      }
    }),

    prisma.seizure.groupBy({
      by: ['status'],
      _count: { status: true },
      where: { 
        ...dateFilter, 
        ...userFilter,
        ...keywordFilter?.seizures 
      }
    }),

    prisma.labSample.groupBy({
      by: ['status'],
      _count: { status: true },
      where: { 
        ...dateFilter, 
        ...userFilter,
        ...keywordFilter?.labSamples 
      }
    }),

    prisma.fIRCase.groupBy({
      by: ['status'],
      _count: { status: true },
      where: { 
        ...dateFilter, 
        ...userFilter,
        ...locationFilter,
        ...keywordFilter?.firCases 
      }
    }),

    // Recent activity
    prisma.auditLog.findMany({
      where: { 
        ...dateFilter,
        ...userFilter 
      },
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
    }),

    // Top performing officers
    prisma.inspectionTask.groupBy({
      by: ['userId'],
      _count: { userId: true },
      where: dateFilter,
      orderBy: { _count: { userId: 'desc' } },
      take: 5
    }),

    // Top districts by activity
    prisma.inspectionTask.groupBy({
      by: ['location'],
      _count: { location: true },
      where: dateFilter,
      orderBy: { _count: { location: 'desc' } },
      take: 5
    })
  ]);

  // Get user details for top officers
  const officerIds = topOfficers.map(o => o.userId);
  const officerDetails = await prisma.user.findMany({
    where: { id: { in: officerIds } },
    select: { id: true, name: true, email: true }
  });

  const topOfficersWithDetails = topOfficers.map(officer => {
    const details = officerDetails.find(d => d.id === officer.userId);
    return {
      ...officer,
      user: details
    };
  });

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
    recentActivity,
    topOfficers: topOfficersWithDetails,
    topDistricts
  };
}

// Enhanced Inspections Report
async function getInspectionsReport(
  startDate?: string | null, 
  endDate?: string | null,
  officer?: string | null,
  district?: string | null,
  keyword?: string | null
) {
  const dateFilter = getDateFilter(startDate, endDate);
  const userFilter = getUserFilter(officer);
  const locationFilter = getLocationFilter(district);
  const keywordFilter = getKeywordFilter(keyword);

  const [inspections, statusBreakdown, userBreakdown, equipmentUsage] = await Promise.all([
    prisma.inspectionTask.findMany({
      where: { 
        ...dateFilter, 
        ...userFilter,
        ...locationFilter,
        ...keywordFilter?.inspections 
      },
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
      where: { 
        ...dateFilter, 
        ...userFilter,
        ...locationFilter,
        ...keywordFilter?.inspections 
      }
    }),

    prisma.inspectionTask.groupBy({
      by: ['userId'],
      _count: { userId: true },
      where: { 
        ...dateFilter,
        ...locationFilter,
        ...keywordFilter?.inspections 
      }
    }),

    // Equipment usage analysis
    prisma.inspectionTask.findMany({
      where: { 
        ...dateFilter, 
        ...userFilter,
        ...locationFilter 
      },
      select: { equipment: true }
    })
  ]);

  // Analyze equipment usage
  const equipmentCount: Record<string, number> = {};
  inspections.forEach(inspection => {
    inspection.equipment.forEach(eq => {
      equipmentCount[eq] = (equipmentCount[eq] || 0) + 1;
    });
  });

  const equipmentStats = Object.entries(equipmentCount)
    .map(([equipment, count]) => ({ equipment, count }))
    .sort((a, b) => b.count - a.count);

  return {
    inspections,
    statusBreakdown,
    userBreakdown,
    equipmentStats
  };
}

// Enhanced Seizures Report
async function getSeizuresReport(
  startDate?: string | null, 
  endDate?: string | null,
  officer?: string | null,
  district?: string | null,
  keyword?: string | null
) {
  const dateFilter = getDateFilter(startDate, endDate);
  const userFilter = getUserFilter(officer);
  const keywordFilter = getKeywordFilter(keyword);

  const [seizures, statusBreakdown, companyBreakdown] = await Promise.all([
    prisma.seizure.findMany({
      where: { 
        ...dateFilter, 
        ...userFilter,
        ...keywordFilter?.seizures 
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        },
        scanResult: true,
        labSamples: {
          select: {
            id: true,
            status: true
          }
        },
        firCases: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),

    prisma.seizure.groupBy({
      by: ['status'],
      _count: { status: true },
      where: { 
        ...dateFilter, 
        ...userFilter,
        ...keywordFilter?.seizures 
      }
    }),

    // Company breakdown via scanResult
    prisma.scanResult.groupBy({
      by: ['company'],
      _count: { company: true },
      where: {
        seizures: {
          some: {
            ...dateFilter,
            ...userFilter
          }
        }
      },
      orderBy: { _count: { company: 'desc' } },
      take: 10
    })
  ]);

  // Calculate value analysis manually since estimatedValue is string
  const numericValues = seizures
    .map(s => {
      const cleanValue = s.estimatedValue.replace(/[^0-9.]/g, '');
      return parseFloat(cleanValue);
    })
    .filter(n => !isNaN(n));

  const total = numericValues.reduce((a, b) => a + b, 0);
  const avg = numericValues.length ? total / numericValues.length : 0;

  return {
    seizures,
    statusBreakdown,
    companyBreakdown,
    valueAnalysis: {
      _sum: { estimatedValue: total },
      _avg: { estimatedValue: avg },
      _count: numericValues.length
    }
  };
}

// Enhanced Lab Samples Report
async function getLabSamplesReport(
  startDate?: string | null, 
  endDate?: string | null,
  officer?: string | null,
  district?: string | null,
  keyword?: string | null
) {
  const dateFilter = getDateFilter(startDate, endDate);
  const userFilter = getUserFilter(officer);
  const keywordFilter = getKeywordFilter(keyword);

  const [labSamples, statusBreakdown, labDestinationBreakdown, resultBreakdown] = await Promise.all([
    prisma.labSample.findMany({
      where: { 
        ...dateFilter, 
        ...userFilter,
        ...keywordFilter?.labSamples 
      },
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
        firCases: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),

    prisma.labSample.groupBy({
      by: ['status'],
      _count: { status: true },
      where: { 
        ...dateFilter, 
        ...userFilter,
        ...keywordFilter?.labSamples 
      }
    }),

    prisma.labSample.groupBy({
      by: ['labDestination'],
      _count: { labDestination: true },
      where: { 
        ...dateFilter, 
        ...userFilter,
        ...keywordFilter?.labSamples 
      },
      orderBy: { _count: { labDestination: 'desc' } }
    }),

    prisma.labSample.groupBy({
      by: ['labResult'],
      _count: { labResult: true },
      where: {
        ...dateFilter,
        ...userFilter,
        labResult: { not: null }
      }
    })
  ]);

  // Calculate completion time analysis
  const completedSamples = labSamples.filter(s => s.status === 'completed');
  const completionTimes = completedSamples.map(sample => {
    const created = new Date(sample.createdAt);
    const updated = new Date(sample.updatedAt);
    return (updated.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
  });

  const avgCompletionTime = completionTimes.length 
    ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length 
    : 0;

  return {
    labSamples,
    statusBreakdown,
    labDestinationBreakdown,
    resultBreakdown,
    analytics: {
      avgCompletionTimeHours: Math.round(avgCompletionTime),
      completionRate: labSamples.length 
        ? (completedSamples.length / labSamples.length * 100).toFixed(1)
        : 0
    }
  };
}

// Enhanced FIR Cases Report
async function getFIRCasesReport(
  startDate?: string | null, 
  endDate?: string | null,
  officer?: string | null,
  district?: string | null,
  keyword?: string | null
) {
  const dateFilter = getDateFilter(startDate, endDate);
  const userFilter = getUserFilter(officer);
  const locationFilter = getLocationFilter(district);
  const keywordFilter = getKeywordFilter(keyword);

  const [firCases, statusBreakdown, violationBreakdown, locationBreakdown] = await Promise.all([
    prisma.fIRCase.findMany({
      where: { 
        ...dateFilter, 
        ...userFilter,
        ...locationFilter,
        ...keywordFilter?.firCases 
      },
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
        labSample: {
          select: {
            id: true,
            sampleType: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),

    prisma.fIRCase.groupBy({
      by: ['status'],
      _count: { status: true },
      where: { 
        ...dateFilter, 
        ...userFilter,
        ...locationFilter,
        ...keywordFilter?.firCases 
      }
    }),

    prisma.fIRCase.groupBy({
      by: ['violationType'],
      _count: { violationType: true },
      where: { 
        ...dateFilter, 
        ...userFilter,
        ...locationFilter,
        ...keywordFilter?.firCases 
      },
      orderBy: { _count: { violationType: 'desc' } }
    }),

    prisma.fIRCase.groupBy({
      by: ['location'],
      _count: { location: true },
      where: { 
        ...dateFilter, 
        ...userFilter,
        ...keywordFilter?.firCases 
      },
      orderBy: { _count: { location: 'desc' } },
      take: 10
    })
  ]);

  // Calculate case resolution time
  const closedCases = firCases.filter(c => c.status === 'closed');
  const avgResolutionTime = closedCases.length 
    ? closedCases.reduce((acc, firCase) => {
        const created = new Date(firCase.createdAt);
        const updated = new Date(firCase.updatedAt);
        return acc + (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // days
      }, 0) / closedCases.length
    : 0;

  return {
    firCases,
    statusBreakdown,
    violationBreakdown,
    locationBreakdown,
    analytics: {
      avgResolutionTimeDays: Math.round(avgResolutionTime),
      resolutionRate: firCases.length 
        ? (closedCases.length / firCases.length * 100).toFixed(1)
        : 0
    }
  };
}

// Helper Functions
function getDateFilter(startDate?: string | null, endDate?: string | null) {
  const filter: any = {};

  if (startDate || endDate) {
    filter.createdAt = {};

    if (startDate) {
      filter.createdAt.gte = new Date(startDate);
    }

    if (endDate) {
      filter.createdAt.lte = new Date(endDate);
    }
  }

  return filter;
}

function getUserFilter(officer?: string | null) {
  if (!officer) return {};
  
  return {
    user: {
      OR: [
        { name: { contains: officer, mode: 'insensitive' } },
        { email: { contains: officer, mode: 'insensitive' } }
      ]
    }
  };
}

function getLocationFilter(district?: string | null) {
  if (!district) return {};
  
  return {
    location: { contains: district, mode: 'insensitive' }
  };
}

function getKeywordFilter(keyword?: string | null) {
  if (!keyword) return {};
  
  const keywordCondition = { contains: keyword, mode: 'insensitive' as const };
  
  return {
    inspections: {
      OR: [
        { location: keywordCondition },
        { officer: keywordCondition },
        { targetType: keywordCondition }
      ]
    },
    seizures: {
      OR: [
        { witnessName: keywordCondition },
        { scanResult: {
          OR: [
            { company: keywordCondition },
            { product: keywordCondition },
            { batchNumber: keywordCondition }
          ]
        }}
      ]
    },
    labSamples: {
      OR: [
        { sampleType: keywordCondition },
        { labDestination: keywordCondition },
        { labResult: keywordCondition }
      ]
    },
    firCases: {
      OR: [
        { violationType: keywordCondition },
        { accused: keywordCondition },
        { caseNotes: keywordCondition }
      ]
    }
  };
}