import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
  BarChart3,
  RefreshCw,
  Calendar,
  MapPin,
  Zap,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Bell
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';



export function Dashboard() {
  const { user, role, region } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    metrics,
    notifications,
    metricsLoading,
    refreshMetrics,
    lastRefresh,
    navigateToComplaintsByStatus,
    navigateToComplaintsByDate,
  } = useDashboard();

  const handleRefresh = () => {
    refreshMetrics();
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${user?.name}`;
  };

  const getRoleTitle = () => {
    const titles = {
      admin: 'System Administrator',
      manager: 'Regional Manager',
      foreman: 'Field Supervisor',
      'call-attendant': 'Customer Service',
      technician: 'Field Technician'
    };
    return titles[role] || 'Dashboard';
  };

  if (metricsLoading && !metrics) {
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {getWelcomeMessage()}
          </h1>
          <p className="text-muted-foreground mt-1">
            {getRoleTitle()} • {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
            {region && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{region}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <RefreshCw className="h-4 w-4" />
              <span>Last updated: {lastRefresh.metrics ? format(lastRefresh.metrics, 'HH:mm:ss') : 'Never'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Notifications Indicator */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/notifications')}
            className="relative"
          >
            <Bell className="h-4 w-4 mr-2" />
            Notifications
            {notifications.filter(n => !n.isRead).length > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {notifications.filter(n => !n.isRead).length}
              </Badge>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={metricsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${metricsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/dashboard/complaints/new')}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Complaint
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Complaints */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/complaints')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.complaints.total || 0}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {metrics?.trends.complaintsChange && metrics.trends.complaintsChange > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-red-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-green-500" />
              )}
              <span>
                {Math.abs(metrics?.trends.complaintsChange || 0)}% from last month
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/dashboard/complaints');
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              View All
            </Button>
          </CardContent>
        </Card>

        {/* Open Complaints */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToComplaintsByStatus('open')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Complaints</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics?.complaints.open || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Requires attention
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2"
              onClick={(e) => {
                e.stopPropagation();
                navigateToComplaintsByStatus('open');
              }}
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              View Open
            </Button>
          </CardContent>
        </Card>

        {/* Resolved Complaints */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToComplaintsByStatus('resolved')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics?.complaints.resolved || 0}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>
                {metrics?.trends.resolutionChange || 0}% improvement
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2"
              onClick={(e) => {
                e.stopPropagation();
                navigateToComplaintsByStatus('resolved');
              }}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              View Resolved
            </Button>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToComplaintsByStatus('in-progress')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics?.complaints.inProgress || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Being processed
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2"
              onClick={(e) => {
                e.stopPropagation();
                navigateToComplaintsByStatus('in-progress');
              }}
            >
              <Activity className="h-3 w-3 mr-1" />
              View Progress
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pending */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToComplaintsByStatus('pending')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {metrics?.complaints.pending || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Awaiting review
            </div>
          </CardContent>
        </Card>

        {/* Escalated */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToComplaintsByStatus('escalated')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalated</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics?.complaints.escalated || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Requires attention
            </div>
          </CardContent>
        </Card>

        {/* Closed */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToComplaintsByStatus('closed')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {metrics?.complaints.closed || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Completed
            </div>
          </CardContent>
        </Card>

        {/* Resolution Rate */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics?.performance.resolutionRate || 0}%
            </div>
            <Progress 
              value={metrics?.performance.resolutionRate || 0} 
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Target: 90%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Distribution & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Priority Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Critical</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metrics?.complaints.critical || 0}</span>
                  <Badge variant="destructive" className="text-xs">
                    {metrics?.complaints.total ? Math.round((metrics.complaints.critical / metrics.complaints.total) * 100) : 0}%
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">High</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metrics?.complaints.high || 0}</span>
                  <Badge variant="secondary" className="text-xs">
                    {metrics?.complaints.total ? Math.round((metrics.complaints.high / metrics.complaints.total) * 100) : 0}%
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Medium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metrics?.complaints.medium || 0}</span>
                  <Badge variant="outline" className="text-xs">
                    {metrics?.complaints.total ? Math.round((metrics.complaints.medium / metrics.complaints.total) * 100) : 0}%
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Low</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metrics?.complaints.low || 0}</span>
                  <Badge variant="outline" className="text-xs">
                    {metrics?.complaints.total ? Math.round((metrics.complaints.low / metrics.complaints.total) * 100) : 0}%
                  </Badge>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/dashboard/analytics')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Detailed Analytics
            </Button>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Avg. Resolution Time</span>
                  <span className="text-sm text-muted-foreground">
                    {metrics?.performance.avgResolutionTime || 0}h
                  </span>
                </div>
                <Progress value={Math.min((48 - (metrics?.performance.avgResolutionTime || 0)) / 48 * 100, 100)} />
                <div className="text-xs text-muted-foreground mt-1">Target: &lt; 24h</div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="text-sm text-muted-foreground">
                    {metrics?.performance.responseTime || 0}h
                  </span>
                </div>
                <Progress value={Math.min((4 - (metrics?.performance.responseTime || 0)) / 4 * 100, 100)} />
                <div className="text-xs text-muted-foreground mt-1">Target: &lt; 2h</div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Customer Satisfaction</span>
                  <span className="text-sm text-muted-foreground">
                    {metrics?.performance.customerSatisfaction || 0}/5.0
                  </span>
                </div>
                <Progress value={(metrics?.performance.customerSatisfaction || 0) / 5 * 100} />
                <div className="text-xs text-muted-foreground mt-1">Target: &gt; 4.0</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Day Filters & Time-based Analytics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Complaints by Time Period</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Daily Comparison */}
              <div>
                <h4 className="text-sm font-medium mb-3">Daily Activity</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className="p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200"
                    onClick={() => navigateToComplaintsByDate('today')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {metrics?.complaints.todayCount || 0}
                        </div>
                        <div className="text-sm text-blue-700">Today</div>
                      </div>
                      <Calendar className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="text-xs text-blue-600 mt-2">
                      {metrics?.complaints.yesterdayCount !== undefined && (
                        <>
                          {metrics.complaints.todayCount > metrics.complaints.yesterdayCount ? (
                            <span className="flex items-center">
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                              +{metrics.complaints.todayCount - metrics.complaints.yesterdayCount} from yesterday
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <ArrowDownRight className="h-3 w-3 mr-1" />
                              {metrics.complaints.todayCount - metrics.complaints.yesterdayCount} from yesterday
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div 
                    className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                    onClick={() => navigateToComplaintsByDate('yesterday')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-gray-600">
                          {metrics?.complaints.yesterdayCount || 0}
                        </div>
                        <div className="text-sm text-gray-700">Yesterday</div>
                      </div>
                      <Clock className="h-6 w-6 text-gray-500" />
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      Previous day activity
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Comparison */}
              <div>
                <h4 className="text-sm font-medium mb-3">Weekly Activity</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className="p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors border border-green-200"
                    onClick={() => navigateToComplaintsByDate('thisweek')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {metrics?.complaints.weekCount || 0}
                        </div>
                        <div className="text-sm text-green-700">This Week</div>
                      </div>
                      <Calendar className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="text-xs text-green-600 mt-2">
                      {metrics?.complaints.lastWeekCount !== undefined && (
                        <>
                          {metrics.complaints.weekCount > metrics.complaints.lastWeekCount ? (
                            <span className="flex items-center">
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                              +{metrics.complaints.weekCount - metrics.complaints.lastWeekCount} from last week
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <ArrowDownRight className="h-3 w-3 mr-1" />
                              {metrics.complaints.weekCount - metrics.complaints.lastWeekCount} from last week
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div 
                    className="p-4 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors border border-orange-200"
                    onClick={() => navigateToComplaintsByDate('lastweek')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {metrics?.complaints.lastWeekCount || 0}
                        </div>
                        <div className="text-sm text-orange-700">Last Week</div>
                      </div>
                      <Calendar className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="text-xs text-orange-600 mt-2">
                      Previous week activity
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Comparison */}
              <div>
                <h4 className="text-sm font-medium mb-3">Monthly Activity</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className="p-4 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors border border-purple-200"
                    onClick={() => navigateToComplaintsByDate('thismonth')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {metrics?.complaints.monthCount || 0}
                        </div>
                        <div className="text-sm text-purple-700">This Month</div>
                      </div>
                      <Calendar className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className="text-xs text-purple-600 mt-2">
                      {metrics?.complaints.lastMonthCount !== undefined && (
                        <>
                          {metrics.complaints.monthCount > metrics.complaints.lastMonthCount ? (
                            <span className="flex items-center">
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                              +{metrics.complaints.monthCount - metrics.complaints.lastMonthCount} from last month
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <ArrowDownRight className="h-3 w-3 mr-1" />
                              {metrics.complaints.monthCount - metrics.complaints.lastMonthCount} from last month
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div 
                    className="p-4 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors border border-indigo-200"
                    onClick={() => navigateToComplaintsByDate('lastmonth')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {metrics?.complaints.lastMonthCount || 0}
                        </div>
                        <div className="text-sm text-indigo-700">Last Month</div>
                      </div>
                      <Calendar className="h-6 w-6 text-indigo-500" />
                    </div>
                    <div className="text-xs text-indigo-600 mt-2">
                      Previous month activity
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">System Status</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    Online - Live Data
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/dashboard/complaints/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Complaint
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/dashboard/complaints')}
            >
              <FileText className="h-4 w-4 mr-2" />
              View All Complaints
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/dashboard/analytics')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            
            {(role === 'admin' || role === 'manager') && (
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/dashboard/users')}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comprehensive Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Complete Status Overview - Live Data</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Real-time complaint status distribution with live updates
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {/* Open Status */}
            <div 
              className="p-3 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors border border-orange-200"
              onClick={() => navigateToComplaintsByStatus('open')}
            >
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <Badge variant="secondary" className="text-xs">
                  {metrics?.complaints.total ? Math.round((metrics.complaints.open / metrics.complaints.total) * 100) : 0}%
                </Badge>
              </div>
              <div className="text-lg font-bold text-orange-600">
                {metrics?.complaints.open || 0}
              </div>
              <div className="text-xs text-orange-700">Open</div>
            </div>

            {/* In Progress Status */}
            <div 
              className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200"
              onClick={() => navigateToComplaintsByStatus('in-progress')}
            >
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <Badge variant="secondary" className="text-xs">
                  {metrics?.complaints.total ? Math.round((metrics.complaints.inProgress / metrics.complaints.total) * 100) : 0}%
                </Badge>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {metrics?.complaints.inProgress || 0}
              </div>
              <div className="text-xs text-blue-700">In Progress</div>
            </div>

            {/* Pending Status */}
            <div 
              className="p-3 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors border border-yellow-200"
              onClick={() => navigateToComplaintsByStatus('pending')}
            >
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <Badge variant="secondary" className="text-xs">
                  {metrics?.complaints.total ? Math.round((metrics.complaints.pending / metrics.complaints.total) * 100) : 0}%
                </Badge>
              </div>
              <div className="text-lg font-bold text-yellow-600">
                {metrics?.complaints.pending || 0}
              </div>
              <div className="text-xs text-yellow-700">Pending</div>
            </div>

            {/* Escalated Status */}
            <div 
              className="p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors border border-red-200"
              onClick={() => navigateToComplaintsByStatus('escalated')}
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-4 w-4 text-red-500" />
                <Badge variant="destructive" className="text-xs">
                  {metrics?.complaints.total ? Math.round((metrics.complaints.escalated / metrics.complaints.total) * 100) : 0}%
                </Badge>
              </div>
              <div className="text-lg font-bold text-red-600">
                {metrics?.complaints.escalated || 0}
              </div>
              <div className="text-xs text-red-700">Escalated</div>
            </div>

            {/* Resolved Status */}
            <div 
              className="p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors border border-green-200"
              onClick={() => navigateToComplaintsByStatus('resolved')}
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                  {metrics?.complaints.total ? Math.round((metrics.complaints.resolved / metrics.complaints.total) * 100) : 0}%
                </Badge>
              </div>
              <div className="text-lg font-bold text-green-600">
                {metrics?.complaints.resolved || 0}
              </div>
              <div className="text-xs text-green-700">Resolved</div>
            </div>

            {/* Closed Status */}
            <div 
              className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
              onClick={() => navigateToComplaintsByStatus('closed')}
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="h-4 w-4 text-gray-500" />
                <Badge variant="secondary" className="text-xs">
                  {metrics?.complaints.total ? Math.round((metrics.complaints.closed / metrics.complaints.total) * 100) : 0}%
                </Badge>
              </div>
              <div className="text-lg font-bold text-gray-600">
                {metrics?.complaints.closed || 0}
              </div>
              <div className="text-xs text-gray-700">Closed</div>
            </div>

            {/* Cancelled Status */}
            <div 
              className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors border border-slate-200"
              onClick={() => navigateToComplaintsByStatus('cancelled')}
            >
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="h-4 w-4 text-slate-500" />
                <Badge variant="secondary" className="text-xs">
                  {metrics?.complaints.total ? Math.round((metrics.complaints.cancelled / metrics.complaints.total) * 100) : 0}%
                </Badge>
              </div>
              <div className="text-lg font-bold text-slate-600">
                {metrics?.complaints.cancelled || 0}
              </div>
              <div className="text-xs text-slate-700">Cancelled</div>
            </div>

            {/* Total Summary */}
            <div 
              className="p-3 bg-primary/5 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors border border-primary/20"
              onClick={() => navigate('/dashboard/complaints')}
            >
              <div className="flex items-center justify-between mb-2">
                <FileText className="h-4 w-4 text-primary" />
                <Badge variant="default" className="text-xs">
                  100%
                </Badge>
              </div>
              <div className="text-lg font-bold text-primary">
                {metrics?.complaints.total || 0}
              </div>
              <div className="text-xs text-primary">Total</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">
                  Live data - Last updated: {lastRefresh.metrics ? format(lastRefresh.metrics, 'HH:mm:ss') : 'Never'}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard/analytics')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Detailed Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}