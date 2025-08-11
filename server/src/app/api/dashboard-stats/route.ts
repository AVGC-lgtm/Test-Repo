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
    const period = searchParams.get('period') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get comprehensive dashboard stats
    const [
      // Total counts
      totalInspections,
      totalSeizures,
      totalFirCases,
      totalLabSamples,
      
      // Active counts
      activeSeizures,
      pendingLabSamples,
      activeFirCases,
      
      // Recent data for trends
      recentInspections,
      recentSeizures,
      recentFirCases,
      recentLabSamples,
      
      // Status breakdowns
      inspectionStatusBreakdown,
      seizureStatusBreakdown,
      firStatusBreakdown,
      labStatusBreakdown
    ] = await Promise.all([
      // Total counts
      prisma.inspectionTask.count(),
      prisma.seizure.count(),
      prisma.fIRCase.count(),
      prisma.labSample.count(),
      
      // Active counts
      prisma.seizure.count({ where: { status: { not: 'closed' } } }),
      prisma.labSample.count({ where: { status: { not: 'completed' } } }),
      prisma.fIRCase.count({ where: { status: { not: 'closed' } } }),
      
      // Recent data for trends
      prisma.inspectionTask.findMany({
        where: { createdAt: { gte: startDate } },
        select: { id: true, createdAt: true, status: true }
      }),
      prisma.seizure.findMany({
        where: { createdAt: { gte: startDate } },
        select: { id: true, createdAt: true, status: true }
      }),
      prisma.fIRCase.findMany({
        where: { createdAt: { gte: startDate } },
        select: { id: true, createdAt: true, status: true }
      }),
      prisma.labSample.findMany({
        where: { createdAt: { gte: startDate } },
        select: { id: true, createdAt: true, status: true }
      }),
      
      // Status breakdowns
      prisma.inspectionTask.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.seizure.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.fIRCase.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.labSample.groupBy({
        by: ['status'],
        _count: { status: true }
      })
    ]);

    // Calculate trends
    const calculateTrend = (data: any[], days: number = 7) => {
      const recentData = data.filter(item => {
        const itemDate = new Date(item.createdAt);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return itemDate >= cutoffDate;
      });
      return recentData.length;
    };

    // Calculate compliance rate
    const completedInspections = recentInspections.filter((i: any) => i.status === 'completed').length;
    const complianceRate = recentInspections.length > 0 
      ? ((completedInspections / recentInspections.length) * 100).toFixed(1)
      : '0.0';

    // Dashboard stats response
    const dashboardStats = {
      overview: {
        totalInspections,
        totalSeizures,
        totalFirCases,
        totalLabSamples,
        activeSeizures,
        pendingLabSamples,
        activeFirCases,
        complianceRate: parseFloat(complianceRate)
      },
      statusBreakdown: {
        inspections: inspectionStatusBreakdown.reduce((acc: any, item: any) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {}),
        seizures: seizureStatusBreakdown.reduce((acc: any, item: any) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {}),
        firCases: firStatusBreakdown.reduce((acc: any, item: any) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {}),
        labSamples: labStatusBreakdown.reduce((acc: any, item: any) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {})
      },
      trends: {
        inspections: {
          current: totalInspections,
          recent: calculateTrend(recentInspections),
          change: calculateTrend(recentInspections) > 0 ? `+${calculateTrend(recentInspections)}` : '0'
        },
        seizures: {
          current: totalSeizures,
          recent: calculateTrend(recentSeizures),
          change: calculateTrend(recentSeizures) > 0 ? `+${calculateTrend(recentSeizures)}` : '0'
        },
        firCases: {
          current: totalFirCases,
          recent: calculateTrend(recentFirCases),
          change: calculateTrend(recentFirCases) > 0 ? `+${calculateTrend(recentFirCases)}` : '0'
        },
        labSamples: {
          current: totalLabSamples,
          recent: calculateTrend(recentLabSamples),
          change: calculateTrend(recentLabSamples) > 0 ? `+${calculateTrend(recentLabSamples)}` : '0'
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: dashboardStats,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST endpoint for dashboard stats refresh
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // This can be used to trigger stats recalculation or cache refresh
    return NextResponse.json({
      success: true,
      message: 'Dashboard stats refresh triggered',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error refreshing dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
