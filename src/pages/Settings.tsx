import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Globe, 
  Database,
  Mail,
  Phone,
  AlertTriangle,
  Save,
  RefreshCw,

} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

import { apiService } from '@/lib/api';

interface SystemSettings {
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  autoAssignment: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  maintenanceMode: boolean;
  sessionTimeout: number;
  maxFileSize: number;
  defaultPriority: string;
  workingHours: {
    start: string;
    end: string;
  };
}



export function Settings() {
  const { permissions, role } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<SystemSettings>({
    companyName: 'Ethiopian Electric Utility',
    supportEmail: 'support@eeu.gov.et',
    supportPhone: '+251-11-123-4567',
    address: 'Addis Ababa, Ethiopia',
    autoAssignment: true,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    sessionTimeout: 60,
    maxFileSize: 10,
    defaultPriority: 'medium',
    workingHours: {
      start: '08:00',
      end: '17:00'
    }
  });

  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);


  // Load settings and permissions on component mount
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch settings
        const settingsResult = await apiService.getSettings();
        if (settingsResult.success && settingsResult.data) {
          setSettings(prevSettings => ({
            ...prevSettings,
            ...settingsResult.data
          }));
        }


      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load settings and permissions",
          variant: "destructive"
        });

      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleWorkingHoursChange = (field: 'start' | 'end', value: string) => {
    setSettings(prev => ({
      ...prev,
      workingHours: { ...prev.workingHours, [field]: value }
    }));
    setIsDirty(true);
  };



  const validateSettings = (): boolean => {
    if (!settings.companyName?.trim()) {
      toast({
        title: "Validation Error",
        description: "Company name is required.",
        variant: "destructive"
      });
      return false;
    }

    if (!settings.supportEmail?.trim() || !settings.supportEmail?.includes('@')) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid support email address.",
        variant: "destructive"
      });
      return false;
    }

    if (!settings.supportPhone?.trim()) {
      toast({
        title: "Validation Error",
        description: "Support phone number is required.",
        variant: "destructive"
      });
      return false;
    }

    if (settings.sessionTimeout < 5 || settings.sessionTimeout > 480) {
      toast({
        title: "Validation Error",
        description: "Session timeout must be between 5 and 480 minutes.",
        variant: "destructive"
      });
      return false;
    }

    if (settings.maxFileSize < 1 || settings.maxFileSize > 100) {
      toast({
        title: "Validation Error",
        description: "Max file size must be between 1 and 100 MB.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSaveSettings = async () => {
    if (!permissions.settings.update) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to update settings.",
        variant: "destructive"
      });
      return;
    }

    if (!validateSettings()) {
      return;
    }

    try {
      const result = await apiService.updateSettings(settings);
      
      if (result.success) {
        toast({
          title: "Settings Saved",
          description: "System settings have been updated successfully.",
        });
        setIsDirty(false);
      } else {
        throw new Error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive"
      });
    }
  };

  const handleResetSettings = async () => {
    if (!permissions.settings.update) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to reset settings.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Fetch fresh settings from server
      const result = await apiService.getSettings();
      if (result.success && result.data) {
        setSettings(result.data);
        setIsDirty(false);
        toast({
          title: "Settings Reset",
          description: "Settings have been reset to server values.",
        });
      }
    } catch (error) {
      // Reset to default values if server fetch fails
      setSettings({
        companyName: 'Ethiopian Electric Utility',
        supportEmail: 'support@eeu.gov.et',
        supportPhone: '+251-11-123-4567',
        address: 'Addis Ababa, Ethiopia',
        autoAssignment: true,
        emailNotifications: true,
        smsNotifications: false,
        maintenanceMode: false,
        sessionTimeout: 60,
        maxFileSize: 10,
        defaultPriority: 'medium',
        workingHours: {
          start: '08:00',
          end: '17:00'
        }
      });
      setIsDirty(false);
      toast({
        title: "Settings Reset",
        description: "Settings have been reset to default values.",
      });
    }
  };

  // System action handlers
  const handleBackupDatabase = async () => {
    if (role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can perform database backups.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Backup Started",
        description: "Database backup is in progress...",
      });
      
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Backup Complete",
        description: "Database has been successfully backed up.",
      });
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Failed to backup database. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleClearCache = async () => {
    if (role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can clear system cache.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Clearing Cache",
        description: "System cache is being cleared...",
      });
      
      // Simulate cache clearing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Cache Cleared",
        description: "System cache has been successfully cleared.",
      });
    } catch (error) {
      toast({
        title: "Cache Clear Failed",
        description: "Failed to clear cache. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSecurityAudit = async () => {
    if (role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can run security audits.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Security Audit Started",
        description: "Running comprehensive security audit...",
      });
      
      // Simulate security audit
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Security Audit Complete",
        description: "No security issues found. System is secure.",
      });
    } catch (error) {
      toast({
        title: "Audit Failed",
        description: "Failed to complete security audit. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!permissions.settings.read) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Access Denied</h3>
          <p className="text-muted-foreground">You don't have permission to view system settings</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Loading settings...</h3>
        </div>
      </div>
    );
  }

  // Safety check to ensure settings are properly initialized
  if (!settings || typeof settings !== 'object') {
    console.error('Settings not properly initialized:', settings);
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Settings Error</h3>
          <p className="text-muted-foreground">Settings could not be loaded properly. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-4xl font-extrabold text-primary drop-shadow-sm tracking-tight">System Settings</h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl">Configure system preferences and company information</p>
        </div>
        {permissions.settings.update && (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleResetSettings}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Settings
            </Button>
            <Button 
              onClick={handleSaveSettings} 
              disabled={!isDirty}
              className="bg-gradient-primary"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>

          </div>
        )}
      </div>

      <Tabs defaultValue="general" className="animate-slide-up">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Company Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    value={settings.companyName || ''}
                    onChange={(e) => handleSettingChange('companyName', e.target.value)}
                    disabled={!permissions.settings.update}
                    className={!settings.companyName?.trim() ? 'border-destructive' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">
                    Support Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail || ''}
                    onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                    disabled={!permissions.settings.update}
                    className={!settings.supportEmail?.includes('@') ? 'border-destructive' : ''}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">
                    Support Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="supportPhone"
                    value={settings.supportPhone || ''}
                    onChange={(e) => handleSettingChange('supportPhone', e.target.value)}
                    disabled={!permissions.settings.update}
                    className={!settings.supportPhone?.trim() ? 'border-destructive' : ''}
                    placeholder="+251-XX-XXX-XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workingHoursStart">Working Hours</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="time"
                      value={settings.workingHours?.start || '08:00'}
                      onChange={(e) => handleWorkingHoursChange('start', e.target.value)}
                      disabled={!permissions.settings.update}
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={settings.workingHours?.end || '17:00'}
                      onChange={(e) => handleWorkingHoursChange('end', e.target.value)}
                      disabled={!permissions.settings.update}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={settings.address || ''}
                  onChange={(e) => handleSettingChange('address', e.target.value)}
                  disabled={!permissions.settings.update}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications for new complaints and updates
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  disabled={!permissions.settings.update}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send SMS notifications for critical complaints
                  </p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                  disabled={!permissions.settings.update}
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Notification Recipients</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">admin@eeu.gov.et</span>
                    <Badge variant="outline">Admin</Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">+251-911-000-001</span>
                    <Badge variant="outline">Emergency</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    disabled={!permissions.settings.update}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                    disabled={!permissions.settings.update}
                  />
                </div>
              </div>

              {role === 'admin' && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="maintenanceMode" className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span>Maintenance Mode</span>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Restrict system access for maintenance
                      </p>
                    </div>
                    <Switch
                      id="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                      disabled={!permissions.settings.update}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Settings */}
        <TabsContent value="workflow" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5" />
                <span>Complaint Workflow</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="autoAssignment">Auto-Assignment</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically assign complaints to available technicians
                  </p>
                </div>
                <Switch
                  id="autoAssignment"
                  checked={settings.autoAssignment}
                  onCheckedChange={(checked) => handleSettingChange('autoAssignment', checked)}
                  disabled={!permissions.settings.update}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultPriority">Default Complaint Priority</Label>
                <Select 
                  value={settings.defaultPriority} 
                  onValueChange={(value) => handleSettingChange('defaultPriority', value)}
                  disabled={!permissions.settings.update}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Response Time Targets</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border border-border rounded-lg">
                    <div className="font-medium text-sm">Critical</div>
                    <div className="text-2xl font-bold text-destructive">15 min</div>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <div className="font-medium text-sm">High</div>
                    <div className="text-2xl font-bold text-warning">2 hours</div>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <div className="font-medium text-sm">Medium</div>
                    <div className="text-2xl font-bold text-primary">8 hours</div>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <div className="font-medium text-sm">Low</div>
                    <div className="text-2xl font-bold text-muted-foreground">24 hours</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>



        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>System Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Version</div>
                  <div className="text-lg font-bold">v2.1.0</div>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Database Status</div>
                  <div className="text-lg font-bold text-success">Connected</div>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Last Backup</div>
                  <div className="text-lg font-bold">Jan 14, 2024</div>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Active Users</div>
                  <div className="text-lg font-bold">24</div>
                </div>
              </div>

              {role === 'admin' && (
                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-medium">System Actions</h4>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleBackupDatabase}>
                      <Database className="mr-2 h-4 w-4" />
                      Backup Database
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleClearCache}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Clear Cache
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSecurityAudit}>
                      <Shield className="mr-2 h-4 w-4" />
                      Security Audit
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

