
"use client";
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TestTube, Upload, AlertTriangle } from 'lucide-react'; // Removed Building, QrCode, CheckCircle, Package
import type { LabSample } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const LabInterfaceModule = () => {
  const { labSamples, updateLabSampleStatus } = useAppContext();
  const { toast } = useToast();
  const [selectedSample, setSelectedSample] = useState<LabSample | null>(null);
  const [newStatus, setNewStatus] = useState<LabSample['status'] | ''>('');
  const [labResult, setLabResult] = useState<LabSample['labResult'] | ''>('');

  const handleUpdateSample = () => {
    if (!selectedSample) {
      toast({ title: "Error", description: "No sample selected.", variant: "destructive" });
      return;
    }
    if (!newStatus) {
      toast({ title: "Error", description: "Please select a new status.", variant: "destructive" });
      return;
    }
    
    let finalResult = selectedSample.labResult;
    if (newStatus === 'completed' && !labResult) {
        toast({ title: "Error", description: "Please select a lab result for completed samples.", variant: "destructive" });
        return;
    }
    if (newStatus === 'completed' && labResult) {
        finalResult = labResult;
    }

    updateLabSampleStatus(selectedSample.id, newStatus, finalResult);
    toast({ title: "Success", description: `Sample ${selectedSample.id} updated to ${newStatus}.` });
    
    if (newStatus === 'completed' && finalResult === 'violation-confirmed') {
        toast({
            title: "Alert",
            description: `Violation confirmed for ${selectedSample.id}. Legal action may be required.`,
            variant: "destructive",
            duration: 7000,
        });
    }
    
    setSelectedSample(prev => prev ? { ...prev, status: newStatus, labResult: finalResult } : null); 
    setNewStatus('');
    setLabResult('');
  };

  const labStatuses: LabSample['status'][] = ['in-transit', 'received', 'testing', 'completed'];
  const labResultOptions: LabSample['labResult'][] = ['violation-confirmed', 'compliant', 'inconclusive'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Lab Samples Tracking</CardTitle>
          <CardDescription className="text-xs sm:text-sm">View and manage lab samples.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] sm:h-[600px]">
            <div className="space-y-3 sm:space-y-4">
              {labSamples.length === 0 && <p className="text-muted-foreground text-sm">No samples sent to lab yet.</p>}
              {labSamples.map((sample) => (
                <div
                  key={sample.id}
                  className={`p-3 sm:p-4 rounded-lg border cursor-pointer hover:ring-2 hover:ring-primary focus-visible:ring-2 focus-visible:ring-primary outline-none ${selectedSample?.id === sample.id ? 'ring-2 ring-primary bg-muted' : 'bg-muted/30'}`}
                  onClick={() => {
                    setSelectedSample(sample);
                    setNewStatus(sample.status);
                    setLabResult(sample.labResult || '');
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedSample(sample)}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start">
                    <div className="mb-1 sm:mb-0">
                      <h4 className="font-medium text-sm sm:text-base">{sample.id} - {sample.product}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">Company: {sample.company}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Batch: {sample.batchNumber}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Lab: {sample.labDestination}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] sm:text-xs rounded-full self-start sm:self-center ${
                      sample.status === 'in-transit' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' :
                      sample.status === 'received' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                      sample.status === 'testing' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' :
                      'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                    }`}>
                      {sample.status}
                    </span>
                  </div>
                  {sample.status === 'completed' && sample.labResult && (
                    <p className={`text-xs sm:text-sm mt-1 font-medium ${sample.labResult === 'violation-confirmed' ? 'text-destructive' : 'text-green-600'}`}>
                      Result: {sample.labResult}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Sample Details & Update</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Update status and results for selected sample.</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedSample ? (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h4 className="font-semibold text-md sm:text-lg">{selectedSample.id}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">{selectedSample.company} - {selectedSample.product}</p>
              </div>
              
              <div className="space-y-1 text-xs sm:text-sm border p-3 rounded-md bg-muted/20">
                <p><strong>Batch:</strong> {selectedSample.batchNumber}</p>
                <p><strong>Type:</strong> {selectedSample.sampleType}</p>
                <p><strong>Current Status:</strong> {selectedSample.status}</p>
                {selectedSample.labResult && <p><strong>Result:</strong> {selectedSample.labResult}</p>}
              </div>
              
              <div>
                <Label htmlFor="sampleStatus" className="text-sm">Update Status</Label>
                <Select value={newStatus || ''} onValueChange={(value) => setNewStatus(value as LabSample['status'])}>
                  <SelectTrigger id="sampleStatus" className="h-9 text-sm"><SelectValue placeholder="Select Status" /></SelectTrigger>
                  <SelectContent>
                    {labStatuses.map(status => (
                      <SelectItem key={status} value={status} className="text-sm">{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {newStatus === 'completed' && (
                 <div>
                    <Label className="text-sm">Lab Result</Label>
                    <RadioGroup value={labResult || ''} onValueChange={(value) => setLabResult(value as LabSample['labResult'])} className="mt-2 space-y-1">
                        {labResultOptions.map(option => (
                             <div key={option} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} id={`res-${option}`} />
                                <Label htmlFor={`res-${option}`} className="font-normal text-sm">{option.replace('-', ' ').charAt(0).toUpperCase() + option.replace('-', ' ').slice(1)}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
              )}
              
              <Button onClick={handleUpdateSample} className="w-full" size="sm">
                <Upload className="mr-2 h-4 w-4" /> Update Sample
              </Button>

              {selectedSample.status === 'completed' && selectedSample.labResult === 'violation-confirmed' && (
                 <Button variant="destructive" className="w-full" size="sm" onClick={() => toast({title: "Action Required", description: "Proceed to Legal Module to file FIR."})}>
                    <AlertTriangle className="mr-2 h-4 w-4" /> Initiate Legal Action
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TestTube className="mx-auto mb-4 h-10 w-10 sm:h-12 sm:w-12" />
              <p className="text-sm sm:text-base">Select a sample to view details.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LabInterfaceModule;
