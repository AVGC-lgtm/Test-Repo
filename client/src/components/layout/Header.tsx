"use client";
import React from "react";
import { Moon, Sun, Bell, User, ChevronsUpDown } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { USER_ROLES, TABS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader() {
  const {
    darkMode,
    toggleDarkMode,
    userRole,
    setUserRole,
    activeTab,
  } = useAppContext();

  const currentTabInfo = TABS.find((tab) => tab.id === activeTab);
  const pageTitle = currentTabInfo?.text || "Dashboard";

  const userInitials = userRole
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 sm:gap-4 border-b bg-background px-3 sm:px-4 md:static md:h-auto md:border-0 md:bg-transparent md:px-6 py-3 sm:py-4">
      <SidebarTrigger className="md:hidden" /> {/* Mobile sidebar toggle */}
      <h2 className="text-lg sm:text-xl font-semibold grow truncate">
        {pageTitle}
      </h2>

      <div className="flex items-center space-x-1.5 sm:space-x-3 md:space-x-4">
        <Select value={userRole} onValueChange={setUserRole}>
          <SelectTrigger
            className="w-[140px] sm:w-[180px] h-8 sm:h-9 text-xs sm:text-sm"
            aria-label="Select user role"
          >
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(USER_ROLES).map((role) => (
              <SelectItem key={role} value={role} className="text-xs sm:text-sm">
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          className="h-8 w-8 sm:h-9 sm:w-9"
        >
          {darkMode ? (
            <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="relative h-8 w-8 sm:h-9 sm:w-9"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-500 rounded-full text-[8px] sm:text-xs flex items-center justify-center text-white">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 sm:w-80 text-xs sm:text-sm">
            <DropdownMenuItem>Notification 1: High alert!</DropdownMenuItem>
            <DropdownMenuItem>Notification 2: Task assigned.</DropdownMenuItem>
            <DropdownMenuItem>Notification 3: Report ready.</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 sm:h-9 w-auto px-1.5 sm:px-2 gap-1 sm:gap-2"
            >
              <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                <AvatarImage
                  src={`https://placehold.co/40x40.png?text=${userInitials}`}
                  alt={userRole}
                />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-xs font-medium">{userRole}</span>
              </div>
              <ChevronsUpDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground hidden md:inline-block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-xs sm:text-sm">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
