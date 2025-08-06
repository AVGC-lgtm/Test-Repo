"use client";
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Scale, FileText, AlertCircle, Download, Briefcase, Save, Loader2 } from 'lucide-react'; // Add loading spinner icon
import type { FIRCase } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

const LegalModule = ({ onActionComplete }: { onActionComplete?: (action: string, caseId: string) => void }) => {
  const { firCases, addFIRCase, updateFIRCaseStatus, updateFIRCaseDetails } = useAppContext(); 
  const { toast } = useToast();
  const [selectedCase, setSelectedCase] = useState<FIRCase | null>(null);
  const [currentCaseNotes, setCurrentCaseNotes] = useState('');

  const [newCaseData, setNewCaseData] = useState<Partial<Omit<FIRCase, 'id' | 'status'>>>({
    labReportId: '', violationType: '', accused: '', location: '', caseNotes: '',
    jurisdictionalPoliceStation: '', suspectName: '', entityType: '', street1: '', street2: '',
    village: '', block: '', district: '', state: '', licenseNumber: '', contactNo: '',
    brandName: '', fertilizerType: '', batchNo: '', manufactureDate: '', expiryDate: '',
    violationTypes: [], // array of selected violation types
    attachments: [] // array of File objects
  });

  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedCase) {
      setCurrentCaseNotes(selectedCase.caseNotes || '');
    } else {
      setCurrentCaseNotes('');
    }
  }, [selectedCase]);

  const handleCaseSelection = (firCase: FIRCase) => {
    setSelectedCase(firCase);
  };

  const handleSaveNotes = () => {
    if (!selectedCase) return;
    updateFIRCaseDetails(selectedCase.id, { caseNotes: currentCaseNotes });
    toast({ title: "Success", description: `Notes saved for case ${selectedCase.id}.` });
    setSelectedCase(prev => prev ? { ...prev, caseNotes: currentCaseNotes } : null);
  };

  const handleFileSystemIntegration = async (caseId: string | undefined, system: string) => {
    if (!caseId) {
      toast({title: "Error", description: "No case selected.", variant: "destructive"});
      return;
    }
    setLoadingAction(system);
    toast({ title: "Info", description: `${system} integration initiated for case ${caseId}.` });
    // Simulate async action
    await new Promise(res => setTimeout(res, 1200));
    if (system === 'Police e-FIR' && selectedCase && selectedCase.status === 'draft') {
      updateFIRCaseStatus(caseId, 'submitted');
      setSelectedCase(prev => prev ? {...prev, status: 'submitted'} : null);
    }
    setLoadingAction(null);
    if (onActionComplete) onActionComplete(system, caseId);
  };

  const handleCreateFIR = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newCaseData.labReportId || !newCaseData.violationType || !newCaseData.accused || !newCaseData.location) {
        toast({title: "Error", description: "Please fill all required fields for FIR.", variant: "destructive"});
        return;
    }
    addFIRCase(newCaseData as Omit<FIRCase, 'id' | 'status'>);
    toast({ title: "Success", description: "New FIR case drafted." });
    setNewCaseData({ labReportId: '', violationType: '', accused: '', location: '', caseNotes: '' });
  };
  
  const currentSelectedCaseFromContext = firCases.find(c => c.id === selectedCase?.id) || selectedCase;


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Create New FIR Case</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Draft a new First Information Report.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateFIR} className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="newLabReportId" className="text-sm">Lab Report ID *</Label>
              <Input id="newLabReportId" value={newCaseData.labReportId || ''} onChange={e => setNewCaseData({...newCaseData, labReportId: e.target.value})} placeholder="e.g., LAB-12345" required className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="newViolationType" className="text-sm">Violation Type *</Label>
              <Input id="newViolationType" value={newCaseData.violationType || ''} onChange={e => setNewCaseData({...newCaseData, violationType: e.target.value})} placeholder="e.g., Counterfeit Product" required className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="newAccused" className="text-sm">Accused Party *</Label>
              <Input id="newAccused" value={newCaseData.accused || ''} onChange={e => setNewCaseData({...newCaseData, accused: e.target.value})} placeholder="e.g., Shop Name / Individual" required className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="newLocation" className="text-sm">Location of Offense *</Label>
              <Input id="newLocation" value={newCaseData.location || ''} onChange={e => setNewCaseData({...newCaseData, location: e.target.value})} placeholder="e.g., Kolhapur Market" required className="h-9 text-sm"/>
            </div>
             <div>
              <Label htmlFor="newCaseNotes" className="text-sm">Initial Case Notes</Label>
              <Textarea id="newCaseNotes" value={newCaseData.caseNotes || ''} onChange={e => setNewCaseData({...newCaseData, caseNotes: e.target.value})} placeholder="Add initial notes..." rows={2} className="text-sm"/>
            </div>
            <div>
              <Label htmlFor="jurisdictionalPoliceStation" className="text-sm">Jurisdictional Police Station *</Label>
              <Input id="jurisdictionalPoliceStation" value={newCaseData.jurisdictionalPoliceStation || ''} onChange={e => setNewCaseData({...newCaseData, jurisdictionalPoliceStation: e.target.value})} required className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="suspectName" className="text-sm">Name of Suspect/Company *</Label>
              <Input id="suspectName" value={newCaseData.suspectName || ''} onChange={e => setNewCaseData({...newCaseData, suspectName: e.target.value})} required className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="entityType" className="text-sm">Type of Entity *</Label>
              <select id="entityType" value={newCaseData.entityType || ''} onChange={e => setNewCaseData({...newCaseData, entityType: e.target.value})} required className="h-9 text-sm w-full rounded border">
                <option value="">Select</option>
                <option value="Manufacturer">Manufacturer</option>
                <option value="Retailer">Retailer</option>
                <option value="Dealer">Dealer</option>
                <option value="Importer">Importer</option>
              </select>
            </div>
            <div>
              <Label htmlFor="street1" className="text-sm">Street 1 *</Label>
              <Input id="street1" value={newCaseData.street1 || ''} onChange={e => setNewCaseData({...newCaseData, street1: e.target.value})} required className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="street2" className="text-sm">Street 2</Label>
              <Input id="street2" value={newCaseData.street2 || ''} onChange={e => setNewCaseData({...newCaseData, street2: e.target.value})} className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="village" className="text-sm">Village *</Label>
              <Input id="village" value={newCaseData.village || ''} onChange={e => setNewCaseData({...newCaseData, village: e.target.value})} required className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="block" className="text-sm">Block *</Label>
              <Input id="block" value={newCaseData.block || ''} onChange={e => setNewCaseData({...newCaseData, block: e.target.value})} required className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="district" className="text-sm">District *</Label>
              <Input id="district" value={newCaseData.district || ''} onChange={e => setNewCaseData({...newCaseData, district: e.target.value})} required className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="state" className="text-sm">State *</Label>
              <Input id="state" value={newCaseData.state || ''} onChange={e => setNewCaseData({...newCaseData, state: e.target.value})} required className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="licenseNumber" className="text-sm">License Number (if available)</Label>
              <Input id="licenseNumber" value={newCaseData.licenseNumber || ''} onChange={e => setNewCaseData({...newCaseData, licenseNumber: e.target.value})} className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="contactNo" className="text-sm">Contact No. *</Label>
              <Input id="contactNo" value={newCaseData.contactNo || ''} onChange={e => setNewCaseData({...newCaseData, contactNo: e.target.value})} required className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="brandName" className="text-sm">Brand Name *</Label>
              <Input id="brandName" value={newCaseData.brandName || ''} onChange={e => setNewCaseData({...newCaseData, brandName: e.target.value})} required className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="fertilizerType" className="text-sm">Fertilizer Type *</Label>
              <Input id="fertilizerType" value={newCaseData.fertilizerType || ''} onChange={e => setNewCaseData({...newCaseData, fertilizerType: e.target.value})} required className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="batchNo" className="text-sm">Batch No. *</Label>
              <Input id="batchNo" value={newCaseData.batchNo || ''} onChange={e => setNewCaseData({...newCaseData, batchNo: e.target.value})} required className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="manufactureDate" className="text-sm">Date of Manufacture *</Label>
              <Input id="manufactureDate" type="date" value={newCaseData.manufactureDate || ''} onChange={e => setNewCaseData({...newCaseData, manufactureDate: e.target.value})} required className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="expiryDate" className="text-sm">Date of Expiry *</Label>
              <Input id="expiryDate" type="date" value={newCaseData.expiryDate || ''} onChange={e => setNewCaseData({...newCaseData, expiryDate: e.target.value})} required className="h-9 text-sm"/>
            </div>
            <div>
              <Label className="text-sm">Type of Violation (Tick Applicable) *</Label>
              <div className="grid grid-cols-1 gap-1">
                {[
                  "Fake product with forged branding",
                  "Substandard as per lab report",
                  "No license for sale",
                  "Expired stock being sold",
                  "Misbranded / misleading labeling",
                  "Overpricing / hoarding",
                  "Illegal repacking or manufacturing",
                  "No invoice / duplicate billing",
                  "Sale of banned/unregistered fertilizer",
                  "Obstruction in sample collection"
                ].map((vType) => (
                  <label key={vType} className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      checked={newCaseData.violationTypes?.includes(vType) || false}
                      onChange={e => {
                        setNewCaseData({
                          ...newCaseData,
                          violationTypes: e.target.checked
                            ? [...(newCaseData.violationTypes || []), vType]
                            : (newCaseData.violationTypes || []).filter(v => v !== vType)
                        });
                      }}
                      className="mr-2"
                    />
                    {vType}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="attachments" className="text-sm">Proof / Evidence Attachment *</Label>
              <Input
                id="attachments"
                type="file"
                multiple
                onChange={e => setNewCaseData({...newCaseData, attachments: Array.from(e.target.files || [])})}
                required
                className="h-9 text-sm"
              />
              <small className="text-xs text-muted-foreground">Attach documents: Lab Test Report, Photos, Invoice, Memo, Video, License, etc.</small>
            </div>
            <Button type="submit" className="w-full" size="sm">
              <Briefcase className="mr-2 h-4 w-4" /> Create Draft FIR
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">FIR Cases Management</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Manage and track all FIR cases.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-r-0 md:border-r md:pr-4">
            <h4 className="font-medium mb-2 text-md sticky top-0 bg-background py-1">Current Cases ({firCases.length})</h4>
            <ScrollArea className="h-[350px] sm:h-[450px] lg:h-[500px]">
            <div className="space-y-3">
              {firCases.length === 0 && <p className="text-muted-foreground text-sm p-2">No FIR cases filed yet.</p>}
              {firCases.map((firCase) => (
                <div
                  key={firCase.id}
                  className={`p-3 rounded-lg border cursor-pointer hover:ring-2 hover:ring-primary transition-all ${currentSelectedCaseFromContext?.id === firCase.id ? 'bg-primary/10 ring-2 ring-primary shadow-md' : 'bg-muted/30'}`}
                  onClick={() => handleCaseSelection(firCase)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleCaseSelection(firCase)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-semibold text-sm text-foreground">{firCase.id}</h5>
                      <p className="text-xs text-muted-foreground">Violation: {firCase.violationType}</p>
                      <p className="text-xs text-muted-foreground">Accused: {firCase.accused}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full self-start ${
                      firCase.status === 'draft' ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                      firCase.status === 'submitted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                      firCase.status === 'investigating' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                      'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                    }`}>
                      {firCase.status.charAt(0).toUpperCase() + firCase.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            </ScrollArea>
          </div>
          
          <div className="md:pl-0">
             <h4 className="font-medium mb-2 text-md sticky top-0 bg-background py-1">Case Details & Actions</h4>
            {currentSelectedCaseFromContext ? (
              <ScrollArea className="h-[350px] sm:h-[450px] lg:h-[500px]">
              <div className="space-y-3 sm:space-y-4 p-1">
                <Card className="bg-card shadow-sm">
                    <CardHeader className="pb-2 sm:pb-3">
                        <CardTitle className="text-md sm:text-lg">{currentSelectedCaseFromContext.id}</CardTitle>
                        <CardDescription className="text-xs">Lab Report: {currentSelectedCaseFromContext.labReportId}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1.5 text-xs sm:text-sm">
                        <p><strong>Violation:</strong> {currentSelectedCaseFromContext.violationType}</p>
                        <p><strong>Accused:</strong> {currentSelectedCaseFromContext.accused}</p>
                        <p><strong>Location:</strong> {currentSelectedCaseFromContext.location}</p>
                        <p><strong>Status:</strong> <span className="font-semibold">{currentSelectedCaseFromContext.status.charAt(0).toUpperCase() + currentSelectedCaseFromContext.status.slice(1)}</span></p>
                         <p><strong>Court Date:</strong> {currentSelectedCaseFromContext.courtDate || 'Not set'}</p>
                        <p><strong>Outcome:</strong> {currentSelectedCaseFromContext.outcome || 'Pending'}</p>
                    </CardContent>
                </Card>
                
                <div>
                  <Label htmlFor="caseNotes" className="text-sm">Case Notes</Label>
                  <Textarea 
                    id="caseNotes" 
                    placeholder="Add legal notes or updates..." 
                    rows={3} 
                    value={currentCaseNotes} 
                    onChange={(e) => setCurrentCaseNotes(e.target.value)}
                    className="bg-background text-sm"
                  />
                  <Button onClick={handleSaveNotes} size="sm" className="mt-2 text-xs">
                    <Save className="mr-1 h-3 w-3 sm:h-4 sm:w-4"/> Save Notes
                  </Button>
                </div>
                
                <div className="space-y-2 pt-2 border-t mt-3 sm:mt-4">
                    <h5 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Actions</h5>
                  <Button
                    onClick={() => handleFileSystemIntegration(currentSelectedCaseFromContext.id, 'Police e-FIR')}
                    className="w-full text-xs"
                    variant="outline"
                    size="sm"
                    disabled={currentSelectedCaseFromContext.status !== 'draft' || loadingAction === 'Police e-FIR'}
                  >
                    {loadingAction === 'Police e-FIR' ? (
                      <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    ) : (
                      <FileText className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    {currentSelectedCaseFromContext.status === 'draft' ? 'Submit to Police e-FIR' : 'Submitted to e-FIR'}
                  </Button>
                  <Button
                    onClick={() => handleFileSystemIntegration(currentSelectedCaseFromContext.id, 'License Suspension')}
                    className="w-full text-xs"
                    variant="outline"
                    size="sm"
                    disabled={loadingAction === 'License Suspension'}
                  >
                    {loadingAction === 'License Suspension' ? (
                      <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    ) : (
                      <AlertCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    Initiate License Suspension
                  </Button>
                  <Button
                    onClick={() => handleFileSystemIntegration(currentSelectedCaseFromContext.id, 'Court Filing')}
                    className="w-full text-xs"
                    variant="outline"
                    size="sm"
                    disabled={loadingAction === 'Court Filing'}
                  >
                    {loadingAction === 'Court Filing' ? (
                      <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    ) : (
                      <Scale className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    File with Court
                  </Button>
                </div>
              </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground">Select a case to view details and actions.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalModule;
