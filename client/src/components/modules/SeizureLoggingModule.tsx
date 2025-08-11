"use client";
import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Package, FileText, Truck, AlertTriangle, Plus, Search, 
  Camera, MapPin, User, Calendar, Filter, Download,
  Eye, Edit, Trash2, RefreshCw, Clock, CheckCircle
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/lib/api";

// Updated interfaces to match your Prisma schema
interface CreateSeizureForm {
  quantity: string;
  estimatedValue: string;
  witnessName: string;
  evidencePhotos: string[];
  videoEvidence?: string;
  scanResult: {
    company: string;
    product: string;
    batchNumber: string;
    authenticityScore: number;
    issues: string[];
    recommendation: string;
    geoLocation: string;
  };
}

// Interface matching your Prisma schema
interface Seizure {
  id: string;
  quantity: string;  // String in your schema
  estimatedValue: string;  // String in your schema
  witnessName: string;
  evidencePhotos: string[];
  videoEvidence?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  scanResultId: string;
  scanResult?: {
    id: string;
    company: string;
    product: string;
    batchNumber: string;
    authenticityScore: number;
    issues: string[];
    recommendation: string;
    geoLocation: string;
    timestamp: string;
  };
  user?: {
    id: string;
    name?: string;
    email: string;
    role: string;
  };
  labSamples?: any[];
  firCases?: any[];
}

