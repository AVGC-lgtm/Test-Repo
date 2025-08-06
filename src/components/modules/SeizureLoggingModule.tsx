
"use client";
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, FileText, Truck, AlertTriangle } from 'lucide-react'; // Removed Info
import type { Seizure } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

const SeizureLoggingModule = () => {
  const { seizures, updateLabSampleStatus, labSamples, setActiveTab } = useAppContext(); 
  const { toast } = useToast();
  const [selectedSeizure, setSelectedSeizure] = useState<Seizure | null>(null);
  
  const handleGenerateMemo = (seizure: Seizure) => {
    toast({ title: "Success", description: `Seizure memo generated for ${seizure.id}` });
  };
  
  const handleDispatchToLab = (seizure: Seizure) => {
    const labSampleToDispatch = labSamples.find(ls => ls.id === seizure.id || ls.batchNumber === seizure.batchNumber);
    if (labSampleToDispatch) {
      updateLabSampleStatus(labSampleToDispatch.id, 'dispatched');
      toast({ title: "Success", description: `Sample from seizure ${seizure.id} dispatched to lab.` });
      setSelectedSeizure(prev => prev ? {...prev, status: 'dispatched'} : null);
    } else {
      toast({ title: "Warning", description: `No lab sample found for seizure ${seizure.id}.`, variant: 'default', duration: 7000 });
    }
  };

  const handleInitiateLegalAction = (seizure: Seizure) => {
    toast({ title: "Info", description: `Legal action process initiated for ${seizure.id}.` });
    setActiveTab('legal-module'); 
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Active Seizures Log</CardTitle>
          <CardDescription className="text-xs sm:text-sm">List of all current seizures.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] sm:h-[600px]">
            <div className="space-y-3 sm:space-y-4">
              {seizures.length === 0 && <p className="text-muted-foreground text-sm">No seizures logged yet.</p>}
              {seizures.map((seizure) => (
                <div
                  key={seizure.id}
                  className={`p-3 sm:p-4 rounded-lg border cursor-pointer hover:ring-2 hover:ring-primary focus-visible:ring-2 focus-visible:ring-primary outline-none ${selectedSeizure?.id === seizure.id ? 'ring-2 ring-primary bg-muted' : 'bg-muted/30'}`}
                  onClick={() => setSelectedSeizure(seizure)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedSeizure(seizure)}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start">
                    <div className="mb-1 sm:mb-0">
                      <h4 className="font-medium text-sm sm:text-base">{seizure.id} - {seizure.company} {seizure.product}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">Location: {seizure.geoLocation}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Qty: {seizure.quantity}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Time: {new Date(seizure.timestamp).toLocaleString([],{ year:'numeric', month: 'short', day:'numeric', hour: '2-digit', minute:'2-digit' })}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] sm:text-xs rounded-full self-start sm:self-center ${
                      seizure.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                      seizure.status === 'dispatched' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                      seizure.status === 'analyzed' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' : 
                      'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                    }`}>
                      {seizure.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Seizure Details & Actions</CardTitle>
          <CardDescription className="text-xs sm:text-sm">View details and take actions.</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedSeizure ? (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h4 className="font-semibold text-md sm:text-lg">{selectedSeizure.id}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">{selectedSeizure.company} - {selectedSeizure.product}</p>
              </div>
              
              <div className="space-y-1 text-xs sm:text-sm border p-3 rounded-md bg-muted/20">
                <p><strong>Batch:</strong> {selectedSeizure.batchNumber}</p>
                <p><strong>Auth. Score:</strong> <span className={selectedSeizure.authenticityScore > 70 ? 'text-green-600' : 'text-red-600'}>{selectedSeizure.authenticityScore}%</span></p>
                <p><strong>Est. Value:</strong> {selectedSeizure.estimatedValue}</p>
                <p><strong>Witness:</strong> {selectedSeizure.witnessName}</p>
                 <p><strong>Status:</strong> {selectedSeizure.status}</p>
              </div>
              
              {selectedSeizure.issues && selectedSeizure.issues.length > 0 && (
                <div className="border p-3 rounded-md bg-destructive/10">
                  <p className="text-xs sm:text-sm font-medium text-destructive">Issues Detected:</p>
                  <ul className="list-disc list-inside text-[10px] sm:text-xs text-destructive/80">
                    {selectedSeizure.issues.map((issue, index) => <li key={index}>{issue}</li>)}
                  </ul>
                </div>
              )}
              
              <div className="space-y-2 pt-3 sm:pt-4">
                <Button onClick={() => handleGenerateMemo(selectedSeizure)} className="w-full text-xs" variant="outline" size="sm">
                  <FileText className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Generate Memo
                </Button>
                <Button 
                  onClick={() => handleDispatchToLab(selectedSeizure)} 
                  className="w-full text-xs" 
                  variant="outline"
                  size="sm"
                  disabled={selectedSeizure.status === 'dispatched' || selectedSeizure.status === 'analyzed' || selectedSeizure.status === 'closed'}
                >
                  <Truck className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Dispatch to Lab
                </Button>
                <Button 
                  onClick={() => handleInitiateLegalAction(selectedSeizure)} 
                  className="w-full text-xs" 
                  variant="destructive"
                  size="sm"
                  disabled={selectedSeizure.authenticityScore >= 85 && selectedSeizure.issues.length === 0 || selectedSeizure.status === 'closed'}
                >
                  <AlertTriangle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Initiate Legal Action
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="mx-auto mb-4 h-10 w-10 sm:h-12 sm:w-12" />
              <p className="text-sm sm:text-base">Select a seizure to view details.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SeizureLoggingModule;
