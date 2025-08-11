
"use client";
import React, { useState, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QrCode, Fingerprint, Camera, AlertTriangle, Upload, FileImage, Loader2 } from 'lucide-react'; // Removed MapPin (not used in UI)
import { PRODUCT_DATABASE } from '@/lib/constants';
import type { ScanResult } from '@/types';
import { analyzePhotoForMarkers } from '@/ai/flows/analyze-photo-for-markers'; 
import Image from 'next/image';

const FieldExecutionModule = () => {
  const { addSeizure, addLabSample } = useAppContext();
  const { toast } = useToast();
  
  const [activeDevice, setActiveDevice] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [bodyCamActive, setBodyCamActive] = useState(false);
  
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productPhoto, setProductPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const companies = Object.keys(PRODUCT_DATABASE.pesticides); 

  const handleDeviceActivation = (device: string) => {
    setActiveDevice(device);
    if (device === 'bodycam') {
      setBodyCamActive(prev => !prev);
      toast({ title: "Info", description: `Body cam ${!bodyCamActive ? 'activated' : 'deactivated'}.` });
    } else {
       toast({ title: "Info", description: `${device} activated.` });
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProductPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleProductScan = async () => {
    if (!selectedCompany || !selectedProduct || !productPhoto) {
      toast({ title: "Error", description: "Please select company, product, and upload a photo.", variant: "destructive" });
      return;
    }
    setIsScanning(true);
    setScanResult(null);

    try {
      const photoDataUri = photoPreview; 
      if (!photoDataUri) {
        toast({ title: "Error", description: "Photo data is missing.", variant: "destructive" });
        setIsScanning(false);
        return;
      }

      const aiResult = await analyzePhotoForMarkers({
        photoDataUri,
        productName: selectedProduct,
        companyName: selectedCompany,
      });

      const result: ScanResult = {
        company: selectedCompany,
        product: selectedProduct,
        batchNumber: `${selectedCompany.toUpperCase()}-${selectedProduct.replace(/\s/g, '').toUpperCase()}-${Date.now().toString().slice(-5)}`, 
        authenticityScore: aiResult.authenticityScore,
        issues: aiResult.detectedIssues,
        recommendation: aiResult.authenticityScore < 60 ? 'Suspected Counterfeit' : (aiResult.authenticityScore < 85 ? 'Needs Verification' : 'Authentic'),
        geoLocation: '16.7050° N, 74.2433° E', 
        timestamp: new Date().toISOString()
      };
      setScanResult(result);
      
      if (result.recommendation === 'Suspected Counterfeit') {
        toast({ title: "Alert", description: "Suspected counterfeit! Review and initiate seizure if needed.", variant: "destructive", duration: 7000 });
      } else if (result.recommendation === 'Needs Verification') {
        toast({ title: "Warning", description: "Product needs verification. Check markers.", variant: "default", duration: 7000 });
      }
       else {
        toast({ title: "Success", description: "Product likely authentic." });
      }

    } catch (error) {
      console.error("AI Analysis Error:", error);
      toast({ title: "Error", description: "Failed to analyze photo. Try again.", variant: "destructive" });
      const mockResult: ScanResult = {
        company: selectedCompany,
        product: selectedProduct,
        batchNumber: 'ERR-MOCK-BATCH',
        authenticityScore: 35,
        issues: ['AI analysis failed', 'Mock result shown'],
        recommendation: 'Needs Verification',
        geoLocation: 'N/A',
        timestamp: new Date().toISOString()
      };
      setScanResult(mockResult);
    } finally {
      setIsScanning(false);
    }
  };
  
  const handleSeizure = () => {
    if (scanResult && (scanResult.recommendation === 'Suspected Counterfeit' || scanResult.recommendation === 'Needs Verification')) {
      const seizureData = {
        ...scanResult,
        quantity: '50 units', 
        estimatedValue: '₹25,000', 
        witnessName: 'Shop Owner', 
        evidencePhotos: productPhoto ? [productPhoto.name] : [], 
        videoEvidence: bodyCamActive ? 'video_rec.mp4' : 'N/A' 
      };
      
      addSeizure(seizureData);
      addLabSample({
        ...seizureData, 
        sampleType: 'Pesticide', 
        labDestination: 'SPTL Ghaziabad' 
      });
      
      toast({ title: "Success", description: "Seizure logged & sample prepared for lab." });
      setScanResult(null); 
      setProductPhoto(null);
      setPhotoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

    } else {
      toast({ title: "Info", description: "No seizure initiated.", variant: "default" });
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Field Equipment Control</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Manage and activate field testing equipment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="p-3 sm:p-4 rounded-lg border bg-muted/30">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 sm:gap-3">
                <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <div>
                  <h4 className="font-medium text-sm sm:text-base">Axon Body Cam</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{bodyCamActive ? 'Recording...' : 'Standby'}</p>
                </div>
              </div>
              <Button onClick={() => handleDeviceActivation('bodycam')} variant={bodyCamActive ? 'destructive' : 'default'} size="sm">
                {bodyCamActive ? 'Stop' : 'Start'} Rec
              </Button>
            </div>
            {bodyCamActive && (
              <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>REC 00:12:34</span>
              </div>
            )}
          </div>
          
          {['TruScan Device', 'Gemini Analyzer'].map((deviceName) => (
            <div key={deviceName} className="p-3 sm:p-4 rounded-lg border bg-muted/30">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 sm:gap-3">
                  {deviceName === 'TruScan Device' ? <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> : <Fingerprint className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
                  <div>
                    <h4 className="font-medium text-sm sm:text-base">{deviceName}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">{activeDevice === deviceName.toLowerCase().replace(' ', '') ? 'Active' : 'Ready'}</p>
                  </div>
                </div>
                <Button onClick={() => handleDeviceActivation(deviceName.toLowerCase().replace(' ', ''))} variant="outline" size="sm" disabled={activeDevice === deviceName.toLowerCase().replace(' ', '')}>
                  {activeDevice === deviceName.toLowerCase().replace(' ', '') ? 'Active' : 'Activate'}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Product Testing & Analysis</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Scan product packaging and analyze for authenticity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="company" className="text-sm">Company</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger id="company" className="h-9 text-sm"><SelectValue placeholder="Select Company" /></SelectTrigger>
                <SelectContent>
                  {companies.map(company => <SelectItem key={company} value={company} className="text-sm">{company}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="productName" className="text-sm">Product Name</Label>
              <Input id="productName" placeholder="e.g., Saaf, Confidor" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="productPhoto" className="text-sm">Product Photo</Label>
              <Input id="productPhoto" type="file" accept="image/*" onChange={handlePhotoChange} ref={fileInputRef} className="file:text-xs file:font-medium text-sm h-auto py-1.5"/>
              {photoPreview && (
                <div className="mt-2 border rounded-md p-2 bg-muted/20">
                  <Image src={photoPreview} alt="Product preview" width={80} height={80} className="object-contain rounded-md mx-auto" data-ai-hint="product package"/>
                </div>
              )}
            </div>
          </div>
          
          <Button onClick={handleProductScan} className="w-full" disabled={isScanning} size="sm">
            {isScanning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><FileImage className="mr-2 h-4 w-4" /> Analyze Product Photo</>}
          </Button>
          
          {scanResult && (
            <div className="p-3 sm:p-4 rounded-lg border bg-muted/30 space-y-2">
              <h4 className="font-semibold text-md sm:text-lg">Test Results:</h4>
              <p className="text-xs sm:text-sm"><strong>Product:</strong> {scanResult.company} {scanResult.product}</p>
              <p className="text-xs sm:text-sm"><strong>Batch:</strong> {scanResult.batchNumber}</p>
              <p className="text-xs sm:text-sm"><strong>Authenticity Score:</strong> 
                <span className={scanResult.authenticityScore > 70 ? 'text-green-600' : 'text-red-600'}> {scanResult.authenticityScore}%</span>
              </p>
              <p className="text-xs sm:text-sm"><strong>Recommendation:</strong> 
                <span className={scanResult.recommendation === 'Authentic' ? 'text-green-600' : 'text-red-600'}> {scanResult.recommendation}</span>
              </p>
              {scanResult.issues.length > 0 && (
                <div>
                  <p className="text-xs sm:text-sm font-medium text-destructive">Issues Detected:</p>
                  <ul className="list-disc list-inside text-[10px] sm:text-xs text-destructive/80">
                    {scanResult.issues.map((issue, index) => <li key={index}>{issue}</li>)}
                  </ul>
                </div>
              )}
              {(scanResult.recommendation === 'Suspected Counterfeit' || scanResult.recommendation === 'Needs Verification') && (
                <Button onClick={handleSeizure} variant="destructive" className="w-full mt-2" size="sm">
                  <AlertTriangle className="mr-2 h-4 w-4" /> Initiate Seizure
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FieldExecutionModule;
