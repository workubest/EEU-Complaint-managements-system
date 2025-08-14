import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Eye,
  Share2,
  Printer
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, subMonths, subWeeks } from 'date-fns';
import { ETHIOPIAN_REGIONS } from '@/types/user';
import { COMPLAINT_CATEGORIES } from '@/lib/constants';

interface Report {
  id: string;
  title: string;
  type: 'summary' | 'detailed' | 'analytics' | 'performance' | 'regional';
  description: string;
  generatedAt: string;
  generatedBy: string;
  status: 'generating' | 'ready' | 'failed';
  downloadUrl?: string;
  size?: string;
  format: 'pdf' | 'excel' | 'csv';
  period: {
    start: string;
    end: string;
  };
  filters: {
    regions?: string[];
    categories?: string[];
    priorities?: string[];
    statuses?: string[];
  };
}

export function Reports() {
  const { user, permissions, canAccessRegion } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('available');

  // Report generation form state
  const [reportForm, setReportForm] = useState({
    type: 'summary',
    title: '',
    description: '',
    format: 'pdf',
    period: {
      start: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd')
    },
    filters: {
      regions: [] as string[],
      categories: [] as string[],
      priorities: [] as string[],
      statuses: [] as string[]
    }
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const result = await apiService.getReports();
      if (result.success) {
        setReports(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!permissions.reports.create) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to generate reports.",
        variant: "destructive"
      });
      return;
    }

    if (!reportForm.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a report title.",
        variant: "destructive"
      });
      return;
    }

    const reportId = `report_${Date.now()}`;
    setGenerating(reportId);

    try {
      const reportData = {
        ...reportForm,
        id: reportId,
        generatedBy: user?.name || 'Unknown',
        generatedAt: new Date().toISOString(),
        status: 'generating' as const
      };

      const result = await apiService.createReport(reportData);
      
      if (result.success) {
        setReports(prev => [result.data, ...prev]);
        toast({
          title: "Report Generation Started",
          description: `${reportForm.title} is being generated. You'll be notified when it's ready.`,
        });
        
        // Reset form
        setReportForm({
          type: 'summary',
          title: '',
          description: '',
          format: 'pdf',
          period: {
            start: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
            end: format(new Date(), 'yyyy-MM-dd')
          },
          filters: {
            regions: [],
            categories: [],
            priorities: [],
            statuses: []
          }
        });
        
        setActiveTab('available');
      } else {
        throw new Error(result.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setGenerating(null);
    }
  };

  const downloadReport = async (report: Report) => {
    if (!permissions.reports.read) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to download reports.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (report.downloadUrl) {
        const link = document.createElement('a');
        link.href = report.downloadUrl;
        link.download = `${report.title.replace(/\s+/g, '_')}.${report.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Download Started",
          description: `${report.title} is being downloaded.`,
        });
      } else {
        // Generate download URL
        const result = await apiService.downloadReport(report.id);
        if (result.success && result.downloadUrl) {
          const link = document.createElement('a');
          link.href = result.downloadUrl;
          link.download = `${report.title.replace(/\s+/g, '_')}.${report.format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive"
      });
    }
  };

  const shareReport = async (report: Report) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: report.title,
          text: report.description,
          url: report.downloadUrl
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(report.downloadUrl || '');
        toast({
          title: "Link Copied",
          description: "Report link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };

  const getReportIcon = (type: Report['type']) => {
    const icons = {
      summary: BarChart3,
      detailed: FileText,
      analytics: TrendingUp,
      performance: Activity,
      regional: PieChart
    };
    return icons[type] || FileText;
  };

  const getStatusBadge = (status: Report['status']) => {
    const configs = {
      generating: { label: 'Generating', className: 'bg-warning/10 text-warning' },
      ready: { label: 'Ready', className: 'bg-success/10 text-success' },
      failed: { label: 'Failed', className: 'bg-destructive/10 text-destructive' }
    };
    return configs[status] || { label: 'Unknown', className: 'bg-muted text-muted-foreground' };
  };

  const predefinedReports = [
    {
      title: 'Monthly Summary Report',
      description: 'Comprehensive monthly overview of all complaints and resolutions',
      type: 'summary',
      format: 'pdf',
      period: 'last_month'
    },
    {
      title: 'Regional Performance Analysis',
      description: 'Performance metrics broken down by region',
      type: 'regional',
      format: 'excel',
      period: 'last_quarter'
    },
    {
      title: 'Critical Issues Report',
      description: 'Detailed analysis of critical and high-priority complaints',
      type: 'detailed',
      format: 'pdf',
      period: 'last_week'
    },
    {
      title: 'Customer Satisfaction Analytics',
      description: 'Customer feedback and satisfaction metrics',
      type: 'analytics',
      format: 'excel',
      period: 'last_month'
    }
  ];

  if (!permissions.reports.read) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Access Denied</h3>
          <p className="text-muted-foreground">You don't have permission to view reports</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary drop-shadow-sm tracking-tight">Reports & Analytics</h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-2 max-w-2xl">
            Generate, manage, and download comprehensive reports
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Schedule Report</span>
            <span className="sm:hidden">Schedule</span>
          </Button>
          <Button size="sm">
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Quick Export</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available Reports</TabsTrigger>
          <TabsTrigger value="generate">Generate New</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {reports.map((report, index) => {
              const Icon = getReportIcon(report.type);
              const statusConfig = getStatusBadge(report.status);
              
              return (
                <Card 
                  key={report.id} 
                  className="border-border hover:shadow-elevated transition-all duration-300 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{report.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {report.description}
                          </p>
                        </div>
                      </div>
                      <Badge className={statusConfig.className} variant="secondary">
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Generated: {format(new Date(report.generatedAt), 'MMM dd, yyyy')}</span>
                        <span>Format: {report.format.toUpperCase()}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>By: {report.generatedBy}</span>
                        {report.size && <span>Size: {report.size}</span>}
                      </div>
                      
                      <div className="flex space-x-2 pt-2">
                        {report.status === 'ready' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => downloadReport(report)}
                              className="flex-1"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => shareReport(report)}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        {report.status === 'generating' && (
                          <Button size="sm" disabled className="flex-1">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2" />
                            Generating...
                          </Button>
                        )}
                        
                        {report.status === 'failed' && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => generateReport()}
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {reports.length === 0 && !loading && (
            <Card className="border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No reports available</h3>
                <p className="text-muted-foreground mb-4">Generate your first report to get started</p>
                <Button onClick={() => setActiveTab('generate')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Generate Custom Report</CardTitle>
              <p className="text-muted-foreground">
                Create a customized report with specific filters and parameters
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Report Title</label>
                    <Input
                      value={reportForm.title}
                      onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter report title"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={reportForm.description}
                      onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the report"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Report Type</label>
                    <Select 
                      value={reportForm.type} 
                      onValueChange={(value) => setReportForm(prev => ({ ...prev, type: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Summary Report</SelectItem>
                        <SelectItem value="detailed">Detailed Analysis</SelectItem>
                        <SelectItem value="analytics">Analytics Report</SelectItem>
                        <SelectItem value="performance">Performance Metrics</SelectItem>
                        <SelectItem value="regional">Regional Breakdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Format</label>
                    <Select 
                      value={reportForm.format} 
                      onValueChange={(value) => setReportForm(prev => ({ ...prev, format: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                        <SelectItem value="csv">CSV Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Date Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={reportForm.period.start}
                        onChange={(e) => setReportForm(prev => ({ 
                          ...prev, 
                          period: { ...prev.period, start: e.target.value }
                        }))}
                      />
                      <Input
                        type="date"
                        value={reportForm.period.end}
                        onChange={(e) => setReportForm(prev => ({ 
                          ...prev, 
                          period: { ...prev.period, end: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Regions (Optional)</label>
                    <Select 
                      value={reportForm.filters.regions[0] || ''} 
                      onValueChange={(value) => setReportForm(prev => ({ 
                        ...prev, 
                        filters: { ...prev.filters, regions: value ? [value] : [] }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select regions" />
                      </SelectTrigger>
                      <SelectContent>
                        {ETHIOPIAN_REGIONS.map(region => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Categories (Optional)</label>
                    <Select 
                      value={reportForm.filters.categories[0] || ''} 
                      onValueChange={(value) => setReportForm(prev => ({ 
                        ...prev, 
                        filters: { ...prev.filters, categories: value ? [value] : [] }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select categories" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPLAINT_CATEGORIES.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Priority Levels (Optional)</label>
                    <Select 
                      value={reportForm.filters.priorities[0] || ''} 
                      onValueChange={(value) => setReportForm(prev => ({ 
                        ...prev, 
                        filters: { ...prev.filters, priorities: value ? [value] : [] }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priorities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button 
                  onClick={generateReport}
                  disabled={generating !== null || !reportForm.title.trim()}
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predefinedReports.map((template, index) => (
              <Card 
                key={template.title} 
                className="border-border hover:shadow-elevated transition-all duration-300 cursor-pointer animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => {
                  setReportForm(prev => ({
                    ...prev,
                    title: template.title,
                    description: template.description,
                    type: template.type as any,
                    format: template.format as any
                  }));
                  setActiveTab('generate');
                }}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Type: {template.type}</span>
                    <span>Format: {template.format.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>Period: {template.period.replace('_', ' ')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}