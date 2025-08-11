
"use client";
import React, { useState } from 'react';
import AgriDashboardCard from './AgriDashboardCard';
import AgriActivityItem from './AgriActivityItem';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

const submissionStatsData = [
  { name: 'Fertilizer Lic.', submitted: 45, approved: 30, rejected: 5 },
  { name: 'Form A1', submitted: 60, approved: 55, rejected: 2 },
  { name: 'Inspection (F)', submitted: 25, approved: 20, rejected: 1 },
  { name: 'Form V', submitted: 30, approved: 22, rejected: 3 },
  { name: 'Form IV', submitted: 18, approved: 15, rejected: 0 },
  { name: 'Inspection (I)', submitted: 22, approved: 19, rejected: 1 },
];

const chartConfig = {
  submitted: { label: "Submitted", color: "hsl(var(--chart-1))" },
  approved: { label: "Approved", color: "hsl(var(--chart-2))" },
  rejected: { label: "Rejected", color: "hsl(var(--chart-3))" },
};

const AgriDashboard = () => {
  const [pendingCount, setPendingCount] = useState(12);
  const [processingAll, setProcessingAll] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleProcessAllPending = () => {
    setProcessingAll(true);
    setTimeout(() => {
      setPendingCount(0);
      setProcessingAll(false);
      setSuccessMessage("All pending forms have been processed successfully!");
      setTimeout(() => setSuccessMessage(""), 5000);
    }, 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Dashboard</h2>
        <Button
          onClick={handleProcessAllPending}
          disabled={pendingCount === 0 || processingAll}
          variant={pendingCount === 0 || processingAll ? "secondary" : "default"}
          size="sm"
        >
          {processingAll ? (
            <>
              <span className="inline-block mr-2 animate-spin">⟳</span>
              Processing...
            </>
          ) : (
            "Process All Pending"
          )}
        </Button>
      </div>

      {successMessage && (
        <Alert variant="default" className="mb-4 sm:mb-6 bg-green-100 border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300">
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <AgriDashboardCard title="Pending Forms" count={pendingCount.toString()} color="blue" />
        <AgriDashboardCard title="Submitted Forms" count="60" color="green" />
        <AgriDashboardCard title="Rejected Forms" count="3" color="red" />
        <AgriDashboardCard title="Under Review" count="7" color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest form actions and status updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-2">
                 <Button variant="link" size="sm" className="text-primary hover:text-primary/80 p-0">View All</Button>
            </div>
            <ul className="space-y-4">
              {pendingCount === 0 && successMessage ? (
                <AgriActivityItem
                  action="Bulk Processed"
                  form="All Pending Forms"
                  time="Just now"
                  status="processed"
                />
              ) : (
                <AgriActivityItem
                  action="Submitted"
                  form="Fertilizer Sale License Application"
                  time="2 hours ago"
                  status="pending"
                />
              )}
              <AgriActivityItem
                action="Approved"
                form="Form A1 - Memorandum of Intimation"
                time="Yesterday"
                status="approved"
              />
              <AgriActivityItem
                action="Returned for Correction"
                form="Insecticide Manufacturing Inspection"
                time="2 days ago"
                status="rejected"
              />
              <AgriActivityItem
                action="Updated"
                form="Form IV - Insecticide Analyst Report"
                time="3 days ago"
                status="updated"
              />
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Form Submission Statistics</CardTitle>
            <CardDescription>Overview of form statuses by type.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] sm:h-[350px] p-2">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%" >
                <BarChart data={submissionStatsData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}> {/* Adjusted margins */}
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} angle={-25} textAnchor="end" height={60} interval={0} fontSize={9} smFontSize={10} /> {/* Responsive font size */}
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={10} smFontSize={12}/>
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="submitted" fill="var(--color-submitted)" radius={4} />
                  <Bar dataKey="approved" fill="var(--color-approved)" radius={4} />
                  <Bar dataKey="rejected" fill="var(--color-rejected)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgriDashboard;
