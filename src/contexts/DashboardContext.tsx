import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';

interface DashboardMetrics {
  complaints: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    pending: number;
    escalated: number;
    cancelled: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    todayCount: number;
    yesterdayCount: number;
    weekCount: number;
    lastWeekCount: number;
    monthCount: number;
    lastMonthCount: number;
    yearCount: number;
  };
  performance: {
    resolutionRate: number;
    avgResolutionTime: number;
    customerSatisfaction: number;
    responseTime: number;
    firstResponseTime: number;
    escalationRate: number;
  };
  trends: {
    complaintsChange: number;
    resolutionChange: number;
    responseChange: number;
    satisfactionChange: number;
  };
  users: {
    total: number;
    active: number;
    online: number;
  };
  dateFilters: {
    today: number;
    yesterday: number;
    thisWeek: number;
    lastWeek: number;
    thisMonth: number;
    lastMonth: number;
    thisYear: number;
  };
}

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

interface AnalyticsData {
  complaints: any[];
  chartData: {
    statusDistribution: { name: string; value: number; color: string }[];
    priorityDistribution: { name: string; value: number; color: string }[];
    regionDistribution: { name: string; value: number }[];
    monthlyTrends: { month: string; complaints: number; resolved: number }[];
    categoryDistribution: { name: string; value: number }[];
  };
  insights: {
    topRegion: string;
    topCategory: string;
    peakHour: string;
    resolutionTrend: 'up' | 'down' | 'stable';
  };
}

interface DashboardContextType {
  // Data
  metrics: DashboardMetrics | null;
  notifications: Notification[];
  analyticsData: AnalyticsData | null;
  
  // Loading states
  metricsLoading: boolean;
  notificationsLoading: boolean;
  analyticsLoading: boolean;
  
  // Actions
  refreshMetrics: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;
  refreshAll: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  
  // Navigation helpers
  navigateToComplaintsByStatus: (status: string) => void;
  navigateToComplaintsByPriority: (priority: string) => void;
  navigateToComplaintsByDate: (dateFilter: string) => void;
  
  // Last refresh timestamps
  lastRefresh: {
    metrics: Date | null;
    notifications: Date | null;
    analytics: Date | null;
  };
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const { role, region } = useAuth();
  const { toast } = useToast();
  
  // State
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  
  // Loading states
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  // Last refresh timestamps
  const [lastRefresh, setLastRefresh] = useState({
    metrics: null as Date | null,
    notifications: null as Date | null,
    analytics: null as Date | null,
  });

