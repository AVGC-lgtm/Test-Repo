
"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from '@/context/AppContext';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  icon: React.ReactNode;
  color?: 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'primary' | 'accent';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon, color = "primary" }) => {
  const { darkMode } = useAppContext();

  const colorClasses = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50",
    red: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50",
    green: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50",
    yellow: "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50",
    purple: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50",
    primary: "text-primary dark:text-primary bg-primary/10 dark:bg-primary/20",
    accent: "text-accent dark:text-accent bg-accent/10 dark:bg-accent/20",
  };
  
  const iconBgClass = colorClasses[color] || colorClasses.primary;
  const valueTextClass = color === 'primary' ? 'text-primary' : color === 'accent' ? 'text-accent' : colorClasses[color]?.split(' ')[0] || 'text-primary';


  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("p-2 rounded-md", iconBgClass.split(' ').slice(2).join(' '))}>
         {React.cloneElement(icon as React.ReactElement, { className: cn("h-5 w-5", iconBgClass.split(' ')[0], darkMode ? iconBgClass.split(' ')[1]: '') })}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold", valueTextClass)}>{value}</div>
        {trend && <p className="text-xs text-muted-foreground pt-1">{trend}</p>}
      </CardContent>
    </Card>
  );
};

export default StatCard;
