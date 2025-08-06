
"use client";
import React from 'react';
import { FileText, Database, Clipboard, BarChart2, Settings, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';

interface AgriSidebarProps {
  activeMenu: string;
  navigateTo: (menu: string, form?: string | null) => void;
  expandedCategories: { fertilizer: boolean; insecticide: boolean };
  toggleCategory: (category: 'fertilizer' | 'insecticide') => void;
  selectedForm: string | null;
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const AgriSidebar: React.FC<AgriSidebarProps> = ({
  activeMenu,
  navigateTo,
  expandedCategories,
  toggleCategory,
  selectedForm,
  isMobile,
  mobileOpen,
  setMobileOpen,
}) => {
  const sidebarNavigation = (
    <>
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Agri Shield - Forms</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4">
          <ul>
            <li className={`mb-2 ${activeMenu === 'dashboard' ? 'bg-primary/80 rounded' : ''}`}>
              <Button
                variant="ghost"
                onClick={() => navigateTo('dashboard')}
                className="flex items-center justify-start w-full p-2 rounded hover:bg-gray-700 text-white"
              >
                <BarChart2 size={18} className="mr-3" />
                Dashboard
              </Button>
            </li>
            <li className="mb-2">
              <Button
                variant="ghost"
                onClick={() => navigateTo('forms')}
                className={`flex items-center justify-between w-full p-2 rounded hover:bg-gray-700 text-white ${activeMenu === 'forms' ? 'bg-primary/80' : ''}`}
              >
                <span className="flex items-center">
                  <FileText size={18} className="mr-3" />
                  Forms
                </span>
              </Button>
              {activeMenu === 'forms' && (
                <div className="ml-6 mt-2 space-y-1 text-sm">
                  <div>
                    <Button
                      variant="ghost"
                      onClick={() => toggleCategory('fertilizer')}
                      className="flex items-center justify-start w-full p-1 rounded hover:bg-gray-700 text-white text-xs"
                    >
                      {expandedCategories.fertilizer ? <ChevronDown size={14} className="mr-1" /> : <ChevronRight size={14} className="mr-1" />}
                      Fertilizer Forms
                    </Button>
                    {expandedCategories.fertilizer && (
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>
                          <Button
                            variant="ghost"
                            onClick={() => navigateTo('forms', 'fertilizerLicense')}
                            className={`w-full p-1 rounded text-left hover:bg-gray-700 text-white text-xs justify-start ${selectedForm === 'fertilizerLicense' ? 'bg-gray-600' : ''}`}
                          >
                            Sale License Application
                          </Button>
                        </li>
                        <li>
                          <Button
                            variant="ghost"
                            onClick={() => navigateTo('forms', 'formA1')}
                            className={`w-full p-1 rounded text-left hover:bg-gray-700 text-white text-xs justify-start ${selectedForm === 'formA1' ? 'bg-gray-600' : ''}`}
                          >
                            Form A1 - Memorandum
                          </Button>
                        </li>
                        <li>
                          <Button
                            variant="ghost"
                            onClick={() => navigateTo('forms', 'inspectionFertilizer')}
                            className={`w-full p-1 rounded text-left hover:bg-gray-700 text-white text-xs justify-start ${selectedForm === 'inspectionFertilizer' ? 'bg-gray-600' : ''}`}
                          >
                            Inspection Report
                          </Button>
                        </li>
                      </ul>
                    )}
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      onClick={() => toggleCategory('insecticide')}
                      className="flex items-center justify-start w-full p-1 rounded hover:bg-gray-700 text-white text-xs"
                    >
                      {expandedCategories.insecticide ? <ChevronDown size={14} className="mr-1" /> : <ChevronRight size={14} className="mr-1" />}
                      Insecticide Forms
                    </Button>
                    {expandedCategories.insecticide && (
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>
                          <Button
                            variant="ghost"
                            onClick={() => navigateTo('forms', 'formV')}
                            className={`w-full p-1 rounded text-left hover:bg-gray-700 text-white text-xs justify-start ${selectedForm === 'formV' ? 'bg-gray-600' : ''}`}
                          >
                            Form V - Inspector Forms
                          </Button>
                        </li>
                        <li>
                          <Button
                            variant="ghost"
                            onClick={() => navigateTo('forms', 'formIV')}
                            className={`w-full p-1 rounded text-left hover:bg-gray-700 text-white text-xs justify-start ${selectedForm === 'formIV' ? 'bg-gray-600' : ''}`}
                          >
                            Form IV - Analyst Report
                          </Button>
                        </li>
                        <li>
                          <Button
                            variant="ghost"
                            onClick={() => navigateTo('forms', 'inspectionInsecticide')}
                            className={`w-full p-1 rounded text-left hover:bg-gray-700 text-white text-xs justify-start ${selectedForm === 'inspectionInsecticide' ? 'bg-gray-600' : ''}`}
                          >
                            Manufacturing Inspection
                          </Button>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </li>
            <li className={`mb-2 ${activeMenu === 'submissions' ? 'bg-primary/80 rounded' : ''}`}>
              <Button
                variant="ghost"
                onClick={() => navigateTo('submissions')}
                className="flex items-center justify-start w-full p-2 rounded hover:bg-gray-700 text-white"
              >
                <Database size={18} className="mr-3" />
                Submissions
              </Button>
            </li>
            <li className={`mb-2 ${activeMenu === 'reports' ? 'bg-primary/80 rounded' : ''}`}>
              <Button
                variant="ghost"
                onClick={() => navigateTo('reports')}
                className="flex items-center justify-start w-full p-2 rounded hover:bg-gray-700 text-white"
              >
                <Clipboard size={18} className="mr-3" />
                Reports
              </Button>
            </li>
            <li className={`mb-2 ${activeMenu === 'settings' ? 'bg-primary/80 rounded' : ''}`}>
              <Button
                variant="ghost"
                onClick={() => navigateTo('settings')}
                className="flex items-center justify-start w-full p-2 rounded hover:bg-gray-700 text-white"
              >
                <Settings size={18} className="mr-3" />
                Settings
              </Button>
            </li>
          </ul>
        </nav>
      </div>
      <div className="p-4 border-t border-gray-700">
        <Button variant="ghost" className="flex items-center justify-start w-full p-2 rounded hover:bg-gray-700 text-white">
          <LogOut size={18} className="mr-3" />
          Logout
        </Button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        {/* Trigger is in AgriHeader now */}
        <SheetContent side="left" className="bg-gray-800 text-white p-0 w-[280px] border-r-0 flex flex-col">
          {sidebarNavigation}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-64 bg-gray-800 text-white flex-col hidden md:flex">
      {sidebarNavigation}
    </div>
  );
};

export default AgriSidebar;
