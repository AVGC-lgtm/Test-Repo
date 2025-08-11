
"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

const monthlySubmissionsData = [
  { month: 'Jan', submissions: 120 }, { month: 'Feb', submissions: 150 },
  { month: 'Mar', submissions: 130 }, { month: 'Apr', submissions: 180 },
  { month: 'May', submissions: 210 }, { month: 'Jun', submissions: 190 },
];
const monthlyChartConfig = {
  submissions: { label: "Submissions", color: "hsl(var(--chart-1))" },
};

const approvalStatsData = [
  { name: 'Approved', value: 400, fill: "hsl(var(--chart-2))" },
  { name: 'Rejected', value: 50, fill: "hsl(var(--chart-3))" },
  { name: 'Pending', value: 150, fill: "hsl(var(--chart-4))" },
];
const approvalChartConfig = {
  value: { label: "Forms" }
};


const AgriReports = () => {
  const ChartPlaceholder = ({ title = "Chart Visualization" }: { title?: string }) => (
    <div className="h-64 flex items-center justify-center border rounded-md bg-muted/30">
      <p className="text-muted-foreground">{title} Would Appear Here</p>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Reports & Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Monthly Submission Trends</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Number of forms submitted per month.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] sm:h-[300px] p-2">
            <ChartContainer config={monthlyChartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySubmissionsData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} smFontSize={12}/>
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={10} smFontSize={12}/>
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="submissions" fill="var(--color-submissions)" radius={4} />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Approval Statistics</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Overall status of submitted forms.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] sm:h-[300px] p-2 flex items-center justify-center">
            <ChartContainer config={approvalChartConfig} className="w-full max-w-[280px] sm:max-w-xs h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" indicator="dot" />} />
                  <Pie data={approvalStatsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} smOuterRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} className="text-[10px] sm:text-xs">
                    {approvalStatsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                   <ChartLegend content={<ChartLegendContent nameKey="name" />} className="mt-2 sm:mt-4 text-xs" />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Form Submissions by Type</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Breakdown of submissions for each form type.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartPlaceholder title="Submissions by Type Chart"/>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Generate Custom Reports</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Select parameters to generate a specific report.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 sm:mb-6">
            <div>
              <Label htmlFor="reportType" className="block text-sm font-medium text-foreground mb-1">Report Type</Label>
              <Select>
                <SelectTrigger id="reportType" className="text-sm h-9"><SelectValue placeholder="Select Report Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="submissions">Form Submissions</SelectItem>
                  <SelectItem value="approval_stats">Approval Statistics</SelectItem>
                  <SelectItem value="inspection_reports">Inspection Reports</SelectItem>
                  <SelectItem value="sample_analysis">Sample Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateRange" className="block text-sm font-medium text-foreground mb-1">Date Range</Label>
              <Select>
                <SelectTrigger id="dateRange" className="text-sm h-9"><SelectValue placeholder="Select Date Range" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="3m">Last 3 Months</SelectItem>
                  <SelectItem value="6m">Last 6 Months</SelectItem>
                  <SelectItem value="custom">Custom Range (Input below)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reportFormat" className="block text-sm font-medium text-foreground mb-1">Format</Label>
              <Select>
                <SelectTrigger id="reportFormat" className="text-sm h-9"><SelectValue placeholder="Select Format" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel (XLSX)</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button size="default" className="w-full sm:w-auto">Generate Report</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgriReports;
