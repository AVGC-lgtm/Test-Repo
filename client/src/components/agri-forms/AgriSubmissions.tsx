

"use client";
import React, { useState } from 'react';
import { Search, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react'; 
import AgriSubmissionRow from './AgriSubmissionRow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type SubmissionStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Pending Update';

interface Submission {
  id: string;
  type: string;
  date: string;
  status: SubmissionStatus;
  formTypeKey: string; 
}

const initialSubmissions: Submission[] = [
    { id: "FL-2024-0123", type: "Fertilizer Sale License", date: "15 May 2025", status: "Pending", formTypeKey: "fertilizerLicense" },
    { id: "FA1-2024-0456", type: "Form A1 - Memorandum", date: "10 May 2025", status: "Under Review", formTypeKey: "formA1" },
    { id: "IRF-2024-0789", type: "Inspection Report - Fertilizer", date: "05 May 2025", status: "Approved", formTypeKey: "inspectionFertilizer" },
    { id: "FV-2024-0321", type: "Form V - Inspector Forms", date: "28 Apr 2025", status: "Rejected", formTypeKey: "formV" },
    { id: "FIV-2024-0654", type: "Form IV - Analyst Report", date: "20 Apr 2025", status: "Approved", formTypeKey: "formIV" },
    { id: "IRI-2024-0990", type: "Insecticide Manufacturing Inspection", date: "18 May 2025", status: "Pending Update", formTypeKey: "inspectionInsecticide" },
];


const AgriSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "All">("All");
  const [formTypeFilter, setFormTypeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingBatch, setProcessingBatch] = useState(false);
  const [showBatchAlert, setShowBatchAlert] = useState(false);

  const handleBatchProcess = () => {
    setProcessingBatch(true);
    setTimeout(() => {
      const updatedSubmissions = submissions.map(submission => {
        if (submission.status === "Pending") {
          return { ...submission, status: "Under Review" as SubmissionStatus };
        }
        return submission;
      });
      setSubmissions(updatedSubmissions);
      setProcessingBatch(false);
      setShowBatchAlert(true);
      setTimeout(() => setShowBatchAlert(false), 5000);
    }, 2000);
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesStatus = statusFilter === "All" || submission.status === statusFilter;
    const matchesFormType = formTypeFilter === "All" || submission.formTypeKey.toLowerCase() === formTypeFilter.toLowerCase();
    const matchesSearch = submission.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          submission.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesFormType && matchesSearch;
  });

  const pendingCount = submissions.filter(s => s.status === "Pending").length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Your Submissions</h2>
        <Button
          onClick={handleBatchProcess}
          disabled={pendingCount === 0 || processingBatch}
          variant={pendingCount === 0 || processingBatch ? "secondary" : "default"}
          size="sm"
        >
          {processingBatch ? (
            <>
              <RotateCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Process All Pending (${pendingCount})`
          )}
        </Button>
      </div>

      {showBatchAlert && (
        <Alert variant="default" className="mb-4 sm:mb-6 bg-green-100 border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300">
          <AlertTitle>Batch Processed!</AlertTitle>
          <AlertDescription>All pending submissions have been processed and moved to 'Under Review'.</AlertDescription>
        </Alert>
      )}

      <Card className="shadow-md">
        <CardHeader className="p-3 sm:p-4 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
            <div className="relative w-full md:w-auto md:flex-grow max-w-xs">
              <Input
                type="text"
                placeholder="Search by ID or Form Type..."
                className="pl-10 pr-4 py-2 w-full h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as SubmissionStatus | "All")}>
                <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm"><SelectValue placeholder="Filter by Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Pending Update">Pending Update</SelectItem>
                </SelectContent>
              </Select>
              <Select value={formTypeFilter} onValueChange={setFormTypeFilter}>
                <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm"><SelectValue placeholder="Filter by Form Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Form Types</SelectItem>
                  <SelectItem value="fertilizerLicense">Fertilizer Sale License</SelectItem>
                  <SelectItem value="formA1">Form A1 - Memorandum</SelectItem>
                  <SelectItem value="inspectionFertilizer">Fertilizer Inspection Report</SelectItem>
                  <SelectItem value="formV">Form V - Inspector Forms</SelectItem>
                  <SelectItem value="formIV">Form IV - Analyst Report</SelectItem>
                  <SelectItem value="inspectionInsecticide">Insecticide Mfg. Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3 sm:px-6">Form ID</TableHead>
                  <TableHead className="px-4 py-3 sm:px-6">Form Type</TableHead>
                  <TableHead className="px-4 py-3 sm:px-6">Date</TableHead>
                  <TableHead className="px-4 py-3 sm:px-6">Status</TableHead>
                  <TableHead className="text-right px-4 py-3 sm:px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map(submission => <AgriSubmissionRow key={submission.id} {...submission} />)}
                {filteredSubmissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No submissions match your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between border-t gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Showing <span className="font-medium">{filteredSubmissions.length}</span> of <span className="font-medium">{submissions.length}</span> submissions
          </p>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <Button variant="outline" size="sm" className="px-2 sm:px-3">1</Button>
            <Button variant="outline" size="sm" disabled>
               <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AgriSubmissions;
