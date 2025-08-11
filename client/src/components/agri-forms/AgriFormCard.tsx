
"use client";
import React from 'react';
import { Button } from '@/components/ui/button';

interface AgriFormCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

const AgriFormCard: React.FC<AgriFormCardProps> = ({ title, description, onClick }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={onClick}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <Button variant="link" className="p-0 text-blue-600 font-medium hover:text-blue-800">
          Fill Form →
        </Button>
      </div>
    </div>
  );
};

export default AgriFormCard;
