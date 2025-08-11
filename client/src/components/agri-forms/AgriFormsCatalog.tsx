
"use client";
import React from 'react';
import AgriFormCard from './AgriFormCard';

interface AgriFormsCatalogProps {
  navigateTo: (menu: string, form: string | null) => void;
}

const AgriFormsCatalog: React.FC<AgriFormsCatalogProps> = ({ navigateTo }) => {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Forms Catalog</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <AgriFormCard
          title="Fertilizer Sale License Application"
          description="Application for obtaining new letter of Authorization (Sale License) for Self Manufactured/Imported fertilizers"
          onClick={() => navigateTo('forms', 'fertilizerLicense')}
        />
        <AgriFormCard
          title="Form A1 - Memorandum of Intimation"
          description="Declaration form as per clause 8(2) of FCO 1985 for fertilizer registration"
          onClick={() => navigateTo('forms', 'formA1')}
        />
        <AgriFormCard
          title="Fertilizer Manufacturing Inspection Report"
          description="Inspection report for fertilizer manufacturing units"
          onClick={() => navigateTo('forms', 'inspectionFertilizer')}
        />
        <AgriFormCard
          title="Form V - Inspector Forms"
          description="Forms used by insecticide inspectors for sample collection, seizure notices, etc."
          onClick={() => navigateTo('forms', 'formV')}
        />
        <AgriFormCard
          title="Form IV - Insecticide Analyst Report"
          description="Standard report format for analysis of insecticide samples by analysts"
          onClick={() => navigateTo('forms', 'formIV')}
        />
        <AgriFormCard
          title="Insecticide Manufacturing Inspection"
          description="Proforma for inspection of insecticides manufacturing units"
          onClick={() => navigateTo('forms', 'inspectionInsecticide')}
        />
      </div>
    </div>
  );
};

export default AgriFormsCatalog;
