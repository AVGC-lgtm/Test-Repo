
"use client";
import React from 'react';
import { Search, User, PanelLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';

interface AgriHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isMobile: boolean;
  onMobileMenuClick: () => void;
}

const AgriHeader: React.FC<AgriHeaderProps> = ({ searchQuery, setSearchQuery, isMobile, onMobileMenuClick }) => {
  return (
    <header className="bg-card shadow-sm border-b">
      <div className="flex items-center justify-between p-3 sm:p-4">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMobileMenuClick} className="mr-2 md:hidden">
            <PanelLeft size={20} />
            <span className="sr-only">Open Menu</span>
          </Button>
        )}
        <div className="relative flex-grow md:flex-grow-0">
          <Input
            type="text"
            placeholder="Search forms..."
            className="pl-10 pr-4 py-2 w-full sm:w-64 h-9 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 ml-2">
          <div className="flex items-center space-x-2">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
              <AvatarImage src="https://placehold.co/40x40.png?text=JD" alt="User avatar" data-ai-hint="avatar person" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm hidden sm:inline">John Doe</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AgriHeader;
