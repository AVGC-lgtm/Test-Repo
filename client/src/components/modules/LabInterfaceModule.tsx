'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  CalendarIcon, FileDownIcon, RefreshCw, Search, 
  FlaskConical, Eye, Edit, CheckCircle, AlertTriangle,
  Clock, Package, MapPin, User, Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import api from '@/lib/api';

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
  user?: {
    id: string;
    name?: string;
    email: string;
    role: string;
  };
  seizure?: {
    id: string;
    quantity: string;
    estimatedValue: string;
    witnessName: string;
    status: string;
    scanResult?: {
      company: string;
      product: string;
      batchNumber: string;
      authenticityScore: number;
      geoLocation: string;
      timestamp: string;
    };
    user?: {
      id: string;
      name?: string;
      email: string;
      role: string;
    };
  };
  firCases?: any[];
}

interface CreateLabSampleForm {
  sampleType: string;
  labDestination: string;
  seizureId: string;
}

export default function LabInterfaceModule() {
  const { toast } = useToast();
  
  // State Management
  const [labSamples, setLabSamples] = useState<LabSample[]>([]);
  const [selectedSample, setSelectedSample] = useState<LabSample | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  
  const [createForm, setCreateForm] = useState<CreateLabSampleForm>({
    sampleType: "",
    labDestination: "",
    seizureId: ""
  });
  
  const [updateForm, setUpdateForm] = useState({
    status: "",
    labResult: ""
  });

  // Fetch lab samples
  const fetchLabSamples = async (status?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status && status !== "all") params.append("status", status);
      
      const response = await api.get(`lab-samples?${params.toString()}`);
      const samplesData = response.data.data || response.data;
      setLabSamples(Array.isArray(samplesData) ? samplesData : []);
      
      console.log("Fetched lab samples:", samplesData);
    } catch (error: any) {
      console.error("Fetch lab samples error:", error);
      toast({
        variant: "destructive",
        title: "Failed to fetch lab samples",
        description: error.response?.data?.error || error.message
      });
      setLabSamples([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new lab sample
  const handleCreateSample = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.sampleType || !createForm.labDestination || !createForm.seizureId) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill all required fields"
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("lab-samples", createForm);
      
      setLabSamples(prev => [response.data, ...prev]);
      setShowCreateForm(false);
      setCreateForm({
        sampleType: "",
        labDestination: "",
        seizureId: ""
      });

      toast({
        title: "Success",
        description: "Lab sample created successfully"
      });
    } catch (error: any) {
      console.error("Create lab sample error:", error);
      toast({
        variant: "destructive",
        title: "Failed to create lab sample",
        description: error.response?.data?.error || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Update lab sample
  const handleUpdateSample = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSample) return;

    try {
      setLoading(true);
      const response = await api.put(`lab-samples/${selectedSample.id}`, updateForm);
      
      setLabSamples(prev => prev.map(sample => 
        sample.id === selectedSample.id ? response.data : sample
      ));
      
      setSelectedSample(response.data);
      setShowUpdateForm(false);
      
      toast({
        title: "Success",
        description: "Lab sample updated successfully"
      });
    } catch (error: any) {
      console.error("Update lab sample error:", error);
      toast({
        variant: "destructive",
        title: "Failed to update lab sample",
        description: error.response?.data?.error || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter samples
  const filteredSamples = labSamples.filter(sample => {
    const matchesSearch = searchTerm === "" || 
      sample.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.sampleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.labDestination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.seizure?.scanResult?.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || sample.status === statusFilter;
    
    // Date filtering
    let matchesDateRange = true;
    if (fromDate || toDate) {
      const sampleDate = new Date(sample.createdAt);
      if (fromDate && sampleDate < fromDate) matchesDateRange = false;
      if (toDate && sampleDate > toDate) matchesDateRange = false;
    }
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
      "in-transit": { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300", icon: Package },
      "received": { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300", icon: Clock },
      "testing": { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300", icon: FlaskConical },
      "completed": { color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300", icon: CheckCircle },
      "failed": { color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300", icon: AlertTriangle }
    };
    
    const config = statusConfig[status] || statusConfig["in-transit"];
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.replace('-', ' ')}
      </Badge>
    );
  };

  // Generate sample tracking timeline
  const getTrackingTimeline = (sample: LabSample) => {
    const timeline = [
      {
        status: "Sample Collected",
        date: sample.createdAt,
        completed: true,
        description: `Collected from seizure ${sample.seizureId}`
      },
      {
        status: "Dispatched to Lab",
        date: sample.createdAt,
        completed: ["received", "testing", "completed", "failed"].includes(sample.status),
        description: `Sent to ${sample.labDestination}`
      },
      {
        status: "Received at Lab",
        date: sample.updatedAt,
        completed: ["testing", "completed", "failed"].includes(sample.status),
        description: "Sample logged in lab system"
      },
      {
        status: "Under Testing",
        date: sample.status === "testing" ? sample.updatedAt : "",
        completed: ["completed", "failed"].includes(sample.status),
        description: "Chemical/physical analysis in progress"
      },
      {
        status: "Results Finalized",
        date: ["completed", "failed"].includes(sample.status) ? sample.updatedAt : "",
        completed: ["completed", "failed"].includes(sample.status),
        description: sample.labResult || "Analysis completed"
      }
    ];

    return timeline;
  };

  useEffect(() => {
    fetchLabSamples(statusFilter);
  }, [statusFilter]);

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Lab Interface</h1>
          <p className="text-muted-foreground">Track and manage lab samples</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => fetchLabSamples(statusFilter)}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <FlaskConical className="h-4 w-4 mr-2" />
            New Sample
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {["all", "in-transit", "received", "testing", "completed"].map(status => {
          const count = status === "all" ? labSamples.length : labSamples.filter(s => s.status === status).length;
          return (
            <Card key={status} className="p-4">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm text-muted-foreground capitalize">
                {status === "all" ? "Total" : status.replace('-', ' ')}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filter Card */}
      <Card>
        <CardHeader>
          <CardTitle>Lab Sample Tracking & Filters</CardTitle>
          <CardDescription>Search and filter lab samples by various criteria.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <Label htmlFor="search">Search (ID, Type, Lab, Company)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search samples..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-transit">In Transit</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !fromDate && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, 'dd/MM/yyyy') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={fromDate} onSelect={setFromDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !toDate && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, 'dd/MM/yyyy') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={toDate} onSelect={setToDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Sample Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Lab Sample</CardTitle>
            <CardDescription>Create a new lab sample for testing</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSample} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sampleType">Sample Type *</Label>
                  <Input
                    id="sampleType"
                    value={createForm.sampleType}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, sampleType: e.target.value }))}
                    placeholder="e.g., Fertilizer Sample"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="labDestination">Lab Destination *</Label>
                  <Input
                    id="labDestination"
                    value={createForm.labDestination}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, labDestination: e.target.value }))}
                    placeholder="e.g., Central Testing Lab"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="seizureId">Seizure ID *</Label>
                  <Input
                    id="seizureId"
                    value={createForm.seizureId}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, seizureId: e.target.value }))}
                    placeholder="e.g., SZ-2025-123456"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FlaskConical className="h-4 w-4 mr-2" />
                      Create Sample
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Update Sample Form */}
      {showUpdateForm && selectedSample && (
        <Card>
          <CardHeader>
            <CardTitle>Update Lab Sample</CardTitle>
            <CardDescription>Update sample status and results</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateSample} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="updateStatus">Status</Label>
                  <Select 
                    value={updateForm.status} 
                    onValueChange={(value) => setUpdateForm(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-transit">In Transit</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor="labResult">Lab Result</Label>
                  <Textarea
                    id="labResult"
                    value={updateForm.labResult}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, labResult: e.target.value }))}
                    placeholder="Enter test results and observations..."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Update Sample
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowUpdateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sample List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lab Samples</CardTitle>
            <CardDescription>
              {filteredSamples.length} of {labSamples.length} samples
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {loading && labSamples.length === 0 && (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading samples...</p>
                </div>
              )}
              
              {!loading && filteredSamples.length === 0 && (
                <div className="text-center py-8">
                  <FlaskConical className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No lab samples found</p>
                </div>
              )}

              <div className="space-y-4">
                {filteredSamples.map((sample) => (
                  <div
                    key={sample.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedSample(sample)}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedSample(sample)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedSample?.id === sample.id
                        ? "ring-2 ring-primary bg-primary/5 border-primary"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">
                          {sample.sampleType}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          ID: {sample.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <MapPin className="inline w-3 h-3 mr-1" />
                          Lab: {sample.labDestination}
                        </p>
                        {sample.seizure?.scanResult && (
                          <p className="text-xs text-muted-foreground">
                            Product: {sample.seizure.scanResult.company} - {sample.seizure.scanResult.product}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(sample.status)}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(sample.createdAt).toLocaleString("en-IN")}
                        </span>
                      </div>
                      {sample.seizure && (
                        <span className="text-blue-600">
                          Seizure: {sample.seizure.id}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Sample Details & Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>Sample Details & Tracking</CardTitle>
            <CardDescription>Detailed status and timeline for selected sample</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedSample ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg">{selectedSample.id}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedSample.sampleType}
                  </p>
                  {getStatusBadge(selectedSample.status)}
                </div>

                {/* Sample Details */}
                <div className="border p-3 rounded-lg bg-muted/20 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>Lab:</strong> {selectedSample.labDestination}</div>
                    <div><strong>Officer:</strong> {selectedSample.user?.name || selectedSample.user?.email}</div>
                    <div><strong>Created:</strong> {format(new Date(selectedSample.createdAt), 'dd/MM/yyyy HH:mm')}</div>
                    <div><strong>Updated:</strong> {format(new Date(selectedSample.updatedAt), 'dd/MM/yyyy HH:mm')}</div>
                  </div>
                  
                  {selectedSample.seizure && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium">Related Seizure:</p>
                      <div className="text-xs space-y-1">
                        <p>ID: {selectedSample.seizure.id}</p>
                        {selectedSample.seizure.scanResult && (
                          <>
                            <p>Product: {selectedSample.seizure.scanResult.company} - {selectedSample.seizure.scanResult.product}</p>
                            <p>Batch: {selectedSample.seizure.scanResult.batchNumber}</p>
                            <p>Auth Score: <span className={selectedSample.seizure.scanResult.authenticityScore > 70 ? "text-green-600" : "text-red-600"}>{selectedSample.seizure.scanResult.authenticityScore}%</span></p>
                          </>
                        )}
                        <p>Quantity: {selectedSample.seizure.quantity}</p>
                        <p>Value: ₹{selectedSample.seizure.estimatedValue}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lab Result */}
                {selectedSample.labResult && (
                  <div className="border p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">Lab Results:</p>
                    <p className="text-xs text-green-700 dark:text-green-400">{selectedSample.labResult}</p>
                  </div>
                )}

                {/* Tracking Timeline */}
                <div className="space-y-3">
                  <p className="text-sm font-medium">Sample Tracking Timeline:</p>
                  <ScrollArea className="h-[200px] pr-2">
                    <div className="space-y-3">
                      {getTrackingTimeline(selectedSample).map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className={`w-3 h-3 rounded-full mt-1 ${item.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <div className="flex-1 space-y-1">
                            <p className={`text-sm font-medium ${item.completed ? 'text-green-700 dark:text-green-400' : 'text-gray-500'}`}>
                              {item.status}
                            </p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                            {item.date && (
                              <p className="text-xs text-blue-600">
                                {format(new Date(item.date), 'dd/MM/yyyy – HH:mm')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4">
                  <Button
                    onClick={() => {
                      setUpdateForm({
                        status: selectedSample.status,
                        labResult: selectedSample.labResult || ""
                      });
                      setShowUpdateForm(true);
                    }}
                    className="w-full"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Update Sample
                  </Button>
                  
                  {selectedSample.labResult && (
                    <Button
                      onClick={() => {
                        // Generate and download report
                        const reportData = {
                          sampleId: selectedSample.id,
                          sampleType: selectedSample.sampleType,
                          labDestination: selectedSample.labDestination,
                          status: selectedSample.status,
                          result: selectedSample.labResult,
                          seizureInfo: selectedSample.seizure
                        };
                        
                        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `lab-report-${selectedSample.id}.json`;
                        a.click();
                        
                        toast({
                          title: "Report Downloaded",
                          description: "Lab report has been downloaded successfully"
                        });
                      }}
                      className="w-full"
                      variant="outline"
                      size="sm"
                    >
                      <FileDownIcon className="mr-2 h-4 w-4" />
                      Download Report
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FlaskConical className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Select a sample to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}