const SeizureLoggingModule = () => {
  const {
    updateLabSampleStatus,
    labSamples,
    setActiveTab,
  } = useAppContext();

  // State Management
  const [seizures, setSeizures] = useState<Seizure[]>([]);
  const [selectedSeizure, setSelectedSeizure] = useState<Seizure | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateSeizureForm>({
    quantity: "",
    estimatedValue: "",
    witnessName: "",
    evidencePhotos: [],
    videoEvidence: "",
    scanResult: {
      company: "",
      product: "",
      batchNumber: "",
      authenticityScore: 0,
      issues: [],
      recommendation: "",
      geoLocation: ""
    }
  });

  const { toast } = useToast();

  // Fetch seizures with filters
  const fetchSeizures = async (status?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status && status !== "all") params.append("status", status);
      
      const response = await api.get(`seizures?${params.toString()}`);
      
      // Handle different response structures
      let seizuresData;
      if (response.data.data) {
        seizuresData = response.data.data; // Paginated response
      } else if (Array.isArray(response.data)) {
        seizuresData = response.data; // Direct array
      } else {
        seizuresData = []; // Fallback
      }
      
      setSeizures(seizuresData);
      
      if (seizuresData.length > 0) {
        console.log("Sample seizure data:", seizuresData[0]);
      }
    } catch (error: any) {
      console.error("Fetch seizures error:", error);
      toast({ 
        variant: "destructive", 
        title: "Failed to fetch seizures",
        description: error.response?.data?.error || error.message || "Unknown error occurred"
      });
      setSeizures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeizures(statusFilter);
  }, [statusFilter]);

  // Create new seizure - Updated to send data in the format your API expects
  const handleCreateSeizure = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.quantity || !formData.estimatedValue || !formData.witnessName) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill all required fields"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Format data to match your Postman working example
      const payload = {
        quantity: formData.quantity, // Keep as string
        estimatedValue: formData.estimatedValue, // Keep as string
        witnessName: formData.witnessName,
        evidencePhotos: formData.evidencePhotos,
        videoEvidence: formData.videoEvidence,
        scanResult: {
          ...formData.scanResult,
          timestamp: new Date().toISOString()
        }
      };

      console.log("Sending payload:", payload);
      
      const response = await api.post("seizures", payload);
      
      console.log("Create response:", response.data);
      
      // Update local state
      setSeizures(prev => [response.data, ...prev]);
      setShowCreateForm(false);
      
      // Reset form
      setFormData({
        quantity: "",
        estimatedValue: "",
        witnessName: "",
        evidencePhotos: [],
        videoEvidence: "",
        scanResult: {
          company: "",
          product: "",
          batchNumber: "",
          authenticityScore: 0,
          issues: [],
          recommendation: "",
          geoLocation: ""
        }
      });

      toast({
        title: "Success",
        description: "Seizure logged successfully"
      });
    } catch (error: any) {
      console.error("Create seizure error:", error);
      console.error("Error details:", error.response?.data);
      
      toast({
        variant: "destructive",
        title: "Failed to create seizure",
        description: error.response?.data?.error || error.message || "Unknown error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  // Update seizure status
  const updateSeizureStatus = async (seizureId: string, status: string) => {
    try {
      const response = await api.patch(`seizures/${seizureId}`, { status });
      
      setSeizures(prev => prev.map(s => 
        s.id === seizureId ? { ...s, status } : s
      ));
      
      if (selectedSeizure?.id === seizureId) {
        setSelectedSeizure(prev => prev ? { ...prev, status } : null);
      }
      
      toast({
        title: "Success",
        description: `Seizure status updated to ${status}`
      });
    } catch (error: any) {
      console.error("Update status error:", error);
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: error.response?.data?.error || error.message || "Unknown error occurred"
      });
    }
  };

  // Generate seizure memo
  const handleGenerateMemo = async (seizure: Seizure) => {
    try {
      setLoading(true);
      const response = await api.post(`seizures/${seizure.id}/generate-memo`);
      
      toast({ 
        title: "Success", 
        description: `Seizure memo generated for ${seizure.id}` 
      });

      if (response.data.memoUrl) {
        window.open(response.data.memoUrl, '_blank');
      }
    } catch (error: any) {
      console.error("Generate memo error:", error);
      toast({ 
        variant: "destructive", 
        title: "Failed to generate memo",
        description: error.response?.data?.error || error.message || "Unknown error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  // Dispatch to lab
  const handleDispatchToLab = async (seizure: Seizure) => {
    try {
      setLoading(true);
      const response = await api.post(`seizures/${seizure.id}/dispatch-to-lab`);
      
      await updateSeizureStatus(seizure.id, "dispatched");
      
      toast({
        title: "Success",
        description: `Sample from seizure ${seizure.id} dispatched to lab.`,
      });
    } catch (error: any) {
      console.error("Dispatch to lab error:", error);
      toast({
        variant: "destructive",
        title: "Failed to dispatch",
        description: error.response?.data?.error || error.message || "Unknown error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initiate legal action
  const handleInitiateLegalAction = async (seizure: Seizure) => {
    try {
      setLoading(true);
      const response = await api.post(`seizures/${seizure.id}/initiate-legal`);
      
      await updateSeizureStatus(seizure.id, "legal-action");
      
      toast({
        title: "Info",
        description: `Legal action process initiated for ${seizure.id}.`,
      });
      
      setActiveTab("legal-module");
    } catch (error: any) {
      console.error("Initiate legal action error:", error);
      toast({
        variant: "destructive",
        title: "Failed to initiate legal action",
        description: error.response?.data?.error || error.message || "Unknown error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add issues to form data
  const addIssue = () => {
    const issueInput = document.getElementById("newIssue") as HTMLInputElement;
    if (issueInput && issueInput.value.trim()) {
      setFormData(prev => ({
        ...prev,
        scanResult: {
          ...prev.scanResult,
          issues: [...prev.scanResult.issues, issueInput.value.trim()]
        }
      }));
      issueInput.value = "";
    }
  };

  // Remove issue from form data
  const removeIssue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      scanResult: {
        ...prev.scanResult,
        issues: prev.scanResult.issues.filter((_, i) => i !== index)
      }
    }));
  };

  // Filter seizures based on search and status
  const filteredSeizures = seizures.filter(seizure => {
    const matchesSearch = searchTerm === "" || 
      seizure.scanResult?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seizure.scanResult?.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seizure.scanResult?.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || seizure.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
      pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300", icon: Clock },
      dispatched: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300", icon: Truck },
      analyzed: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300", icon: Eye },
      "legal-action": { color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300", icon: AlertTriangle },
      closed: { color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300", icon: CheckCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.replace('-', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Seizure Management</h1>
          <p className="text-muted-foreground">Log and manage product seizures</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => fetchSeizures(statusFilter)}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Seizure
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {["all", "pending", "dispatched", "analyzed", "closed"].map(status => {
          const count = status === "all" ? seizures.length : seizures.filter(s => s.status === status).length;
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

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by company, product, or batch number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="dispatched">Dispatched</SelectItem>
              <SelectItem value="analyzed">Analyzed</SelectItem>
              <SelectItem value="legal-action">Legal Action</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Create Form Modal */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Seizure</CardTitle>
            <CardDescription>Log a new product seizure with scan results</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSeizure} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="text"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="e.g., 100 bags"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Include units (e.g., "100 bags", "50 bottles")</p>
                </div>
                <div>
                  <Label htmlFor="estimatedValue">Estimated Value (₹) *</Label>
                  <Input
                    id="estimatedValue"
                    type="text"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedValue: e.target.value }))}
                    placeholder="e.g., 50000"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="witnessName">Witness Name *</Label>
                <Input
                  id="witnessName"
                  value={formData.witnessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, witnessName: e.target.value }))}
                  placeholder="Full name of witness"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={formData.scanResult.company}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      scanResult: { ...prev.scanResult, company: e.target.value }
                    }))}
                    placeholder="e.g., AgroChem Ltd"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="product">Product *</Label>
                  <Input
                    id="product"
                    value={formData.scanResult.product}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      scanResult: { ...prev.scanResult, product: e.target.value }
                    }))}
                    placeholder="e.g., Super Fertilizer"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="batchNumber">Batch Number</Label>
                  <Input
                    id="batchNumber"
                    value={formData.scanResult.batchNumber}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      scanResult: { ...prev.scanResult, batchNumber: e.target.value }
                    }))}
                    placeholder="e.g., BATCH12345"
                  />
                </div>
                <div>
                  <Label htmlFor="authenticityScore">Authenticity Score (%)</Label>
                  <Input
                    id="authenticityScore"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.scanResult.authenticityScore}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      scanResult: { ...prev.scanResult, authenticityScore: parseFloat(e.target.value) || 0 }
                    }))}
                    placeholder="e.g., 92.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="geoLocation">Location</Label>
                <Input
                  id="geoLocation"
                  value={formData.scanResult.geoLocation}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    scanResult: { ...prev.scanResult, geoLocation: e.target.value }
                  }))}
                  placeholder="e.g., 18.5204,73.8567 or Mumbai, Maharashtra"
                />
              </div>

              {/* Issues Section */}
              <div>
                <Label>Issues Detected</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="newIssue"
                      placeholder="Add an issue (e.g., Fake hologram)"
                    />
                    <Button type="button" onClick={addIssue} variant="outline" size="sm">
                      Add
                    </Button>
                  </div>
                  {formData.scanResult.issues.length > 0 && (
                    <div className="space-y-1">
                      {formData.scanResult.issues.map((issue, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                          <span className="text-sm">{issue}</span>
                          <Button 
                            type="button" 
                            onClick={() => removeIssue(index)}
                            variant="ghost" 
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="recommendation">Recommendation</Label>
                <Textarea
                  id="recommendation"
                  value={formData.scanResult.recommendation}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    scanResult: { ...prev.scanResult, recommendation: e.target.value }
                  }))}
                  placeholder="e.g., Seize and send to lab for testing"
                />
              </div>

              {/* Evidence Photos */}
              <div>
                <Label htmlFor="evidencePhoto">Evidence Photo URLs (Optional)</Label>
                <div className="space-y-2">
                  <Input
                    id="evidencePhoto"
                    placeholder="https://example.com/photo.jpg"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            evidencePhotos: [...prev.evidencePhotos, input.value.trim()]
                          }));
                          input.value = "";
                        }
                      }
                    }}
                  />
                  {formData.evidencePhotos.length > 0 && (
                    <div className="space-y-1">
                      {formData.evidencePhotos.map((photo, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                          <span className="text-sm truncate">{photo}</span>
                          <Button 
                            type="button" 
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              evidencePhotos: prev.evidencePhotos.filter((_, i) => i !== index)
                            }))}
                            variant="ghost" 
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="videoEvidence">Video Evidence URL (Optional)</Label>
                <Input
                  id="videoEvidence"
                  value={formData.videoEvidence}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoEvidence: e.target.value }))}
                  placeholder="https://example.com/video.mp4"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Seizure
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seizures List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Seizures Log</CardTitle>
            <CardDescription>
              {filteredSeizures.length} of {seizures.length} seizures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {loading && seizures.length === 0 && (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading seizures...</p>
                  </div>
                )}
                
                {!loading && filteredSeizures.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No seizures found</p>
                  </div>
                )}
                
                {filteredSeizures.map((seizure) => (
                  <div
                    key={seizure.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedSeizure(seizure)}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedSeizure(seizure)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedSeizure?.id === seizure.id
                        ? "ring-2 ring-primary bg-primary/5 border-primary"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">
                          {seizure.scanResult?.company ?? "N/A"} – {seizure.scanResult?.product ?? "N/A"}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          <MapPin className="inline w-3 h-3 mr-1" />
                          {seizure.scanResult?.geoLocation ?? "N/A"}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Qty: {seizure.quantity}</span>
                          <span>Value: ₹{seizure.estimatedValue}</span>
                        </div>
                      </div>
                      {getStatusBadge(seizure.status)}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {seizure.scanResult?.timestamp
                          ? new Date(seizure.scanResult.timestamp).toLocaleString("en-IN")
                          : new Date(seizure.createdAt).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Details Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Seizure Details & Actions</CardTitle>
            <CardDescription>View details and manage seizure</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedSeizure ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg">{selectedSeizure.id}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedSeizure.scanResult?.company} - {selectedSeizure.scanResult?.product}
                  </p>
                  {getStatusBadge(selectedSeizure.status)}
                </div>

                <div className="space-y-2 border p-3 rounded-lg bg-muted/20">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>Batch:</strong> {selectedSeizure.scanResult?.batchNumber || "N/A"}</div>
                    <div>
                      <strong>Auth. Score:</strong>{" "}
                      <span className={selectedSeizure.scanResult?.authenticityScore && selectedSeizure.scanResult.authenticityScore > 70 ? "text-green-600" : "text-red-600"}>
                        {selectedSeizure.scanResult?.authenticityScore || 0}%
                      </span>
                    </div>
                    <div><strong>Quantity:</strong> {selectedSeizure.quantity}</div>
                    <div><strong>Value:</strong> ₹{selectedSeizure.estimatedValue}</div>
                  </div>
                  <div className="text-sm">
                    <strong>Witness:</strong> {selectedSeizure.witnessName}
                  </div>
                </div>

                {selectedSeizure.scanResult?.issues && selectedSeizure.scanResult.issues.length > 0 && (
                  <div className="border p-3 rounded-lg bg-destructive/10">
                    <p className="text-sm font-medium text-destructive">Issues Detected:</p>
                    <ul className="list-disc list-inside text-xs text-destructive/80 mt-1">
                      {selectedSeizure.scanResult.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedSeizure.evidencePhotos && selectedSeizure.evidencePhotos.length > 0 && (
                  <div className="border p-3 rounded-lg">
                    <p className="text-sm font-medium mb-2">Evidence Photos:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedSeizure.evidencePhotos.map((photo, index) => (
                        <a 
                          key={index} 
                          href={photo} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline truncate"
                        >
                          Photo {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-4">
                  <Button
                    onClick={() => handleGenerateMemo(selectedSeizure)}
                    className="w-full"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Memo
                  </Button>
                  
                  <Button
                    onClick={() => handleDispatchToLab(selectedSeizure)}
                    className="w-full"
                    variant="outline"
                    size="sm"
                    disabled={["dispatched", "analyzed", "closed", "legal-action"].includes(selectedSeizure.status) || loading}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Dispatch to Lab
                  </Button>
                  
                  <Button
                    onClick={() => handleInitiateLegalAction(selectedSeizure)}
                    className="w-full"
                    variant="destructive"
                    size="sm"
                    disabled={
                      (selectedSeizure.scanResult?.authenticityScore && selectedSeizure.scanResult.authenticityScore >= 85 &&
                        (!selectedSeizure.scanResult?.issues || selectedSeizure.scanResult.issues.length === 0)) ||
                      ["closed", "legal-action"].includes(selectedSeizure.status) ||
                      loading
                    }
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Initiate Legal Action
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Select a seizure to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeizureLoggingModule;