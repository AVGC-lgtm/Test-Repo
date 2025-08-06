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

  const [submittedData, setSubmittedData] = useState<any[]>([]);
  const [formFields, setFormFields] = useState({
    dealerName: '',
    registrationNumber: '',
    samplingDate: '',
    fertilizerTypeGrade: '',
    omittedSO: '',
    batchNoManufactureDate: '',
    stockReceiptDate: '',
    sampleCodeNo: '',
    stockPosition: '',
    physicalCondition: '',
    specificationFCO: '',
    compositionAnalysis: '',
    variation: '',
    toleranceMoisture: '',
    toleranceTotalN: '',
    toleranceNH4N: '',
    toleranceNH4NO3N: '',
    toleranceUreaN: '',
    toleranceTotalP2O5: '',
    toleranceNeutralAmmonium: '',
    toleranceCitricAcid: '',
    toleranceWaterSolubleP2O5: '',
    toleranceWaterSolubleK2O: '',
    toleranceParticleSize: '',
    toleranceOthers: '',
  });

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

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedData([...submittedData, formFields]);
    setFormFields({
      dealerName: '',
      registrationNumber: '',
      samplingDate: '',
      fertilizerTypeGrade: '',
      omittedSO: '',
      batchNoManufactureDate: '',
      stockReceiptDate: '',
      sampleCodeNo: '',
      stockPosition: '',
      physicalCondition: '',
      specificationFCO: '',
      compositionAnalysis: '',
      variation: '',
      toleranceMoisture: '',
      toleranceTotalN: '',
      toleranceNH4N: '',
      toleranceNH4NO3N: '',
      toleranceUreaN: '',
      toleranceTotalP2O5: '',
      toleranceNeutralAmmonium: '',
      toleranceCitricAcid: '',
      toleranceWaterSolubleP2O5: '',
      toleranceWaterSolubleK2O: '',
      toleranceParticleSize: '',
      toleranceOthers: '',
    });
    toast({ title: "Success", description: "Data submitted and saved." });
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Field Inspection Data Entry</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Enter details for scheduled inspection tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-2">
            <div>
              <Label>Name and address of dealer/manufacturer/importer</Label>
              <Input name="dealerName" value={formFields.dealerName} onChange={handleFieldChange} required />
            </div>
            <div>
              <Label>Certificate of Registration Number</Label>
              <Input name="registrationNumber" value={formFields.registrationNumber} onChange={handleFieldChange} required />
            </div>
            <div>
              <Label>Date of sampling</Label>
              <Input name="samplingDate" type="date" value={formFields.samplingDate} onChange={handleFieldChange} required />
            </div>
            <div>
              <Label>Type and grade of fertilizer</Label>
              <Input name="fertilizerTypeGrade" value={formFields.fertilizerTypeGrade} onChange={handleFieldChange} required />
            </div>
            <div>
              <Label>Omitted vide S.O. 49(E) dt.16.01.03</Label>
              <Input name="omittedSO" value={formFields.omittedSO} onChange={handleFieldChange} />
            </div>
            <div>
              <Label>Batch No. (if applicable) and date of manufacture/import</Label>
              <Input name="batchNoManufactureDate" value={formFields.batchNoManufactureDate} onChange={handleFieldChange} />
            </div>
            <div>
              <Label>Date of receipt of the stock by the dealer/manufacturer/importer/pool handling agency</Label>
              <Input name="stockReceiptDate" type="date" value={formFields.stockReceiptDate} onChange={handleFieldChange} />
            </div>
            <div>
              <Label>Code No. of sample</Label>
              <Input name="sampleCodeNo" value={formFields.sampleCodeNo} onChange={handleFieldChange} />
            </div>
            <div>
              <Label>Stock position of the lot</Label>
              <Input name="stockPosition" value={formFields.stockPosition} onChange={handleFieldChange} />
            </div>
            <div>
              <Label>Physical condition of fertilizer</Label>
              <Input name="physicalCondition" value={formFields.physicalCondition} onChange={handleFieldChange} />
            </div>
            <div>
              <Label>Specification as per FCO</Label>
              <Input name="specificationFCO" value={formFields.specificationFCO} onChange={handleFieldChange} />
            </div>
            <div>
              <Label>Composition as per analysis</Label>
              <Input name="compositionAnalysis" value={formFields.compositionAnalysis} onChange={handleFieldChange} />
            </div>
            <div>
              <Label>Variation</Label>
              <Input name="variation" value={formFields.variation} onChange={handleFieldChange} />
            </div>
            <div>
              <Label>Permissible Tolerance Limit</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input name="toleranceMoisture" placeholder="Moisture" value={formFields.toleranceMoisture} onChange={handleFieldChange} />
                <Input name="toleranceTotalN" placeholder="Total N" value={formFields.toleranceTotalN} onChange={handleFieldChange} />
                <Input name="toleranceNH4N" placeholder="NH4N" value={formFields.toleranceNH4N} onChange={handleFieldChange} />
                <Input name="toleranceNH4NO3N" placeholder="NH4.NO3N" value={formFields.toleranceNH4NO3N} onChange={handleFieldChange} />
                <Input name="toleranceUreaN" placeholder="Urea N" value={formFields.toleranceUreaN} onChange={handleFieldChange} />
                <Input name="toleranceTotalP2O5" placeholder="Total P2O5" value={formFields.toleranceTotalP2O5} onChange={handleFieldChange} />
                <Input name="toleranceNeutralAmmonium" placeholder="Neutral ammonium citrate soluble P2O5" value={formFields.toleranceNeutralAmmonium} onChange={handleFieldChange} />
                <Input name="toleranceCitricAcid" placeholder="Citric acid soluble P2O5" value={formFields.toleranceCitricAcid} onChange={handleFieldChange} />
                <Input name="toleranceWaterSolubleP2O5" placeholder="Water soluble P2O5" value={formFields.toleranceWaterSolubleP2O5} onChange={handleFieldChange} />
                <Input name="toleranceWaterSolubleK2O" placeholder="Water soluble K2O" value={formFields.toleranceWaterSolubleK2O} onChange={handleFieldChange} />
                <Input name="toleranceParticleSize" placeholder="Particle size" value={formFields.toleranceParticleSize} onChange={handleFieldChange} />
                <Input name="toleranceOthers" placeholder="Others" value={formFields.toleranceOthers} onChange={handleFieldChange} />
              </div>
            </div>
            <Button type="submit" className="w-full" size="sm">Save Data</Button>
          </form>
          {submittedData.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-md">Submitted Data</h4>
              <div className="space-y-2">
                {submittedData.map((data, idx) => (
                  <Card key={idx} className="p-2 bg-muted/20">
                    <CardContent>
                      <div className="text-xs">
                        <div><strong>Name & Address:</strong> {data.dealerName}</div>
                        <div><strong>Reg. No:</strong> {data.registrationNumber}</div>
                        <div><strong>Sampling Date:</strong> {data.samplingDate}</div>
                        <div><strong>Type/Grade:</strong> {data.fertilizerTypeGrade}</div>
                        <div><strong>Batch/Manufacture Date:</strong> {data.batchNoManufactureDate}</div>
                        <div><strong>Stock Receipt Date:</strong> {data.stockReceiptDate}</div>
                        <div><strong>Sample Code No:</strong> {data.sampleCodeNo}</div>
                        <div><strong>Stock Position:</strong> {data.stockPosition}</div>
                        <div><strong>Physical Condition:</strong> {data.physicalCondition}</div>
                        <div><strong>Specification FCO:</strong> {data.specificationFCO}</div>
                        <div><strong>Composition Analysis:</strong> {data.compositionAnalysis}</div>
                        <div><strong>Variation:</strong> {data.variation}</div>
                        <div><strong>Tolerance Limits:</strong>
                          <ul>
                            <li>Moisture: {data.toleranceMoisture}</li>
                            <li>Total N: {data.toleranceTotalN}</li>
                            <li>NH4N: {data.toleranceNH4N}</li>
                            <li>NH4.NO3N: {data.toleranceNH4NO3N}</li>
                            <li>Urea N: {data.toleranceUreaN}</li>
                            <li>Total P2O5: {data.toleranceTotalP2O5}</li>
                            <li>Neutral ammonium citrate soluble P2O5: {data.toleranceNeutralAmmonium}</li>
                            <li>Citric acid soluble P2O5: {data.toleranceCitricAcid}</li>
                            <li>Water soluble P2O5: {data.toleranceWaterSolubleP2O5}</li>
                            <li>Water soluble K2O: {data.toleranceWaterSolubleK2O}</li>
                            <li>Particle size: {data.toleranceParticleSize}</li>
                            <li>Others: {data.toleranceOthers}</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FieldExecutionModule;
