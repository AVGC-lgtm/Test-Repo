
"use client";
import React from 'react';
import { cn } from '@/lib/utils';

interface AgriActivityItemProps {
  action: string;
  form: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected' | 'updated' | 'processed';
}

const AgriActivityItem: React.FC<AgriActivityItemProps> = ({ action, form, time, status }) => {
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700",
    approved: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border border-green-300 dark:border-green-700",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border border-red-300 dark:border-red-700",
    updated: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-300 dark:border-blue-700",
    processed: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-300 dark:border-purple-700",
  };

  return (
    <li className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-muted/50 transition-colors">
      <div>
        <p className="font-medium text-card-foreground">{action}: {form}</p>
        <p className="text-sm text-muted-foreground">{time}</p>
      </div>
      <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", statusStyles[status])}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </li>
  );
};

export default AgriActivityItem;
