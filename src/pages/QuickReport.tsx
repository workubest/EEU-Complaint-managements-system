import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { format, subDays, subMonths, subWeeks } from 'date-fns';
import { apiService } from '@/lib/api';
import { Footer } from '@/components/layout/Footer';

interface QuickReportTemplate {
  id: string;
  title: string;
  description: string;
  type: 'summary' | 'detailed' | 'analytics' | 'performance' | 'regional';
  icon: React.ComponentType<any>;
  period: string;
  format: 'pdf' | 'excel' | 'csv';
  estimatedTime: string;
  color: string;
}

export function QuickReport() {
  const { user, permissions } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [generating, setGenerating] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('last_week');

  const quickReportTemplates: QuickReportTemplate[] = [
    {
      id: 'daily_summary',
      title: 'Daily Summary',
      description: 'Quick overview of today\'s complaints and activities',
      type: 'summary',
      icon: BarChart3,
      period: 'today',
      format: 'pdf',
      estimatedTime: '30 seconds',
      color: 'bg-blue-500'
    },
    {
      id: 'weekly_overview',
      title: 'Weekly Overview',
      description: 'Comprehensive weekly performance metrics',
      type: 'analytics',
      icon: TrendingUp,
      period: 'last_week',
      format: 'pdf',
      estimatedTime: '1 minute',
      color: 'bg-green-500'
    },
    {
      id: 'critical_issues',
      title: 'Critical Issues',
      description: 'High-priority complaints requiring immediate attention',
      type: 'detailed',
      icon: Activity,
      period: 'last_24h',
      format: 'pdf',
      estimatedTime: '45 seconds',
      color: 'bg-red-500'
    },
    {
      id: 'regional_snapshot',
      title: 'Regional Snapshot',
      description: 'Quick regional performance comparison',
      type: 'regional',
      icon: PieChart,
      period: 'last_week',
      format: 'excel',
      estimatedTime: '1 minute',
      color: 'bg-purple-500'
    },
    {
      id: 'recent_activity',
      title: 'Recent Activity',
      description: 'Latest complaints and resolution updates',
      type: 'summary',
      icon: Clock,
      period: 'last_3_days',
      format: 'pdf',
      estimatedTime: '30 seconds',
      color: 'bg-orange-500'
    },
    {
      id: 'performance_metrics',
      title: 'Performance Metrics',
      description: 'Key performance indicators and trends',
      type: 'performance',
      icon: BarChart3,
      period: 'last_month',
      format: 'excel',
      estimatedTime: '2 minutes',
      color: 'bg-indigo-500'
    }
  ];

  const generateQuickReport = async (template: QuickReportTemplate) => {
    if (!permissions.reports.create) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to generate reports.",
        variant: "destructive"
      });
      return;
    }

    setGenerating(template.id);

    try {
      const reportData = {
        id: `quick_${template.id}_${Date.now()}`,
        title: `${template.title} - ${format(new Date(), 'MMM dd, yyyy')}`,
        description: template.description,
        type: template.type,
        format: template.format,
        period: {
          start: getPeriodStart(selectedPeriod),
          end: format(new Date(), 'yyyy-MM-dd')
        },
        filters: {},
        generatedBy: user?.name || 'Unknown',
        generatedAt: new Date().toISOString(),
        status: 'generating' as const
      };

      const result = await apiService.createReport(reportData);
      
      if (result.success) {
        toast({
          title: "Quick Report Generated",
          description: `${template.title} has been generated successfully. Downloading now...`,
        });
        
        // Simulate download after a short delay
        setTimeout(() => {
          toast({
            title: "Download Started",
            description: `${template.title} is being downloaded.`,
          });
        }, 1500);
      } else {
        throw new Error(result.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating quick report:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate quick report",
        variant: "destructive"
      });
    } finally {
      setGenerating(null);
    }
  };

  const getPeriodStart = (period: string): string => {
    const now = new Date();
    switch (period) {
      case 'today':
        return format(now, 'yyyy-MM-dd');
      case 'last_24h':
        return format(subDays(now, 1), 'yyyy-MM-dd');
      case 'last_3_days':
        return format(subDays(now, 3), 'yyyy-MM-dd');
      case 'last_week':
        return format(subWeeks(now, 1), 'yyyy-MM-dd');
      case 'last_month':
        return format(subMonths(now, 1), 'yyyy-MM-dd');
      default:
        return format(subWeeks(now, 1), 'yyyy-MM-dd');
    }
  };

  const getPeriodLabel = (period: string): string => {
    switch (period) {
      case 'today':
        return 'Today';
      case 'last_24h':
        return 'Last 24 Hours';
      case 'last_3_days':
        return 'Last 3 Days';
      case 'last_week':
        return 'Last Week';
      case 'last_month':
        return 'Last Month';
      default:
        return 'Last Week';
    }
  };

  if (!permissions.reports.read) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Access Denied</h3>
          <p className="text-muted-foreground mb-4">You don't have permission to generate reports</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-eeu-green/5 via-white to-eeu-orange/5 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-eeu-orange rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-eeu-green rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-eeu-green to-eeu-orange rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 animate-fade-in">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(-1)}
              className="shrink-0 border-eeu-green text-eeu-green hover:bg-eeu-green hover:text-white transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-r from-eeu-green to-eeu-orange shadow-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-eeu-green drop-shadow-sm tracking-tight">
                  Quick Reports
                </h1>
              </div>
              <p className="text-base sm:text-lg text-gray-700 mt-2 max-w-2xl font-medium">
                Generate instant reports with pre-configured templates
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40 border-eeu-orange/30 focus:border-eeu-orange focus:ring-2 focus:ring-eeu-orange/20 transition-all duration-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last_24h">Last 24 Hours</SelectItem>
                <SelectItem value="last_3_days">Last 3 Days</SelectItem>
                <SelectItem value="last_week">Last Week</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-sm border-eeu-green text-eeu-green bg-eeu-green/10">
              Period: {getPeriodLabel(selectedPeriod)}
            </Badge>
          </div>
        </div>

        {/* Quick Report Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {quickReportTemplates.map((template, index) => {
            const Icon = template.icon;
            const isGenerating = generating === template.id;
            
            return (
              <Card 
                key={template.id}
                className="border-2 border-eeu-orange/20 hover:border-eeu-orange hover:shadow-2xl transition-all duration-300 animate-scale-in cursor-pointer group bg-white/90 backdrop-blur-sm"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 rounded-lg bg-gradient-to-r from-eeu-green to-eeu-orange group-hover:scale-110 transition-transform duration-200 shadow-lg">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-eeu-green group-hover:text-eeu-orange transition-colors">
                          {template.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Format: {template.format.toUpperCase()}</span>
                      <span>Est. Time: {template.estimatedTime}</span>
                    </div>
                    
                    <Button 
                      onClick={() => generateQuickReport(template)}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-eeu-green to-eeu-orange hover:from-eeu-green/90 hover:to-eeu-orange/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isGenerating ? (
                        <>
                          <Activity className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Generate & Download
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="animate-slide-up border-2 border-eeu-green/20 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-eeu-green/10 to-eeu-orange/10 rounded-t-lg">
            <CardTitle className="flex items-center space-x-2 text-eeu-green">
              <FileText className="h-5 w-5" />
              <span>Need More Options?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/reports')}
                className="flex-1 sm:flex-none border-eeu-orange text-eeu-orange hover:bg-eeu-orange hover:text-white transition-all duration-300"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Advanced Reports
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/analytics')}
                className="flex-1 sm:flex-none border-eeu-green text-eeu-green hover:bg-eeu-green hover:text-white transition-all duration-300"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Analytics Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/complaints')}
                className="flex-1 sm:flex-none border-eeu-orange text-eeu-orange hover:bg-eeu-orange hover:text-white transition-all duration-300"
              >
                <FileText className="mr-2 h-4 w-4" />
                View Complaints
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default QuickReport;