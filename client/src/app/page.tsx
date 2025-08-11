"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout/Header";
import { AppSidebar } from "@/components/layout/Sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useAppContext } from "@/context/AppContext";
import DashboardModule from "@/components/modules/DashboardModule";
import InspectionPlanningModule from "@/components/modules/InspectionPlanningModule";
import FieldExecutionModule from "@/components/modules/FieldExecutionModule";
import SeizureLoggingModule from "@/components/modules/SeizureLoggingModule";
import LegalModule from "@/components/modules/LegalModule";
import LabInterfaceModule from "@/components/modules/LabInterfaceModule";
import ReportAuditModule from "@/components/modules/ReportAuditModule";
import AgriFormsModule from "@/components/modules/AgriFormsModule";
export default function PageContentWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}
function PageContent(): JSX.Element | null {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeTab, setActiveTab, allowedTabs, userRole } = useAppContext();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  // 1) Check localStorage for token/user on client mount
  useEffect(() => {
    // Only run in browser
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;

      if (token && user) {
        setIsAuthed(true);
      } else {
        setIsAuthed(false);
      }
    } catch (err) {
      setIsAuthed(false);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  // Redirect to signin only when we finished checking and user is not authed
  useEffect(() => {
    if (!checkingAuth && !isAuthed) {
      router.push("/auth/signin");
    }
  }, [checkingAuth, isAuthed, router]);

  // Update URL when activeTab changes
  useEffect(() => {
    const tabInUrl = searchParams.get("tab");
    if (activeTab && activeTab !== tabInUrl && allowedTabs.find((t) => t.id === activeTab)) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("tab", activeTab);
      if (activeTab !== "agri-forms-module") {
        newParams.delete("agriSubMenu");
        newParams.delete("selectedForm");
        newParams.delete("id");
        newParams.delete("edit");
      }
      router.replace(`?${newParams.toString()}`, { scroll: false });
    }
  }, [activeTab, router, searchParams, allowedTabs]);

  // Set activeTab from URL or fallback
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl) {
      const isAllowed = allowedTabs.find((t) => t.id === tabFromUrl);
      if (isAllowed && tabFromUrl !== activeTab) {
        setActiveTab(tabFromUrl);
      } else if (!isAllowed && allowedTabs.length > 0 && allowedTabs[0].id !== activeTab) {
        setActiveTab(allowedTabs[0].id);
      }
    } else if (allowedTabs.length > 0 && allowedTabs[0].id !== activeTab) {
      setActiveTab(allowedTabs[0].id);
    } else if (!activeTab && allowedTabs.find((t) => t.id === "dashboard")) {
      setActiveTab("dashboard");
    }
    // note: userRole not needed here but can be added if tab set depends on role
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, allowedTabs, userRole]);

  // while checking auth show spinner
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-gray-900"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authed, we've already redirected. Return null to avoid render flicker.
  if (!isAuthed) return null;

  const currentTab = searchParams.get("tab") || activeTab;

  const renderModule = () => {
    switch (currentTab) {
      case "dashboard":
        return <DashboardModule />;
      case "inspection-planning":
        return <InspectionPlanningModule />;
      case "field-execution":
        return <FieldExecutionModule />;
      case "seizure-logging":
        return <SeizureLoggingModule />;
      case "legal-module":
        return <LegalModule />;
      case "lab-interface":
        return <LabInterfaceModule />;
      case "report-audit":
        return <ReportAuditModule />;
      case "agri-forms-module":
        return <AgriFormsModule />;
      default: {
        if (allowedTabs.length > 0) {
          const fallback = allowedTabs.find((t) => t.id === "dashboard");
          return fallback ? <DashboardModule /> : null;
        }
        return <DashboardModule />;
      }
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 overflow-auto bg-background p-4 sm:p-6 md:p-8">
          <div className="mx-auto w-full max-w-screen-2xl">{renderModule()}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
