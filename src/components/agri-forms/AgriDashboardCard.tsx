
"use client";
import React from 'react';
import { FileText } from 'lucide-react';

interface AgriDashboardCardProps {
  title: string;
  count: string;
  color: 'blue' | 'green' | 'red' | 'yellow';
}

const AgriDashboardCard: React.FC<AgriDashboardCardProps> = ({ title, count, color }) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center text-white`}>
          <FileText size={24} />
        </div>
        <div className="ml-4">
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className="text-2xl font-bold">{count}</p>
        </div>
      </div>
    </div>
  );
};

export default AgriDashboardCard;
