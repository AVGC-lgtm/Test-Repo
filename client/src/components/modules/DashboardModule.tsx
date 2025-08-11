"use client";
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import StatCard from '@/components/shared/StatCard';
import { AlertTriangle, Calendar, Package, Building, Scale, UserCheck, ListChecks, Settings2, FilePieChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Area, AreaChart, ResponsiveContainer } from "recharts"
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

import AgriDashboardCard from '@/components/agri-forms/AgriDashboardCard';
import AgriActivityItem from '@/components/agri-forms/AgriActivityItem';

const agriFormSubmissionStatsData = [
  { name: 'Fert.Lic.', submitted: 45, approved: 30, rejected: 5 },
  { name: 'Form A1', submitted: 60, approved: 55, rejected: 2 },
  { name: 'Insp(F)', submitted: 25, approved: 20, rejected: 1 },
  { name: 'Form V', submitted: 30, approved: 22, rejected: 3 },
  { name: 'Form IV', submitted: 18, approved: 15, rejected: 0 },
  { name: 'Insp(I)', submitted: 22, approved: 19, rejected: 1 },
];

const agriFormChartConfig = {
  submitted: { label: "Submitted", color: "hsl(var(--chart-1))" },
  approved: { label: "Approved", color: "hsl(var(--chart-2))" },
  rejected: { label: "Rejected", color: "hsl(var(--chart-4))" },
};

interface DashboardStatsType {
  overview: {
    totalInspections: number;
    totalSeizures: number;
    totalFirCases: number;
    totalLabSamples: number;
    activeSeizures: number;
    pendingLabSamples: number;
    activeFirCases: number;
    complianceRate: number;
  };
  trends: {
    inspections: { current: number; recent: number; change: string };
    seizures: { current: number; recent: number; change: string };
    firCases: { current: number; recent: number; change: string };
    labSamples: { current: number; recent: number; change: string };
  };
  statusBreakdown: {
    inspections: Record<string, number>;
    seizures: Record<string, number>;
    firCases: Record<string, number>;
    labSamples: Record<string, number>;
  };
}

const DashboardModule = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const { setActiveTab } = useAppContext();
  const router = useRouter();
  const [dynamicBarSize, setDynamicBarSize] = useState(15);

