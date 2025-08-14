import { Bell, User, LogOut, Settings, Search, HelpCircle, Moon, Sun, Wifi, WifiOff, Battery, Clock, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserRole } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { apiService } from '@/lib/api';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, role, switchRole, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Fetch live notification count
    const fetchNotificationCount = async () => {
      try {
        const result = await apiService.getNotifications();
        if (result.success && result.data) {
          // Count only unread notifications
          const unreadCount = result.data.filter((notification: any) => !notification.isRead).length;
          setNotifications(unreadCount);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Don't show any count if there's an error
        setNotifications(0);
      }
    };

    // Initial fetch
    fetchNotificationCount();

    // Refresh notification count every 30 seconds
    const notificationInterval = setInterval(fetchNotificationCount, 30000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(notificationInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard/complaints/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, this would update the theme context
    document.documentElement.classList.toggle('dark');
  };

  const getRoleColor = (userRole: UserRole) => {
    const colors = {
      admin: 'bg-destructive text-destructive-foreground',
      manager: 'bg-warning text-warning-foreground',
      foreman: 'bg-primary text-primary-foreground',
      'call-attendant': 'bg-success text-success-foreground',
      technician: 'bg-muted text-muted-foreground'
    };
    return colors[userRole];
  };

  const getRoleTitle = (userRole: UserRole) => {
    const titleKeys = {
      admin: 'role.admin_display',
      manager: 'role.manager_display',
      foreman: 'role.foreman_display',
      'call-attendant': 'role.call_attendant_display',
      technician: 'role.technician_display'
    };
    return t(titleKeys[userRole]);
  };

  return (
    <header className="bg-card border-b border-border shadow-card sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-3">
            {/* Standard Logo */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center group cursor-pointer relative">
              {/* Subtle Glow Effect */}
              <div className="absolute inset-0 bg-gradient-eeu rounded-full blur-sm opacity-0 group-hover:opacity-20 transition-all duration-300"></div>
              
              <img 
                src="/eeu-logo-new.png" 
                alt="Ethiopian Electric Utility Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain transform group-hover:scale-105 transition-all duration-300 drop-shadow-md relative z-10"
              />
              
              {/* Simple Ring Animation */}
              <div className="absolute inset-0 border border-transparent border-t-eeu-orange/30 rounded-full opacity-0 group-hover:opacity-60 group-hover:animate-spin transition-all duration-300"></div>
            </div>
            
            {/* Organization Text */}
            <div className="hidden sm:block">
              <div className="relative inline-block mb-1">
                <h1 className="text-lg font-bold text-eeu-orange drop-shadow-lg">
                  Ethiopian Electric Utility
                </h1>
              </div>
              <div className="relative inline-block">
                <p className="text-sm font-semibold text-eeu-green">
                  Complaint Management System
                </p>
              </div>
            </div>
            
            {/* Mobile Text */}
            <div className="sm:hidden">
              <div className="relative inline-block">
                <h1 className="text-sm font-bold text-eeu-orange drop-shadow-lg">
                  EEU
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          {/* Enhanced Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center space-x-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-eeu-orange transition-colors duration-300" />
              <Input
                type="text"
                placeholder={t('common.search') + ' ' + t('nav.complaints').toLowerCase() + '...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-48 xl:w-64 h-10 border-2 border-gray-200 focus:border-eeu-orange focus:ring-2 focus:ring-eeu-orange/20 transition-all duration-300 rounded-lg bg-gray-50 focus:bg-white"
              />
              {searchQuery && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-eeu-green rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          </form>

          {/* Enhanced Mobile Search Button */}
          <Button 
            variant="outline" 
            size="icon" 
            className="lg:hidden h-10 w-10 border-2 border-gray-200 hover:border-eeu-orange hover:bg-eeu-orange/10 transition-all duration-300 rounded-lg group"
            onClick={() => navigate('/dashboard/complaints/search')}
          >
            <Search className="h-4 w-4 text-gray-600 group-hover:text-eeu-orange transition-colors duration-300" />
          </Button>

          {/* Enhanced System Status Indicators */}
          <div className="hidden xl:flex items-center space-x-3">
            {/* Time Display */}
            <div className="flex items-center space-x-2 bg-gradient-to-r from-eeu-orange/10 to-eeu-green/10 px-3 py-2 rounded-lg border border-eeu-orange/20 hover:shadow-md transition-all duration-300">
              <Clock className="h-4 w-4 text-eeu-orange" />
              <span className="text-sm font-medium text-gray-700">{format(currentTime, 'HH:mm')}</span>
            </div>
            
            {/* Connection Status */}
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-300 hover:shadow-md ${
              isOnline 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500 animate-pulse" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">{isOnline ? t('dashboard.online') : t('dashboard.offline')}</span>
            </div>
          </div>

          {/* Enhanced Role Selector */}
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-sm text-gray-600 font-medium hidden lg:block">{t('users.role')}:</span>
            <div className="relative">
              <Select value={role} onValueChange={(value: UserRole) => switchRole(value)}>
                <SelectTrigger className="w-28 lg:w-36 h-10 border-2 border-gray-200 hover:border-eeu-orange focus:border-eeu-orange focus:ring-2 focus:ring-eeu-orange/20 transition-all duration-300 rounded-lg bg-white hover:bg-gray-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-2 border-gray-200 rounded-lg shadow-xl">
                  <SelectItem value="admin" className="hover:bg-red-50 hover:text-red-700 transition-colors">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>{t('role.admin')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="manager" className="hover:bg-yellow-50 hover:text-yellow-700 transition-colors">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>{t('role.manager')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="foreman" className="hover:bg-blue-50 hover:text-blue-700 transition-colors">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{t('role.foreman')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="call-attendant" className="hover:bg-green-50 hover:text-green-700 transition-colors">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{t('role.call_attendant')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="technician" className="hover:bg-gray-50 hover:text-gray-700 transition-colors">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span>{t('role.technician')}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Enhanced Language Switcher */}
          <div className="hidden sm:block">
            <div className="bg-gradient-to-r from-eeu-orange/10 to-eeu-green/10 p-1 rounded-lg border border-eeu-orange/20 hover:shadow-md transition-all duration-300">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Enhanced Theme Toggle */}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleTheme} 
            className="hidden sm:flex h-10 w-10 border-2 border-gray-200 hover:border-eeu-orange hover:bg-eeu-orange/10 transition-all duration-300 rounded-lg"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 text-eeu-orange" />
            ) : (
              <Moon className="h-4 w-4 text-gray-600 hover:text-eeu-orange" />
            )}
          </Button>

          {/* Enhanced Notifications */}
          <Button 
            variant="outline" 
            size="icon" 
            className="relative h-10 w-10 border-2 border-gray-200 hover:border-eeu-orange hover:bg-eeu-orange/10 transition-all duration-300 rounded-lg group"
            onClick={() => navigate('/dashboard/notifications')}
          >
            <Bell className="h-4 w-4 text-gray-600 group-hover:text-eeu-orange transition-colors duration-300" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce text-[10px] font-bold shadow-lg">
                {notifications > 99 ? '99+' : notifications}
              </span>
            )}
            {notifications > 0 && (
              <div className="absolute inset-0 rounded-lg bg-red-500/20 animate-ping"></div>
            )}
          </Button>

          {/* Enhanced User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 w-12 rounded-full hover:bg-eeu-orange/10 transition-all duration-300 group">
                <div className="relative">
                  <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-eeu-orange transition-all duration-300">
                    <AvatarFallback className="bg-gradient-eeu text-white font-bold text-sm">
                      {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online Status Indicator */}
                  <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 border-2 border-gray-200 shadow-2xl rounded-xl" align="end" forceMount>
              <DropdownMenuLabel className="font-normal bg-gradient-to-r from-eeu-orange/10 to-eeu-green/10 rounded-t-lg">
                <div className="flex flex-col space-y-3 p-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                    <Badge className={`${getRoleColor(role)} shadow-sm`} variant="secondary">
                      {t(`role.${role.replace('-', '_')}_display`)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">{user?.email}</p>
                  <p className="text-xs text-eeu-orange font-medium">{getRoleTitle(role)}</p>
                  <p className="text-xs text-eeu-green font-medium">{t('common.region')}: {user?.region}</p>
                  
                  {/* Quick Stats */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-xs font-bold text-eeu-orange">Online</div>
                      <div className="text-[10px] text-gray-500">Status</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-eeu-green">{format(currentTime, 'HH:mm')}</div>
                      <div className="text-[10px] text-gray-500">Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-blue-600">{notifications}</div>
                      <div className="text-[10px] text-gray-500">Alerts</div>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-eeu-orange/10 transition-colors duration-200 rounded-lg mx-1">
                <User className="mr-3 h-4 w-4 text-eeu-orange" />
                <span className="font-medium">{t('nav.profile')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-eeu-green/10 transition-colors duration-200 rounded-lg mx-1">
                <Settings className="mr-3 h-4 w-4 text-eeu-green" />
                <span className="font-medium">{t('nav.settings')}</span>
              </DropdownMenuItem>
              
              {/* Quick Actions */}
              <DropdownMenuSeparator />
              <div className="px-2 py-1">
                <div className="text-xs font-semibold text-gray-500 mb-2">Quick Actions</div>
                <div className="grid grid-cols-2 gap-2">
                  <DropdownMenuItem className="hover:bg-blue-50 transition-colors duration-200 rounded-lg p-2 h-auto">
                    <div className="flex flex-col items-center space-y-1">
                      <Bell className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium">Alerts</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-green-50 transition-colors duration-200 rounded-lg p-2 h-auto">
                    <div className="flex flex-col items-center space-y-1">
                      <Search className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium">Search</span>
                    </div>
                  </DropdownMenuItem>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-lg mx-1 font-medium">
                <LogOut className="mr-3 h-4 w-4" />
                <span>{t('nav.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}