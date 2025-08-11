"use client";
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QrCode, Fingerprint, Camera, MapPin, Calendar, User, MapPinIcon, Package, RefreshCw } from 'lucide-react';
import type { InspectionTask } from '@/types';
import api from "@/lib/api";

const InspectionPlanningModule = () => {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const { addInspectionTask, inspectionTasks } = useAppContext();
  const { toast } = useToast();
  const [fetchedTasks, setFetchedTasks] = useState<InspectionTask[]>([]);

  const initialTaskState: Omit<InspectionTask, 'id' | 'status'> = {
    officer: '',
    date: '',
    location: '',
    targetType: '',
    equipment: []
  };
  const [newTask, setNewTask] = useState(initialTaskState);

  // Fetch inspection tasks from API
  const fetchInspectionTasks = async () => {
    try {
      setFetchLoading(true);

      // Using your configured api instance
      const response = await api.get('inspections');

      // Axios returns data in response.data
      const data = response.data;
      setFetchedTasks(Array.isArray(data) ? data : []);

    } catch (error: any) {
      console.error("Fetch inspections error:", error);

      // Handle Axios error structure
      const errorMessage = error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch inspection tasks";

      toast({
        variant: "destructive",
        title: "Failed to fetch inspection tasks",
        description: errorMessage
      });

      // Set empty array on error to prevent crashes
      setFetchedTasks([]);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchInspectionTasks();
  }, []);

  // Calculate statistics
  const scheduledTasks = fetchedTasks.filter(t => t.status === 'scheduled');
  const inProgressTasks = fetchedTasks.filter(t => t.status === 'in-progress');
  const completedTasks = fetchedTasks.filter(t => t.status === 'completed');
  const upcomingDate = scheduledTasks.length > 0
    ? new Date(Math.min(...scheduledTasks.map(t => new Date(t.date).getTime())))
    : null;

  // Equipment list with icons
  const equipmentList = [
    { id: 'truscan', name: 'TruScan Device', icon: <QrCode className="h-4 w-4" />, description: 'Handheld authentication scanner' },
    { id: 'gemini', name: 'Gemini Analyzer', icon: <Fingerprint className="h-4 w-4" />, description: 'Chemical composition analyzer' },
    { id: 'bodycam', name: 'Axon Body Cam', icon: <Camera className="h-4 w-4" />, description: 'Evidence recording device' },
    { id: 'gps', name: 'GPS Tracker', icon: <MapPin className="h-4 w-4" />, description: 'Location tracking device' },
  ];

  // Officers list - you might want to fetch this from API too
  const officers = [
    'Ram Kumar',
    'Priya Sharma',
    'Suresh Patil',
    'Anjali Singh',
    'Vikram Reddy',
    'Deepak Yadav',
    'Sunita Devi',
    'Rajesh Gupta'
  ];

  // Target types with descriptions
  const targetTypes = [
    { value: 'retailer', label: 'Retailer', description: 'Local shop or store inspection' },
    { value: 'distributor', label: 'Distributor', description: 'Regional distributor facility' },
    { value: 'warehouse', label: 'Warehouse', description: 'Storage facility inspection' },
    { value: 'market-survey', label: 'Market Survey', description: 'General market area survey' }
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

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTask.officer || !newTask.date || !newTask.location || !newTask.targetType) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(newTask.date);
    const now = new Date();
    if (selectedDate < now) {
      toast({
        title: "Error",
        description: "Please select a future date and time.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Using your configured api instance
      const response = await api.post('inspections', {
        officer: newTask.officer,
        date: newTask.date,
        location: newTask.location,
        targetType: newTask.targetType,
        equipment: newTask.equipment
      });

      // Axios returns data in response.data
      const createdTask = response.data;

      // Add to local state management
      addInspectionTask(createdTask);

      // Also add to fetched tasks for immediate UI update
      setFetchedTasks(prev => [createdTask, ...prev]);

      toast({
        title: "Success",
        description: "Inspection task created successfully."
      });

      setNewTask(initialTaskState);

    } catch (error: any) {
      console.error("Create task error:", error);

      // Handle Axios error structure
      const errorMessage = error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to create inspection task";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Get equipment name by ID
  const getEquipmentName = (id: string) => {
    const equipment = equipmentList.find(eq => eq.id === id);
    return equipment ? equipment.name : id;
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inspection Planning</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Schedule and manage field inspection tasks</p>
        </div>
        <Button
          onClick={fetchInspectionTasks}
          variant="outline"
          size="sm"
          disabled={fetchLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${fetchLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                <p className="text-2xl font-bold">{fetchedTasks.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{scheduledTasks.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{inProgressTasks.length}</p>
              </div>
              <User className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create New Task Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Create Inspection Visit Plan
            </CardTitle>
            <CardDescription>
              Schedule and assign new inspection tasks to field officers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTaskSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="officer" className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Field Officer *
                  </Label>
                  <Select value={newTask.officer} onValueChange={(value) => handleInputChange('officer', value)}>
                    <SelectTrigger id="officer" className="h-10">
                      <SelectValue placeholder="Select Officer" />
                    </SelectTrigger>
                    <SelectContent>
                      {officers.map(officer => (
                        <SelectItem key={officer} value={officer}>
                          {officer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Visit Date & Time *
                  </Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={newTask.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="h-10"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4" />
                  Location *
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., Kolhapur Market, Shop No. 15"
                  value={newTask.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetType" className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Target Type *
                </Label>
                <Select value={newTask.targetType} onValueChange={(value) => handleInputChange('targetType', value)}>
                  <SelectTrigger id="targetType" className="h-10">
                    <SelectValue placeholder="Select Target Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col">
                          <span>{type.label}</span>
                          <span className="text-xs text-white">{type.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Equipment Assignment</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {equipmentList.map(item => (
                    <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <Checkbox
                        id={item.id}
                        checked={newTask.equipment.includes(item.id)}
                        onCheckedChange={() => handleEquipmentChange(item.id)}
                        className="mt-1"
                      />
                      <Label htmlFor={item.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 font-medium">
                          {item.icon}
                          {item.name}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Create Inspection Task
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Task List Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Scheduled Inspections</CardTitle>
            <CardDescription>
              Overview of upcoming tasks
              {fetchLoading && <span className="text-blue-600"> (Loading...)</span>}
            </CardDescription>
            {upcomingDate && (
              <div className="text-sm text-green-600 font-medium">
                Next: {formatDate(upcomingDate.toISOString())}
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {fetchLoading && fetchedTasks.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Loading inspections...</span>
                </div>
              )}

              {!fetchLoading && fetchedTasks.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No inspections scheduled</p>
                  <p className="text-xs text-gray-400">Create your first inspection task</p>
                </div>
              )}

              {fetchedTasks
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((task) => (
                  <div key={task.id} className="p-4 rounded-lg border bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white capitalize">
                        {task.location}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadgeClass(task.status)}`}>
                        {task.status.replace('-', ' ')}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span className="font-medium">Officer:</span> {task.officer}
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span className="font-medium">Date:</span> {formatDate(task.date)}
                      </div>

                      <div className="flex items-center gap-2">
                        <Package className="h-3 w-3" />
                        <span className="font-medium">Type:</span>
                        <span className="capitalize">{task.targetType.replace('-', ' ')}</span>
                      </div>

                      {task.equipment && task.equipment.length > 0 && (
                        <div className="flex items-start gap-2">
                          <QrCode className="h-3 w-3 mt-0.5" />
                          <div>
                            <span className="font-medium">Equipment:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {task.equipment.map((eq, index) => (
                                <span key={index} className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                  {getEquipmentName(eq)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InspectionPlanningModule;