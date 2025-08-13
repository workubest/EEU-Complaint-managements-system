import { 
  BarChart3, 
  Plus, 
  FileText, 
  Users, 
  Settings, 
  Home,
  Bell,
  Download,
  Shield
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { PermissionGate, RoleGate } from '@/components/ui/permission-gate';

const getNavigation = (t: (key: string) => string) => [
  { name: t('nav.dashboard'), href: '/dashboard', icon: Home, requiresAuth: false },
  { name: t('nav.new_complaint'), href: '/dashboard/complaints/new', icon: Plus, requiresAuth: false },
  { name: t('nav.complaint_list'), href: '/dashboard/complaints', icon: FileText, requiresAuth: false },
  { name: t('nav.analytics'), href: '/dashboard/analytics', icon: BarChart3, resource: 'reports', action: 'read' },
  { name: t('nav.reports'), href: '/dashboard/reports', icon: Download, resource: 'reports', action: 'read' },
  { name: t('nav.users'), href: '/dashboard/users', icon: Users, resource: 'users', action: 'read' },
  { name: t('nav.notifications'), href: '/dashboard/notifications', icon: Bell, requiresAuth: false },
  { name: t('nav.settings'), href: '/dashboard/settings', icon: Settings, resource: 'settings', action: 'read' },
  { name: t('nav.permissions'), href: '/dashboard/permissions', icon: Shield, resource: 'settings', action: 'update' },
];

interface SidebarProps {
  onItemClick?: () => void;
}

export function Sidebar({ onItemClick }: SidebarProps) {
  const location = useLocation();
  const { role } = useAuth();
  const { t } = useLanguage();
  
  const navigation = getNavigation(t);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname.startsWith(href);
  };

  const getDashboardTitle = () => {
    const titleKeys = {
      admin: 'dashboard.admin_title',
      manager: 'dashboard.manager_title',
      foreman: 'dashboard.foreman_title',
      'call-attendant': 'dashboard.call_attendant_title',
      technician: 'dashboard.technician_title'
    };
    return t(titleKeys[role]);
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          {getDashboardTitle()}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('common.role')}: {t(`role.${role.replace('-', '_')}_display`)}
        </p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          if (item.resource && item.action) {
            return (
              <PermissionGate
                key={item.name}
                resource={item.resource as any}
                action={item.action as any}
              >
                <NavLink
                  to={item.href}
                  onClick={onItemClick}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </NavLink>
              </PermissionGate>
            );
          }

          // Special role restrictions
          if (item.name === 'New Complaint' && role === 'technician') {
            return null;
          }

          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onItemClick}
              className={cn(
                'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                isActive(item.href)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <p>Ethiopian Electric Utility</p>
          <p>v2.1.0 • {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}