import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';
import {
  Shield,
  Users,
  FileText,
  Settings,
  Bell,
  BarChart3,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Activity
} from 'lucide-react';

interface Permission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

interface RolePermissions {
  [resource: string]: Permission;
}

interface PermissionMatrix {
  [role: string]: RolePermissions;
}

interface Resource {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

const resources: Resource[] = [
  {
    id: 'users',
    name: 'User Management',
    description: 'Manage system users and their profiles',
    icon: Users,
    category: 'Administration'
  },
  {
    id: 'complaints',
    name: 'Complaints',
    description: 'Handle customer complaints and tickets',
    icon: FileText,
    category: 'Operations'
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    description: 'Generate and view system reports',
    icon: BarChart3,
    category: 'Analytics'
  },
  {
    id: 'settings',
    name: 'System Settings',
    description: 'Configure system preferences',
    icon: Settings,
    category: 'Administration'
  },
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'Manage system notifications',
    icon: Bell,
    category: 'Communication'
  }
];

const roles = [
  { id: 'administrator', name: 'Administrator', color: 'bg-red-500' },
  { id: 'manager', name: 'Manager', color: 'bg-blue-500' },
  { id: 'foreman', name: 'Foreman', color: 'bg-green-500' },
  { id: 'call_attendant', name: 'Call Attendant', color: 'bg-yellow-500' },
  { id: 'technician', name: 'Technician', color: 'bg-purple-500' }
];

const permissionActions = [
  { id: 'create', name: 'Create', icon: Plus, description: 'Create new records' },
  { id: 'read', name: 'Read', icon: Eye, description: 'View and read records' },
  { id: 'update', name: 'Update', icon: Edit, description: 'Modify existing records' },
  { id: 'delete', name: 'Delete', icon: Trash2, description: 'Remove records' }
];

export default function PermissionManagement() {
  const { permissions, role } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  // Check if user has permission to manage permissions
  if (!permissions.settings?.update || role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Shield className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Access Denied
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Only administrators can manage system permissions.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span>Current role: {role}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get default permission matrix
  const getDefaultPermissionMatrix = (): PermissionMatrix => ({
    administrator: {
      users: { create: true, read: true, update: true, delete: true },
      complaints: { create: true, read: true, update: true, delete: true },
      reports: { create: true, read: true, update: true, delete: true },
      settings: { create: true, read: true, update: true, delete: true },
      notifications: { create: true, read: true, update: true, delete: true }
    },
    manager: {
      users: { create: false, read: true, update: true, delete: false },
      complaints: { create: true, read: true, update: true, delete: false },
      reports: { create: true, read: true, update: false, delete: false },
      settings: { create: false, read: true, update: true, delete: false },
      notifications: { create: true, read: true, update: true, delete: false }
    },
    foreman: {
      users: { create: false, read: true, update: false, delete: false },
      complaints: { create: false, read: true, update: true, delete: false },
      reports: { create: false, read: true, update: false, delete: false },
      settings: { create: false, read: true, update: false, delete: false },
      notifications: { create: false, read: true, update: false, delete: false }
    },
    call_attendant: {
      users: { create: false, read: false, update: false, delete: false },
      complaints: { create: true, read: true, update: false, delete: false },
      reports: { create: false, read: true, update: false, delete: false },
      settings: { create: false, read: false, update: false, delete: false },
      notifications: { create: false, read: true, update: false, delete: false }
    },
    technician: {
      users: { create: false, read: false, update: false, delete: false },
      complaints: { create: false, read: true, update: true, delete: false },
      reports: { create: false, read: false, update: false, delete: false },
      settings: { create: false, read: false, update: false, delete: false },
      notifications: { create: false, read: true, update: false, delete: false }
    }
  });

  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>(getDefaultPermissionMatrix());

  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('administrator');

  // Load permissions from API on component mount
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoading(true);
        const result = await apiService.getPermissionMatrix();
        
        if (result.success && result.data && isValidPermissionMatrix(result.data)) {
          setPermissionMatrix(result.data);
        } else {
          // If no permissions exist or invalid structure, keep defaults
          console.log('No valid permissions found, using defaults');
          toast({
            title: "Info",
            description: "Using default permission settings.",
          });
        }
      } catch (error) {
        console.error('Error loading permissions:', error);
        toast({
          title: "Warning",
          description: "Could not load saved permissions. Using default values.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [toast]);

  // Validate permission matrix structure
  const isValidPermissionMatrix = (data: any): data is PermissionMatrix => {
    if (!data || typeof data !== 'object') return false;
    
    const requiredRoles = ['administrator', 'manager', 'foreman', 'call_attendant', 'technician'];
    const requiredResources = ['users', 'complaints', 'reports', 'settings', 'notifications'];
    const requiredActions = ['create', 'read', 'update', 'delete'];
    
    for (const role of requiredRoles) {
      if (!data[role] || typeof data[role] !== 'object') return false;
      
      for (const resource of requiredResources) {
        if (!data[role][resource] || typeof data[role][resource] !== 'object') return false;
        
        for (const action of requiredActions) {
          if (typeof data[role][resource][action] !== 'boolean') return false;
        }
      }
    }
    
    return true;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Loading permissions...</h3>
          <p className="text-muted-foreground">Please wait while we load the permission matrix.</p>
        </div>
      </div>
    );
  }

  const handlePermissionChange = (roleId: string, resourceId: string, action: keyof Permission, value: boolean) => {
    if (!permissions.settings?.update) return;

    setPermissionMatrix(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [resourceId]: {
          ...prev[roleId][resourceId],
          [action]: value
        }
      }
    }));
    setIsDirty(true);
  };

  const handleBulkPermissionChange = (roleId: string, resourceId: string, permissions: Permission) => {
    if (!permissions.settings?.update) return;

    setPermissionMatrix(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [resourceId]: permissions
      }
    }));
    setIsDirty(true);
  };

  const calculateRolePermissionPercentage = (roleId: string): number => {
    const safeMatrix = permissionMatrix || getDefaultPermissionMatrix();
    const rolePerms = safeMatrix[roleId];
    if (!rolePerms) return 0;

    let totalPermissions = 0;
    let grantedPermissions = 0;

    Object.values(rolePerms).forEach(resourcePerms => {
      Object.values(resourcePerms).forEach(hasPermission => {
        totalPermissions++;
        if (hasPermission) grantedPermissions++;
      });
    });

    return totalPermissions > 0 ? Math.round((grantedPermissions / totalPermissions) * 100) : 0;
  };

  const getPermissionCount = (roleId: string): { granted: number; total: number } => {
    const safeMatrix = permissionMatrix || getDefaultPermissionMatrix();
    const rolePerms = safeMatrix[roleId];
    if (!rolePerms) return { granted: 0, total: 0 };

    let total = 0;
    let granted = 0;

    Object.values(rolePerms).forEach(resourcePerms => {
      Object.values(resourcePerms).forEach(hasPermission => {
        total++;
        if (hasPermission) granted++;
      });
    });

    return { granted, total };
  };

  const handleSavePermissions = async () => {
    try {
      setLoading(true);
      
      // Save to backend using API service
      const result = await apiService.updatePermissionMatrix(permissionMatrix);
      
      if (result.success) {
        setIsDirty(false);
        toast({
          title: "Permissions Updated",
          description: "Role permissions have been saved successfully.",
        });
      } else {
        throw new Error(result.error || 'Failed to save permissions');
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save permissions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPermissions = () => {
    // Reset to default permissions
    setPermissionMatrix(getDefaultPermissionMatrix());
    setIsDirty(true);
    toast({
      title: "Permissions Reset",
      description: "All permissions have been reset to default values.",
    });
  };

  const getQuickActionPresets = () => [
    {
      name: 'Full Access',
      icon: Unlock,
      permissions: { create: true, read: true, update: true, delete: true },
      color: 'bg-green-500'
    },
    {
      name: 'Read Only',
      icon: Eye,
      permissions: { create: false, read: true, update: false, delete: false },
      color: 'bg-blue-500'
    },
    {
      name: 'Read & Update',
      icon: Edit,
      permissions: { create: false, read: true, update: true, delete: false },
      color: 'bg-yellow-500'
    },
    {
      name: 'No Access',
      icon: Lock,
      permissions: { create: false, read: false, update: false, delete: false },
      color: 'bg-red-500'
    }
  ];

  // Safety check to ensure permission matrix is valid
  const safePermissionMatrix = permissionMatrix || getDefaultPermissionMatrix();
  
  // Ensure selected role exists in the matrix
  if (!safePermissionMatrix[selectedRole]) {
    setSelectedRole('administrator');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Permission Management</h1>
          <p className="text-muted-foreground mt-2">
            Configure CRUD permissions for each role and resource
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {isDirty && (
            <Badge variant="outline" className="bg-warning/10 text-warning">
              Unsaved Changes
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={handleResetPermissions}
            disabled={loading || !permissions.settings?.update}
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Reset to Defaults</span>
            <span className="sm:hidden">Reset</span>
          </Button>
          <Button
            onClick={handleSavePermissions}
            disabled={loading || !isDirty || !permissions.settings?.update}
            className="bg-gradient-primary"
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Save Permissions</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </div>
      </div>

      {/* Role-Based Access Control Matrix */}
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Role-Based Access Control Matrix</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {resources.map((resource, resourceIndex) => (
            <div key={resource.id} className="space-y-4">
              <div className="flex items-center space-x-3">
                <resource.icon className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">{resource.name}</h3>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 sm:p-3 font-medium">Role</th>
                      {permissionActions.map(action => (
                        <th key={action.id} className="text-center p-2 sm:p-3 font-medium min-w-[80px] sm:min-w-[100px]">
                          <div className="flex flex-col items-center space-y-1">
                            <action.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs">{action.name}</span>
                          </div>
                        </th>
                      ))}
                      <th className="text-center p-2 sm:p-3 font-medium">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map(role => (
                      <tr key={role.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 sm:p-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${role.color}`} />
                            <span className="font-medium text-sm sm:text-base">{role.name}</span>
                          </div>
                        </td>
                        {permissionActions.map(action => (
                          <td key={action.id} className="text-center p-2 sm:p-3">
                            <Switch
                              checked={safePermissionMatrix[role.id]?.[resource.id]?.[action.id as keyof Permission] || false}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(role.id, resource.id, action.id as keyof Permission, checked)
                              }
                              disabled={!permissions.settings?.update}
                            />
                          </td>
                        ))}
                        <td className="text-center p-3">
                          <div className="flex justify-center space-x-1">
                            {getQuickActionPresets().map((preset, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title={preset.name}
                                onClick={() => handleBulkPermissionChange(role.id, resource.id, preset.permissions)}
                                disabled={!permissions.settings?.update}
                              >
                                <preset.icon className="h-3 w-3" />
                              </Button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {resourceIndex < resources.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Permission Summary */}
      <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Permission Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map(role => {
              const percentage = calculateRolePermissionPercentage(role.id);
              const { granted, total } = getPermissionCount(role.id);
              
              return (
                <div key={role.id} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${role.color}`} />
                      <span className="font-semibold">{role.name}</span>
                    </div>
                    <Badge variant={percentage >= 75 ? "default" : percentage >= 50 ? "secondary" : "outline"}>
                      {percentage}%
                    </Badge>
                  </div>
                  
                  <Progress value={percentage} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{granted} of {total} permissions granted</span>
                    {percentage >= 75 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : percentage >= 50 ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {resources.map(resource => {
                      const resourcePerms = safePermissionMatrix[role.id]?.[resource.id];
                      const resourceGranted = resourcePerms ? Object.values(resourcePerms).filter(Boolean).length : 0;
                      const resourceTotal = 4; // CRUD operations
                      
                      return (
                        <div key={resource.id} className="flex items-center justify-between text-xs">
                          <span className="flex items-center space-x-1">
                            <resource.icon className="h-3 w-3" />
                            <span>{resource.name}</span>
                          </span>
                          <span className="text-muted-foreground">
                            {resourceGranted}/{resourceTotal}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Role Selector for Mobile View */}
      <Card className="animate-slide-up md:hidden" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5" />
            <span>Role-Specific View</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map(role => (
                <SelectItem key={role.id} value={role.id}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${role.color}`} />
                    <span>{role.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="space-y-3">
            {resources.map(resource => (
              <div key={resource.id} className="p-3 border rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <resource.icon className="h-5 w-5 text-primary" />
                  <span className="font-medium">{resource.name}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {permissionActions.map(action => (
                    <div key={action.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <action.icon className="h-3 w-3" />
                        <span className="text-sm">{action.name}</span>
                      </div>
                      <Switch
                        checked={safePermissionMatrix[selectedRole]?.[resource.id]?.[action.id as keyof Permission] || false}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(selectedRole, resource.id, action.id as keyof Permission, checked)
                        }
                        disabled={!permissions.settings?.update}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}