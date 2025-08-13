import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  Users, 
  Zap, 
  AlertTriangle,
  MapPin,
  Calendar,
  Download, 
  FileText, 
  Share2,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Activity,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export function Analytics() {
  const { role, region } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    analyticsData,
    metrics,
    analyticsLoading,
    refreshAnalytics,
    lastRefresh,
    navigateToComplaintsByStatus,
    navigateToComplaintsByPriority,
  } = useDashboard();

  const handleRefresh = () => {
    refreshAnalytics();
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Analytics report is being generated...",
      variant: "default"
    });
    // Export functionality would be implemented here
  };

  if (analyticsLoading && !analyticsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights and performance metrics
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
              <span>Last updated: {lastRefresh.analytics ? format(lastRefresh.analytics, 'HH:mm:ss') : 'Never'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
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
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={analyticsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${analyticsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Complaints */}
        <Card className="hover:shadow-lg transition-shadow">
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
          </CardContent>
        </Card>

        {/* Resolution Rate */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics?.performance.resolutionRate || 0}%
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>
                {metrics?.trends.resolutionChange || 0}% improvement
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Average Response Time */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics?.performance.responseTime || 0}h
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {metrics?.trends.responseChange && metrics.trends.responseChange < 0 ? (
                <ArrowDownRight className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowUpRight className="h-3 w-3 text-red-500" />
              )}
              <span>
                {Math.abs(metrics?.trends.responseChange || 0)}% change
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Customer Satisfaction */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metrics?.performance.customerSatisfaction || 0}/5.0
            </div>
            <div className="text-xs text-muted-foreground">
              Based on resolved complaints
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Status Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded"
                onClick={() => navigateToComplaintsByStatus('open')}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Open</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metrics?.complaints.open || 0}</span>
                  <Badge variant="secondary" className="text-xs">
                    {metrics?.complaints.total ? Math.round((metrics.complaints.open / metrics.complaints.total) * 100) : 0}%
                  </Badge>
                  <Eye className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
              
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded"
                onClick={() => navigateToComplaintsByStatus('in-progress')}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">In Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metrics?.complaints.inProgress || 0}</span>
                  <Badge variant="secondary" className="text-xs">
                    {metrics?.complaints.total ? Math.round((metrics.complaints.inProgress / metrics.complaints.total) * 100) : 0}%
                  </Badge>
                  <Eye className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
              
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded"
                onClick={() => navigateToComplaintsByStatus('resolved')}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Resolved</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metrics?.complaints.resolved || 0}</span>
                  <Badge variant="secondary" className="text-xs">
                    {metrics?.complaints.total ? Math.round((metrics.complaints.resolved / metrics.complaints.total) * 100) : 0}%
                  </Badge>
                  <Eye className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
              
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded"
                onClick={() => navigateToComplaintsByStatus('closed')}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm">Closed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metrics?.complaints.closed || 0}</span>
                  <Badge variant="secondary" className="text-xs">
                    {metrics?.complaints.total ? Math.round((metrics.complaints.closed / metrics.complaints.total) * 100) : 0}%
                  </Badge>
                  <Eye className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded"
                onClick={() => navigateToComplaintsByPriority('critical')}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Critical</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metrics?.complaints.critical || 0}</span>
                  <Badge variant="destructive" className="text-xs">
                    {metrics?.complaints.total ? Math.round((metrics.complaints.critical / metrics.complaints.total) * 100) : 0}%
                  </Badge>
                  <Eye className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
              
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded"
                onClick={() => navigateToComplaintsByPriority('high')}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">High</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metrics?.complaints.high || 0}</span>
                  <Badge variant="secondary" className="text-xs">
                    {metrics?.complaints.total ? Math.round((metrics.complaints.high / metrics.complaints.total) * 100) : 0}%
                  </Badge>
                  <Eye className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
              
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded"
                onClick={() => navigateToComplaintsByPriority('medium')}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Medium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metrics?.complaints.medium || 0}</span>
                  <Badge variant="outline" className="text-xs">
                    {metrics?.complaints.total ? Math.round((metrics.complaints.medium / metrics.complaints.total) * 100) : 0}%
                  </Badge>
                  <Eye className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
              
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded"
                onClick={() => navigateToComplaintsByPriority('low')}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Low</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metrics?.complaints.low || 0}</span>
                  <Badge variant="outline" className="text-xs">
                    {metrics?.complaints.total ? Math.round((metrics.complaints.low / metrics.complaints.total) * 100) : 0}%
                  </Badge>
                  <Eye className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Performance Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Resolution Rate</span>
                  <span className="text-sm text-muted-foreground">
                    {metrics?.performance.resolutionRate || 0}%
                  </span>
                </div>
                <Progress value={metrics?.performance.resolutionRate || 0} />
                <div className="text-xs text-muted-foreground mt-1">Target: 90%</div>
              </div>
              
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

        {/* Key Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Key Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-900">Top Region</div>
                <div className="text-lg font-bold text-blue-700">
                  {analyticsData?.insights.topRegion || 'N/A'}
                </div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-900">Top Category</div>
                <div className="text-lg font-bold text-green-700">
                  {analyticsData?.insights.topCategory || 'N/A'}
                </div>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-sm font-medium text-purple-900">Peak Hour</div>
                <div className="text-lg font-bold text-purple-700">
                  {analyticsData?.insights.peakHour || 'N/A'}
                </div>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-sm font-medium text-orange-900">Trend</div>
                <div className="flex items-center space-x-1">
                  {analyticsData?.insights.resolutionTrend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-lg font-bold text-orange-700">
                    {analyticsData?.insights.resolutionTrend === 'up' ? 'Improving' : 'Declining'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => navigate('/dashboard/complaints')}
            >
              <FileText className="h-4 w-4 mr-2" />
              View All Complaints
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => navigateToComplaintsByStatus('open')}
            >
              <Clock className="h-4 w-4 mr-2" />
              Open Complaints
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => navigateToComplaintsByPriority('critical')}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Critical Issues
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => navigate('/dashboard')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}