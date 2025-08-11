"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Scale, 
  FileText, 
  AlertCircle, 
  Download, 
  Briefcase, 
  Search,
  Filter,
  Plus,
  Eye,
  Calendar,
  User,
  MapPin,
  FileCheck,
  Clock,
  RefreshCw,
  Info
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '@/lib/api';

// Type definitions
type FIRCaseStatus = 'draft' | 'submitted' | 'investigating' | 'closed';

interface FIRCase {
  id: string;
  labReportId: string;
  violationType: string;
  accused: string;
  location: string;
  status: FIRCaseStatus;
  caseNotes: string | null;
  courtDate: string | null;
  outcome: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  seizureId: string | null;
  labSampleId: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  seizure?: any;
  labSample?: any;
}

const LegalModule = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allFirCases, setAllFirCases] = useState<FIRCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<FIRCase[]>([]);

  const { addFIRCase } = useAppContext();

  const { toast } = useToast();
  const [selectedCase, setSelectedCase] = useState<FIRCase | null>(null);

  // Filters and search
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [newCaseData, setNewCaseData] = useState<Partial<Omit<FIRCase, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'userId'>>>({
    labReportId: '', 
    violationType: '', 
    accused: '', 
    location: '', 
    caseNotes: '', 
    courtDate: '',
    seizureId: '',
    labSampleId: ''
  });

  // Filter cases based on search and status
  useEffect(() => {
    let filtered = [...allFirCases];

    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(firCase => firCase.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(firCase => 
        firCase.labReportId.toLowerCase().includes(query) ||
        firCase.violationType.toLowerCase().includes(query) ||
        firCase.accused.toLowerCase().includes(query) ||
        firCase.location.toLowerCase().includes(query)
      );
    }

    setFilteredCases(filtered);
  }, [allFirCases, statusFilter, searchQuery]);

  // Fetch FIR cases
  const fetchFIRCases = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      // Add status filter to API call if not 'all'
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const res = await api.get(`fir-cases${params.toString() ? '?' + params.toString() : ''}`);
      
      // Handle simple array response from your API
      const cases = Array.isArray(res.data) ? res.data : [];
      setAllFirCases(cases);
    } catch (error: any) {
      console.error("Fetch FIR error:", error);
      toast({ 
        variant: "destructive", 
        title: "Failed to fetch FIR cases",
        description: error.response?.data?.error || error.message
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  // Initial fetch
  useEffect(() => {
    fetchFIRCases();
  }, [fetchFIRCases]);

  const handleCaseSelection = (firCase: FIRCase) => {
    setSelectedCase(firCase);
  };

  const handleFileSystemIntegration = (caseId: string | undefined, system: string) => {
    if (!caseId) {
      toast({ title: "Error", description: "No case selected.", variant: "destructive" });
      return;
    }

    toast({ 
      title: "Info", 
      description: `${system} integration initiated for case ${caseId}. Note: This is view-only mode - status updates require additional API endpoints.`,
      duration: 5000
    });
  };

  const handleCreateFIR = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCaseData.labReportId || !newCaseData.violationType || !newCaseData.accused || !newCaseData.location) {
      toast({ 
        title: "Error", 
        description: "Please fill all required fields for FIR.", 
        variant: "destructive" 
      });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast({ 
        title: "Error", 
        description: "Please login to create FIR cases.", 
        variant: "destructive" 
      });
      return;
    }

    try {
      setSubmitting(true);

      const cleanedData = {
        labReportId: newCaseData.labReportId!.trim(),
        violationType: newCaseData.violationType!.trim(),
        accused: newCaseData.accused!.trim(),
        location: newCaseData.location!.trim(),
        caseNotes: newCaseData.caseNotes?.trim() || null,
        courtDate: newCaseData.courtDate || null,
        seizureId: newCaseData.seizureId?.trim() || null,
        labSampleId: newCaseData.labSampleId?.trim() || null
      };

      const res = await api.post('fir-cases', cleanedData);
      
      if (res.data) {
        const created = res.data;
        addFIRCase(created);

        toast({ 
          title: "Success", 
          description: "New FIR case created successfully." 
        });

        // Reset form
        setNewCaseData({ 
          labReportId: '', 
          violationType: '', 
          accused: '', 
          location: '', 
          caseNotes: '', 
          courtDate: '', 
          seizureId: '', 
          labSampleId: '' 
        });

        // Refresh the list
        await fetchFIRCases();
      }
    } catch (error: any) {
      console.error('FIR Creation Error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create FIR case';
      toast({ 
        title: "Error", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const downloadLegalDocument = () => {
    if (!selectedCase) {
      toast({ title: "Error", description: "No case selected to download.", variant: "destructive" });
      return;
    }

    const caseDetails = `
FIR CASE DOCUMENT
================

Case ID: ${selectedCase.id}
Lab Report: ${selectedCase.labReportId}
Violation: ${selectedCase.violationType}
Accused: ${selectedCase.accused}
Location: ${selectedCase.location}
Status: ${selectedCase.status.charAt(0).toUpperCase() + selectedCase.status.slice(1)}
Court Date: ${selectedCase.courtDate || 'Not set'}
Outcome: ${selectedCase.outcome || 'Pending'}

Created: ${selectedCase.createdAt ? new Date(selectedCase.createdAt).toLocaleDateString() : 'N/A'}
Updated: ${selectedCase.updatedAt ? new Date(selectedCase.updatedAt).toLocaleDateString() : 'N/A'}

Case Notes:
${selectedCase.caseNotes || 'No notes available'}

Legal Actions Available:
- Submit to Police e-FIR
- Initiate License Suspension  
- Prepare Court Filing

Generated on: ${new Date().toLocaleString()}

Note: This document is for informational purposes only.
    `;

    const element = document.createElement("a");
    const file = new Blob([caseDetails], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `fir-case-${selectedCase.labReportId}-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getStatusColor = (status: FIRCaseStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'investigating': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'closed': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Legal Module</h1>
          <p className="text-muted-foreground">Create and view FIR cases</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchFIRCases}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create New FIR Case */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New FIR Case
            </CardTitle>
            <CardDescription>
              Draft a new First Information Report for legal proceedings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateFIR} className="space-y-4">
              <div>
                <Label htmlFor="newLabReportId">Lab Report ID *</Label>
                <Input 
                  id="newLabReportId" 
                  value={newCaseData.labReportId || ''} 
                  onChange={e => setNewCaseData({ ...newCaseData, labReportId: e.target.value })} 
                  placeholder="e.g., LAB-12345" 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="newViolationType">Violation Type *</Label>
                <Input 
                  id="newViolationType" 
                  value={newCaseData.violationType || ''} 
                  onChange={e => setNewCaseData({ ...newCaseData, violationType: e.target.value })} 
                  placeholder="e.g., Selling counterfeit pesticide" 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="newAccused">Accused Party *</Label>
                <Input 
                  id="newAccused" 
                  value={newCaseData.accused || ''} 
                  onChange={e => setNewCaseData({ ...newCaseData, accused: e.target.value })} 
                  placeholder="e.g., Shop Name / Individual" 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="newLocation">Location of Offense *</Label>
                <Input 
                  id="newLocation" 
                  value={newCaseData.location || ''} 
                  onChange={e => setNewCaseData({ ...newCaseData, location: e.target.value })} 
                  placeholder="e.g., Kolhapur Market" 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="newCourtDate">Court Date</Label>
                <Input
                  type="date"
                  id="newCourtDate"
                  value={newCaseData.courtDate || ''}
                  onChange={e => setNewCaseData({ ...newCaseData, courtDate: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="newCaseNotes">Initial Case Notes</Label>
                <Textarea 
                  id="newCaseNotes" 
                  value={newCaseData.caseNotes || ''} 
                  onChange={e => setNewCaseData({ ...newCaseData, caseNotes: e.target.value })} 
                  placeholder="Add initial notes..." 
                  rows={3} 
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Briefcase className="mr-2 h-4 w-4" />
                    Create FIR Case
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* FIR Cases Management */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              FIR Cases View
            </CardTitle>
            <CardDescription>
              View and track all FIR cases with filtering capabilities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cases..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cases List */}
              <div className="border-r-0 md:border-r md:pr-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">
                    Cases ({filteredCases.length})
                  </h4>
                  {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                </div>

                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {filteredCases.length === 0 && !loading && (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-8 w-8 mx-auto mb-2" />
                        <p>No FIR cases found.</p>
                      </div>
                    )}

                    {filteredCases.map((firCase) => (
                      <div
                        key={firCase.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          selectedCase?.id === firCase.id
                            ? "bg-primary/10 ring-2 ring-primary"
                            : "bg-card hover:bg-muted/50"
                        }`}
                        onClick={() => handleCaseSelection(firCase)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h5 className="font-semibold text-sm">{firCase.labReportId}</h5>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {firCase.violationType}
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getStatusColor(firCase.status)}`}
                          >
                            {firCase.status.charAt(0).toUpperCase() + firCase.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <User className="h-3 w-3 mr-1" />
                            {firCase.accused}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            {firCase.location}
                          </div>
                          {firCase.courtDate && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(firCase.courtDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">
                            {new Date(firCase.createdAt).toLocaleDateString()}
                          </span>
                          <Eye className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Case Details */}
              <div className="md:pl-4">
                <h4 className="font-medium mb-4">Case Details & Information</h4>
                
                {selectedCase ? (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {/* Case Information */}
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{selectedCase.labReportId}</CardTitle>
                            <Badge className={getStatusColor(selectedCase.status)}>
                              {selectedCase.status.charAt(0).toUpperCase() + selectedCase.status.slice(1)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">VIOLATION TYPE</Label>
                            <p>{selectedCase.violationType}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">ACCUSED PARTY</Label>
                            <p>{selectedCase.accused}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">LOCATION</Label>
                            <p>{selectedCase.location}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">COURT DATE</Label>
                              <p>{selectedCase.courtDate ? new Date(selectedCase.courtDate).toLocaleDateString() : 'Not set'}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">OUTCOME</Label>
                              <p>{selectedCase.outcome || 'Pending'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">CREATED</Label>
                              <p>{new Date(selectedCase.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">UPDATED</Label>
                              <p>{new Date(selectedCase.updatedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Case Notes (Read-only) */}
                      <div>
                        <Label className="text-sm font-medium">Case Notes</Label>
                        <div className="mt-2 p-3 bg-muted/50 rounded-md border min-h-[100px]">
                          <p className="text-sm text-muted-foreground">
                            {selectedCase.caseNotes || 'No notes available'}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      {/* Available Actions (View-only) */}
                      <div className="space-y-3">
                        <h5 className="text-sm font-medium">Available Legal Actions</h5>
                        
                        <Button 
                          onClick={() => handleFileSystemIntegration(selectedCase.id, 'Police e-FIR')} 
                          className="w-full" 
                          variant="outline" 
                          size="sm"
                        >
                          <FileText className="mr-2 h-4 w-4" /> 
                          Submit to Police e-FIR
                        </Button>
                        
                        <Button 
                          onClick={() => handleFileSystemIntegration(selectedCase.id, 'License Suspension')} 
                          className="w-full" 
                          variant="outline" 
                          size="sm"
                        >
                          <AlertCircle className="mr-2 h-4 w-4" /> 
                          Initiate License Suspension
                        </Button>
                        
                        <Button 
                          onClick={() => handleFileSystemIntegration(selectedCase.id, 'Court Filing')} 
                          className="w-full" 
                          variant="outline" 
                          size="sm"
                        >
                          <Scale className="mr-2 h-4 w-4" /> 
                          Prepare Court Filing
                        </Button>
                        
                        <Button
                          className="w-full"
                          variant="outline"
                          size="sm"
                          onClick={downloadLegalDocument}
                        >
                          <Download className="mr-2 h-4 w-4" /> 
                          Download Case Document
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12 text-muted-foreground h-[500px] flex flex-col justify-center items-center border rounded-lg bg-muted/20">
                    <Eye className="mx-auto mb-4 h-12 w-12" />
                    <p>Select a case to view details.</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LegalModule;