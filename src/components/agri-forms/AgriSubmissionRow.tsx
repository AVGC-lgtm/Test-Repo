
"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit3, MapPin } from 'lucide-react'; // Added icons
import { useRouter } from 'next/navigation'; // For client-side navigation
import { useAppContext } from '@/context/AppContext'; // To trigger navigation in main app

interface AgriSubmissionRowProps {
  id: string;
  type: string;
  date: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Pending Update';
  formTypeKey: string; // e.g., 'fertilizerLicense', 'formA1'
}

const AgriSubmissionRow: React.FC<AgriSubmissionRowProps> = ({ id, type, date, status, formTypeKey }) => {
  const router = useRouter(); // Next.js App Router's useRouter
  const { setActiveTab } = useAppContext(); // Assuming AppContext is available if needed for main nav

  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700',
    'Under Review': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-300 dark:border-blue-700',
    'Approved': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border border-green-300 dark:border-green-700',
    'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border border-red-300 dark:border-red-700',
    'Pending Update': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-300 dark:border-purple-700',
  };
  
  // Function to navigate within the AgriFormsModule context
  // It simulates how the parent AgriFormsModule's navigateTo would work
  const handleNavigateToForm = (editMode: boolean) => {
    // This is a bit tricky as this component is deep.
    // For a real app, a shared state/context for AgriFormsModule internal navigation would be better.
    // Or, the parent AgriSubmissions passes down a navigateTo function.
    // For now, we'll construct a URL and use router.push.
    // This assumes AgriFormsModule is at the root of its module's display.
    const params = new URLSearchParams();
    params.set('activeMenu', 'forms'); // Signal to AgriFormsModule
    params.set('selectedForm', formTypeKey);
    params.set('id', id);
    if (editMode) {
      params.set('edit', 'true');
    }
    // This URL change will be caught by AgriFormsModule's useEffect to set its internal state
    // This depends on AgriFormsModule being the active module in the main app.
    // We also need to ensure the main app's activeTab is set to 'agri-forms-module'.
    // This is a simplified navigation, ideally AgriSubmissions would have a prop to call navigateTo of AgriFormsModule
    
    // To ensure we are on the right main tab first (if not already)
    // setActiveTab('agri-forms-module'); // This might cause immediate re-render before router.push
    
    // Then navigate with query parameters for the AgriFormsModule to pick up
    // The actual page path would be determined by where AgriFormsModule is rendered.
    // Assuming it's on '/app/page.tsx' which might be just '/' route.
    router.push(`/?${params.toString()}`);
  };


  return (
    <tr className="hover:bg-muted/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{id}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{type}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{date}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <Button variant="ghost" size="sm" onClick={() => handleNavigateToForm(false)} className="text-primary hover:text-primary/80 mr-2">
          <Eye size={14} className="mr-1"/>View
        </Button>
        {(status === 'Rejected' || status === 'Pending Update') && (
          <Button variant="ghost" size="sm" onClick={() => handleNavigateToForm(true)} className="text-accent hover:text-accent/80 mr-2">
             <Edit3 size={14} className="mr-1"/>Update
          </Button>
        )}
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground/80">
          <MapPin size={14} className="mr-1"/>Track
        </Button>
      </td>
    </tr>
  );
};

export default AgriSubmissionRow;
