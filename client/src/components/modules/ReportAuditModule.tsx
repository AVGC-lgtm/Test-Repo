"use client";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  FileSearch,
  Download,
  RefreshCw,
  BarChart3,
  Users,
  Package,
  FlaskConical,
  Scale,
  Calendar as CalendarIcon,
  Filter,
  Eye,
  TrendingUp,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { DateRange as CalendarDateRange } from "react-day-picker";

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
}

interface ScanResult {
  id: string;
  company: string;
  product: string;
  batchNumber: string;
  authenticityScore: number;
  issues: string[];
  recommendation: string;
  geoLocation: string;
  timestamp: string;
}

interface Inspection {
  id: string;
  officer: string;
  date: string;
  location: string;
  targetType: string;
  equipment: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: User;
}

interface Seizure {
  id: string;
  quantity: string;
  estimatedValue: string;
  witnessName: string;
  evidencePhotos: string[];
  videoEvidence?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  scanResultId: string;
  user?: User;
  scanResult?: ScanResult;
}

interface LabSample {
  id: string;
  sampleType: string;
  labDestination: string;
  status: string;
  labResult?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  seizureId: string;
  user?: User;
  seizure?: {
    id: string;
    quantity: string;
    estimatedValue: string;
    scanResult?: ScanResult;
  };
}

interface FIRCase {
  id: string;
  labReportId: string;
  violationType: string;
  accused: string;
  location: string;
  status: string;
  caseNotes?: string;
  courtDate?: string;
  outcome?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  seizureId?: string;
  labSampleId?: string;
  user?: User;
  seizure?: Seizure;
  labSample?: LabSample;
}

interface StatusCount {
  status: string;
  _count: {
    status: number;
  };
}

interface AuditActivity {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
  user: User;
}

interface DateRange {
  from?: Date;
  to?: Date;
}

interface ReportFilters {
  auditId: string;
  officer: string;
  district: string;
  keyword: string;
  dateRange?: CalendarDateRange;
}

interface DashboardReport {
  summary: {
    totalInspections: number;
    totalSeizures: number;
    totalLabSamples: number;
    totalFIRCases: number;
  };
  statusBreakdown: {
    inspections: StatusCount[];
    seizures: StatusCount[];
    labSamples: StatusCount[];
    firCases: StatusCount[];
  };
  recentActivity: AuditActivity[];
  topOfficers?: Array<{
    userId: string;
    _count: { userId: number };
    user?: User;
  }>;
  topDistricts?: Array<{
    location: string;
    _count: { location: number };
  }>;
}

interface InspectionsReport {
  inspections: Inspection[];
  statusBreakdown: StatusCount[];
  userBreakdown: Array<{
    userId: string;
    _count: { userId: number };
  }>;
  equipmentStats?: Array<{
    equipment: string;
    count: number;
  }>;
}

interface SeizuresReport {
  seizures: Seizure[];
  statusBreakdown: StatusCount[];
  companyBreakdown?: Array<{
    company: string;
    _count: { company: number };
  }>;
  valueAnalysis?: {
    _sum: { estimatedValue: number };
    _avg: { estimatedValue: number };
    _count: number;
  };
}

interface LabSamplesReport {
  labSamples: LabSample[];
  statusBreakdown: StatusCount[];
  labDestinationBreakdown?: Array<{
    labDestination: string;
    _count: { labDestination: number };
  }>;
  resultBreakdown?: Array<{
    labResult: string;
    _count: { labResult: number };
  }>;
  analytics?: {
    avgCompletionTimeHours: number;
    completionRate: string;
  };
}

interface FIRCasesReport {
  firCases: FIRCase[];
  statusBreakdown: StatusCount[];
  violationBreakdown?: Array<{
    violationType: string;
    _count: { violationType: number };
  }>;
  locationBreakdown?: Array<{
    location: string;
    _count: { location: number };
  }>;
  analytics?: {
    avgResolutionTimeDays: number;
    resolutionRate: string;
  };
}