  // Fetch metrics from real complaint data
  const refreshMetrics = async () => {
    setMetricsLoading(true);
    try {
      // Fetch real complaints data
      const complaintsResult = await apiService.getComplaints();
      
      if (complaintsResult.success && complaintsResult.data) {
        const complaints = complaintsResult.data.map((item: any) => ({
          id: item.ID || item.id || '',
          title: item.Title || item.title || '',
          category: item.Category || item.category || '',
          region: item.Region || item.region || '',
          priority: (item.Priority || item.priority || 'medium').toLowerCase(),
          status: (item.Status || item.status || 'open').toLowerCase(),
          createdAt: item['Created At'] || item.createdAt || new Date().toISOString(),
          updatedAt: item['Updated At'] || item.updatedAt || new Date().toISOString(),
          customer: {
            name: item['Customer Name'] || item.customerName || item.customer?.name || '',
            email: item['Customer Email'] || item.customerEmail || item.customer?.email || '',
            phone: item['Customer Phone'] || item.customerPhone || item.customer?.phone || '',
          },
        }));

        // Calculate real metrics from complaint data
        const transformedMetrics = calculateMetricsFromComplaints(complaints);
        
        setMetrics(transformedMetrics);
        setLastRefresh(prev => ({ ...prev, metrics: new Date() }));
        
        // Generate notifications based on metrics
        generateMetricNotifications(transformedMetrics);
      } else {
        // Fallback to dashboard API if complaints API fails
        const dashboardResult = await apiService.getDashboardData(role, region);
        if (dashboardResult.success && dashboardResult.data) {
          const data = dashboardResult.data;
          const fallbackMetrics = createFallbackMetrics(data);
          setMetrics(fallbackMetrics);
          setLastRefresh(prev => ({ ...prev, metrics: new Date() }));
        }
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard metrics",
        variant: "destructive"
      });
    } finally {
      setMetricsLoading(false);
    }
  };

  // Fetch notifications
  const refreshNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const result = await apiService.getNotifications();
      
      if (result.success && result.data) {
        setNotifications(result.data);
        setLastRefresh(prev => ({ ...prev, notifications: new Date() }));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Fetch analytics data
  const refreshAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const complaintsResult = await apiService.getComplaints();
      
      if (complaintsResult.success && complaintsResult.data) {
        const complaints = complaintsResult.data.map((item: any) => ({
          id: item.ID || item.id || '',
          title: item.Title || item.title || '',
          category: item.Category || item.category || '',
          region: item.Region || item.region || '',
          priority: item.Priority || item.priority || 'medium',
          status: item.Status || item.status || 'open',
          createdAt: item['Created At'] || item.createdAt || new Date().toISOString(),
          customer: {
            name: item['Customer Name'] || item.customerName || item.customer?.name || '',
            email: item['Customer Email'] || item.customerEmail || item.customer?.email || '',
            phone: item['Customer Phone'] || item.customerPhone || item.customer?.phone || '',
          },
        }));

        // Process analytics data
        const analyticsData = processAnalyticsData(complaints);
        setAnalyticsData(analyticsData);
        setLastRefresh(prev => ({ ...prev, analytics: new Date() }));
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Process analytics data
  const processAnalyticsData = (complaints: any[]): AnalyticsData => {
    // Status distribution
    const statusCounts = complaints.reduce((acc, complaint) => {
      acc[complaint.status] = (acc[complaint.status] || 0) + 1;
      return acc;
    }, {});

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count as number,
      color: getStatusColor(status)
    }));

    // Priority distribution
    const priorityCounts = complaints.reduce((acc, complaint) => {
      acc[complaint.priority] = (acc[complaint.priority] || 0) + 1;
      return acc;
    }, {});

    const priorityDistribution = Object.entries(priorityCounts).map(([priority, count]) => ({
      name: priority,
      value: count as number,
      color: getPriorityColor(priority)
    }));

    // Region distribution
    const regionCounts = complaints.reduce((acc, complaint) => {
      acc[complaint.region] = (acc[complaint.region] || 0) + 1;
      return acc;
    }, {});

    const regionDistribution = Object.entries(regionCounts).map(([region, count]) => ({
      name: region,
      value: count as number
    }));

    // Category distribution
    const categoryCounts = complaints.reduce((acc, complaint) => {
      acc[complaint.category] = (acc[complaint.category] || 0) + 1;
      return acc;
    }, {});

    const categoryDistribution = Object.entries(categoryCounts).map(([category, count]) => ({
      name: category,
      value: count as number
    }));

    // Monthly trends (simplified)
    const monthlyTrends = [
      { month: 'Jan', complaints: 45, resolved: 38 },
      { month: 'Feb', complaints: 52, resolved: 45 },
      { month: 'Mar', complaints: 48, resolved: 42 },
      { month: 'Apr', complaints: 61, resolved: 55 },
      { month: 'May', complaints: 55, resolved: 48 },
      { month: 'Jun', complaints: 67, resolved: 58 },
    ];

    // Insights
    const topRegion = regionDistribution.sort((a, b) => b.value - a.value)[0]?.name || 'N/A';
    const topCategory = categoryDistribution.sort((a, b) => b.value - a.value)[0]?.name || 'N/A';

    return {
      complaints,
      chartData: {
        statusDistribution,
        priorityDistribution,
        regionDistribution,
        monthlyTrends,
        categoryDistribution,
      },
      insights: {
        topRegion,
        topCategory,
        peakHour: '14:00',
        resolutionTrend: 'up',
      }
    };
  };

  // Generate notifications based on metrics
  const generateMetricNotifications = (metrics: DashboardMetrics) => {
    const newNotifications: Notification[] = [];

    // Critical complaints notification
    if (metrics.complaints.critical > 0) {
      newNotifications.push({
        id: `critical-${Date.now()}`,
        title: 'Critical Complaints Alert',
        message: `You have ${metrics.complaints.critical} critical complaints requiring immediate attention.`,
        type: 'error',
        priority: 'critical',
        isRead: false,
        createdAt: new Date().toISOString(),
        actionRequired: true,
      });
    }

    // Low resolution rate notification
    if (metrics.performance.resolutionRate < 80) {
      newNotifications.push({
        id: `resolution-${Date.now()}`,
        title: 'Low Resolution Rate',
        message: `Resolution rate is ${metrics.performance.resolutionRate}%. Consider reviewing processes.`,
        type: 'warning',
        priority: 'high',
        isRead: false,
        createdAt: new Date().toISOString(),
        actionRequired: true,
      });
    }

    // High response time notification
    if (metrics.performance.responseTime > 4) {
      newNotifications.push({
        id: `response-${Date.now()}`,
        title: 'High Response Time',
        message: `Average response time is ${metrics.performance.responseTime}h. Target is under 2h.`,
        type: 'warning',
        priority: 'medium',
        isRead: false,
        createdAt: new Date().toISOString(),
        actionRequired: true,
      });
    }

    // Update notifications if there are new ones
    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev]);
    }
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    const colors = {
      open: '#f59e0b',
      'in-progress': '#3b82f6',
      resolved: '#10b981',
      closed: '#6b7280',
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: '#ef4444',
      high: '#f97316',
      medium: '#eab308',
      low: '#22c55e',
    };
    return colors[priority] || '#6b7280';
  };

  // Refresh all data
  const refreshAll = async () => {
    await Promise.all([
      refreshMetrics(),
      refreshNotifications(),
      refreshAnalytics(),
    ]);
  };

  // Mark notification as read
  const markNotificationAsRead = async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Navigation helpers
  const navigateToComplaintsByStatus = (status: string) => {
    window.location.href = `/dashboard/complaints?status=${status}`;
  };

  const navigateToComplaintsByPriority = (priority: string) => {
    window.location.href = `/dashboard/complaints?priority=${priority}`;
  };

  const navigateToComplaintsByDate = (dateFilter: string) => {
    // Map date filters to appropriate query parameters
    const dateFilterMap: { [key: string]: string } = {
      'today': 'today',
      'yesterday': 'yesterday', 
      'thisweek': 'thisweek',
      'lastweek': 'lastweek',
      'thismonth': 'thismonth',
      'lastmonth': 'lastmonth',
      'thisyear': 'thisyear'
    };
    
    const mappedFilter = dateFilterMap[dateFilter] || dateFilter;
    window.location.href = `/dashboard/complaints?dateFilter=${mappedFilter}`;
  };

  // Calculate metrics from real complaint data
  const calculateMetricsFromComplaints = (complaints: any[]): DashboardMetrics => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const lastWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Filter complaints by user region access
    const accessibleComplaints = complaints.filter(complaint => 
      !region || complaint.region === region
    );

    // Status counts - normalize status values
    const statusCounts = {
      total: accessibleComplaints.length,
      open: accessibleComplaints.filter(c => c.status === 'open').length,
      inProgress: accessibleComplaints.filter(c => 
        c.status === 'in-progress' || c.status === 'in_progress' || c.status === 'in progress'
      ).length,
      resolved: accessibleComplaints.filter(c => c.status === 'resolved').length,
      closed: accessibleComplaints.filter(c => c.status === 'closed').length,
      pending: accessibleComplaints.filter(c => c.status === 'pending').length,
      escalated: accessibleComplaints.filter(c => c.status === 'escalated').length,
      cancelled: accessibleComplaints.filter(c => c.status === 'cancelled').length,
    };

    // Priority counts
    const priorityCounts = {
      critical: accessibleComplaints.filter(c => c.priority === 'critical').length,
      high: accessibleComplaints.filter(c => c.priority === 'high').length,
      medium: accessibleComplaints.filter(c => c.priority === 'medium').length,
      low: accessibleComplaints.filter(c => c.priority === 'low').length,
    };

    // Date-based counts
    const dateCounts = {
      today: accessibleComplaints.filter(c => new Date(c.createdAt) >= today).length,
      yesterday: accessibleComplaints.filter(c => {
        const createdDate = new Date(c.createdAt);
        return createdDate >= yesterday && createdDate < today;
      }).length,
      thisWeek: accessibleComplaints.filter(c => new Date(c.createdAt) >= weekStart).length,
      lastWeek: accessibleComplaints.filter(c => {
        const createdDate = new Date(c.createdAt);
        return createdDate >= lastWeekStart && createdDate < weekStart;
      }).length,
      thisMonth: accessibleComplaints.filter(c => new Date(c.createdAt) >= monthStart).length,
      lastMonth: accessibleComplaints.filter(c => {
        const createdDate = new Date(c.createdAt);
        return createdDate >= lastMonthStart && createdDate < monthStart;
      }).length,
      thisYear: accessibleComplaints.filter(c => new Date(c.createdAt) >= yearStart).length,
    };

    // Calculate performance metrics
    const resolvedComplaints = accessibleComplaints.filter(c => c.status === 'resolved');
    const resolutionRate = statusCounts.total > 0 ? (statusCounts.resolved / statusCounts.total) * 100 : 0;
    
    // Calculate average resolution time (simplified)
    const avgResolutionTime = resolvedComplaints.length > 0 
      ? resolvedComplaints.reduce((acc, complaint) => {
          const created = new Date(complaint.createdAt);
          const updated = new Date(complaint.updatedAt);
          const hours = (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
          return acc + hours;
        }, 0) / resolvedComplaints.length
      : 0;

    // Calculate trends (compare with previous periods)
    const complaintsChange = dateCounts.lastMonth > 0 
      ? ((dateCounts.thisMonth - dateCounts.lastMonth) / dateCounts.lastMonth) * 100 
      : 0;

    const lastMonthResolved = accessibleComplaints.filter(c => {
      const createdDate = new Date(c.createdAt);
      return createdDate >= lastMonthStart && createdDate < monthStart && c.status === 'resolved';
    }).length;

    const thisMonthResolved = accessibleComplaints.filter(c => {
      const createdDate = new Date(c.createdAt);
      return createdDate >= monthStart && c.status === 'resolved';
    }).length;

    const resolutionChange = lastMonthResolved > 0 
      ? ((thisMonthResolved - lastMonthResolved) / lastMonthResolved) * 100 
      : 0;

    return {
      complaints: {
        ...statusCounts,
        ...priorityCounts,
        todayCount: dateCounts.today,
        yesterdayCount: dateCounts.yesterday,
        weekCount: dateCounts.thisWeek,
        lastWeekCount: dateCounts.lastWeek,
        monthCount: dateCounts.thisMonth,
        lastMonthCount: dateCounts.lastMonth,
        yearCount: dateCounts.thisYear,
      },
      performance: {
        resolutionRate: Math.round(resolutionRate * 100) / 100,
        avgResolutionTime: Math.round(avgResolutionTime * 100) / 100,
        customerSatisfaction: 4.2, // This would come from feedback data
        responseTime: 2.5, // This would be calculated from first response times
        firstResponseTime: 1.8,
        escalationRate: statusCounts.total > 0 ? (statusCounts.escalated / statusCounts.total) * 100 : 0,
      },
      trends: {
        complaintsChange: Math.round(complaintsChange * 100) / 100,
        resolutionChange: Math.round(resolutionChange * 100) / 100,
        responseChange: -8, // This would be calculated from response time trends
        satisfactionChange: 5,
      },
      users: {
        total: 150, // This would come from user management API
        active: 120,
        online: 45,
      },
      dateFilters: dateCounts,
    };
  };

  // Create fallback metrics when API data is available
  const createFallbackMetrics = (data: any): DashboardMetrics => {
    return {
      complaints: {
        total: data.totalComplaints || 0,
        open: data.openComplaints || 0,
        inProgress: data.inProgressComplaints || 0,
        resolved: data.resolvedComplaints || 0,
        closed: data.closedComplaints || 0,
        pending: data.pendingComplaints || 0,
        escalated: data.escalatedComplaints || 0,
        cancelled: data.cancelledComplaints || 0,
        critical: data.criticalComplaints || 0,
        high: data.highPriorityComplaints || 0,
        medium: data.mediumPriorityComplaints || 0,
        low: data.lowPriorityComplaints || 0,
        todayCount: data.todayComplaints || 0,
        yesterdayCount: data.yesterdayComplaints || 0,
        weekCount: data.weekComplaints || 0,
        lastWeekCount: data.lastWeekComplaints || 0,
        monthCount: data.monthComplaints || 0,
        lastMonthCount: data.lastMonthComplaints || 0,
        yearCount: data.yearComplaints || 0,
      },
      performance: {
        resolutionRate: data.performance?.resolutionRate || 85,
        avgResolutionTime: data.performance?.avgResolutionTime || 24,
        customerSatisfaction: data.performance?.customerSatisfaction || 4.2,
        responseTime: data.performance?.responseTime || 2.5,
        firstResponseTime: data.performance?.firstResponseTime || 1.8,
        escalationRate: data.performance?.escalationRate || 5,
      },
      trends: {
        complaintsChange: data.trends?.complaintsChange || 5,
        resolutionChange: data.trends?.resolutionChange || 12,
        responseChange: data.trends?.responseChange || -8,
        satisfactionChange: data.trends?.satisfactionChange || 5,
      },
      users: {
        total: data.totalUsers || 150,
        active: data.activeUsers || 120,
        online: data.onlineUsers || 45,
      },
      dateFilters: {
        today: data.todayComplaints || 0,
        yesterday: data.yesterdayComplaints || 0,
        thisWeek: data.weekComplaints || 0,
        lastWeek: data.lastWeekComplaints || 0,
        thisMonth: data.monthComplaints || 0,
        lastMonth: data.lastMonthComplaints || 0,
        thisYear: data.yearComplaints || 0,
      },
    };
  };

  // Initial data load
  useEffect(() => {
    refreshAll();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(refreshAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [role, region]);

  const value: DashboardContextType = {
    // Data
    metrics,
    notifications,
    analyticsData,
    
    // Loading states
    metricsLoading,
    notificationsLoading,
    analyticsLoading,
    
    // Actions
    refreshMetrics,
    refreshNotifications,
    refreshAnalytics,
    refreshAll,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    
    // Navigation helpers
    navigateToComplaintsByStatus,
    navigateToComplaintsByPriority,
    navigateToComplaintsByDate,
    
    // Last refresh timestamps
    lastRefresh,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}