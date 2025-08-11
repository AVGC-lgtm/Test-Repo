
"use client";
import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import {
  Sidebar as ShadSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar'; // Assuming this path is correct based on your setup
import { APP_NAME, APP_LOGO as AppLogoIcon, COMPANY_INFO } from '@/lib/constants';
import { Button } from '@/components/ui/button';

export function AppSidebar() {
  const { activeTab, setActiveTab, allowedTabs } = useAppContext();
  const AppLogo = AppLogoIcon || Shield;

  return (
    <ShadSidebar collapsible="icon" variant="sidebar" side="left" className="border-r">
      <SidebarHeader className="p-2 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-sidebar-foreground group-data-[collapsible=icon]:hidden">
          <Button variant="ghost" size="icon" className="rounded-lg bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90">
            <AppLogo className="h-6 w-6" />
          </Button>
          <span className="group-data-[collapsible=icon]:hidden">{APP_NAME}</span>
        </Link>
         <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {allowedTabs.map((tab) => (
            <SidebarMenuItem key={tab.id}>
              <SidebarMenuButton
                onClick={() => setActiveTab(tab.id)}
                isActive={activeTab === tab.id}
                aria-label={tab.ariaLabel}
                tooltip={{ children: tab.text, side: "right", align: "center" }}
                className="justify-start"
              >
                <tab.icon className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">{tab.text}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 group-data-[collapsible=icon]:hidden">
        <div className="text-xs text-muted-foreground text-center text-white space-y-1">
          <div>© 2024 {APP_NAME}</div>
          <div>Developed by {COMPANY_INFO.name}</div>
          <div>Contact: {COMPANY_INFO.contact}</div>
        </div>
      </SidebarFooter>
    </ShadSidebar>
  );
}
