
"use client";
import React, { useState, useEffect, ChangeEvent } from 'react';
import { Save, Printer, Download, Upload, CalendarDays, User, Building, FlaskConical, Microscope, FileCheck2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AgriFormRendererProps {
  formType: string;
}

const AgriFormRenderer: React.FC<AgriFormRendererProps> = ({ formType }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [pendingUpdateFields, setPendingUpdateFields] = useState<string[]>([]);
  const [isPendingUpdateMode, setIsPendingUpdateMode] = useState(false); 
  const [updateComment, setUpdateComment] = useState("");
  const [showOnlyUpdateFields, setShowOnlyUpdateFields] = useState(false);

  const commonInputClass = "focus:ring-primary"; 
  const commonLabelClass = "mb-1 text-sm font-medium text-foreground";

  useEffect(() => {
    setFormData({});
    setCurrentStep(1);
    setFormSubmitted(false);
    setIsUpdate(false);
    setPendingUpdateFields([]);
    setIsPendingUpdateMode(false);
    setUpdateComment("");
    setShowOnlyUpdateFields(false);

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const editMode = urlParams.get('edit') === 'true';
      const formId = urlParams.get('id'); 

      if (editMode && formType === 'fertilizerLicense') {
        setIsUpdate(true);
        setIsPendingUpdateMode(true); 
        setFormData({
          fullName: "John Doe (Existing)",
          aadharNumber: "123456789012",
          panNumber: "ABCDE1234F",
          education: "B.Sc. Agriculture",
          mobileNumber: "9876543210",
          email: "john.doe.existing@example.com",
          address: "123 Farm Avenue, Agricultural District, Existing City",
          businessName: "Green Fields Fertilizers (Old)",
          businessType: "proprietorship",
          registrationNumber: "REG123456OLD",
          gstNumber: "GST9876543210OLD",
          salePointAddress: "456 Market Street, Commercial Zone (Old Location)",
          storageAddress: "789 Warehouse Area, Industrial Zone (Pending Update)",
          premisesOwnership: "owned",
          premisesSize: "2500",
          responsiblePersonName: "Jane Smith (Old Manager)",
          responsiblePersonDesignation: "Operations Manager",
          responsiblePersonQualification: "M.Sc. Agricultural Science",
          responsiblePersonContact: "9876543211 (Pending Update)",
          paymentMethod: "challan",
          paymentReference: "PAY987654321 (Pending Update)",
          paymentDate: "2025-05-01",
          paymentAmount: "2250",
          declaration: true,
        });
        setPendingUpdateFields([
          "responsiblePersonContact",
          "paymentReference",
          "storageAddress",
          "businessName",
          "salePointAddress"
        ]);
      }
    }
  }, [formType]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (isUpdate && pendingUpdateFields.includes(name)) {
      // Optionally remove from pending if considered "addressed" immediately
      // setPendingUpdateFields(prev => prev.filter(f => f !== name));
    }
  };
  
  const handleSelectChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
     if (isUpdate && pendingUpdateFields.includes(name)) {
      // As above
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const requiredFieldsForCurrentForm = getRequiredFields(formType, currentStep);
    const missingFields = requiredFieldsForCurrentForm.filter(field => !formData[field] && formData[field] !== false); 

    if (missingFields.length > 0 && (formType === 'fertilizerLicense' && currentStep === 3 || formType !== 'fertilizerLicense')) {
        toast({
            title: "Missing Information",
            description: `Please fill in the following required fields: ${missingFields.map(f => f.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())).join(', ')}`,
            variant: "destructive"
        });
        return;
    }
    
    // For update mode, check if all highlighted fields are addressed (pendingUpdateFields is empty after user edits)
    // This logic assumes that user interaction with a highlighted field implies it's addressed.
    // A more robust check might involve comparing original vs current values.
    // For simplicity, we'll assume interacting with a field (thus removing from pendingUpdateFields via a more proactive handleChange) is enough.
    // Or, if pendingUpdateFields isn't cleared automatically by handleChange, check its length.
    const allUpdatesAddressed = isUpdate ? pendingUpdateFields.filter(field => {
        // This check ensures the field was actually changed from its initial "Pending Update" state.
        // This requires knowing original data, which isn't fully mocked here.
        // For now, we'll keep the simpler check.
        // A more robust check:
        // const originalValue = originalFormDataForUpdate[field]; // (Needs originalFormDataForUpdate state)
        // return formData[field] !== originalValue;
        // Simple check: if pendingUpdateFields is empty (assuming handleChange removed them), all good.
        return true; 
    }).length === 0 : true;


    if (isUpdate && !allUpdatesAddressed && pendingUpdateFields.length > 0) { // If still pending fields explicitly
        toast({
            title: "Updates Pending",
            description: `Please address all fields marked for update: ${pendingUpdateFields.map(f => f.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())).join(', ')}`,
            variant: "destructive"
        });
        return;
    }
    
    setFormSubmitted(true);
    setIsPendingUpdateMode(false); 
    setPendingUpdateFields([]); 
    toast({
        title: isUpdate ? "Form Updated" : "Form Submitted",
        description: `Your form (${renderFormTitle()}) has been ${isUpdate ? "updated" : "submitted"} successfully.`,
        variant: "default"
    });
  };

  const getRequiredFields = (currentFormType: string, step?: number): string[] => {
    if (currentFormType === 'fertilizerLicense') {
        if (step === 1) return ['fullName', 'aadharNumber', 'mobileNumber', 'address'];
        if (step === 2) return ['businessName', 'businessType', 'salePointAddress', 'storageAddress', 'responsiblePersonName', 'responsiblePersonContact'];
        if (step === 3) return ['declaration'];
    }
    if (currentFormType === 'formA1') return ['applicantNameA1', 'dealerLicenseNoA1', 'intimationDateA1', 'declarationA1'];
    if (currentFormType === 'inspectionFertilizer') return ['unitNameInspF', 'inspectionDateInspF', 'inspectorNameInspF', 'observationsInspF'];
    if (currentFormType === 'formV') return ['inspectorNameFormV', 'inspectionDateFormV', 'locationFormV', 'productNameFormV'];
    if (currentFormType === 'formIV') return ['sampleIdFormIV', 'analystNameFormIV', 'labNameFormIV', 'dateReceivedFormIV', 'dateAnalyzedFormIV', 'productTestedFormIV', 'declaredContentFormIV', 'foundContentFormIV', 'resultFormIV'];
    if (currentFormType === 'inspectionInsecticide') return ['unitNameInspI', 'inspectionDateInspI', 'inspectorNameInspI', 'overallComplianceInspI'];
    return [];
  }

  const handleSaveDraft = () => {
    toast({ title: "Draft Saved", description: "Form draft has been saved successfully!", variant: "default" });
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const handleExport = () => {
    toast({ title: "Exported", description: "Form data has been exported successfully!", variant: "default" });
  };

  const nextStep = () => {
    if (formType === 'fertilizerLicense') {
        const requiredFields = getRequiredFields(formType, currentStep);
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
             toast({
                title: "Missing Information",
                description: `Please fill in the following fields before proceeding: ${missingFields.map(f => f.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())).join(', ')}`,
                variant: "destructive"
            });
            return;
        }
    }
    setCurrentStep(prev => prev + 1);
  }
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const renderFormTitle = () => {
    switch(formType) {
      case 'fertilizerLicense': return "Fertilizer Sale License Application";
      case 'formA1': return "Form A1 - Memorandum of Intimation";
      case 'inspectionFertilizer': return "Fertilizer Manufacturing Unit Inspection Report";
      case 'formV': return "Form V - Insecticide Inspector Sample & Seizure Form";
      case 'formIV': return "Form IV - Insecticide Analyst Report";
      case 'inspectionInsecticide': return "Insecticide Manufacturing Unit Inspection Report";
      default: return "Form";
    }
  };

  const FormToolbar = () => (
    <Card className="mb-4 sm:mb-6 shadow-md">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 border-b">
        <div>
          <CardTitle className="text-lg sm:text-xl">{renderFormTitle()}</CardTitle>
          {formSubmitted ? (
            <CardDescription className="text-green-600 dark:text-green-400 mt-1 text-xs sm:text-sm">
              <CheckCircle className="inline-block mr-1 h-4 w-4" /> Form {isUpdate ? "updated" : "submitted"} successfully!
            </CardDescription>
          ) : (
            <CardDescription className="mt-1 text-xs sm:text-sm">
              {isUpdate ? "Please update the highlighted fields and provide comments." : "Please fill out the form completely."}
            </CardDescription>
          )}
          {isPendingUpdateMode && !formSubmitted && (
            <span className="ml-0 mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 text-xs rounded-full inline-flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" /> Pending Update
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
          <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={formSubmitted}><Save size={14} className="mr-1 sm:mr-1.5" />Save Draft</Button>
          <Button variant="outline" size="sm" onClick={handlePrint}><Printer size={14} className="mr-1 sm:mr-1.5" />Print</Button>
          <Button variant="outline" size="sm" onClick={handleExport}><Download size={14} className="mr-1 sm:mr-1.5" />Export</Button>
          <Button variant="outline" size="sm" disabled={formSubmitted}><Upload size={14} className="mr-1 sm:mr-1.5" />Attachments</Button>
        </div>
      </CardHeader>
    </Card>
  );

  const needsUpdateHighlight = (fieldName: string) => isUpdate && pendingUpdateFields.includes(fieldName);

  const UpdateFieldWrapper: React.FC<{ children: React.ReactNode; fieldName: string }> = ({ children, fieldName }) => {
    if (needsUpdateHighlight(fieldName)) {
      return (
        <div className="border-2 border-yellow-400 dark:border-yellow-600 rounded-md p-0.5 relative bg-yellow-50 dark:bg-yellow-900/20">
          <div className="absolute -top-2.5 left-2 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs px-1 rounded-t-sm border border-b-0 border-yellow-400 dark:border-yellow-600">
            Update Required
          </div>
          <div className="pt-1">{children}</div>
        </div>
      );
    }
    return <>{children}</>;
  };
  
  const renderFertilizerLicenseForm = () => {    
    return (
      <Card className="shadow-md">
        <CardContent className="p-4 sm:p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            {[1,2,3].map(stepNum => (
              <div key={stepNum} className={`w-1/3 text-center ${currentStep >= stepNum ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto rounded-full flex items-center justify-center mb-1 text-xs sm:text-sm ${currentStep >= stepNum ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{stepNum}</div>
                <span className="hidden sm:inline">{stepNum === 1 && "Applicant"} {stepNum === 2 && "Business"} {stepNum === 3 && "Documents"}</span>
                <span className="sm:hidden text-[10px] leading-tight">{stepNum === 1 && "Appl."} {stepNum === 2 && "Biz."} {stepNum === 3 && "Docs"}</span>
              </div>
            ))}
          </div>
          <div className="w-full h-1.5 bg-muted mt-2 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300 ease-in-out" style={{ width: `${((currentStep - 1) / 2) * 100}%` }}></div>
          </div>
        </div>

        {isUpdate && !formSubmitted && (
          <Alert variant="default" className="mb-4 sm:mb-6 bg-accent/10 border-accent/50 text-accent dark:bg-accent/20 dark:border-accent/70 dark:text-accent">
            <AlertTriangle className="h-5 w-5 text-accent" />
            <AlertTitle className="text-accent">Form Update Required</AlertTitle>
            <AlertDescription>
              This form has been returned for updates. Please review and update the highlighted fields. Add comments below regarding the changes made.
              <Button variant="link" size="sm" onClick={() => setShowOnlyUpdateFields(!showOnlyUpdateFields)} className="text-accent hover:text-accent/80 p-0 h-auto ml-2 text-xs">
                ({showOnlyUpdateFields ? "Show All Fields" : "Show Only Update Fields"})
              </Button>
            </AlertDescription>
            <div className="mt-3">
              <Label htmlFor="updateComment" className={commonLabelClass + " text-accent"}>Update Comments</Label>
              <Textarea
                id="updateComment"
                className={`${commonInputClass} bg-background focus:ring-accent`}
                rows={3}
                placeholder="Detail the updates you have made..."
                value={updateComment}
                onChange={(e) => setUpdateComment(e.target.value)}
              />
            </div>
            {pendingUpdateFields.length > 0 && (
              <div className="mt-3">
                <span className="text-sm font-medium text-accent">Fields still requiring update:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {pendingUpdateFields.map(field => (
                    <span key={field} className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                      {field.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {pendingUpdateFields.length === 0 && isPendingUpdateMode && (
              <div className="mt-3 text-green-600 dark:text-green-400 text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" /> All highlighted updates seem to be addressed. Please add comments and submit.
              </div>
            )}
          </Alert>
        )}

        <div className={formSubmitted ? "opacity-50 pointer-events-none" : ""}>
          {(currentStep === 1 && (!showOnlyUpdateFields || pendingUpdateFields.some(field => 
            ['fullName', 'aadharNumber', 'panNumber', 'education', 'mobileNumber', 'email', 'address'].includes(field)
          ))) && (
            <section className="space-y-4">
              <h3 className="text-md sm:text-lg font-semibold mb-4 border-b pb-2">Applicant Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="fullName" className={commonLabelClass}>Full Name *</Label><UpdateFieldWrapper fieldName="fullName"><Input type="text" name="fullName" id="fullName" className={commonInputClass} value={String(formData.fullName || '')} onChange={handleChange} required/></UpdateFieldWrapper></div>
                <div><Label htmlFor="aadharNumber" className={commonLabelClass}>Aadhar Number *</Label><UpdateFieldWrapper fieldName="aadharNumber"><Input type="text" name="aadharNumber" id="aadharNumber" className={commonInputClass} value={String(formData.aadharNumber || '')} onChange={handleChange} required pattern="\d{12}" title="12 digit Aadhar number"/></UpdateFieldWrapper></div>
                <div><Label htmlFor="panNumber" className={commonLabelClass}>PAN Number</Label><UpdateFieldWrapper fieldName="panNumber"><Input type="text" name="panNumber" id="panNumber" className={commonInputClass} value={String(formData.panNumber || '')} onChange={handleChange} pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}" title="Valid PAN number format"/></UpdateFieldWrapper></div>
                <div><Label htmlFor="education" className={commonLabelClass}>Educational Qualification</Label><UpdateFieldWrapper fieldName="education"><Input type="text" name="education" id="education" className={commonInputClass} value={String(formData.education || '')} onChange={handleChange}/></UpdateFieldWrapper></div>
                <div><Label htmlFor="mobileNumber" className={commonLabelClass}>Mobile Number *</Label><UpdateFieldWrapper fieldName="mobileNumber"><Input type="tel" name="mobileNumber" id="mobileNumber" className={commonInputClass} value={String(formData.mobileNumber || '')} onChange={handleChange} required pattern="\d{10}" title="10 digit mobile number"/></UpdateFieldWrapper></div>
                <div><Label htmlFor="email" className={commonLabelClass}>Email Address</Label><UpdateFieldWrapper fieldName="email"><Input type="email" name="email" id="email" className={commonInputClass} value={String(formData.email || '')} onChange={handleChange}/></UpdateFieldWrapper></div>
              </div>
              <div><Label htmlFor="address" className={commonLabelClass}>Complete Address *</Label><UpdateFieldWrapper fieldName="address"><Textarea name="address" id="address" rows={3} className={commonInputClass} value={String(formData.address || '')} onChange={handleChange} required/></UpdateFieldWrapper></div>
              
              <div className="pt-4"> 
                <Label className={commonLabelClass + " mb-2"}>Documents to Upload (Self-attested)</Label>
                {[
                  {id: "aadharUpload", label: "Aadhar Card"}, {id: "panUpload", label: "PAN Card"}, 
                  {id: "educationUpload", label: "Education Qualification Document"}, {id: "photoUpload", label: "I-card Size Recent Photo"},
                  {id: "signatureUpload", label: "Scanned Copy of Signature"}
                ].map(doc => (
                  <div key={doc.id} className="flex items-center space-x-3 mb-2 p-2 sm:p-3 border rounded-md bg-muted/30">
                    <Checkbox id={doc.id} name={doc.id} checked={!!formData[doc.id]} onCheckedChange={(checked) => handleSelectChange(doc.id, Boolean(checked))} />
                    <Label htmlFor={doc.id} className="text-xs sm:text-sm font-normal flex-1 cursor-pointer">{doc.label}</Label>
                    <Button variant="outline" size="sm" onClick={() => document.getElementById(`file_${doc.id}`)?.click()}><Upload size={12} className="mr-1 sm:mr-1.5"/>Upload</Button>
                    <Input type="file" id={`file_${doc.id}`} className="hidden" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {(currentStep === 2 && (!showOnlyUpdateFields || pendingUpdateFields.some(field => 
            ['businessName', 'businessType', 'registrationNumber', 'gstNumber', 'salePointAddress', 'storageAddress', 
            'premisesOwnership', 'premisesSize', 'responsiblePersonName', 'responsiblePersonDesignation', 
            'responsiblePersonQualification', 'responsiblePersonContact', 'paymentMethod', 'paymentReference', 
            'paymentDate', 'paymentAmount'].includes(field)
          ))) && (
            <section className="space-y-4">
              <h3 className="text-md sm:text-lg font-semibold mb-4 border-b pb-2">Business Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="businessName" className={commonLabelClass}>Business Name *</Label><UpdateFieldWrapper fieldName="businessName"><Input type="text" name="businessName" id="businessName" className={commonInputClass} value={String(formData.businessName || '')} onChange={handleChange} required/></UpdateFieldWrapper></div>
                <div>
                  <Label htmlFor="businessType" className={commonLabelClass}>Type of Business *</Label>
                  <UpdateFieldWrapper fieldName="businessType">
                    <Select name="businessType" value={String(formData.businessType || '')} onValueChange={(value) => handleSelectChange("businessType", value)} required>
                      <SelectTrigger className={commonInputClass} id="businessType"><SelectValue placeholder="Select Type" /></SelectTrigger>
                      <SelectContent><SelectItem value="proprietorship">Proprietorship</SelectItem><SelectItem value="partnership">Partnership</SelectItem><SelectItem value="limited">Limited Company</SelectItem><SelectItem value="cooperative">Cooperative Society</SelectItem></SelectContent>
                    </Select>
                  </UpdateFieldWrapper>
                </div>
                <div><Label htmlFor="registrationNumber" className={commonLabelClass}>Registration Number</Label><UpdateFieldWrapper fieldName="registrationNumber"><Input type="text" name="registrationNumber" id="registrationNumber" className={commonInputClass} value={String(formData.registrationNumber || '')} onChange={handleChange}/></UpdateFieldWrapper></div>
                <div><Label htmlFor="gstNumber" className={commonLabelClass}>GST Number</Label><UpdateFieldWrapper fieldName="gstNumber"><Input type="text" name="gstNumber" id="gstNumber" className={commonInputClass} value={String(formData.gstNumber || '')} onChange={handleChange}/></UpdateFieldWrapper></div>
              </div>
              
              <h4 className="font-semibold text-sm sm:text-base text-muted-foreground mb-2 pt-3 border-t mt-6">Business Premises Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="salePointAddress" className={commonLabelClass}>Sale Point Address *</Label><UpdateFieldWrapper fieldName="salePointAddress"><Textarea name="salePointAddress" id="salePointAddress" rows={3} className={commonInputClass} value={String(formData.salePointAddress || '')} onChange={handleChange} required/></UpdateFieldWrapper></div>
                <div><Label htmlFor="storageAddress" className={commonLabelClass}>Godown/Storage Address *</Label><UpdateFieldWrapper fieldName="storageAddress"><Textarea name="storageAddress" id="storageAddress" rows={3} className={commonInputClass} value={String(formData.storageAddress || '')} onChange={handleChange} required/></UpdateFieldWrapper></div>
                <div>
                  <Label htmlFor="premisesOwnership" className={commonLabelClass}>Premises Ownership</Label>
                  <UpdateFieldWrapper fieldName="premisesOwnership">
                    <Select name="premisesOwnership" value={String(formData.premisesOwnership || '')} onValueChange={(value) => handleSelectChange("premisesOwnership", value)}>
                      <SelectTrigger className={commonInputClass} id="premisesOwnership"><SelectValue placeholder="Select Type" /></SelectTrigger>
                      <SelectContent><SelectItem value="owned">Owned</SelectItem><SelectItem value="rented">Rented</SelectItem></SelectContent>
                    </Select>
                  </UpdateFieldWrapper>
                </div>
                <div><Label htmlFor="premisesSize" className={commonLabelClass}>Premises Size (sq. ft.)</Label><UpdateFieldWrapper fieldName="premisesSize"><Input type="number" name="premisesSize" id="premisesSize" className={commonInputClass} value={String(formData.premisesSize || '')} onChange={handleChange}/></UpdateFieldWrapper></div>
              </div>

              <h4 className="font-semibold text-sm sm:text-base text-muted-foreground mb-2 pt-3 border-t mt-6">Responsible Person Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="responsiblePersonName" className={commonLabelClass}>Name *</Label><UpdateFieldWrapper fieldName="responsiblePersonName"><Input type="text" name="responsiblePersonName" id="responsiblePersonName" className={commonInputClass} value={String(formData.responsiblePersonName || '')} onChange={handleChange} required/></UpdateFieldWrapper></div>
                <div><Label htmlFor="responsiblePersonDesignation" className={commonLabelClass}>Designation</Label><UpdateFieldWrapper fieldName="responsiblePersonDesignation"><Input type="text" name="responsiblePersonDesignation" id="responsiblePersonDesignation" className={commonInputClass} value={String(formData.responsiblePersonDesignation || '')} onChange={handleChange}/></UpdateFieldWrapper></div>
                <div><Label htmlFor="responsiblePersonQualification" className={commonLabelClass}>Qualification</Label><UpdateFieldWrapper fieldName="responsiblePersonQualification"><Input type="text" name="responsiblePersonQualification" id="responsiblePersonQualification" className={commonInputClass} value={String(formData.responsiblePersonQualification || '')} onChange={handleChange}/></UpdateFieldWrapper></div>
                <div><Label htmlFor="responsiblePersonContact" className={commonLabelClass}>Contact Number *</Label><UpdateFieldWrapper fieldName="responsiblePersonContact"><Input type="tel" name="responsiblePersonContact" id="responsiblePersonContact" className={commonInputClass} value={String(formData.responsiblePersonContact || '')} onChange={handleChange} required pattern="\d{10}" title="10 digit mobile number"/></UpdateFieldWrapper></div>
              </div>

              <h4 className="font-semibold text-sm sm:text-base text-muted-foreground mb-2 pt-3 border-t mt-6">Registration Fees Payment</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                  <Label htmlFor="paymentMethod" className={commonLabelClass}>Payment Method</Label>
                  <UpdateFieldWrapper fieldName="paymentMethod">
                    <Select name="paymentMethod" value={String(formData.paymentMethod || '')} onValueChange={(value) => handleSelectChange("paymentMethod", value)}>
                      <SelectTrigger className={commonInputClass} id="paymentMethod"><SelectValue placeholder="Select Method" /></SelectTrigger>
                      <SelectContent><SelectItem value="challan">Online Challan</SelectItem><SelectItem value="bankChallan">Bank Counter Challan</SelectItem><SelectItem value="demandDraft">Demand Draft</SelectItem></SelectContent>
                    </Select>
                  </UpdateFieldWrapper>
                </div>
                <div><Label htmlFor="paymentReference" className={commonLabelClass}>Reference/UTR Number</Label><UpdateFieldWrapper fieldName="paymentReference"><Input type="text" name="paymentReference" id="paymentReference" className={commonInputClass} value={String(formData.paymentReference || '')} onChange={handleChange}/></UpdateFieldWrapper></div>
                <div><Label htmlFor="paymentDate" className={commonLabelClass}>Payment Date</Label><UpdateFieldWrapper fieldName="paymentDate"><Input type="date" name="paymentDate" id="paymentDate" className={commonInputClass} value={String(formData.paymentDate || '')} onChange={handleChange}/></UpdateFieldWrapper></div>
                <div><Label htmlFor="paymentAmount" className={commonLabelClass}>Amount Paid (Rs.)</Label><UpdateFieldWrapper fieldName="paymentAmount"><Input type="number" name="paymentAmount" id="paymentAmount" className={commonInputClass} value={String(formData.paymentAmount || '')} onChange={handleChange}/></UpdateFieldWrapper></div>
              </div>
            </section>
          )}

          {currentStep === 3 && (
            <section className="space-y-4">
              <h3 className="text-md sm:text-lg font-semibold mb-4 border-b pb-2">Documents & Submission</h3>
              <div>
                <h4 className="font-semibold text-sm sm:text-base text-muted-foreground mb-2">Required Documents</h4>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">Please upload the specified documents and check the boxes upon completion.</p>
                {[
                    {id: "formA1UploadDoc", label: "Duly filled Form A-1 (Signed Copy)"},
                    {id: "challanUploadDoc", label: "Payment Challan/Receipt"},
                    {id: "responsiblePersonUploadDoc", label: "Responsible Person Acceptance (Rs.500/- stamp paper)"},
                    {id: "manufactureCertUploadDoc", label: "Certificate of Manufacture"},
                    {id: "labCertUploadDoc", label: "Certificate of Laboratory Facility"},
                    {id: "bagPrintUploadDoc", label: "Matter to be Printed on Bag/Container"},
                    {id: "premisesDocUploadDoc", label: "Premises Ownership/Rental Documents"},
                    {id: "qualityAssuranceUploadDoc", label: "Quality Assurance Undertaking (Rs.500/- stamp paper)"},
                    {id: "inspectionReportUploadDoc", label: "Joint Inspection Report of DLC"},
                ].map(doc => (
                  <div key={doc.id} className="flex items-center space-x-3 mb-2 p-2 sm:p-3 border rounded-md bg-muted/30">
                    <Checkbox id={doc.id} name={doc.id} checked={!!formData[doc.id]} onCheckedChange={(checked) => handleSelectChange(doc.id, Boolean(checked))} />
                    <Label htmlFor={doc.id} className="text-xs sm:text-sm font-normal flex-1 cursor-pointer">{doc.label}</Label>
                    <Button variant="outline" size="sm" onClick={() => document.getElementById(`file_${doc.id}`)?.click()}><Upload size={12} className="mr-1 sm:mr-1.5"/>Upload</Button>
                    <Input type="file" id={`file_${doc.id}`} className="hidden" />
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-semibold text-sm sm:text-base text-muted-foreground mb-2 pt-3 border-t mt-6">Declaration *</h4>
                <div className="p-3 sm:p-4 bg-muted/30 rounded border">
                  <Label htmlFor="declaration" className="flex items-start cursor-pointer">
                    <Checkbox id="declaration" name="declaration" className="mt-1 mr-2 sm:mr-3 flex-shrink-0" checked={!!formData.declaration} onCheckedChange={(checked) => handleSelectChange("declaration", Boolean(checked))} required/>
                    <span className="text-xs sm:text-sm">
                      I/We declare that the information given above is true to the best of my/our knowledge and
                      belief and no part thereof is false or no material information has been concealed. I have read
                      the terms and conditions of eligibility for submission of Memorandum of intimation and
                      undertake that the same will be complied by me.
                    </span>
                  </Label>
                </div>
              </div>
            </section>
          )}

          <div className="flex flex-col sm:flex-row justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t gap-2">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={prevStep} disabled={formSubmitted} className="w-full sm:w-auto">Previous</Button>
            ) : (<div className="hidden sm:block"></div>) /* Placeholder for alignment */}
            
            {currentStep < 3 ? (
              <Button onClick={nextStep} disabled={formSubmitted} className="w-full sm:w-auto sm:ml-auto">Next</Button>
            ) : (
              <Button 
                variant={ (isUpdate && pendingUpdateFields.length > 0) || (getRequiredFields(formType, currentStep).some(f => !formData[f] && formData[f] !== false )) ? "secondary" : "default"}
                className={`${ (isUpdate && pendingUpdateFields.length > 0) || (getRequiredFields(formType, currentStep).some(f => !formData[f] && formData[f] !== false)) ? "" : "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"} w-full sm:w-auto sm:ml-auto`}
                onClick={handleSubmit} 
                disabled={formSubmitted || (isUpdate && pendingUpdateFields.length > 0 && !updateComment) || (getRequiredFields(formType, currentStep).some(f => !formData[f] && formData[f] !== false ))}
              >
                <CheckCircle size={16} className="mr-1"/>
                {isUpdate ? "Submit Updates" : "Submit Application"}
              </Button>
            )}
          </div>
          {isUpdate && pendingUpdateFields.length > 0 && currentStep === 3 && !formSubmitted && (
            <p className="mt-4 text-yellow-600 dark:text-yellow-400 text-xs sm:text-sm">
              Please make all required updates and add comments before submitting.
            </p>
          )}
          {getRequiredFields(formType, currentStep).some(f => !formData[f] && formData[f] !== false) && currentStep === 3 && !isUpdate && !formSubmitted && (
             <p className="mt-4 text-red-600 dark:text-red-400 text-xs sm:text-sm">
              Please fill all required fields (e.g., Declaration) before submitting.
            </p>
          )}
        </div>
        </CardContent>
      </Card>
    );
  };

  const SimpleFormLayout: React.FC<{ title: string; description: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, description, children, icon }) => (
    <Card className="shadow-md">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center space-x-2">
          {icon || <FileCheck2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary"/>}
          <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className={formSubmitted ? "opacity-50 pointer-events-none" : ""}>
        <CardContent className="space-y-4 p-4 sm:p-6">
          {children}
        </CardContent>
        <CardFooter className="border-t px-4 sm:px-6 py-3 sm:py-4 mt-4">
            <Button type="submit" className="w-full sm:w-auto ml-auto bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600" disabled={formSubmitted}>
               <CheckCircle size={16} className="mr-1"/> Submit {title.split(' - ')[0]}
            </Button>
        </CardFooter>
      </form>
    </Card>
  );

  const renderFormA1 = () => (
    <SimpleFormLayout title="Form A1 - Memorandum of Intimation" description="Declaration form as per clause 8(2) of FCO 1985 for fertilizer registration.">
      <div>
        <Label htmlFor="applicantNameA1" className={commonLabelClass}>Applicant/Dealer Name *</Label>
        <Input type="text" name="applicantNameA1" id="applicantNameA1" className={commonInputClass} value={String(formData.applicantNameA1 || '')} onChange={handleChange} placeholder="Enter applicant or dealer name" required/>
      </div>
      <div>
        <Label htmlFor="dealerLicenseNoA1" className={commonLabelClass}>Dealer License Number *</Label>
        <Input type="text" name="dealerLicenseNoA1" id="dealerLicenseNoA1" className={commonInputClass} value={String(formData.dealerLicenseNoA1 || '')} onChange={handleChange} placeholder="Enter dealer license number" required/>
      </div>
      <div>
        <Label htmlFor="intimationDateA1" className={commonLabelClass}>Date of Intimation *</Label>
        <Input type="date" name="intimationDateA1" id="intimationDateA1" className={commonInputClass} value={String(formData.intimationDateA1 || '')} onChange={handleChange} required/>
      </div>
      <div>
        <Label htmlFor="fertilizerTypeA1" className={commonLabelClass}>Type of Fertilizer(s)</Label>
        <Textarea name="fertilizerTypeA1" id="fertilizerTypeA1" rows={3} className={commonInputClass} value={String(formData.fertilizerTypeA1 || '')} onChange={handleChange} placeholder="List fertilizer types, e.g., Urea, DAP, NPK mixtures" />
      </div>
      <div>
        <Label htmlFor="declarationA1" className={commonLabelClass}>Declaration (as per clause 8(2) of FCO 1985) *</Label>
        <Textarea name="declarationA1" id="declarationA1" rows={5} className={commonInputClass} value={String(formData.declarationA1 || '')} onChange={handleChange} placeholder="Enter the full declaration text..." required/>
      </div>
    </SimpleFormLayout>
  );

  const renderInspectionFertilizer = () => (
    <SimpleFormLayout title="Fertilizer Manufacturing Unit Inspection Report" description="Inspection report for fertilizer manufacturing units." icon={<Building className="h-6 w-6 text-primary"/>}>
      <div>
        <Label htmlFor="unitNameInspF" className={commonLabelClass}>Manufacturing Unit Name *</Label>
        <Input type="text" name="unitNameInspF" id="unitNameInspF" className={commonInputClass} value={String(formData.unitNameInspF || '')} onChange={handleChange} placeholder="Name of the unit inspected" required/>
      </div>
      <div>
        <Label htmlFor="inspectionDateInspF" className={commonLabelClass}>Date of Inspection *</Label>
        <Input type="date" name="inspectionDateInspF" id="inspectionDateInspF" className={commonInputClass} value={String(formData.inspectionDateInspF || '')} onChange={handleChange} required/>
      </div>
      <div>
        <Label htmlFor="inspectorNameInspF" className={commonLabelClass}>Inspector Name(s) *</Label>
        <Input type="text" name="inspectorNameInspF" id="inspectorNameInspF" className={commonInputClass} value={String(formData.inspectorNameInspF || '')} onChange={handleChange} placeholder="Name(s) of inspecting officer(s)" required/>
      </div>
      <div>
        <Label htmlFor="productionCapacityInspF" className={commonLabelClass}>Production Capacity</Label>
        <Input type="text" name="productionCapacityInspF" id="productionCapacityInspF" className={commonInputClass} value={String(formData.productionCapacityInspF || '')} onChange={handleChange} placeholder="e.g., 500 MT/day"/>
      </div>
      <div>
        <Label htmlFor="observationsInspF" className={commonLabelClass}>Key Observations & Findings *</Label>
        <Textarea name="observationsInspF" id="observationsInspF" rows={6} className={commonInputClass} value={String(formData.observationsInspF || '')} onChange={handleChange} placeholder="Detail compliance, non-compliance, infrastructure, safety, etc." required/>
      </div>
      <div>
        <Label htmlFor="recommendationsInspF" className={commonLabelClass}>Recommendations/Actions Suggested</Label>
        <Textarea name="recommendationsInspF" id="recommendationsInspF" rows={4} className={commonInputClass} value={String(formData.recommendationsInspF || '')} onChange={handleChange} placeholder="e.g., Issue warning, License suspension, Re-inspection required"/>
      </div>
    </SimpleFormLayout>
  );

  const renderFormV = () => (
    <SimpleFormLayout title="Form V - Insecticide Inspector Sample & Seizure Form" description="Form for insecticide inspectors to record sample collection and seizure details." icon={<FlaskConical className="h-6 w-6 text-primary"/>}>
      <div>
        <Label htmlFor="inspectorNameFormV" className={commonLabelClass}>Inspector Name *</Label>
        <Input type="text" name="inspectorNameFormV" id="inspectorNameFormV" className={commonInputClass} value={String(formData.inspectorNameFormV || '')} onChange={handleChange} placeholder="Enter inspector's name" required/>
      </div>
      <div>
        <Label htmlFor="inspectionDateFormV" className={commonLabelClass}>Date of Inspection/Sampling *</Label>
        <Input type="date" name="inspectionDateFormV" id="inspectionDateFormV" className={commonInputClass} value={String(formData.inspectionDateFormV || '')} onChange={handleChange} required/>
      </div>
      <div>
        <Label htmlFor="locationFormV" className={commonLabelClass}>Location of Inspection/Sampling *</Label>
        <Input type="text" name="locationFormV" id="locationFormV" className={commonInputClass} value={String(formData.locationFormV || '')} onChange={handleChange} placeholder="Shop name, address, village, etc." required/>
      </div>
      <div>
        <Label htmlFor="productNameFormV" className={commonLabelClass}>Insecticide/Pesticide Name *</Label>
        <Input type="text" name="productNameFormV" id="productNameFormV" className={commonInputClass} value={String(formData.productNameFormV || '')} onChange={handleChange} placeholder="e.g., Monocrotophos 36% SL" required/>
      </div>
      <div>
        <Label htmlFor="batchNoFormV" className={commonLabelClass}>Batch Number</Label>
        <Input type="text" name="batchNoFormV" id="batchNoFormV" className={commonInputClass} value={String(formData.batchNoFormV || '')} onChange={handleChange} placeholder="As on product label"/>
      </div>
      <div>
        <Label htmlFor="mfgDateFormV" className={commonLabelClass}>Manufacturing Date</Label>
        <Input type="date" name="mfgDateFormV" id="mfgDateFormV" className={commonInputClass} value={String(formData.mfgDateFormV || '')} onChange={handleChange}/>
      </div>
      <div>
        <Label htmlFor="expDateFormV" className={commonLabelClass}>Expiry Date</Label>
        <Input type="date" name="expDateFormV" id="expDateFormV" className={commonInputClass} value={String(formData.expDateFormV || '')} onChange={handleChange}/>
      </div>
      <div>
        <Label htmlFor="sampleQuantityFormV" className={commonLabelClass}>Quantity of Sample Drawn</Label>
        <Input type="text" name="sampleQuantityFormV" id="sampleQuantityFormV" className={commonInputClass} value={String(formData.sampleQuantityFormV || '')} onChange={handleChange} placeholder="e.g., 250ml x 3 packets"/>
      </div>
       <div>
        <Label htmlFor="seizureDetailsFormV" className={commonLabelClass}>Details of Seizure (if any)</Label>
        <Textarea name="seizureDetailsFormV" id="seizureDetailsFormV" rows={4} className={commonInputClass} value={String(formData.seizureDetailsFormV || '')} onChange={handleChange} placeholder="Quantity seized, reason for seizure, Panchnama details, etc."/>
      </div>
    </SimpleFormLayout>
  );

  const renderFormIV = () => (
    <SimpleFormLayout title="Form IV - Insecticide Analyst Report" description="Standard report format for analysis of insecticide samples by analysts." icon={<Microscope className="h-6 w-6 text-primary"/>}>
      <div>
        <Label htmlFor="sampleIdFormIV" className={commonLabelClass}>Sample ID / Code *</Label>
        <Input type="text" name="sampleIdFormIV" id="sampleIdFormIV" className={commonInputClass} value={String(formData.sampleIdFormIV || '')} onChange={handleChange} placeholder="Unique ID of the sample analyzed" required/>
      </div>
      <div>
        <Label htmlFor="analystNameFormIV" className={commonLabelClass}>Analyst Name *</Label>
        <Input type="text" name="analystNameFormIV" id="analystNameFormIV" className={commonInputClass} value={String(formData.analystNameFormIV || '')} onChange={handleChange} placeholder="Name of the analyst" required/>
      </div>
       <div>
        <Label htmlFor="labNameFormIV" className={commonLabelClass}>Laboratory Name *</Label>
        <Input type="text" name="labNameFormIV" id="labNameFormIV" className={commonInputClass} value={String(formData.labNameFormIV || '')} onChange={handleChange} placeholder="Name of the testing laboratory" required/>
      </div>
      <div>
        <Label htmlFor="dateReceivedFormIV" className={commonLabelClass}>Date Sample Received *</Label>
        <Input type="date" name="dateReceivedFormIV" id="dateReceivedFormIV" className={commonInputClass} value={String(formData.dateReceivedFormIV || '')} onChange={handleChange} required/>
      </div>
      <div>
        <Label htmlFor="dateAnalyzedFormIV" className={commonLabelClass}>Date of Analysis *</Label>
        <Input type="date" name="dateAnalyzedFormIV" id="dateAnalyzedFormIV" className={commonInputClass} value={String(formData.dateAnalyzedFormIV || '')} onChange={handleChange} required/>
      </div>
      <div>
        <Label htmlFor="productTestedFormIV" className={commonLabelClass}>Product Name Tested *</Label>
        <Input type="text" name="productTestedFormIV" id="productTestedFormIV" className={commonInputClass} value={String(formData.productTestedFormIV || '')} onChange={handleChange} placeholder="As declared on sample" required/>
      </div>
      <div>
        <Label htmlFor="declaredContentFormIV" className={commonLabelClass}>Declared Active Ingredient & Content *</Label>
        <Input type="text" name="declaredContentFormIV" id="declaredContentFormIV" className={commonInputClass} value={String(formData.declaredContentFormIV || '')} onChange={handleChange} placeholder="e.g., Imidacloprid 17.8% SL" required/>
      </div>
      <div>
        <Label htmlFor="foundContentFormIV" className={commonLabelClass}>Found Active Ingredient & Content *</Label>
        <Input type="text" name="foundContentFormIV" id="foundContentFormIV" className={commonInputClass} value={String(formData.foundContentFormIV || '')} onChange={handleChange} placeholder="e.g., Imidacloprid 15.2% SL" required/>
      </div>
       <div>
        <Label htmlFor="resultFormIV" className={commonLabelClass}>Result of Analysis *</Label>
        <Select name="resultFormIV" value={String(formData.resultFormIV || '')} onValueChange={(value) => handleSelectChange("resultFormIV", value)} required>
            <SelectTrigger className={commonInputClass} id="resultFormIV"><SelectValue placeholder="Select Result" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="standard">Standard Quality (Compliant)</SelectItem>
                <SelectItem value="misbranded">Misbranded (Non-Compliant)</SelectItem>
                <SelectItem value="substandard">Sub-Standard (Non-Compliant)</SelectItem>
                <SelectItem value="other">Other (Specify in remarks)</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="remarksFormIV" className={commonLabelClass}>Remarks</Label>
        <Textarea name="remarksFormIV" id="remarksFormIV" rows={4} className={commonInputClass} value={String(formData.remarksFormIV || '')} onChange={handleChange} placeholder="Any specific observations or details regarding the analysis"/>
      </div>
    </SimpleFormLayout>
  );
  
  const renderInspectionInsecticide = () => (
    <SimpleFormLayout title="Insecticide Manufacturing Unit Inspection Report" description="Proforma for inspection of insecticides manufacturing units." icon={<Building className="h-6 w-6 text-primary"/>}>
        <div>
          <Label htmlFor="unitNameInspI" className={commonLabelClass}>Manufacturing Unit Name *</Label>
          <Input type="text" name="unitNameInspI" id="unitNameInspI" className={commonInputClass} value={String(formData.unitNameInspI || '')} onChange={handleChange} placeholder="Name of the insecticide unit" required/>
        </div>
        <div>
          <Label htmlFor="inspectionDateInspI" className={commonLabelClass}>Date of Inspection *</Label>
          <Input type="date" name="inspectionDateInspI" id="inspectionDateInspI" className={commonInputClass} value={String(formData.inspectionDateInspI || '')} onChange={handleChange} required/>
        </div>
        <div>
          <Label htmlFor="inspectorNameInspI" className={commonLabelClass}>Inspector Name(s) *</Label>
          <Input type="text" name="inspectorNameInspI" id="inspectorNameInspI" className={commonInputClass} value={String(formData.inspectorNameInspI || '')} onChange={handleChange} placeholder="Name(s) of inspecting officer(s)" required/>
        </div>
        <div>
          <Label htmlFor="licenseNoInspI" className={commonLabelClass}>Manufacturing License No.</Label>
          <Input type="text" name="licenseNoInspI" id="licenseNoInspI" className={commonInputClass} value={String(formData.licenseNoInspI || '')} onChange={handleChange} placeholder="License number of the unit"/>
        </div>
        <div>
          <Label htmlFor="technicalPersonnelInspI" className={commonLabelClass}>Details of Technical Personnel</Label>
          <Textarea name="technicalPersonnelInspI" id="technicalPersonnelInspI" rows={3} className={commonInputClass} value={String(formData.technicalPersonnelInspI || '')} onChange={handleChange} placeholder="Names, qualifications, experience"/>
        </div>
        <div>
          <Label htmlFor="safetyMeasuresInspI" className={commonLabelClass}>Safety Measures Observed</Label>
          <Textarea name="safetyMeasuresInspI" id="safetyMeasuresInspI" rows={4} className={commonInputClass} value={String(formData.safetyMeasuresInspI || '')} onChange={handleChange} placeholder="Fire safety, effluent treatment, worker safety gear, etc."/>
        </div>
        <div>
          <Label htmlFor="qualityControlInspI" className={commonLabelClass}>Quality Control Facilities & Procedures</Label>
          <Textarea name="qualityControlInspI" id="qualityControlInspI" rows={4} className={commonInputClass} value={String(formData.qualityControlInspI || '')} onChange={handleChange} placeholder="Lab facilities, testing protocols, record keeping"/>
        </div>
        <div>
          <Label htmlFor="overallComplianceInspI" className={commonLabelClass}>Overall Compliance Status *</Label>
          <Select name="overallComplianceInspI" value={String(formData.overallComplianceInspI || '')} onValueChange={(value) => handleSelectChange("overallComplianceInspI", value)} required>
              <SelectTrigger className={commonInputClass} id="overallComplianceInspI"><SelectValue placeholder="Select Compliance Status" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="fully_compliant">Fully Compliant</SelectItem>
                  <SelectItem value="partially_compliant">Partially Compliant (Minor Issues)</SelectItem>
                  <SelectItem value="non_compliant">Non-Compliant (Major Issues)</SelectItem>
              </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="recommendationsInspI" className={commonLabelClass}>Recommendations/Actions</Label>
          <Textarea name="recommendationsInspI" id="recommendationsInspI" rows={4} className={commonInputClass} value={String(formData.recommendationsInspI || '')} onChange={handleChange} placeholder="e.g., Issue improvement notice, Follow-up inspection, Action under Insecticides Act"/>
        </div>
    </SimpleFormLayout>
  );

  if (formSubmitted && !isUpdate) { 
    return (
        <Card className="shadow-md text-center p-6 sm:p-8">
            <CardHeader>
                <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-xl sm:text-2xl">Form Submitted Successfully!</CardTitle>
                <CardDescription className="text-sm sm:text-base">Your {renderFormTitle()} has been processed.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => { setFormSubmitted(false); setFormData({}); setCurrentStep(1); }}>
                    Fill Another {renderFormTitle().split(" - ")[0]}
                </Button>
            </CardContent>
        </Card>
    );
  }
   if (formSubmitted && isUpdate) {
    return (
        <Card className="shadow-md text-center p-6 sm:p-8">
            <CardHeader>
                <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-xl sm:text-2xl">Form Updated Successfully!</CardTitle>
                <CardDescription className="text-sm sm:text-base">Your changes to {renderFormTitle()} have been saved.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Button onClick={() => { 
                    setFormSubmitted(false); 
                    setIsUpdate(false); 
                    setIsPendingUpdateMode(false);
                    setFormData({}); 
                    setCurrentStep(1); 
                    }}>
                    Back to Forms
                </Button>
            </CardContent>
        </Card>
    );
  }


  return (
    <div>
      <FormToolbar />
      {formType === 'fertilizerLicense' && renderFertilizerLicenseForm()}
      {formType === 'formA1' && renderFormA1()}
      {formType === 'inspectionFertilizer' && renderInspectionFertilizer()}
      {formType === 'formV' && renderFormV()}
      {formType === 'formIV' && renderFormIV()}
      {formType === 'inspectionInsecticide' && renderInspectionInsecticide()}
    </div>
  );
};

export default AgriFormRenderer;
