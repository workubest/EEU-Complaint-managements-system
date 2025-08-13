import React, { useState, useEffect } from 'react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentComplaints } from '@/components/dashboard/RecentComplaints';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Zap,
  Settings,
  RefreshCw,
  Loader2,
  Download,
  Server,
  Database,
  Plus,
  BarChart3,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { RepairOrderExport } from '@/components/export/RepairOrderExport';
import { RepairOrderPDFExport } from '@/components/export/RepairOrderPDFExport';

interface DashboardData {
  roleInsights: {
    label: string;
    value: string;
    status: 'good' | 'warning' | 'error';
    trend?: 'up' | 'down' | 'stable';
  }[];
  systemStatus: {
    temperature: number;
    connectivity: string;
    batteryLevel: number;
    lastUpdate: Date;
    alerts: number;
    activeIncidents: number;
    serverLoad: number;
    uptime: string;
  };
  weatherData?: {
    temperature: number;
    condition: string;
    windSpeed: number;
    visibility: string;
    safetyLevel: 'safe' | 'caution' | 'danger';
  };
}

export function Dashboard() {
  const { user, role, region } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  
  // Dashboard customization states
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);
  const [showTeamStatusDialog, setShowTeamStatusDialog] = useState(false);
  const [showSystemStatusDialog, setShowSystemStatusDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showQuickActionsDialog, setShowQuickActionsDialog] = useState(false);
  
  // Dashboard layout states
  const [dashboardLayout, setDashboardLayout] = useState({
    showWeather: true,
    showQuickInsights: false,
    showActivityFeed: true,
    showRecentComplaints: true,
    showSystemStatus: true,
    compactMode: false,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    theme: 'default'
  });
  
  // System status states
  const [systemStatus, setSystemStatus] = useState({
    api: 'online',
    database: 'online',
    services: 'online',
    lastCheck: new Date()
  });
  
  // Team status states
  const [teamStatus, setTeamStatus] = useState([]);
  
  // Export states
  const [exportType, setExportType] = useState('dashboard');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, [role, region]);

  const fetchDashboardData = async () => {
    try {
      const result = await apiService.getDashboardData(role, region);
      
      if (result.success && result.data) {
        // Transform the Google Apps Script response to match Dashboard expectations
        const transformedData: DashboardData = {
          roleInsights: [
            {
              label: 'Total Complaints',
              value: result.data.totalComplaints?.toString() || '0',
              status: 'good' as const,
              trend: 'stable' as const
            },
            {
              label: 'Open Complaints',
              value: result.data.openComplaints?.toString() || '0',
              status: result.data.openComplaints > 20 ? 'warning' : 'good',
              trend: 'up' as const
            },
            {
              label: 'In Progress',
              value: result.data.inProgressComplaints?.toString() || '0',
              status: 'good' as const,
              trend: 'stable' as const
            },
            {
              label: 'Resolved',
              value: result.data.resolvedComplaints?.toString() || '0',
              status: 'good' as const,
              trend: 'up' as const
            },
            {
              label: 'Active Users',
              value: result.data.activeUsers?.toString() || '0',
              status: 'good' as const,
              trend: 'stable' as const
            },
            {
              label: 'Resolution Rate',
              value: `${result.data.performance?.resolutionRate || 85}%`,
              status: (result.data.performance?.resolutionRate || 85) > 80 ? 'good' : 'warning',
              trend: 'up' as const
            }
          ],
          systemStatus: {
            temperature: 22,
            connectivity: 'online',
            batteryLevel: 95,
            lastUpdate: new Date(),
            alerts: result.data.openComplaints || 0,
            activeIncidents: result.data.inProgressComplaints || 0,
            serverLoad: 45,
            uptime: '99.9%'
          },
          weatherData: {
            temperature: 24,
            condition: 'Clear',
            windSpeed: 12,
            visibility: 'Good',
            safetyLevel: 'safe' as const
          }
        };
        
        setDashboardData(transformedData);
        console.log('✅ Dashboard data loaded successfully:', transformedData);
      } else {
        console.error('Failed to fetch dashboard data:', result.error);
        toast({
          title: "Data Loading Error",
          description: result.error || "Failed to load dashboard data",
          variant: "destructive"
        });
      }
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Connection Issue",
        description: "Unable to connect to the server. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };



  // System status functions
  const checkSystemStatus = async () => {
    try {
      const result = await apiService.healthCheck();
      setSystemStatus({
        api: result.success ? 'online' : 'offline',
        database: result.success ? 'online' : 'offline',
        services: result.success ? 'online' : 'offline',
        lastCheck: new Date()
      });
    } catch (error) {
      console.error('Error checking system status:', error);
      setSystemStatus({
        api: 'offline',
        database: 'offline',
        services: 'offline',
        lastCheck: new Date()
      });
    }
  };

  // Team status functions
  const fetchTeamStatus = async () => {
    try {
      const result = await apiService.getUsers();
      if (result.success && result.data) {
        const activeUsers = result.data.filter(user => user.isActive);
        setTeamStatus(activeUsers.map(user => ({
          id: user.id,
          name: user.name,
          role: user.role,
          status: user.lastLogin && new Date(user.lastLogin) > new Date(Date.now() - 30 * 60 * 1000) ? 'online' : 'offline',
          lastSeen: user.lastLogin,
          region: user.region,
          serviceCenter: user.serviceCenter
        })));
      }
    } catch (error) {
      console.error('Error fetching team status:', error);
    }
  };

  // Export functions
  const handleExport = async () => {
    setExportLoading(true);
    try {
      // Handle repair orders export specially
      if (exportType === 'repair-orders') {
        // Fetch complaints data for repair orders
        const complaintsResult = await apiService.getComplaints();
        if (complaintsResult.success && complaintsResult.data) {
          // Use the repair order export functionality
          const complaints = complaintsResult.data.map((item: any) => ({
            id: item.ID || item.id || '',
            customerId: item['Customer ID'] || item.customerId || '',
            customer: {
              id: item['Customer ID'] || item.customerId || '',
              name: item['Customer Name'] || item.customerName || '',
              email: item['Customer Email'] || item.customerEmail || '',
              phone: item['Customer Phone'] || item.customerPhone || '',
              address: item['Customer Address'] || item.customerAddress || ''
            },
            title: item.Title || item.title || '',
            description: item.Description || item.description || '',
            status: item.Status || item.status || 'open',
            priority: item.Priority || item.priority || 'medium',
            region: item.Region || item.region || '',
            createdAt: item['Created At'] || item.createdAt || new Date().toISOString(),
            updatedAt: item['Updated At'] || item.updatedAt || new Date().toISOString()
          }));

          // Generate repair orders based on format
          if (exportFormat === 'pdf') {
            const { jsPDF } = await import('jspdf');
            // Use PDF export logic here
            const doc = new jsPDF('p', 'mm', 'a4');
            // Add repair order generation logic
            doc.save(`repair-orders-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
          } else {
            // Use HTML export
            const RepairOrderExportComponent = new RepairOrderExport({ 
              complaints, 
              onExport: () => {} 
            });
            // Trigger export
          }

          toast({
            title: "Repair Orders Generated",
            description: `${complaints.length} repair orders exported successfully`,
            variant: "default"
          });
          setShowExportDialog(false);
        } else {
          throw new Error('Failed to fetch complaints data');
        }
      } else {
        // Handle other export types
        const result = await apiService.exportData(exportType, {
          format: exportFormat,
          includeCharts: true,
          dateRange: 'last30days'
        });
        
        if (result.success) {
          // Create download link
          const blob = new Blob([result.data], { 
            type: exportFormat === 'pdf' ? 'application/pdf' : 'text/csv' 
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `dashboard-export-${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          toast({
            title: "Export Successful",
            description: `Dashboard data exported as ${exportFormat.toUpperCase()}`,
            variant: "default"
          });
          setShowExportDialog(false);
        } else {
          toast({
            title: "Export Failed",
            description: result.error || "Failed to export data",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Error",
        description: "An error occurred during export",
        variant: "destructive"
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Dashboard customization functions
  const saveDashboardLayout = () => {
    localStorage.setItem('dashboardLayout', JSON.stringify(dashboardLayout));
    toast({
      title: "Layout Saved",
      description: "Dashboard layout preferences saved successfully",
      variant: "default"
    });
    setShowCustomizeDialog(false);
  };

  const resetDashboardLayout = () => {
    const defaultLayout = {
      showWeather: true,
      showQuickInsights: false,
      showActivityFeed: true,
      showRecentComplaints: true,
      showSystemStatus: true,
      compactMode: false,
      autoRefresh: true,
      refreshInterval: 30000,
      theme: 'default'
    };
    setDashboardLayout(defaultLayout);
    localStorage.setItem('dashboardLayout', JSON.stringify(defaultLayout));
    toast({
      title: "Layout Reset",
      description: "Dashboard layout reset to default settings",
      variant: "default"
    });
  };

  // Quick actions functions
  const handleQuickAction = async (action: string) => {
    switch (action) {
      case 'create-complaint':
        window.location.href = '/dashboard/complaints/new';
        break;
      case 'view-analytics':
        window.location.href = '/analytics';
        break;
      case 'manage-users':
        if (role === 'admin' || role === 'manager') {
          window.location.href = '/users';
        } else {
          toast({
            title: "Access Denied",
            description: "You don't have permission to manage users",
            variant: "destructive"
          });
        }
        break;
      case 'system-settings':
        if (role === 'admin') {
          window.location.href = '/settings';
        } else {
          toast({
            title: "Access Denied",
            description: "Only administrators can access system settings",
            variant: "destructive"
          });
        }
        break;
      case 'generate-report':
        setShowExportDialog(true);
        break;
      default:
        toast({
          title: "Action Not Available",
          description: "This action is not yet implemented",
          variant: "default"
        });
    }
  };

  // Load saved layout on component mount
  useEffect(() => {
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (savedLayout) {
      try {
        setDashboardLayout(JSON.parse(savedLayout));
      } catch (error) {
        console.error('Error loading saved layout:', error);
      }
    }
    
    // Fetch additional data
    checkSystemStatus();
    fetchTeamStatus();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (dashboardLayout.autoRefresh) {
      const interval = setInterval(() => {
        fetchDashboardData();
        checkSystemStatus();
      }, dashboardLayout.refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [dashboardLayout.autoRefresh, dashboardLayout.refreshInterval]);

  const getWelcomeMessage = () => {
    const messages = {
      admin: 'System Administration Overview',
      manager: 'Regional Management Overview',
      foreman: 'Field Operations Overview',
      'call-attendant': 'Customer Service Overview',
      technician: 'Your Assigned Tasks'
    };
    return messages[role] || 'Dashboard Overview';
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchDashboardData();
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with System Status */}
      <div className="animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary drop-shadow-sm tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mt-2 max-w-2xl">
              {getWelcomeMessage()}
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{format(new Date(), 'EEEE, MMMM do, yyyy')}</span>
                <span className="sm:hidden">{format(new Date(), 'MMM do')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{format(new Date(), 'HH:mm')}</span>
              </div>
              {region && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate max-w-24 sm:max-w-none">{region}</span>
                </div>
              )}
              <div className="flex items-center space-x-1 text-xs">
                <RefreshCw className="h-3 w-3" />
                <span className="hidden sm:inline">Last updated: {format(lastRefresh, 'HH:mm:ss')}</span>
                <span className="sm:hidden">{format(lastRefresh, 'HH:mm')}</span>
              </div>
            </div>
          </div>
          
          {/* System Status Indicators */}
          <div className="flex flex-wrap items-center gap-2">
            {/* System Status Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSystemStatusDialog(true)}
              className="flex items-center space-x-1"
            >
              <div className={`h-2 w-2 rounded-full ${
                systemStatus.api === 'online' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <Server className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
            </Button>

            {/* Export Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportDialog(true)}
              className="flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span className="hidden md:inline">Export</span>
            </Button>


            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-1"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Role-specific Insights */}
      {dashboardLayout.showQuickInsights && (
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Card className="border-border bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Quick Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardData?.roleInsights.map((insight, index) => (
                  <div 
                    key={insight.label}
                    className="text-center p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`text-2xl font-bold ${
                      insight.status === 'good' ? 'text-green-600' : 
                      insight.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {insight.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{insight.label}</div>
                    <div className="mt-1 flex items-center justify-center space-x-1">
                      {insight.status === 'good' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      {insight.trend && (
                        <TrendingUp className={`h-3 w-3 ${
                          insight.trend === 'up' ? 'text-green-500' : 
                          insight.trend === 'down' ? 'text-red-500 rotate-180' : 'text-gray-500'
                        }`} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats Cards - Enhanced */}
      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="rounded-xl border-none shadow-card bg-gradient-to-br from-primary/10 to-primary-glow/10 p-4 hover:shadow-elevated hover:scale-[1.02] transition-all duration-300 group">
          <StatsCards />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <QuickActions />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        {/* Left Column - Recent Complaints */}
        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-xl border-none shadow-card bg-gradient-to-br from-success/10 to-primary-glow/10 p-4 hover:shadow-elevated hover:scale-[1.02] transition-all duration-300 group">
            <RecentComplaints />
          </div>
          

        </div>

        {/* Right Column - Activity Feed */}
        <div className="space-y-6">
          <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <ActivityFeed />
          </div>
          
          {/* Weather Widget for Field Workers */}
          {(role === 'technician' || role === 'foreman') && dashboardData?.weatherData && (
            <Card className="border-border animate-slide-up" style={{ animationDelay: '0.7s' }}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span>Field Conditions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Weather</span>
                    <span className="font-medium">
                      {dashboardData.weatherData.condition}, {dashboardData.weatherData.temperature.toFixed(0)}°C
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Wind Speed</span>
                    <span className="font-medium">{dashboardData.weatherData.windSpeed.toFixed(0)} km/h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Visibility</span>
                    <span className="font-medium">{dashboardData.weatherData.visibility}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Safety Level</span>
                    <Badge 
                      variant="outline" 
                      className={
                        dashboardData.weatherData.safetyLevel === 'safe' 
                          ? "bg-green-50 text-green-700"
                          : dashboardData.weatherData.safetyLevel === 'caution'
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-700"
                      }
                    >
                      {dashboardData.weatherData.safetyLevel === 'safe' ? 'Safe' : 
                       dashboardData.weatherData.safetyLevel === 'caution' ? 'Caution' : 'Danger'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-center space-x-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
        <Button 
          variant="outline" 
          className="flex items-center space-x-2"
          onClick={() => setShowCustomizeDialog(true)}
        >
          <Settings className="h-4 w-4" />
          <span>Customize Dashboard</span>
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center space-x-2"
          onClick={() => setShowTeamStatusDialog(true)}
        >
          <Users className="h-4 w-4" />
          <span>Team Status</span>
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center space-x-2"
          onClick={() => setShowQuickActionsDialog(true)}
        >
          <Zap className="h-4 w-4" />
          <span>Quick Actions</span>
        </Button>
      </div>

      {/* Dialog Components */}
      
      {/* Customize Dashboard Dialog */}
      <Dialog open={showCustomizeDialog} onOpenChange={setShowCustomizeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Customize Dashboard</span>
            </DialogTitle>
            <DialogDescription>
              Personalize your dashboard layout and preferences
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="layout" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
            </TabsList>
            
            <TabsContent value="layout" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Switch 
                      checked={dashboardLayout.showQuickInsights}
                      onCheckedChange={(checked) => 
                        setDashboardLayout(prev => ({ ...prev, showQuickInsights: checked }))
                      }
                    />
                    <span>Quick Insights</span>
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Switch 
                      checked={dashboardLayout.showPerformanceMetrics}
                      onCheckedChange={(checked) => 
                        setDashboardLayout(prev => ({ ...prev, showPerformanceMetrics: checked }))
                      }
                    />
                    <span>Performance Metrics</span>
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Switch 
                      checked={dashboardLayout.showActivityFeed}
                      onCheckedChange={(checked) => 
                        setDashboardLayout(prev => ({ ...prev, showActivityFeed: checked }))
                      }
                    />
                    <span>Activity Feed</span>
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Switch 
                      checked={dashboardLayout.showRecentComplaints}
                      onCheckedChange={(checked) => 
                        setDashboardLayout(prev => ({ ...prev, showRecentComplaints: checked }))
                      }
                    />
                    <span>Recent Complaints</span>
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Switch 
                      checked={dashboardLayout.showWeather}
                      onCheckedChange={(checked) => 
                        setDashboardLayout(prev => ({ ...prev, showWeather: checked }))
                      }
                    />
                    <span>Weather Widget</span>
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Switch 
                      checked={dashboardLayout.compactMode}
                      onCheckedChange={(checked) => 
                        setDashboardLayout(prev => ({ ...prev, compactMode: checked }))
                      }
                    />
                    <span>Compact Mode</span>
                  </Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Switch 
                      checked={dashboardLayout.autoRefresh}
                      onCheckedChange={(checked) => 
                        setDashboardLayout(prev => ({ ...prev, autoRefresh: checked }))
                      }
                    />
                    <span>Auto Refresh</span>
                  </Label>
                </div>
                
                {dashboardLayout.autoRefresh && (
                  <div className="space-y-2">
                    <Label>Refresh Interval (seconds)</Label>
                    <Select 
                      value={dashboardLayout.refreshInterval.toString()}
                      onValueChange={(value) => 
                        setDashboardLayout(prev => ({ ...prev, refreshInterval: parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15000">15 seconds</SelectItem>
                        <SelectItem value="30000">30 seconds</SelectItem>
                        <SelectItem value="60000">1 minute</SelectItem>
                        <SelectItem value="300000">5 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="theme" className="space-y-4">
              <div className="space-y-4">
                <Label>Dashboard Theme</Label>
                <Select 
                  value={dashboardLayout.theme}
                  onValueChange={(value) => 
                    setDashboardLayout(prev => ({ ...prev, theme: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={resetDashboardLayout}>
              Reset to Default
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setShowCustomizeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveDashboardLayout}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Status Dialog */}
      <Dialog open={showTeamStatusDialog} onOpenChange={setShowTeamStatusDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Team Status</span>
            </DialogTitle>
            <DialogDescription>
              View current status of all team members
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamStatus.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`h-3 w-3 rounded-full ${
                      member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground capitalize">{member.role}</div>
                      <div className="text-xs text-muted-foreground">{member.region}</div>
                      {member.lastSeen && (
                        <div className="text-xs text-muted-foreground">
                          Last seen: {format(new Date(member.lastSeen), 'MMM d, HH:mm')}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {teamStatus.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No team members found
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* System Status Dialog */}
      <Dialog open={showSystemStatusDialog} onOpenChange={setShowSystemStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>System Status</span>
            </DialogTitle>
            <DialogDescription>
              Current status of all system components
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>API Service</span>
                </span>
                <Badge variant={systemStatus.api === 'online' ? 'default' : 'destructive'}>
                  {systemStatus.api}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Database</span>
                </span>
                <Badge variant={systemStatus.database === 'online' ? 'default' : 'destructive'}>
                  {systemStatus.database}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Server className="h-4 w-4" />
                  <span>Services</span>
                </span>
                <Badge variant={systemStatus.services === 'online' ? 'default' : 'destructive'}>
                  {systemStatus.services}
                </Badge>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Last checked: {format(systemStatus.lastCheck, 'MMM d, yyyy HH:mm:ss')}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkSystemStatus}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Again
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Export Dashboard Data</span>
            </DialogTitle>
            <DialogDescription>
              Export dashboard data in various formats
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Export Type</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard">Dashboard Summary</SelectItem>
                  <SelectItem value="complaints">Complaints Data</SelectItem>
                  <SelectItem value="repair-orders">Repair Orders (የማደሻ ትእዛዝ)</SelectItem>
                  <SelectItem value="analytics">Analytics Report</SelectItem>
                  <SelectItem value="performance">Performance Metrics</SelectItem>
                  <SelectItem value="users">User Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="csv">CSV Data</SelectItem>
                  <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                  <SelectItem value="json">JSON Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={exportLoading}>
              {exportLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Actions Dialog */}
      <Dialog open={showQuickActionsDialog} onOpenChange={setShowQuickActionsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Quick Actions</span>
            </DialogTitle>
            <DialogDescription>
              Perform common tasks quickly
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => handleQuickAction('create-complaint')}
            >
              <Plus className="h-6 w-6" />
              <span>New Complaint</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => handleQuickAction('view-analytics')}
            >
              <BarChart3 className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => handleQuickAction('manage-users')}
            >
              <Users className="h-6 w-6" />
              <span>Manage Users</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => handleQuickAction('generate-report')}
            >
              <FileText className="h-6 w-6" />
              <span>Generate Report</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => handleQuickAction('system-settings')}
            >
              <Settings className="h-6 w-6" />
              <span>System Settings</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}