const ReportAuditModule = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    auditId: "",
    officer: "",
    district: "",
    keyword: "",
    dateRange: undefined,
  });

  // Available officers (you can fetch this from API)
  const officers = [
    "Priya Sharma",
    "Suresh Patil",
    "Ram Kumar",
    "Anjali Singh",
    "Vikram Reddy",
    "Deepak Yadav",
    "Sunita Devi",
    "Rajesh Gupta"
  ];

  // Available districts
  const districts = [
    "Kolhapur",
    "Pune",
    "Mumbai",
    "Nashik",
    "Satara",
    "Sangli",
    "Aurangabad",
    "Nagpur"
  ];

  const handleFilter = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("type", activeTab);
      
      if (filters.dateRange?.from) {
        params.append("startDate", filters.dateRange.from.toISOString());
      }
      if (filters.dateRange?.to) {
        params.append("endDate", filters.dateRange.to.toISOString());
      }
      if (filters.officer && filters.officer !== "all") params.append("officer", filters.officer);
      if (filters.district && filters.district !== "all") params.append("district", filters.district);
      if (filters.keyword) params.append("keyword", filters.keyword);
      if (filters.auditId) params.append("auditId", filters.auditId);

      console.log(`Fetching: /api/reports?${params.toString()}`);
      const response = await api.get(`reports?${params.toString()}`);
      
      setData(response.data);
      console.log("Report data:", response.data);
      
      toast({
        title: "Success",
        description: "Report generated successfully"
      });
    } catch (error: any) {
      console.error("Error fetching data", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || "Failed to fetch report data"
      });
    }
    setLoading(false);
  };

  const exportToCSV = (data: Record<string, any>[], filename: string) => {
    if (!data.length) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "No data available to export"
      });
      return;
    }

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row: Record<string, any>) => 
      Object.values(row).map((value: any) => 
        typeof value === 'object' ? JSON.stringify(value) : value
      ).join(",")
    );
    
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `${filename} exported successfully`
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      scheduled: "bg-blue-100 text-blue-800",
      "in-progress": "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      pending: "bg-orange-100 text-orange-800",
      dispatched: "bg-purple-100 text-purple-800",
      analyzed: "bg-indigo-100 text-indigo-800",
      "legal-action": "bg-red-100 text-red-800",
      closed: "bg-gray-100 text-gray-800",
      "in-transit": "bg-blue-100 text-blue-800",
      received: "bg-yellow-100 text-yellow-800",
      testing: "bg-purple-100 text-purple-800",
      failed: "bg-red-100 text-red-800",
      draft: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={statusConfig[status] || "bg-gray-100 text-gray-800"}>
        {status.replace("-", " ").toUpperCase()}
      </Badge>
    );
  };

  useEffect(() => {
    handleFilter();
  }, [activeTab]);

  const renderDashboard = () => {
    const dashboardData = data as DashboardReport;
    if (!dashboardData?.summary) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{dashboardData.summary.totalInspections}</p>
                <p className="text-sm text-muted-foreground">Inspections</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{dashboardData.summary.totalSeizures}</p>
                <p className="text-sm text-muted-foreground">Seizures</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <FlaskConical className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{dashboardData.summary.totalLabSamples}</p>
                <p className="text-sm text-muted-foreground">Lab Samples</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Scale className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{dashboardData.summary.totalFIRCases}</p>
                <p className="text-sm text-muted-foreground">FIR Cases</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Inspections</h4>
                  <div className="flex flex-wrap gap-2">
                    {dashboardData.statusBreakdown.inspections.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {getStatusBadge(item.status)}
                        <span className="text-sm">({item._count.status})</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Seizures</h4>
                  <div className="flex flex-wrap gap-2">
                    {dashboardData.statusBreakdown.seizures.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {getStatusBadge(item.status)}
                        <span className="text-sm">({item._count.status})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {dashboardData.recentActivity?.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2 rounded border-l-2 border-blue-200">
                      <Activity className="h-4 w-4 mt-1 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {activity.action} {activity.entity}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {activity.entityId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          By: {activity.user.name || activity.user.email} • {format(new Date(activity.createdAt), "MMM dd, HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderInspectionsTable = () => {
    const reportData = data as InspectionsReport;
    const inspections = reportData.inspections || [];
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold">Inspections Report ({inspections.length})</h3>
          <Button 
            onClick={() => exportToCSV(inspections, "inspections-report")}
            variant="outline" 
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
        <div className="border rounded-lg">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px] whitespace-nowrap">ID</TableHead>
                  <TableHead className="min-w-[150px] whitespace-nowrap">Officer</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Date</TableHead>
                  <TableHead className="min-w-[150px] whitespace-nowrap">Location</TableHead>
                  <TableHead className="min-w-[140px] whitespace-nowrap">Target Type</TableHead>
                  <TableHead className="min-w-[200px] whitespace-nowrap">Equipment</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Status</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspections.map((inspection: Inspection) => (
                  <TableRow key={inspection.id}>
                    <TableCell className="font-mono text-xs">{inspection.id}</TableCell>
                    <TableCell className="whitespace-nowrap">{inspection.user?.name || inspection.officer}</TableCell>
                    <TableCell className="whitespace-nowrap">{inspection.date}</TableCell>
                    <TableCell className="whitespace-nowrap">{inspection.location}</TableCell>
                    <TableCell className="capitalize whitespace-nowrap">{inspection.targetType.replace("-", " ")}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {inspection.equipment.slice(0, 2).map((eq: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs whitespace-nowrap">
                            {eq}
                          </Badge>
                        ))}
                        {inspection.equipment.length > 2 && (
                          <Badge variant="secondary" className="text-xs whitespace-nowrap">
                            +{inspection.equipment.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(inspection.status)}</TableCell>
                    <TableCell className="whitespace-nowrap">{format(new Date(inspection.createdAt), "MMM dd, yyyy")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  };

  const renderSeizuresTable = () => {
    const reportData = data as SeizuresReport;
    const seizures = reportData.seizures || [];
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold">Seizures Report ({seizures.length})</h3>
          <Button 
            onClick={() => exportToCSV(seizures, "seizures-report")}
            variant="outline" 
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
        {reportData.valueAnalysis && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">₹{reportData.valueAnalysis._sum.estimatedValue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">₹{Math.round(reportData.valueAnalysis._avg.estimatedValue).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Average Value</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{seizures.length}</p>
                <p className="text-sm text-muted-foreground">Total Seizures</p>
              </div>
            </Card>
          </div>
        )}
        <div className="border rounded-lg">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px] whitespace-nowrap">ID</TableHead>
                  <TableHead className="min-w-[150px] whitespace-nowrap">Company</TableHead>
                  <TableHead className="min-w-[150px] whitespace-nowrap">Product</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Quantity</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Value</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Auth Score</TableHead>
                  <TableHead className="min-w-[150px] whitespace-nowrap">Officer</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Status</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seizures.map((seizure: Seizure) => (
                  <TableRow key={seizure.id}>
                    <TableCell className="font-mono text-xs">{seizure.id}</TableCell>
                    <TableCell className="whitespace-nowrap">{seizure.scanResult?.company || "N/A"}</TableCell>
                    <TableCell className="whitespace-nowrap">{seizure.scanResult?.product || "N/A"}</TableCell>
                    <TableCell className="whitespace-nowrap">{seizure.quantity}</TableCell>
                    <TableCell className="whitespace-nowrap">₹{seizure.estimatedValue}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className={(seizure.scanResult?.authenticityScore || 0) > 70 ? "text-green-600" : "text-red-600"}>
                        {seizure.scanResult?.authenticityScore || 0}%
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{seizure.user?.name || seizure.user?.email}</TableCell>
                    <TableCell>{getStatusBadge(seizure.status)}</TableCell>
                    <TableCell className="whitespace-nowrap">{format(new Date(seizure.createdAt), "MMM dd, yyyy")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  };

  const renderLabSamplesTable = () => {
    const reportData = data as LabSamplesReport;
    const labSamples = reportData.labSamples || [];
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold">Lab Samples Report ({labSamples.length})</h3>
          <Button 
            onClick={() => exportToCSV(labSamples, "lab-samples-report")}
            variant="outline" 
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
        <div className="border rounded-lg">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[140px] whitespace-nowrap">Sample ID</TableHead>
                  <TableHead className="min-w-[140px] whitespace-nowrap">Sample Type</TableHead>
                  <TableHead className="min-w-[160px] whitespace-nowrap">Lab Destination</TableHead>
                  <TableHead className="min-w-[140px] whitespace-nowrap">Seizure ID</TableHead>
                  <TableHead className="min-w-[180px] whitespace-nowrap">Product</TableHead>
                  <TableHead className="min-w-[150px] whitespace-nowrap">Officer</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Status</TableHead>
                  <TableHead className="min-w-[180px] whitespace-nowrap">Result</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labSamples.map((sample: LabSample) => (
                  <TableRow key={sample.id}>
                    <TableCell className="font-mono text-xs">{sample.id}</TableCell>
                    <TableCell className="whitespace-nowrap">{sample.sampleType}</TableCell>
                    <TableCell className="whitespace-nowrap">{sample.labDestination}</TableCell>
                    <TableCell className="font-mono text-xs">{sample.seizureId}</TableCell>
                    <TableCell className="whitespace-nowrap max-w-[180px]">
                      <div className="truncate" title={`${sample.seizure?.scanResult?.company} - ${sample.seizure?.scanResult?.product}`}>
                        {sample.seizure?.scanResult?.company} - {sample.seizure?.scanResult?.product}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{sample.user?.name || sample.user?.email}</TableCell>
                    <TableCell>{getStatusBadge(sample.status)}</TableCell>
                    <TableCell className="max-w-[180px]">
                      {sample.labResult ? (
                        <div className="truncate" title={sample.labResult}>
                          {sample.labResult}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Pending</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{format(new Date(sample.createdAt), "MMM dd, yyyy")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  };

  const renderFIRCasesTable = () => {
    const reportData = data as FIRCasesReport;
    const firCases = reportData.firCases || [];
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold">FIR Cases Report ({firCases.length})</h3>
          <Button 
            onClick={() => exportToCSV(firCases, "fir-cases-report")}
            variant="outline" 
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
        <div className="border rounded-lg">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[140px] whitespace-nowrap">Case ID</TableHead>
                  <TableHead className="min-w-[140px] whitespace-nowrap">Lab Report ID</TableHead>
                  <TableHead className="min-w-[160px] whitespace-nowrap">Violation Type</TableHead>
                  <TableHead className="min-w-[140px] whitespace-nowrap">Accused</TableHead>
                  <TableHead className="min-w-[140px] whitespace-nowrap">Location</TableHead>
                  <TableHead className="min-w-[140px] whitespace-nowrap">Seizure ID</TableHead>
                  <TableHead className="min-w-[150px] whitespace-nowrap">Officer</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Status</TableHead>
                  <TableHead className="min-w-[140px] whitespace-nowrap">Court Date</TableHead>
                  <TableHead className="min-w-[120px] whitespace-nowrap">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {firCases.map((firCase: FIRCase) => (
                  <TableRow key={firCase.id}>
                    <TableCell className="font-mono text-xs">{firCase.id}</TableCell>
                    <TableCell className="font-mono text-xs">{firCase.labReportId}</TableCell>
                    <TableCell className="whitespace-nowrap">{firCase.violationType}</TableCell>
                    <TableCell className="whitespace-nowrap">{firCase.accused}</TableCell>
                    <TableCell className="whitespace-nowrap">{firCase.location}</TableCell>
                    <TableCell className="font-mono text-xs">{firCase.seizureId || "N/A"}</TableCell>
                    <TableCell className="whitespace-nowrap">{firCase.user?.name || firCase.user?.email}</TableCell>
                    <TableCell>{getStatusBadge(firCase.status)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {firCase.courtDate ? format(new Date(firCase.courtDate), "MMM dd, yyyy") : "N/A"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{format(new Date(firCase.createdAt), "MMM dd, yyyy")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Reports & Audit
              </CardTitle>
              <CardDescription>Comprehensive reports and audit trails for all operations.</CardDescription>
            </div>
            <Button onClick={handleFilter} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filters */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div>
                <Label htmlFor="auditId">Audit ID</Label>
                <Input
                  id="auditId"
                  placeholder="Enter audit ID"
                  value={filters.auditId}
                  onChange={(e) => setFilters(prev => ({ ...prev, auditId: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="officer">Officer</Label>
                <Select
                  value={filters.officer}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, officer: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Officer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Officers</SelectItem>
                    {officers.map(officer => (
                      <SelectItem key={officer} value={officer}>{officer}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="district">District</Label>
                <Select
                  value={filters.district}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, district: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    {districts.map(district => (
                      <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange?.from ? (
                        filters.dateRange.to ? (
                          <>
                            {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                            {format(filters.dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(filters.dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={filters.dateRange?.from}
                      selected={filters.dateRange}
                      onSelect={(range: CalendarDateRange | undefined) => setFilters(prev => ({ ...prev, dateRange: range }))}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="keyword">Keyword</Label>
                <Input
                  id="keyword"
                  placeholder="Search keyword"
                  value={filters.keyword}
                  onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                />
              </div>

              <div className="flex items-end">
                <Button className="w-full" onClick={handleFilter} disabled={loading}>
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </Card>

          {/* Report Type Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="overflow-x-auto">
              <TabsList className="grid w-max grid-cols-5 min-w-full">
                <TabsTrigger value="dashboard" className="flex items-center gap-2 whitespace-nowrap">
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="inspections" className="flex items-center gap-2 whitespace-nowrap">
                  <Eye className="h-4 w-4" />
                  Inspections
                </TabsTrigger>
                <TabsTrigger value="seizures" className="flex items-center gap-2 whitespace-nowrap">
                  <Package className="h-4 w-4" />
                  Seizures
                </TabsTrigger>
                <TabsTrigger value="lab-samples" className="flex items-center gap-2 whitespace-nowrap">
                  <FlaskConical className="h-4 w-4" />
                  Lab Samples
                </TabsTrigger>
                <TabsTrigger value="fir-cases" className="flex items-center gap-2 whitespace-nowrap">
                  <Scale className="h-4 w-4" />
                  FIR Cases
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-6">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin mr-3" />
                  <p>Generating report...</p>
                </div>
              )}

              {!loading && (
                <>
                  <TabsContent value="dashboard" className="mt-0">
                    {renderDashboard()}
                  </TabsContent>
                  <TabsContent value="inspections" className="mt-0">
                    {renderInspectionsTable()}
                  </TabsContent>
                  <TabsContent value="seizures" className="mt-0">
                    {renderSeizuresTable()}
                  </TabsContent>
                  <TabsContent value="lab-samples" className="mt-0">
                    {renderLabSamplesTable()}
                  </TabsContent>
                  <TabsContent value="fir-cases" className="mt-0">
                    {renderFIRCasesTable()}
                  </TabsContent>
                </>
              )}

              {!loading && !data && (
                <div className="text-center py-12">
                  <FileSearch className="w-12 h-12 mb-4 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">No data found for the selected filters.</p>
                  <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or date range.</p>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportAuditModule;