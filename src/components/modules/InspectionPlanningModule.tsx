
"use client";
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QrCode, Fingerprint, Camera, MapPin } from 'lucide-react'; // Removed CheckCircle (not used)
import type { InspectionTask } from '@/types';

const InspectionPlanningModule = () => {
  const { addInspectionTask, inspectionTasks } = useAppContext();
  const { toast } = useToast();
  
  const initialTaskState: Omit<InspectionTask, 'id' | 'status'> = {
    officer: '',
    date: '',
    location: '',
    targetType: '',
    equipment: []
  };
  const [newTask, setNewTask] = useState(initialTaskState);
  
  const equipmentList = [
    { id: 'truscan', name: 'TruScan Device', icon: <QrCode className="h-4 w-4" /> },
    { id: 'gemini', name: 'Gemini Analyzer', icon: <Fingerprint className="h-4 w-4" /> },
    { id: 'bodycam', name: 'Axon Body Cam', icon: <Camera className="h-4 w-4" /> },
    { id: 'gps', name: 'GPS Tracker', icon: <MapPin className="h-4 w-4" /> },
  ];
  
  const officers = [
    'Ram Kumar', 'Priya Sharma', 'Suresh Patil', 'Anjali Singh', 'Vikram Reddy'
  ];
  
  const handleInputChange = (field: keyof typeof newTask, value: string | string[]) => {
    setNewTask(prev => ({ ...prev, [field]: value }));
  };

  const handleEquipmentChange = (itemId: string) => {
    setNewTask(prev => {
      const newEquipment = prev.equipment.includes(itemId)
        ? prev.equipment.filter(id => id !== itemId)
        : [...prev.equipment, itemId];
      return { ...prev, equipment: newEquipment };
    });
  };
  
  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.officer || !newTask.date || !newTask.location || !newTask.targetType) {
      toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    addInspectionTask(newTask);
    toast({ title: "Success", description: "Inspection task created successfully." });
    setNewTask(initialTaskState);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Create Inspection Visit Plan</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Schedule and assign new inspection tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTaskSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <Label htmlFor="officer" className="text-sm">Field Officer</Label>
                <Select value={newTask.officer} onValueChange={(value) => handleInputChange('officer', value)}>
                  <SelectTrigger id="officer" className="h-9 text-sm"><SelectValue placeholder="Select Officer" /></SelectTrigger>
                  <SelectContent>
                    {officers.map(officer => (
                      <SelectItem key={officer} value={officer} className="text-sm">{officer}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date" className="text-sm">Visit Date & Time</Label>
                <Input id="date" type="datetime-local" value={newTask.date} onChange={(e) => handleInputChange('date', e.target.value)} className="h-9 text-sm"/>
              </div>
            </div>
            
            <div>
              <Label htmlFor="location" className="text-sm">Location</Label>
              <Input id="location" type="text" placeholder="e.g., Kolhapur Market" value={newTask.location} onChange={(e) => handleInputChange('location', e.target.value)} className="h-9 text-sm"/>
            </div>
            
             <div>
                <Label htmlFor="targetType" className="text-sm">Target Type</Label>
                <Select value={newTask.targetType} onValueChange={(value) => handleInputChange('targetType', value)}>
                  <SelectTrigger id="targetType" className="h-9 text-sm"><SelectValue placeholder="Select Target Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retailer" className="text-sm">Retailer</SelectItem>
                    <SelectItem value="distributor" className="text-sm">Distributor</SelectItem>
                    <SelectItem value="warehouse" className="text-sm">Warehouse</SelectItem>
                    <SelectItem value="market-survey" className="text-sm">Market Survey</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            <div>
              <Label className="text-sm">Equipment Assignment</Label>
              <div className="space-y-2 pt-2">
                {equipmentList.map(item => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox id={item.id} checked={newTask.equipment.includes(item.id)} onCheckedChange={() => handleEquipmentChange(item.id)} />
                    <Label htmlFor={item.id} className="flex items-center gap-2 font-normal cursor-pointer text-xs sm:text-sm">
                      {item.icon} {item.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <Button type="submit" className="w-full sm:w-auto" size="sm">Create Inspection Task</Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Scheduled Inspections</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Overview of upcoming tasks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
          {inspectionTasks.length === 0 && <p className="text-muted-foreground text-sm">No inspections scheduled.</p>}
          {inspectionTasks.filter(task => task.status === 'scheduled').map((task) => (
            <div key={task.id} className="p-3 rounded-lg border bg-muted/30">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{task.location}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">{task.status}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Officer: {task.officer}</p>
              <p className="text-xs text-muted-foreground">Date: {new Date(task.date).toLocaleString([], { year:'numeric', month: 'short', day:'numeric', hour: '2-digit', minute:'2-digit' })}</p>
              {task.equipment.length > 0 && (
                 <p className="text-xs text-muted-foreground">Equip: {task.equipment.join(', ')}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default InspectionPlanningModule;
