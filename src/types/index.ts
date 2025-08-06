
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

export interface Seizure extends ScanResult {
  id: string;
  quantity: string;
  estimatedValue: string;
  witnessName: string;
  evidencePhotos: string[]; // URLs or identifiers
  videoEvidence: string; // URL or identifier
  status: 'pending' | 'dispatched' | 'analyzed' | 'closed';
}

export interface LabSample extends Seizure { // Inherits ScanResult properties via Seizure
  id: string; // Could be same as seizure ID or a new one if multiple samples from one seizure
  sampleType: string;
  labDestination: string;
  status: 'in-transit' | 'received' | 'testing' | 'completed';
  labResult?: 'violation-confirmed' | 'compliant' | 'inconclusive';
}

export interface FIRCase {
  id: string;
  seizureId?: string; // Link to the original seizure
  labSampleId?: string; // Link to the specific lab sample
  labReportId: string; // ID from the lab system for the report
  violationType: string;
  accused: string;
  location: string;
  status: 'draft' | 'submitted' | 'investigating' | 'closed';
  caseNotes?: string;
  courtDate?: string;
  outcome?: string;
}

