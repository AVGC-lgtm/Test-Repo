
"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AgriSettingsPanel = () => {

  const NotificationToggle: React.FC<{ id: string; title: string; description: string; defaultChecked?: boolean }> = 
  ({ id, title, description, defaultChecked }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 border-b last:border-b-0">
      <div className="mb-2 sm:mb-0">
        <Label htmlFor={id} className="font-medium cursor-pointer text-sm sm:text-base">{title}</Label>
        <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} defaultChecked={defaultChecked} />
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Settings</h2>
      
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-sm">Name</Label>
              <Input id="name" type="text" defaultValue="John Doe" className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input id="email" type="email" defaultValue="john.doe@example.com" className="h-9 text-sm"/>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="phone" className="text-sm">Phone</Label>
              <Input id="phone" type="tel" defaultValue="+91 9876543210" className="h-9 text-sm"/>
            </div>
          </div>
          <Button size="sm" className="w-full sm:w-auto">Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="currentPassword"  className="text-sm">Current Password</Label>
              <Input id="currentPassword" type="password" className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="newPassword" className="text-sm">New Password</Label>
              <Input id="newPassword" type="password" className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="confirmNewPassword" className="text-sm">Confirm New Password</Label>
              <Input id="confirmNewPassword" type="password" className="h-9 text-sm"/>
            </div>
          </div>
          <Button size="sm" className="w-full sm:w-auto">Change Password</Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
         <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <NotificationToggle 
              id="emailNotifications" 
              title="Email Notifications" 
              description="Receive email updates about form status" 
              defaultChecked 
            />
            <NotificationToggle 
              id="smsNotifications" 
              title="SMS Notifications" 
              description="Receive text message updates about form status" 
            />
            <NotificationToggle 
              id="pushNotifications" 
              title="Push Notifications" 
              description="Receive push notifications on this device" 
              defaultChecked 
            />
          </div>
          <Button size="sm" className="mt-4 w-full sm:w-auto">Save Preferences</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgriSettingsPanel;
