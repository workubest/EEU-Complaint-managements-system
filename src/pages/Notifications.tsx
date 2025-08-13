import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Zap,
  Clock,
  Users,
  Settings,
  RefreshCw,
  BarChart3,
  FileText,
  Eye,
  CheckCheck,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: string;
  relatedComplaintId?: string;
  actionRequired?: boolean;
}

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date(dateString).toLocaleDateString();
  }
};

export function Notifications() {
  const { role, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread' | 'action-required'>('all');
  
  const {
    notifications,
    notificationsLoading,
    refreshNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    lastRefresh,
    navigateToComplaintsByStatus,
  } = useDashboard();

  const handleRefresh = () => {
    refreshNotifications();
  };

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
  };



  const getNotificationIcon = (type: Notification['type']) => {
    const icons = {
      info: Info,
      warning: AlertTriangle,
      success: CheckCircle,
      error: Zap,
      system: Settings
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
    const colors = {
      info: 'text-primary border-primary/20 bg-primary/5',
      warning: 'text-warning border-warning/20 bg-warning/5',
      success: 'text-success border-success/20 bg-success/5',
      error: 'text-destructive border-destructive/20 bg-destructive/5',
      system: 'text-muted-foreground border-border bg-muted/20'
    };
    return colors[type] || 'text-muted-foreground border-border bg-muted/20';
  };

  const getPriorityBadge = (priority: Notification['priority']) => {
    const configs = {
      low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
      medium: { label: 'Medium', className: 'bg-primary/10 text-primary' },
      high: { label: 'High', className: 'bg-warning/10 text-warning' },
      critical: { label: 'Critical', className: 'bg-destructive/10 text-destructive' }
    };
    return configs[priority] || { label: 'Unknown', className: 'bg-muted text-muted-foreground' };
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter(notification => notification.id !== notificationId));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'action-required') return notification.actionRequired;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.isRead).length;

  if (notificationsLoading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with system alerts and complaint notifications
          </p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <RefreshCw className="h-4 w-4" />
              <span>Last updated: {lastRefresh.notifications ? format(lastRefresh.notifications, 'HH:mm:ss') : 'Never'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Navigation to other pages */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/analytics')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={notificationsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${notificationsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">All notifications</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Required</CardTitle>
            <Zap className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{actionRequiredCount}</div>
            <p className="text-xs text-muted-foreground">Need immediate action</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filter === 'action-required' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('action-required')}
        >
          Action Required ({actionRequiredCount})
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {filteredNotifications.length === 0 ? (
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? "You're all caught up!" 
                  : filter === 'unread' 
                    ? "No unread notifications"
                    : "No action required at the moment"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification, index) => {
            const Icon = getNotificationIcon(notification.type);
            const priorityConfig = getPriorityBadge(notification.priority);
            
            return (
              <Card 
                key={notification.id} 
                className={`border transition-all duration-200 hover:shadow-md ${
                  !notification.isRead ? 'ring-2 ring-primary/20' : ''
                } ${getNotificationColor(notification.type, notification.priority)}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getNotificationColor(notification.type, notification.priority)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-foreground">{notification.title}</h3>
                          <Badge className={priorityConfig.className} variant="secondary">
                            {priorityConfig.label}
                          </Badge>
                          {notification.actionRequired && (
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                              Action Required
                            </Badge>
                          )}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{formatDate(notification.createdAt)}</span>
                          {notification.relatedComplaintId && (
                            <span className="text-primary">
                              Related: {notification.relatedComplaintId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {notification.relatedComplaintId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/dashboard/complaints/${notification.relatedComplaintId}`)}
                          className="text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      )}
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {notification.actionRequired && (
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {notification.relatedComplaintId ? (
                        <Button 
                          size="sm" 
                          onClick={() => navigate(`/dashboard/complaints/${notification.relatedComplaintId}`)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Complaint
                        </Button>
                      ) : notification.title.includes('Critical') ? (
                        <Button 
                          size="sm" 
                          onClick={() => navigateToComplaintsByStatus('open')}
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          View Critical
                        </Button>
                      ) : notification.title.includes('Resolution') ? (
                        <Button 
                          size="sm" 
                          onClick={() => navigate('/dashboard/analytics')}
                        >
                          <BarChart3 className="h-3 w-3 mr-1" />
                          View Analytics
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => navigate('/dashboard')}
                        >
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Go to Dashboard
                        </Button>
                      )}
                      
                      {!notification.isRead && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Summary Card */}
      <Card className="border-border animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Notification Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-foreground">{notifications.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-primary">{unreadCount}</div>
              <div className="text-sm text-muted-foreground">Unread</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-warning">{actionRequiredCount}</div>
              <div className="text-sm text-muted-foreground">Action Required</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-success">
                {notifications.filter(n => n.type === 'success').length}
              </div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}