
"use client";
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AppHeader } from '@/components/layout/Header';
import { AppSidebar } from '@/components/layout/Sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useAppContext } from '@/context/AppContext';
import { TABS } from '@/lib/constants'; // Import TABS for validation
import DashboardModule from '@/components/modules/DashboardModule';
import InspectionPlanningModule from '@/components/modules/InspectionPlanningModule';
import FieldExecutionModule from '@/components/modules/FieldExecutionModule';
import SeizureLoggingModule from '@/components/modules/SeizureLoggingModule';
import LegalModule from '@/components/modules/LegalModule';
import LabInterfaceModule from '@/components/modules/LabInterfaceModule';
import ReportAuditModule from '@/components/modules/ReportAuditModule';
import AgriFormsModule from '@/components/modules/AgriFormsModule';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  )
}
function PageContent() {
  const { data: session, status } = useSession();
  const { activeTab, setActiveTab: setContextActiveTab, allowedTabs, userRole } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  // Effect to update URL when activeTab changes internally (e.g., sidebar click)
  useEffect(() => {
    const currentTabInUrl = searchParams.get('tab');
    if (activeTab && activeTab !== currentTabInUrl && allowedTabs.find(t => t.id === activeTab)) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('tab', activeTab);
      // Preserve agriSubMenu if the target is agri-forms-module
      if (activeTab !== 'agri-forms-module') {
        newParams.delete('agriSubMenu');
        newParams.delete('selectedForm');
        newParams.delete('id');
        newParams.delete('edit');
      }
      router.replace(`?${newParams.toString()}`, { scroll: false });
    }
  }, [activeTab, router, searchParams, allowedTabs]);

  // Effect to set activeTab from URL on load or when userRole changes (affecting allowedTabs)
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      const isValidTabForRole = allowedTabs.find(t => t.id === tabFromUrl);
      if (isValidTabForRole && tabFromUrl !== activeTab) {
        setContextActiveTab(tabFromUrl);
      } else if (!isValidTabForRole && allowedTabs.length > 0 && allowedTabs[0].id !== activeTab) {
        // If URL tab is invalid for current role, go to first allowed tab
        setContextActiveTab(allowedTabs[0].id); 
         // router.replace(`?tab=${allowedTabs[0].id}`, { scroll: false }); // Also update URL
      }
    } else if (allowedTabs.length > 0 && allowedTabs[0].id !== activeTab) {
      // If no tab in URL, default to first allowed tab
      setContextActiveTab(allowedTabs[0].id);
      // router.replace(`?tab=${allowedTabs[0].id}`, { scroll: false }); // Also update URL
    }
    // If still no active tab, and dashboard is allowed, default to dashboard.
    else if (!activeTab && allowedTabs.find(t => t.id === 'dashboard')) {
        setContextActiveTab('dashboard');
        // router.replace(`?tab=dashboard`, { scroll: false });
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, allowedTabs, userRole]); // activeTab removed from deps to avoid loop with above effect
                                          // setContextActiveTab also removed as it's stable

  const renderActiveModule = () => {
    const currentTabFromUrl = searchParams.get('tab') || activeTab; // Prefer URL tab if present
    
    switch (currentTabFromUrl) {
      case 'dashboard':
        return <DashboardModule />;
      case 'inspection-planning':
        return <InspectionPlanningModule />;
      case 'field-execution':
        return <FieldExecutionModule />;
      case 'seizure-logging':
        return <SeizureLoggingModule />;
      case 'legal-module':
        return <LegalModule />;
      case 'lab-interface':
        return <LabInterfaceModule />;
      case 'report-audit':
        return <ReportAuditModule />;
      case 'agri-forms-module':
        return <AgriFormsModule />;
      default:
        // Fallback logic (already handled by useEffect, but good to have a default render)
        if (allowedTabs.length > 0 && allowedTabs.find(tab => tab.id === 'dashboard')) {
          return <DashboardModule />;
        }
        if (allowedTabs.length > 0) {
          const firstAllowedTabId = allowedTabs[0]?.id;
          if (firstAllowedTabId === 'inspection-planning') return <InspectionPlanningModule />;
          // Add other mappings as necessary
        }
        return <DashboardModule />; // Default fallback
    }
  };

  return (
     <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 overflow-auto bg-background p-4 sm:p-6 md:p-8">
          <div className="mx-auto w-full max-w-screen-2xl"> {/* Max width container */}
            {renderActiveModule()}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
