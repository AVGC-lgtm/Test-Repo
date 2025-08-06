
"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AgriSidebar from '@/components/agri-forms/AgriSidebar';
import AgriHeader from '@/components/agri-forms/AgriHeader';
import AgriDashboard from '@/components/agri-forms/AgriDashboard';
import AgriFormsCatalog from '@/components/agri-forms/AgriFormsCatalog';
import AgriFormRenderer from '@/components/agri-forms/AgriFormRenderer';
import AgriSubmissions from '@/components/agri-forms/AgriSubmissions';
import AgriReports from '@/components/agri-forms/AgriReports';
import AgriSettingsPanel from '@/components/agri-forms/AgriSettingsPanel';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AgriFormsModule() {
  const searchParams = useSearchParams();
  const router = useRouter(); 
  const isMobile = useIsMobile();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [expandedCategories, setExpandedCategories] = useState({
    fertilizer: true,
    insecticide: false,
  });
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const agriSubMenu = searchParams.get('agriSubMenu');
    const formTypeFromQuery = searchParams.get('selectedForm'); 
    const formId = searchParams.get('id'); 
    const editMode = searchParams.get('edit') === 'true';


    if (agriSubMenu) {
      if (['dashboard', 'forms', 'submissions', 'reports', 'settings'].includes(agriSubMenu)) {
        setActiveMenu(agriSubMenu);
        if (agriSubMenu === 'forms' && formTypeFromQuery) {
          setSelectedForm(formTypeFromQuery);
        } else {
          setSelectedForm(null); 
        }
      }
    } else if (formTypeFromQuery) { 
        setActiveMenu('forms');
        setSelectedForm(formTypeFromQuery);
    }
  }, [searchParams]);

  const toggleCategory = (category: 'fertilizer' | 'insecticide') => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const navigateTo = (menu: string, form: string | null = null) => {
    setActiveMenu(menu);
    setSelectedForm(form);
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('agriSubMenu', menu);
    if (form) {
      newParams.set('selectedForm', form);
    } else {
      newParams.delete('selectedForm');
    }
    newParams.delete('id'); 
    newParams.delete('edit');
    // router.push(`?${newParams.toString()}`); // Commented out to avoid loops as per previous logic
  };

  const renderContent = () => {
    if (activeMenu === 'forms' && selectedForm) return <AgriFormRenderer formType={selectedForm} />;
    
    switch (activeMenu) {
      case 'dashboard':
        return <AgriDashboard />;
      case 'forms': 
        return <AgriFormsCatalog navigateTo={navigateTo} />;
      case 'submissions':
        return <AgriSubmissions />;
      case 'reports':
        return <AgriReports />;
      case 'settings':
        return <AgriSettingsPanel />;
      default:
        return <AgriDashboard />; 
    }
  };
  

  return (
    <div className="flex h-full bg-background"> {/* Use h-full and standard background */}
      <AgriSidebar
        activeMenu={activeMenu}
        navigateTo={navigateTo}
        expandedCategories={expandedCategories}
        toggleCategory={toggleCategory}
        selectedForm={selectedForm}
        isMobile={isMobile}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AgriHeader 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          isMobile={isMobile}
          onMobileMenuClick={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background"> {/* Adjusted padding */}
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