useEffect(() => {
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard-stats'); // No /api prefix if api instance already has baseURL
      console.log("dashboard stat", response.data.overview);
      setDashboardStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardStats();
}, []);


  useEffect(() => {
    const handleResize = () => {
      setDynamicBarSize(window.innerWidth < 640 ? 8 : 15);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [dynamicVerticalBarSize, setDynamicVerticalBarSize] = useState(12);

  useEffect(() => {
    const handleResize = () => {
      setDynamicVerticalBarSize(window.innerWidth < 640 ? 8 : 12);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const performanceData = [
    { month: 'Jan', inspections: 234, violations: 28, seizures: 15 },
    { month: 'Feb', inspections: 267, violations: 35, seizures: 22 },
    { month: 'Mar', inspections: 298, violations: 42, seizures: 31 },
    { month: 'Apr', inspections: 312, violations: 38, seizures: 27 },
    { month: 'May', inspections: 324, violations: 45, seizures: 33 },
  ];

  const performanceChartConfig = {
    inspections: { label: "Inspections", color: "hsl(var(--chart-1))" },
    violations: { label: "Violations", color: "hsl(var(--chart-2))" },
    seizures: { label: "Seizures", color: "hsl(var(--chart-3))" },
  }

  const officerPerformance = [
    { name: 'Ram Kumar', inspections: 45, seizures: 8, compliance: 92 },
    { name: 'Priya Sharma', inspections: 52, seizures: 12, compliance: 89 },
    { name: 'Suresh Patil', inspections: 38, seizures: 5, compliance: 95 },
    { name: 'Anjali Singh', inspections: 41, seizures: 7, compliance: 91 },
    { name: 'Vikram Reddy', inspections: 49, seizures: 10, compliance: 88 },
  ];

  const hotspotData = [
    { area: 'Kolhapur', riskLevel: 85, violations: 22 },
    { area: 'Sangli', riskLevel: 72, violations: 18 },
    { area: 'Solapur', riskLevel: 68, violations: 15 },
    { area: 'Ahmednagar', riskLevel: 78, violations: 20 },
    { area: 'Pune', riskLevel: 65, violations: 12 },
  ];

  const hotspotChartConfig = {
    riskLevel: { label: "Risk %", color: "hsl(var(--chart-1))" },
    violations: { label: "Violations", color: "hsl(var(--chart-2))" },
  }

  const handleNavigateToAgriForms = (targetSubMenu?: string) => {
    setActiveTab('agri-forms-module');
    let path = '/?tab=agri-forms-module';
    if (targetSubMenu) {
      path += `&agriSubMenu=${targetSubMenu}`;
    }
    router.push(path);
  }

  const agriPendingFormsCount = 12;
  const agriSubmittedFormsCount = 60;
  const agriRejectedFormsCount = 3;
  const agriUnderReviewFormsCount = 7;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="border-l-4 border-destructive bg-destructive/10 p-3 sm:p-4 rounded-md">
        <div className="flex items-center">
          <AlertTriangle className="text-destructive mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
          <div>
            <h3 className="font-semibold text-destructive text-sm sm:text-base">
              Escalation Alert: {dashboardStats ? dashboardStats.overview.activeFirCases : '...'} Pending FIRs
            </h3>
            <p className="text-xs sm:text-sm text-destructive/80">
              Lab reports confirmed violations. Immediate legal action required.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Inspections"
          value={dashboardStats ? dashboardStats.overview.totalInspections.toString() : '...'}
          trend={dashboardStats ? dashboardStats.trends.inspections.change : '+12%'}
          icon={<Calendar />}
          color="blue"
        />
        <StatCard
          title="Active Seizures"
          value={dashboardStats ? dashboardStats.overview.activeSeizures.toString() : '...'}
          trend={dashboardStats ? dashboardStats.trends.seizures.change : '+8%'}
          color="yellow"
          icon={<Package />}
        />
        <StatCard
          title="Lab Samples"
          value={dashboardStats ? dashboardStats.overview.pendingLabSamples.toString() : '...'}
          trend={dashboardStats ? dashboardStats.trends.labSamples.change : '5 pending'}
          color="purple"
          icon={<Building />}
        />
        <StatCard
          title="FIR Cases"
          value={dashboardStats ? dashboardStats.overview.totalFirCases.toString() : '...'}
          trend={dashboardStats ? dashboardStats.trends.firCases.change : '3 new'}
          color="red"
          icon={<Scale />}
        />
        <StatCard
          title="Compliance Rate"
          value={dashboardStats ? `${dashboardStats.overview.complianceRate.toFixed(1)}%` : '...'}
          trend="+2.3%"
          color="green"
          icon={<UserCheck />}
        />
      </div>

      <Card className="shadow-md">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg sm:text-xl">Agri-Forms Portal Summary</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Overview of agricultural form activities.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleNavigateToAgriForms('dashboard')}>
            Go to Agri-Forms Portal
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AgriDashboardCard title="Pending Forms" count={agriPendingFormsCount.toString()} color="blue" />
            <AgriDashboardCard title="Submitted Forms" count={agriSubmittedFormsCount.toString()} color="green" />
            <AgriDashboardCard title="Rejected Forms" count={agriRejectedFormsCount.toString()} color="red" />
            <AgriDashboardCard title="Under Review" count={agriUnderReviewFormsCount.toString()} color="yellow" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Recent Agri-Form Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <AgriActivityItem
                    action="Submitted"
                    form="Fertilizer Sale License Application"
                    time="2 hours ago"
                    status="pending"
                  />
                  <AgriActivityItem
                    action="Approved"
                    form="Form A1 - Memorandum of Intimation"
                    time="Yesterday"
                    status="approved"
                  />
                  <AgriActivityItem
                    action="Returned"
                    form="Insecticide Mfg. Inspection"
                    time="2 days ago"
                    status="rejected"
                  />
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Agri-Form Submission Stats</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Overview of form statuses by type.</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px] sm:h-[350px] p-2">
                <ChartContainer config={agriFormChartConfig} className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agriFormSubmissionStatsData} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} angle={-30} textAnchor="end" height={70} interval={0} fontSize={9} />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={9} />
                      <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="submitted" fill="var(--color-submitted)" radius={3} barSize={dynamicBarSize}/>
                      <Bar dataKey="approved" fill="var(--color-approved)" radius={3} barSize={dynamicBarSize}/>
                      <Bar dataKey="rejected" fill="var(--color-rejected)" radius={3} barSize={dynamicBarSize}/>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">Agri-Forms: Submissions</CardTitle>
              <ListChecks className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </div>
            <CardDescription className="text-xs sm:text-sm">Quick overview of form submissions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs sm:text-sm">Total Submissions: <span className="font-semibold">78</span></p>
            <div className="text-[10px] sm:text-xs text-muted-foreground space-y-1">
              <p>Latest: <span className="text-foreground">FL-2024-0124 - Pend.</span></p>
              <p>Updated: <span className="text-foreground">IRI-2024-0990 - Pend. Upd.</span></p>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-2 text-xs sm:text-sm" onClick={() => handleNavigateToAgriForms('submissions')}>
              View All Submissions
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">Agri-Forms: Reports</CardTitle>
              <FilePieChart className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </div>
            <CardDescription className="text-xs sm:text-sm">Access form analytics and reports.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs sm:text-sm">Generate reports on trends & rates.</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Approval rate: <span className="text-foreground">85%</span></p>
             <Button variant="outline" size="sm" className="w-full mt-2 text-xs sm:text-sm" onClick={() => handleNavigateToAgriForms('reports')}>
              Go to Reports Section
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">Agri-Forms: Settings</CardTitle>
              <Settings2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </div>
            <CardDescription className="text-xs sm:text-sm">Configure portal preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs sm:text-sm">Manage account and notifications.</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Tip: Enable email notifications.</p>
             <Button variant="outline" size="sm" className="w-full mt-2 text-xs sm:text-sm" onClick={() => handleNavigateToAgriForms('settings')}>
              Manage Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Monthly Inspection Trends</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Inspection activities over past months.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] sm:h-[300px] p-2">
            <ChartContainer config={performanceChartConfig} className="w-full h-full">
              <AreaChart data={performanceData} margin={{ left: -25, right: 5, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Area type="monotone" dataKey="inspections" fill="var(--color-inspections)" stroke="var(--color-inspections)" stackId="1" />
                <Area type="monotone" dataKey="violations" fill="var(--color-violations)" stroke="var(--color-violations)" stackId="1" />
                <Area type="monotone" dataKey="seizures" fill="var(--color-seizures)" stroke="var(--color-seizures)" stackId="1" />
                 <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Officer-wise Performance</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Key metrics for field officers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {officerPerformance.slice(0, 4).map((officer, index) => (
              <div key={index} className="p-2 sm:p-3 rounded-lg bg-muted/50">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-xs sm:text-sm">{officer.name}</span>
                  <div className="flex gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
                    <span>Insp: {officer.inspections}</span>
                    <span>Seiz: {officer.seizures}</span>
                    <span className={`font-medium ${
                      officer.compliance > 90 ? 'text-green-500' : 'text-yellow-500'
                    }`}>
                      {officer.compliance}% Comp.
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">High-Risk Area Identification</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Violation hotspots and risk levels.</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] sm:h-[300px] p-2">
          <ChartContainer config={hotspotChartConfig} className="w-full h-full">
            <BarChart data={hotspotData} layout="vertical" margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
              <YAxis dataKey="area" type="category" tickLine={false} axisLine={false} tickMargin={8} width={60} fontSize={10} />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <Bar dataKey="riskLevel" fill="var(--color-riskLevel)" radius={3} barSize={dynamicVerticalBarSize} />
              <Bar dataKey="violations" fill="var(--color-violations)" radius={3} barSize={dynamicVerticalBarSize} />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardModule;
