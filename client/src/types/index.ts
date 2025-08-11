// types.ts
import type { LucideIcon } from 'lucide-react';

export interface Product {
  activeIngredient?: string;
  packaging?: string[];
  batchFormat?: string;
  commonCounterfeitMarkers?: string[];
  mrp?: Record<string, number>;
  hologramFeatures?: string[];
  composition?: string;
  bagColor?: string;
  subsidizedRate?: number;
  varieties?: string[];
}

export interface CompanyProducts {
  [productName: string]: Product;
}

export interface ProductCategory {
  [companyName: string]: CompanyProducts;
}

export interface ProductDatabase {
  pesticides: ProductCategory;
  fertilizers: ProductCategory;
  seeds: ProductCategory;
}

export interface UserRole {
  FIELD_OFFICER: string;
  DAO: string;
  LEGAL_OFFICER: string;
  LAB_COORDINATOR: string;
  HQ_MONITORING: string;
  DISTRICT_ADMIN: string;
}

export interface TabDefinition {
  id: string;
  icon: LucideIcon;
  text: string;
  ariaLabel: string;
  allowedRoles: string[];
}

export interface InspectionTask {
  id: string;
  officer: string;
  date: string;
  location: string;
  targetType: string;
  equipment: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export interface ScanResult {
  company: string;
  product: string;
  batchNumber: string;
  authenticityScore: number;
  issues: string[];
  recommendation: 'Suspected Counterfeit' | 'Authentic' | 'Needs Verification';
  geoLocation: string;
  timestamp: string;
}

export interface Seizure {
  id: string;
  quantity: string;
  estimatedValue: string;
  witnessName: string;
  evidencePhotos: string[];
  videoEvidence: string;
  status: 'pending' | 'dispatched' | 'analyzed' | 'closed';
  scanResult: ScanResult;
}

export interface LabSample {
  id: string;
  seizureId: string;
  batchNumber: string;
  authenticityScore: number;
  issues: string[];
  company: string;
  product: string;
  timestamp: string;
  sampleType: string;
  labDestination: string;
  status: 'in-transit' | 'received' | 'testing' | 'completed';
  labResult?: 'violation-confirmed' | 'compliant' | 'inconclusive';
}

export interface FIRCase {
  id: string;
  seizureId?: string;
  labSampleId?: string;
  labReportId: string;
  violationType: string;
  accused: string;
  location: string;
  status: 'draft' | 'submitted' | 'investigating' | 'closed';
  caseNotes?: string;
  courtDate?: string;
  outcome?: string;
}