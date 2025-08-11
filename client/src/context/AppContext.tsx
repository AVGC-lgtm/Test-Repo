
"use client";
import type { InspectionTask, Seizure, LabSample, FIRCase, TabDefinition } from '@/types';
import { USER_ROLES, TABS } from '@/lib/constants';
import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { useTheme } from 'next-themes'; // Using next-themes for dark mode

interface AppContextType {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  userRole: string;
  setUserRole: (role: string) => void;
  allowedTabs: TabDefinition[];
  inspectionTasks: InspectionTask[];
  addInspectionTask: (task: Omit<InspectionTask, 'id' | 'status'>) => void;
  seizures: Seizure[];
  addSeizure: (seizure: Omit<Seizure, 'id' | 'status'>) => void;
  labSamples: LabSample[];
  addLabSample: (sample: Omit<LabSample, 'id' | 'status' >) => void;
  updateLabSampleStatus: (sampleId: string, status: LabSample['status'], result?: LabSample['labResult']) => void;
  firCases: FIRCase[];
  addFIRCase: (firCase: Omit<FIRCase, 'id' | 'status'>) => void;
  updateFIRCaseStatus: (caseId: string, status: FIRCase['status']) => void;
  updateFIRCaseDetails: (caseId: string, details: Partial<Omit<FIRCase, 'id' | 'status'>>) => void; // Added status to Omit
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState('dashboard');
  const { theme, setTheme } = useTheme();
  const [userRole, setUserRoleState] = useState(USER_ROLES.DAO);
  
  const [inspectionTasks, setInspectionTasks] = useState<InspectionTask[]>([]);
  const [seizures, setSeizures] = useState<Seizure[]>([]);
  const [labSamples, setLabSamples] = useState<LabSample[]>([]);
  const [firCases, setFIRCases] = useState<FIRCase[]>([]);

  const darkMode = theme === 'dark';

  const toggleDarkMode = useCallback(() => {
    setTheme(darkMode ? 'light' : 'dark');
  }, [darkMode, setTheme]);

  const addInspectionTask = useCallback((task: Omit<InspectionTask, 'id' | 'status'>) => {
    setInspectionTasks(prev => [...prev, { ...task, id: `INS-${Date.now()}`, status: 'scheduled' }]);
  }, []);

  const addSeizure = useCallback((seizure: Omit<Seizure, 'id' | 'status'>) => {
    setSeizures(prev => [...prev, { ...seizure, id: `SEZ-${Date.now()}`, status: 'pending' }]);
  }, []);

  const addLabSample = useCallback((sample: Omit<LabSample, 'id' | 'status'>) => {
    setLabSamples(prev => [...prev, { ...sample, id: `LAB-${Date.now()}`, status: 'in-transit' }]);
  }, []);

  const updateLabSampleStatus = useCallback((sampleId: string, status: LabSample['status'], result?: LabSample['labResult']) => {
    setLabSamples(prev => prev.map(s => s.id === sampleId ? { ...s, status, labResult: result ?? s.labResult } : s));
  }, []);

  const addFIRCase = useCallback((firCase: Omit<FIRCase, 'id' | 'status'>) => {
    setFIRCases(prev => [...prev, { ...firCase, id: `FIR-${Date.now()}`, status: 'draft' }]);
  }, []);
  
  const updateFIRCaseStatus = useCallback((caseId: string, status: FIRCase['status']) => {
    setFIRCases(prev => prev.map(f => f.id === caseId ? { ...f, status } : f));
  }, []);

  const updateFIRCaseDetails = useCallback((caseId: string, details: Partial<Omit<FIRCase, 'id' | 'status'>>) => {
    setFIRCases(prev => prev.map(f => f.id === caseId ? { ...f, ...details } : f));
  }, []);

  const allowedTabs = useMemo(() => {
    return TABS.filter(tab => tab.allowedRoles.includes(userRole));
  }, [userRole]);

  const setActiveTab = useCallback((tabId: string) => {
    if (allowedTabs.find(tab => tab.id === tabId) || TABS.find(tab => tab.id === tabId)) { // Allow setting to any tab initially
      setActiveTabState(tabId);
    } else if (allowedTabs.length > 0) {
      setActiveTabState(allowedTabs[0].id);
    } else {
      setActiveTabState('dashboard'); // Fallback
    }
  }, [allowedTabs]);

  useEffect(() => {
    // Ensure activeTab is valid when userRole or allowedTabs change
    if (allowedTabs.length > 0 && !allowedTabs.find(tab => tab.id === activeTab)) {
      setActiveTab(allowedTabs[0].id);
    } else if (allowedTabs.length === 0 && TABS.length > 0) {
      if (TABS.find(t => t.id === 'dashboard')?.allowedRoles.includes(userRole)) {
         setActiveTab('dashboard');
      } 
    }
  }, [userRole, allowedTabs, activeTab, setActiveTab]);


  const contextValue = useMemo(() => ({
    activeTab,
    setActiveTab,
    darkMode,
    toggleDarkMode,
    userRole,
    setUserRole: setUserRoleState,
    allowedTabs,
    inspectionTasks,
    addInspectionTask,
    seizures,
    addSeizure,
    labSamples,
    addLabSample,
    updateLabSampleStatus,
    firCases,
    addFIRCase,
    updateFIRCaseStatus,
    updateFIRCaseDetails, // Add new function to context value
  }), [
    activeTab, setActiveTab, darkMode, toggleDarkMode, userRole, setUserRoleState, allowedTabs,
    inspectionTasks, addInspectionTask, seizures, addSeizure, labSamples, addLabSample, updateLabSampleStatus,
    firCases, addFIRCase, updateFIRCaseStatus, updateFIRCaseDetails, // Add new function to dependencies
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
