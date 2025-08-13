import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Filter, Eye, Edit, User, Calendar, Trash2, UserCheck, Plus, AlertTriangle, Phone, MapPin, Settings, CheckCircle, Info, SortDesc, Clock, Building } from 'lucide-react';
// import { mockComplaints } from '@/data/mockData';
import { STATUS_CONFIG, PRIORITY_CONFIG, Complaint, ComplaintStatus, ComplaintPriority } from '@/types/complaint';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProtectedAction } from '@/components/auth/ProtectedRoute';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';
import { format } from 'date-fns';
import { RepairOrderExportDialog } from '@/components/export/RepairOrderExportDialog';

// Work types for status updates
const WORK_TYPES = [
  { value: 'fuse_replacement', label: 'Changing Fuse' },
  { value: 'joint_repair', label: 'Joining Joints' },
  { value: 'wire_jointing', label: 'Jointing Wire Cut' },
  { value: 'cable_repair', label: 'Cable Repair' },
  { value: 'transformer_maintenance', label: 'Transformer Maintenance' },
  { value: 'meter_replacement', label: 'Meter Replacement' },
  { value: 'pole_replacement', label: 'Pole Replacement' },
  { value: 'line_extension', label: 'Line Extension' },
  { value: 'voltage_regulation', label: 'Voltage Regulation' },
  { value: 'insulator_replacement', label: 'Insulator Replacement' },
  { value: 'grounding_repair', label: 'Grounding System Repair' },
  { value: 'switch_maintenance', label: 'Switch Maintenance' },
  { value: 'other', label: 'Other Work' }
];

// Status workflow validation - defines allowed transitions
const STATUS_WORKFLOW = {
  'open': ['in-progress', 'escalated', 'cancelled'], // From open: can go to in-progress, escalated, or cancelled
  'in-progress': ['resolved', 'escalated'], // From in-progress: can go to resolved or escalated
  'escalated': ['resolved', 'in-progress'], // From escalated: can go to resolved or back to in-progress
  'resolved': ['closed'], // From resolved: can only go to closed
  'closed': [], // From closed: no further transitions (final state)
  'cancelled': [] // From cancelled: no further transitions (final state)
};

// Helper function to get allowed status transitions
const getAllowedStatusTransitions = (currentStatus: ComplaintStatus): ComplaintStatus[] => {
  return STATUS_WORKFLOW[currentStatus] || [];
};

// Helper function to validate if a status transition is allowed
const isStatusTransitionAllowed = (currentStatus: ComplaintStatus, newStatus: ComplaintStatus): boolean => {
  const allowedTransitions = getAllowedStatusTransitions(currentStatus);
  return allowedTransitions.includes(newStatus);
};

const ComplaintsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canAccessRegion, permissions, user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  // Ensure config objects are properly defined
  React.useEffect(() => {
    if (!STATUS_CONFIG || !PRIORITY_CONFIG) {
      console.error('STATUS_CONFIG or PRIORITY_CONFIG not properly imported');
    }
  }, []);

  // Helper function to format phone numbers
  const formatPhoneNumber = (phone: any) => {
    if (!phone) return '';
    // If it's a negative number, it's likely a formatting issue from the API
    if (typeof phone === 'number' && phone < 0) {
      // Try to reconstruct the phone number (this is a workaround for API issues)
      return '+251-911-123456'; // Default Ethiopian format
    }
    return String(phone);
  };

  // Helper function to format notes
  const formatNotes = (notes: any) => {
    if (!notes) return [];
    if (typeof notes === 'string') {
      // Filter out Java object serialization artifacts
      if (notes.includes('[Ljava.lang.Object;')) {
        return []; // Return empty array for corrupted notes
      }
      return notes.split(';').map(note => note.trim()).filter(note => note && note.length > 0);
    }
    return [];
  };

  // Helper function to normalize priority values
  const normalizePriority = (priority: any): ComplaintPriority => {
    if (!priority) return 'medium';
    const normalized = String(priority).toLowerCase().trim();
    if (['low', 'medium', 'high', 'critical'].includes(normalized)) {
      return normalized as ComplaintPriority;
    }
    return 'medium';
  };

  // Helper function to normalize status values
  const normalizeStatus = (status: any): ComplaintStatus => {
    if (!status) return 'open';
    const normalized = String(status).toLowerCase().trim();
    if (['open', 'in-progress', 'resolved', 'escalated', 'closed', 'cancelled'].includes(normalized)) {
      return normalized as ComplaintStatus;
    }
    return 'open';
  };

  // Helper function to map API data to UI format
  const mapComplaintData = (item: any) => {
    // Validate priority and status values
    if (item.Priority && !['low', 'medium', 'high', 'critical'].includes(String(item.Priority).toLowerCase().trim())) {
      console.warn('Invalid priority value received:', item.Priority);
    }
    if (item.Status && !['open', 'in-progress', 'resolved', 'escalated', 'closed', 'cancelled'].includes(String(item.Status).toLowerCase().trim())) {
      console.warn('Invalid status value received:', item.Status);
    }
    
    // Generate a fallback ID if none exists
    const complaintId = item.ID || item.id || item['Complaint ID'] || item.complaintId;
    const fallbackId = complaintId || `complaint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Debug logging for ID issues
    if (!complaintId) {
      console.warn('Complaint missing ID, using fallback:', { 
        originalItem: item, 
        fallbackId,
        availableKeys: Object.keys(item)
      });
    }
    
    const mappedData = {
    id: fallbackId,
    customerId: item['Customer ID'] || item.customerId || '1',
    title: item.Title || item.title || '',
    description: item.Description || item.description || '',
    category: item.Category || item.category || 'other',
    region: item.Region || item.region || item.Location || '',
    serviceCenter: item['Service Center'] || item.serviceCenter || '',
    priority: normalizePriority(item.Priority || item.priority),
    status: normalizeStatus(item.Status || item.status),
    createdAt: item['Created At'] || item.createdAt || new Date().toISOString(),
    updatedAt: item['Updated At'] || item.updatedAt || item['Created At'] || item.createdAt || new Date().toISOString(),
    resolvedAt: item['Resolved At'] || item.resolvedAt || '',
    estimatedResolution: item['Estimated Resolution'] || item.estimatedResolution || '',
    assignedTo: item['Assigned To'] || item.assignedTo || '',
    assignedBy: item['Assigned By'] || item.assignedBy || '',
    createdBy: item['Created By'] || item.createdBy || '',
    contractNumber: item['Contract Number'] || item.contractNumber || item.customer?.contractNumber || '',
    businessPartner: item['Business Partner'] || item.businessPartner || item.customer?.businessPartner || '',
    repairOrder: item['Repair Order'] || item.repairOrder || item.repairOrderNumber || '',
    notes: formatNotes(item.Notes),
    attachments: item.Attachments ? (typeof item.Attachments === 'string' ? item.Attachments.split(';').map(att => att.trim()).filter(att => att) : []) : [],
    customer: {
      id: item['Customer ID'] || item.customerId || '1',
      name: item['Customer Name'] || item.customerName || item.customer?.name || '',
      email: item['Customer Email'] || item.customerEmail || item.customer?.email || '',
      phone: formatPhoneNumber(item['Customer Phone'] || item.customerPhone || item.customer?.phone),
      address: item['Customer Address'] || item.customerAddress || item.customer?.address || item.Location || '',
      region: item.Region || item.region || item.Location || '',
      serviceCenter: item['Service Center'] || item.serviceCenter || item.customer?.serviceCenter || '',
      meterNumber: item['Meter Number'] || item.meterNumber || item.customer?.meterNumber || '',
      accountNumber: item['Account Number'] || item.accountNumber || item.customer?.accountNumber || '',
      contractNumber: item['Contract Number'] || item.contractNumber || item.customer?.contractNumber || '',
      businessPartner: item['Business Partner'] || item.businessPartner || item.customer?.businessPartner || '',
    },
  };
  
  return mappedData;
};

  // Helper function to check if a complaint is overdue (older than 7 days and not resolved/closed)
  const isComplaintOverdue = (complaint: any) => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const createdAt = new Date(complaint.createdAt);
    const status = complaint.status?.toLowerCase();
    
    return createdAt < sevenDaysAgo && 
           status !== 'resolved' && 
           status !== 'closed' && 
           status !== 'cancelled';
  };

  // Helper function to get date range based on filter
  const getDateRange = (filter: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'today':
        return {
          from: today,
          to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case 'yesterday':
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {
          from: yesterday,
          to: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case 'last7days':
        return {
          from: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          to: now
        };
      case 'last30days':
        return {
          from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
          to: now
        };
      case 'thisweek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return {
          from: startOfWeek,
          to: now
        };
      case 'thismonth':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          from: startOfMonth,
          to: now
        };
      case 'lastmonth':
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
        return {
          from: startOfLastMonth,
          to: endOfLastMonth
        };
      case 'custom':
        if (customDateFrom && customDateTo) {
          return {
            from: new Date(customDateFrom),
            to: new Date(customDateTo + 'T23:59:59')
          };
        }
        return null;
      default:
        return null;
    }
  };

  // Helper function to check if complaint matches date filter
  const matchesDateFilter = (complaint: any) => {
    if (dateFilter === 'all') return true;
    
    const dateRange = getDateRange(dateFilter);
    if (!dateRange) return true;
    
    const complaintDate = new Date(complaint.createdAt);
    return complaintDate >= dateRange.from && complaintDate <= dateRange.to;
  };

  // Helper function to get complaint count for a specific date filter
  const getComplaintCountForDateFilter = (filter: string) => {
    if (filter === 'all') return complaints.length;
    
    const dateRange = getDateRange(filter);
    if (!dateRange) return 0;
    
    return complaints.filter(complaint => {
      const complaintDate = new Date(complaint.createdAt);
      return complaintDate >= dateRange.from && complaintDate <= dateRange.to;
    }).length;
  };
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');
  const [priorityFilter, setPriorityFilter] = useState<string>(searchParams.get('priority') || 'all');
  const [dateFilter, setDateFilter] = useState<string>(searchParams.get('dateFilter') || 'all');
  const [customDateFrom, setCustomDateFrom] = useState<string>(searchParams.get('dateFrom') || '');
  const [customDateTo, setCustomDateTo] = useState<string>(searchParams.get('dateTo') || '');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);
  const [statusUpdateComplaint, setStatusUpdateComplaint] = useState<Complaint | null>(null);
  const [statusUpdateForm, setStatusUpdateForm] = useState({
    status: '',
    workType: '',
    notes: '',
    resolutionNotes: ''
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Handle URL parameter changes
  useEffect(() => {
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const dateFilterParam = searchParams.get('dateFilter');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    if (status && status !== statusFilter) {
      setStatusFilter(status);
    }
    if (priority && priority !== priorityFilter) {
      setPriorityFilter(priority);
    }
    if (search && search !== searchTerm) {
      setSearchTerm(search);
    }
    if (dateFilterParam && dateFilterParam !== dateFilter) {
      setDateFilter(dateFilterParam);
    }
    if (dateFrom && dateFrom !== customDateFrom) {
      setCustomDateFrom(dateFrom);
    }
    if (dateTo && dateTo !== customDateTo) {
      setCustomDateTo(dateTo);
    }
  }, [searchParams]);

  // Update URL when filters change (with debounce for search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();
      
      if (searchTerm && searchTerm !== '') {
        params.set('search', searchTerm);
      }
      if (statusFilter && statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      if (priorityFilter && priorityFilter !== 'all') {
        params.set('priority', priorityFilter);
      }
      if (dateFilter && dateFilter !== 'all') {
        params.set('dateFilter', dateFilter);
      }
      if (customDateFrom && dateFilter === 'custom') {
        params.set('dateFrom', customDateFrom);
      }
      if (customDateTo && dateFilter === 'custom') {
        params.set('dateTo', customDateTo);
      }
      
      // Only update URL if params have changed
      const newSearch = params.toString();
      const currentSearch = searchParams.toString();
      if (newSearch !== currentSearch) {
        setSearchParams(params, { replace: true });
      }
    }, 300); // 300ms debounce for search, immediate for dropdowns
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, priorityFilter, dateFilter, customDateFrom, customDateTo]);

  React.useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiService.getComplaints();
        if (result && result.success && Array.isArray(result.data)) {
          // Map raw sheet data to expected UI shape and sort by creation date (most recent first)
          const mapped = result.data.map(mapComplaintData).filter(complaint => {
            // Filter out any null/invalid complaints
            const isValid = complaint && 
                           complaint.id && 
                           complaint.id.trim() !== '' && 
                           complaint.priority && 
                           complaint.status;
            
            if (!isValid) {
              console.warn('Filtering out invalid complaint:', complaint);
            }
            
            return isValid;
          }).sort((a, b) => {
            // Sort by creation date - most recent first
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          });
          setComplaints(mapped);
          setError(null);
        } else {
          setComplaints([]);
          setError(result && result.error ? result.error : 'No complaints found');
        }
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch complaints');
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // Filter complaints based on user access, search criteria, status, priority, and date
  const filteredComplaints = complaints.filter(complaint => {
    const matchesAccess = canAccessRegion(complaint.region);
    
    // Enhanced search functionality - search across multiple fields
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      // Basic complaint info
      complaint.title?.toLowerCase().includes(searchLower) ||
      complaint.id?.toLowerCase().includes(searchLower) ||
      complaint.description?.toLowerCase().includes(searchLower) ||
      
      // Customer information
      complaint.customer?.name?.toLowerCase().includes(searchLower) ||
      complaint.customer?.email?.toLowerCase().includes(searchLower) ||
      complaint.customer?.phone?.toLowerCase().includes(searchLower) ||
      complaint.customer?.address?.toLowerCase().includes(searchLower) ||
      
      // Contract and business information
      complaint.contractNumber?.toLowerCase().includes(searchLower) ||
      complaint.businessPartner?.toLowerCase().includes(searchLower) ||
      complaint.customer?.contractNumber?.toLowerCase().includes(searchLower) ||
      complaint.customer?.businessPartner?.toLowerCase().includes(searchLower) ||
      
      // Account and meter information
      complaint.customer?.accountNumber?.toLowerCase().includes(searchLower) ||
      complaint.customer?.meterNumber?.toLowerCase().includes(searchLower) ||
      
      // Repair order information
      complaint.repairOrder?.toLowerCase().includes(searchLower) ||
      complaint.repairOrderNumber?.toLowerCase().includes(searchLower) ||
      
      // Region and location
      complaint.region?.toLowerCase().includes(searchLower);
      
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter;
    const matchesDate = matchesDateFilter(complaint);

    return matchesAccess && matchesSearch && matchesStatus && matchesPriority && matchesDate;
  });

  const handleViewComplaint = (complaint: Complaint) => {
    navigate(`/dashboard/complaints/${complaint.id}`);
  };

  const handleEditComplaint = (complaint: Complaint) => {
    if (!permissions.complaints.update) {
      toast({
        title: t('common.error'),
        description: t('permissions.access_denied'),
        variant: "destructive"
      });
      return;
    }
    setEditingComplaint(complaint);
  };

  const handleUpdateComplaint = async () => {
    if (!editingComplaint) return;

    if (!editingComplaint.id) {
      console.error('Missing complaint ID:', editingComplaint);
      toast({
        title: "Error",
        description: "Missing complaint ID. Please refresh the page and try again.",
        variant: "destructive"
      });
      return;
    }

    // Find the original complaint to check status transition
    const originalComplaint = complaints.find(c => c.id === editingComplaint.id);
    if (originalComplaint && originalComplaint.status !== editingComplaint.status) {
      // Validate status transition
      if (!isStatusTransitionAllowed(originalComplaint.status, editingComplaint.status as ComplaintStatus)) {
        const allowedTransitions = getAllowedStatusTransitions(originalComplaint.status);
        const allowedStatusNames = allowedTransitions.map(status => 
          STATUS_CONFIG[status]?.label || status
        ).join(', ');
        
        toast({
          title: "Invalid Status Transition",
          description: `Cannot change status from "${STATUS_CONFIG[originalComplaint.status]?.label || originalComplaint.status}" to "${STATUS_CONFIG[editingComplaint.status]?.label || editingComplaint.status}". Allowed transitions: ${allowedStatusNames || 'None (final state)'}`,
          variant: "destructive"
        });
        return;
      }
    }

    try {
      const updateData = {
        ...editingComplaint,
        id: editingComplaint.id, // Ensure ID is included
        updatedAt: new Date().toISOString(),
        updatedBy: user?.id || user?.name || 'Unknown'
      };

      console.log('🔄 Updating complaint (edit) with data:', updateData);
      const result = await apiService.updateComplaint(updateData);

      if (result.success) {
        // Refresh complaints list with sorting
        const complaintsResult = await apiService.getComplaints();
        if (complaintsResult.success && Array.isArray(complaintsResult.data)) {
          const mapped = complaintsResult.data.map(mapComplaintData).filter(complaint => {
            return complaint && complaint.id && complaint.priority && complaint.status;
          }).sort((a, b) => {
            // Sort by creation date - most recent first
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          });
          setComplaints(mapped);
        }

        setEditingComplaint(null);
        toast({
          title: t('complaint.updated'),
          description: t('complaint.update_success'),
        });
      } else {
        throw new Error(result.error || 'Failed to update complaint');
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('complaint.update_failed'),
        variant: "destructive"
      });
    }
  };

  const handleDeleteComplaint = async (complaintId: string) => {
    if (!permissions.complaints.delete) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete complaints.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await apiService.deleteComplaint(complaintId);

      if (result.success) {
        setComplaints(complaints.filter(c => c.id !== complaintId));
        toast({
          title: "Complaint Deleted",
          description: "The complaint has been successfully deleted.",
        });
      } else {
        throw new Error(result.error || 'Failed to delete complaint');
      }
    } catch (error) {
      console.error('Error deleting complaint:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete complaint",
        variant: "destructive"
      });
    }
  };

  const handleAssignComplaint = async (complaintId: string, assigneeId: string) => {
    try {
      const result = await apiService.assignComplaint(complaintId, assigneeId);

      if (result.success) {
        // Refresh complaints list with sorting
        const complaintsResult = await apiService.getComplaints();
        if (complaintsResult.success && Array.isArray(complaintsResult.data)) {
          const mapped = complaintsResult.data.map(mapComplaintData).filter(complaint => {
            return complaint && complaint.id && complaint.priority && complaint.status;
          }).sort((a, b) => {
            // Sort by creation date - most recent first
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          });
          setComplaints(mapped);
        }

        toast({
          title: "Complaint Assigned",
          description: "The complaint has been successfully assigned.",
        });
      } else {
        throw new Error(result.error || 'Failed to assign complaint');
      }
    } catch (error) {
      console.error('Error assigning complaint:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign complaint",
        variant: "destructive"
      });
    }
  };

  const handleStatusUpdate = (complaint: Complaint) => {
    if (!permissions.complaints.update) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to update complaint status.",
        variant: "destructive"
      });
      return;
    }
    setStatusUpdateComplaint(complaint);
    setStatusUpdateForm({
      status: complaint.status,
      workType: '',
      notes: '',
      resolutionNotes: ''
    });
  };

  const handleStatusUpdateSubmit = async () => {
    if (!statusUpdateComplaint) return;

    if (!statusUpdateComplaint.id) {
      console.error('Missing complaint ID:', statusUpdateComplaint);
      toast({
        title: "Error",
        description: "Missing complaint ID. Please refresh the page and try again.",
        variant: "destructive"
      });
      return;
    }

    if (!statusUpdateForm.status) {
      toast({
        title: "Validation Error",
        description: "Please select a status.",
        variant: "destructive"
      });
      return;
    }

    // Validate status transition workflow
    if (!isStatusTransitionAllowed(statusUpdateComplaint.status, statusUpdateForm.status as ComplaintStatus)) {
      const allowedTransitions = getAllowedStatusTransitions(statusUpdateComplaint.status);
      const allowedStatusNames = allowedTransitions.map(status => 
        STATUS_CONFIG[status]?.label || status
      ).join(', ');
      
      toast({
        title: "Invalid Status Transition",
        description: `Cannot change status from "${STATUS_CONFIG[statusUpdateComplaint.status]?.label || statusUpdateComplaint.status}" to "${STATUS_CONFIG[statusUpdateForm.status]?.label || statusUpdateForm.status}". Allowed transitions: ${allowedStatusNames || 'None (final state)'}`,
        variant: "destructive"
      });
      return;
    }

    if (statusUpdateForm.status === 'resolved' && !statusUpdateForm.workType) {
      toast({
        title: "Validation Error",
        description: "Please select the type of work done when resolving the complaint.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const updateData = {
        ...statusUpdateComplaint,
        id: statusUpdateComplaint.id, // Ensure ID is included
        status: statusUpdateForm.status,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.id || user?.name || 'Unknown',
        workType: statusUpdateForm.workType,
        resolutionNotes: statusUpdateForm.resolutionNotes,
        notes: statusUpdateComplaint.notes ? 
          [...statusUpdateComplaint.notes, statusUpdateForm.notes].filter(note => note.trim()) :
          [statusUpdateForm.notes].filter(note => note.trim())
      };

      if (statusUpdateForm.status === 'resolved') {
        updateData.resolvedAt = new Date().toISOString();
      }

      console.log('🔄 Updating complaint with data:', updateData);
      console.log('🔄 Original complaint:', statusUpdateComplaint);
      console.log('🔄 Form data:', statusUpdateForm);
      
      const result = await apiService.updateComplaint(updateData);
      console.log('🔄 Update result:', result);

      if (result.success) {
        console.log('✅ Status update successful, refreshing data...');
        
        // Update local state immediately for instant feedback
        const immediateUpdate = complaints.map(complaint => {
          if (complaint.id === statusUpdateComplaint.id) {
            return {
              ...complaint,
              status: statusUpdateForm.status as ComplaintStatus,
              updatedAt: new Date().toISOString(),
              workType: statusUpdateForm.workType,
              resolutionNotes: statusUpdateForm.resolutionNotes,
              resolvedAt: statusUpdateForm.status === 'resolved' ? new Date().toISOString() : complaint.resolvedAt,
              notes: complaint.notes ? 
                [...complaint.notes, statusUpdateForm.notes].filter(note => note.trim()) :
                [statusUpdateForm.notes].filter(note => note.trim())
            };
          }
          return complaint;
        });
        setComplaints(immediateUpdate);

        // Close dialog immediately to show user the action completed
        setStatusUpdateComplaint(null);
        setStatusUpdateForm({
          status: '',
          workType: '',
          notes: '',
          resolutionNotes: ''
        });

        // Show success message
        toast({
          title: "Status Updated",
          description: `Complaint status has been updated to ${statusUpdateForm.status}.`,
        });

        // Wait a moment for backend to process the update
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Refresh complaints list with sorting
        const complaintsResult = await apiService.getComplaints();
        console.log('🔄 Refreshed complaints result:', complaintsResult);
        
        if (complaintsResult.success && Array.isArray(complaintsResult.data)) {
          // Find the updated complaint in the raw data
          const updatedComplaintRaw = complaintsResult.data.find(item => 
            (item.ID || item.id) === statusUpdateComplaint.id
          );
          console.log('🔍 Updated complaint raw data:', updatedComplaintRaw);
          
          const mapped = complaintsResult.data.map(mapComplaintData).filter(complaint => {
            return complaint && complaint.id && complaint.priority && complaint.status;
          }).sort((a, b) => {
            // Sort by creation date - most recent first
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          });
          
          // Find the updated complaint in the mapped data
          const updatedComplaintMapped = mapped.find(complaint => 
            complaint.id === statusUpdateComplaint.id
          );
          console.log('🔍 Updated complaint mapped data:', updatedComplaintMapped);
          console.log('🔍 Expected status:', statusUpdateForm.status);
          console.log('🔍 Actual status in mapped data:', updatedComplaintMapped?.status);
          
          console.log('🔄 Setting updated complaints:', mapped.length, 'complaints');
          
          // Check if the status was actually updated in the backend data
          if (updatedComplaintMapped && updatedComplaintMapped.status !== statusUpdateForm.status) {
            console.log('⚠️ Backend data not updated yet, applying local update');
            // Update the local state immediately for better UX
            const locallyUpdated = mapped.map(complaint => {
              if (complaint.id === statusUpdateComplaint.id) {
                return {
                  ...complaint,
                  status: statusUpdateForm.status as ComplaintStatus,
                  updatedAt: new Date().toISOString(),
                  workType: statusUpdateForm.workType,
                  resolutionNotes: statusUpdateForm.resolutionNotes,
                  resolvedAt: statusUpdateForm.status === 'resolved' ? new Date().toISOString() : complaint.resolvedAt,
                  notes: complaint.notes ? 
                    [...complaint.notes, statusUpdateForm.notes].filter(note => note.trim()) :
                    [statusUpdateForm.notes].filter(note => note.trim())
                };
              }
              return complaint;
            });
            setComplaints(locallyUpdated);
          } else {
            setComplaints(mapped);
          }
          
          // Force a re-render by updating the loading state briefly
          setLoading(true);
          setTimeout(() => setLoading(false), 100);
        }
      } else {
        throw new Error(result.error || 'Failed to update complaint status');
      }
    } catch (error) {
      console.error('Error updating complaint status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update complaint status",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Loading complaints...</h3>
        </div>
      </div>
    );
  }

// ...existing code...
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-destructive mb-2">Error loading complaints</h3>
          <p className="text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary drop-shadow-sm tracking-tight">All Complaints</h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-2 max-w-2xl">Manage and track electrical supply complaints</p>
        </div>
        <div className="flex items-center space-x-2">
          <RepairOrderExportDialog 
            complaints={filteredComplaints}
            onExport={() => {
              toast({
                title: "Export Successful",
                description: "Repair orders have been generated successfully",
                variant: "default"
              });
            }}
          />
          <ProtectedAction resource="complaints" action="create">
            <Button className="bg-gradient-primary" onClick={() => window.location.href = '/complaint-form'} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Complaint</span>
              <span className="sm:hidden">New</span>
            </Button>
          </ProtectedAction>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-none shadow-card bg-gradient-to-br from-primary/10 to-primary-glow/10 animate-slide-up hover:shadow-elevated transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-primary">
            <Filter className="h-5 w-5 text-primary" />
            <span>Search & Filter</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/60" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      placeholder="Search by ID, customer, phone, contract, repair order..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-8 focus:ring-2 focus:ring-primary"
                    />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">Search across:</p>
                      <ul className="space-y-0.5 text-xs">
                        <li>• Complaint ID & Title</li>
                        <li>• Customer Name, Email & Phone</li>
                        <li>• Contract Number & Business Partner</li>
                        <li>• Account & Meter Number</li>
                        <li>• Repair Order Number</li>
                        <li>• Address & Region</li>
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Info className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/40" />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="focus:ring-2 focus:ring-primary">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="focus:ring-2 focus:ring-primary">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="focus:ring-2 focus:ring-primary">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="thisweek">This Week</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="thismonth">This Month</SelectItem>
                <SelectItem value="lastmonth">Last Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary/10"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setDateFilter('all');
                setCustomDateFrom('');
                setCustomDateTo('');
                // Clear URL parameters as well
                setSearchParams({}, { replace: true });
              }}
            >
              Clear Filters
            </Button>
          </div>

          {/* Quick Date Filter Buttons */}
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-3 flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Quick Date Filters</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'today', label: 'Today', icon: '📅' },
                { key: 'yesterday', label: 'Yesterday', icon: '📆' },
                { key: 'last7days', label: 'Last 7 Days', icon: '📊' },
                { key: 'thisweek', label: 'This Week', icon: '🗓️' },
                { key: 'last30days', label: 'Last 30 Days', icon: '📈' },
                { key: 'thismonth', label: 'This Month', icon: '🗓️' },
                { key: 'lastmonth', label: 'Last Month', icon: '📋' }
              ].map((filter) => {
                const count = getComplaintCountForDateFilter(filter.key);
                return (
                  <Button
                    key={filter.key}
                    variant={dateFilter === filter.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateFilter(filter.key)}
                    className={`text-xs ${dateFilter === filter.key ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'}`}
                    title={`${count} complaint${count !== 1 ? 's' : ''} in this period`}
                  >
                    <span className="mr-1">{filter.icon}</span>
                    {filter.label}
                    <Badge 
                      variant="secondary" 
                      className={`ml-2 text-xs ${dateFilter === filter.key ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                    >
                      {count}
                    </Badge>
                  </Button>
                );
              })}
              <Button
                variant={dateFilter === 'custom' ? "default" : "outline"}
                size="sm"
                onClick={() => setDateFilter('custom')}
                className={`text-xs ${dateFilter === 'custom' ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'}`}
              >
                <span className="mr-1">🎯</span>
                Custom Range
              </Button>
              <Button
                variant={dateFilter === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => setDateFilter('all')}
                className={`text-xs ${dateFilter === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'}`}
                title={`${complaints.length} total complaint${complaints.length !== 1 ? 's' : ''}`}
              >
                <span className="mr-1">🔄</span>
                All Dates
                <Badge 
                  variant="secondary" 
                  className={`ml-2 text-xs ${dateFilter === 'all' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  {complaints.length}
                </Badge>
              </Button>
            </div>
          </div>

          {/* Custom Date Range Inputs */}
          {dateFilter === 'custom' && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
              <h4 className="text-sm font-medium mb-3 flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Custom Date Range</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date-from" className="text-xs text-muted-foreground">From Date</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                    className="mt-1"
                    max={customDateTo || new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="date-to" className="text-xs text-muted-foreground">To Date</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                    className="mt-1"
                    min={customDateFrom}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              {customDateFrom && customDateTo && (
                <div className="mt-3 p-2 bg-primary/10 rounded text-xs text-primary">
                  📊 Showing complaints from {new Date(customDateFrom).toLocaleDateString()} to {new Date(customDateTo).toLocaleDateString()}
                  {(() => {
                    const from = new Date(customDateFrom);
                    const to = new Date(customDateTo);
                    const diffTime = Math.abs(to.getTime() - from.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return ` (${diffDays} day${diffDays !== 1 ? 's' : ''})`;
                  })()}
                </div>
              )}
              {customDateFrom && customDateTo && new Date(customDateFrom) > new Date(customDateTo) && (
                <div className="mt-2 p-2 bg-destructive/10 rounded text-xs text-destructive">
                  ⚠️ Start date cannot be after end date
                </div>
              )}
            </div>
          )}

          {/* Filter Summary */}
          {(dateFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all' || searchTerm) && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-sm text-primary">
                    <Filter className="h-4 w-4" />
                    <span className="font-medium">Active Filters:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dateFilter !== 'all' && (
                      <Badge variant="outline" className="text-xs">
                        📅 {dateFilter === 'custom' && customDateFrom && customDateTo
                          ? `${new Date(customDateFrom).toLocaleDateString()} - ${new Date(customDateTo).toLocaleDateString()}`
                          : dateFilter === 'today' ? 'Today'
                          : dateFilter === 'yesterday' ? 'Yesterday'
                          : dateFilter === 'last7days' ? 'Last 7 Days'
                          : dateFilter === 'thisweek' ? 'This Week'
                          : dateFilter === 'last30days' ? 'Last 30 Days'
                          : dateFilter === 'thismonth' ? 'This Month'
                          : dateFilter === 'lastmonth' ? 'Last Month'
                          : dateFilter
                        }
                      </Badge>
                    )}
                    {statusFilter !== 'all' && (
                      <Badge variant="outline" className="text-xs">
                        🔄 Status: {statusFilter}
                      </Badge>
                    )}
                    {priorityFilter !== 'all' && (
                      <Badge variant="outline" className="text-xs">
                        ⚡ Priority: {priorityFilter}
                      </Badge>
                    )}
                    {searchTerm && (
                      <Badge variant="outline" className="text-xs">
                        🔍 Search: "{searchTerm}"
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-primary">{filteredComplaints.length}</span> of {complaints.length} complaints
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card className="border-border animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span>Complaints ({filteredComplaints.length})</span>
              {filteredComplaints.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <SortDesc className="h-4 w-4" />
                        <span>Recent First</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Complaints are sorted by creation date (newest first)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Search className="h-3 w-3" />
                  <span>Searching: "{searchTerm}"</span>
                </Badge>
              )}
              {dateFilter !== 'all' && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {dateFilter === 'custom' && customDateFrom && customDateTo
                      ? `${new Date(customDateFrom).toLocaleDateString()} - ${new Date(customDateTo).toLocaleDateString()}`
                      : dateFilter === 'today' ? 'Today'
                      : dateFilter === 'yesterday' ? 'Yesterday'
                      : dateFilter === 'last7days' ? 'Last 7 Days'
                      : dateFilter === 'thisweek' ? 'This Week'
                      : dateFilter === 'last30days' ? 'Last 30 Days'
                      : dateFilter === 'thismonth' ? 'This Month'
                      : dateFilter === 'lastmonth' ? 'Last Month'
                      : dateFilter
                    }
                  </span>
                </Badge>
              )}
              {(statusFilter !== 'all' || priorityFilter !== 'all') && (
                <Badge variant="outline" className="text-xs">
                  {[
                    statusFilter !== 'all' ? `Status: ${statusFilter}` : null,
                    priorityFilter !== 'all' ? `Priority: ${priorityFilter}` : null
                  ].filter(Boolean).join(', ')}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Desktop Table View */}
          <div className="hidden lg:block rounded-md border overflow-hidden">
            <Table className="w-full table-fixed" style={{ maxWidth: '100%' }}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[8%] p-2">ID</TableHead>
                  <TableHead className="w-[25%] p-2">Complaint</TableHead>
                  <TableHead className="w-[18%] p-2">Customer</TableHead>
                  <TableHead className="w-[12%] p-2">Location</TableHead>
                  <TableHead className="w-[8%] p-2">Priority</TableHead>
                  <TableHead className="w-[10%] p-2">Status</TableHead>
                  <TableHead className="w-[7%] p-2">
                    <Clock className="h-3 w-3" />
                  </TableHead>
                  <TableHead className="w-[12%] p-2">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No complaints found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComplaints.map((complaint) => {
                    // Additional safety check
                    if (!complaint || !complaint.priority || !complaint.status) {
                      console.warn('Invalid complaint data:', complaint);
                      return null;
                    }
                    return (
                    <TableRow key={complaint.id} className="hover:bg-muted/50 transition-colors">
                      {/* ID Column - Ultra Compact */}
                      <TableCell className="p-2">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-mono font-medium">{complaint.id}</span>
                          {isComplaintOverdue(complaint) && (
                            <AlertTriangle className="h-2 w-2 text-destructive mt-1" />
                          )}
                        </div>
                      </TableCell>

                      {/* Complaint Column - Compact */}
                      <TableCell className="p-2">
                        <div className="space-y-0.5">
                          <p className="font-medium text-xs leading-tight truncate" title={complaint.title}>
                            {complaint.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {t(`complaint_type.${complaint.category}`).substring(0, 20)}...
                          </p>
                        </div>
                      </TableCell>

                      {/* Customer Column - Very Compact */}
                      <TableCell className="p-2">
                        <div className="space-y-0.5">
                          <p className="text-xs font-medium truncate" title={complaint.customer.name}>
                            {complaint.customer.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {complaint.customer.phone?.substring(0, 10) || 'N/A'}
                          </p>
                        </div>
                      </TableCell>

                      {/* Location Column - Minimal */}
                      <TableCell className="p-2">
                        <div className="space-y-0.5">
                          <p className="text-xs text-primary font-medium truncate">
                            {complaint.region}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {(complaint.customer.serviceCenter || complaint.serviceCenter || 'N/A').substring(0, 8)}
                          </p>
                        </div>
                      </TableCell>

                      {/* Priority Column - Icon Only */}
                      <TableCell className="p-1">
                        <div 
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${PRIORITY_CONFIG[complaint.priority]?.bgColor || 'bg-muted'}`}
                          title={PRIORITY_CONFIG[complaint.priority]?.labelKey ? t(PRIORITY_CONFIG[complaint.priority].labelKey) : complaint.priority}
                        >
                          <span className={`text-xs font-bold ${PRIORITY_CONFIG[complaint.priority]?.color || 'text-muted-foreground'}`}>
                            {complaint.priority?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status Column - Mini Badge */}
                      <TableCell className="p-1">
                        <div 
                          className={`px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_CONFIG[complaint.status]?.bgColor || 'bg-muted'} ${STATUS_CONFIG[complaint.status]?.color || 'text-muted-foreground'}`}
                          title={STATUS_CONFIG[complaint.status]?.labelKey ? t(STATUS_CONFIG[complaint.status].labelKey) : complaint.status}
                        >
                          {complaint.status?.substring(0, 3).toUpperCase()}
                        </div>
                      </TableCell>

                      {/* Date Column - Minimal */}
                      <TableCell className="p-2">
                        <div className="text-xs text-muted-foreground text-center">
                          <div>{format(new Date(complaint.createdAt), 'MMM')}</div>
                          <div className="font-medium">{format(new Date(complaint.createdAt), 'dd')}</div>
                        </div>
                      </TableCell>

                      {/* Actions Column - Compact Icons */}
                      <TableCell className="p-1">
                        <div className="flex flex-col space-y-1">
                          <div className="flex space-x-0.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewComplaint(complaint)}
                              className="h-6 w-6 p-0"
                              title="View"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <ProtectedAction resource="complaints" action="update">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(complaint)}
                                className="h-6 w-6 p-0 text-green-600"
                                title="Status"
                              >
                                <Settings className="h-3 w-3" />
                              </Button>
                            </ProtectedAction>
                          </div>
                          <div className="flex space-x-0.5">
                            <ProtectedAction resource="complaints" action="update">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditComplaint(complaint)}
                                className="h-6 w-6 p-0"
                                title="Edit"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </ProtectedAction>
                            <ProtectedAction resource="complaints" action="delete">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteComplaint(complaint.id)}
                                className="h-6 w-6 p-0 text-destructive"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </ProtectedAction>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Tablet Compact Table View */}
          <div className="hidden md:block lg:hidden rounded-md border">
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] p-1 text-xs">ID</TableHead>
                  <TableHead className="w-[180px] p-1 text-xs">Details</TableHead>
                  <TableHead className="w-[120px] p-1 text-xs">Customer</TableHead>
                  <TableHead className="w-[80px] p-1 text-xs">Region</TableHead>
                  <TableHead className="w-[50px] p-1 text-xs">P</TableHead>
                  <TableHead className="w-[60px] p-1 text-xs">Status</TableHead>
                  <TableHead className="w-[80px] p-1 text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No complaints found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComplaints.map((complaint) => {
                    if (!complaint || !complaint.priority || !complaint.status) {
                      return null;
                    }
                    return (
                      <TableRow key={complaint.id} className="hover:bg-muted/50">
                        <TableCell className="p-1 text-xs font-mono">{complaint.id}</TableCell>
                        <TableCell className="p-1">
                          <div className="truncate text-xs font-medium" title={complaint.title}>
                            {complaint.title}
                          </div>
                        </TableCell>
                        <TableCell className="p-1">
                          <div className="truncate text-xs" title={complaint.customer.name}>
                            {complaint.customer.name}
                          </div>
                        </TableCell>
                        <TableCell className="p-1 text-xs">{complaint.region}</TableCell>
                        <TableCell className="p-1">
                          <div className={`w-4 h-4 rounded-full ${PRIORITY_CONFIG[complaint.priority]?.bgColor}`} title={complaint.priority}></div>
                        </TableCell>
                        <TableCell className="p-1">
                          <div className={`px-1 py-0.5 rounded text-xs ${STATUS_CONFIG[complaint.status]?.bgColor}`}>
                            {complaint.status?.substring(0, 3)}
                          </div>
                        </TableCell>
                        <TableCell className="p-1">
                          <div className="flex space-x-0.5">
                            <Button variant="ghost" size="sm" onClick={() => handleViewComplaint(complaint)} className="h-5 w-5 p-0">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <ProtectedAction resource="complaints" action="update">
                              <Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(complaint)} className="h-5 w-5 p-0">
                                <Settings className="h-3 w-3" />
                              </Button>
                            </ProtectedAction>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No complaints found matching your criteria
              </div>
            ) : (
              filteredComplaints.map((complaint) => {
                if (!complaint || !complaint.priority || !complaint.status) {
                  return null;
                }
                return (
                  <Card key={complaint.id} className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-medium">{complaint.id}</span>
                          {isComplaintOverdue(complaint) && (
                            <AlertTriangle className="h-3 w-3 text-destructive" />
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Badge 
                            variant="secondary"
                            className={`text-xs ${PRIORITY_CONFIG[complaint.priority]?.bgColor || 'bg-muted'} ${PRIORITY_CONFIG[complaint.priority]?.color || 'text-muted-foreground'}`}
                          >
                            {PRIORITY_CONFIG[complaint.priority]?.labelKey ? t(PRIORITY_CONFIG[complaint.priority].labelKey) : complaint.priority}
                          </Badge>
                          <Badge 
                            variant="secondary"
                            className={`text-xs ${STATUS_CONFIG[complaint.status]?.bgColor || 'bg-muted'} ${STATUS_CONFIG[complaint.status]?.color || 'text-muted-foreground'}`}
                          >
                            {STATUS_CONFIG[complaint.status]?.labelKey ? t(STATUS_CONFIG[complaint.status].labelKey) : complaint.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <h4 className="font-medium text-sm">{complaint.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {t(`complaint_type.${complaint.category}`)}
                        </p>
                      </div>

                      {/* Customer & Location */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate">{complaint.customer.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{complaint.customer.phone || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-primary font-medium">{complaint.region}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{format(new Date(complaint.createdAt), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end space-x-2 pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewComplaint(complaint)}
                          className="h-8 px-3 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <ProtectedAction resource="complaints" action="update">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusUpdate(complaint)}
                            className="h-8 px-3 text-xs text-green-600 hover:text-green-700"
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Status
                          </Button>
                        </ProtectedAction>
                        <ProtectedAction resource="complaints" action="update">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditComplaint(complaint)}
                            className="h-8 px-3 text-xs"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </ProtectedAction>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Complaint Dialog */}
      {viewingComplaint && (
        <Dialog open={!!viewingComplaint} onOpenChange={() => setViewingComplaint(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <span>Complaint Details - {viewingComplaint.id}</span>
                {isComplaintOverdue(viewingComplaint) && (
                  <Badge variant="destructive" className="ml-2">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                View detailed information about this complaint including customer details, status, and resolution history.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Title</Label>
                    <p className="text-sm text-muted-foreground mt-1">{viewingComplaint.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <p className="text-sm text-muted-foreground mt-1 capitalize">{viewingComplaint.category.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <div className="mt-1">
                      <Badge className={`${PRIORITY_CONFIG[viewingComplaint.priority]?.bgColor || 'bg-muted'} ${PRIORITY_CONFIG[viewingComplaint.priority]?.color || 'text-muted-foreground'}`}>
                        {PRIORITY_CONFIG[viewingComplaint.priority]?.label || viewingComplaint.priority || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      <Badge className={`${STATUS_CONFIG[viewingComplaint.status]?.bgColor || 'bg-muted'} ${STATUS_CONFIG[viewingComplaint.status]?.color || 'text-muted-foreground'}`}>
                        {STATUS_CONFIG[viewingComplaint.status]?.label || viewingComplaint.status || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {viewingComplaint.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                    {viewingComplaint.description}
                  </p>
                </div>
              )}

              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm text-muted-foreground mt-1">{viewingComplaint.customer.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-muted-foreground mt-1">{viewingComplaint.customer.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm text-muted-foreground mt-1">{viewingComplaint.customer.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Address</Label>
                    <p className="text-sm text-muted-foreground mt-1">{viewingComplaint.customer.address || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Region</Label>
                    <p className="text-sm text-muted-foreground mt-1">{viewingComplaint.region}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Meter Number</Label>
                    <p className="text-sm text-muted-foreground mt-1">{viewingComplaint.customer.meterNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Account Number</Label>
                    <p className="text-sm text-muted-foreground mt-1">{viewingComplaint.customer.accountNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Timeline Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Timeline</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Created At</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(viewingComplaint.createdAt), 'PPP p')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(viewingComplaint.updatedAt), 'PPP p')}
                    </p>
                  </div>
                  {viewingComplaint.estimatedResolution && (
                    <div>
                      <Label className="text-sm font-medium">Estimated Resolution</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(viewingComplaint.estimatedResolution), 'PPP p')}
                      </p>
                    </div>
                  )}
                  {viewingComplaint.resolvedAt && (
                    <div>
                      <Label className="text-sm font-medium">Resolved At</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(viewingComplaint.resolvedAt), 'PPP p')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Assignment Information */}
              {(viewingComplaint.assignedTo || viewingComplaint.assignedBy || viewingComplaint.createdBy) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Assignment</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {viewingComplaint.assignedTo && (
                      <div>
                        <Label className="text-sm font-medium">Assigned To</Label>
                        <p className="text-sm text-muted-foreground mt-1">User ID: {viewingComplaint.assignedTo}</p>
                      </div>
                    )}
                    {viewingComplaint.assignedBy && (
                      <div>
                        <Label className="text-sm font-medium">Assigned By</Label>
                        <p className="text-sm text-muted-foreground mt-1">User ID: {viewingComplaint.assignedBy}</p>
                      </div>
                    )}
                    {viewingComplaint.createdBy && (
                      <div>
                        <Label className="text-sm font-medium">Created By</Label>
                        <p className="text-sm text-muted-foreground mt-1">User ID: {viewingComplaint.createdBy}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {viewingComplaint.notes && viewingComplaint.notes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Notes</h3>
                  <div className="space-y-2">
                    {viewingComplaint.notes.map((note, index) => (
                      <div key={index} className="bg-muted/50 p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">{note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Complaint Dialog */}
      {editingComplaint && (
        <Dialog open={!!editingComplaint} onOpenChange={() => setEditingComplaint(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Complaint - {editingComplaint.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingComplaint.title}
                    onChange={(e) => setEditingComplaint({...editingComplaint, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Input
                    id="edit-category"
                    value={editingComplaint.category}
                    onChange={(e) => setEditingComplaint({...editingComplaint, category: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select 
                    value={editingComplaint.priority} 
                    onValueChange={(value) => setEditingComplaint({...editingComplaint, priority: value})}
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
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={editingComplaint.status} 
                    onValueChange={(value) => setEditingComplaint({...editingComplaint, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Keep current status as an option */}
                      <SelectItem value={editingComplaint.status}>
                        {STATUS_CONFIG[editingComplaint.status]?.label || editingComplaint.status} (Current)
                      </SelectItem>
                      {/* Show allowed transitions */}
                      {getAllowedStatusTransitions(editingComplaint.status).map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_CONFIG[status]?.label || status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingComplaint(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateComplaint}>
                  Update Complaint
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Status Update Dialog */}
      {statusUpdateComplaint && (
        <Dialog open={!!statusUpdateComplaint} onOpenChange={() => setStatusUpdateComplaint(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Update Status - {statusUpdateComplaint.id}</span>
              </DialogTitle>
              <DialogDescription>
                Update the status of this complaint and add any relevant notes or work details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Current Status Info */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Current Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Customer:</span>
                    <p className="font-medium">{statusUpdateComplaint.customer.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Status:</span>
                    <div className="mt-1">
                      <Badge className={`${STATUS_CONFIG[statusUpdateComplaint.status]?.bgColor || 'bg-muted'} ${STATUS_CONFIG[statusUpdateComplaint.status]?.color || 'text-muted-foreground'}`}>
                        {STATUS_CONFIG[statusUpdateComplaint.status]?.label || statusUpdateComplaint.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Title:</span>
                    <p className="font-medium">{statusUpdateComplaint.title}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Region:</span>
                    <p className="font-medium">{statusUpdateComplaint.region}</p>
                  </div>
                </div>
              </div>

              {/* Status Update Form */}
              <div className="space-y-4">
                {/* Workflow Information */}
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <h5 className="text-sm font-medium text-blue-800 mb-1">Status Workflow</h5>
                  <p className="text-xs text-blue-600">
                    {getAllowedStatusTransitions(statusUpdateComplaint.status).length > 0 
                      ? `From "${STATUS_CONFIG[statusUpdateComplaint.status]?.label || statusUpdateComplaint.status}", you can change to: ${getAllowedStatusTransitions(statusUpdateComplaint.status).map(s => STATUS_CONFIG[s]?.label || s).join(', ')}`
                      : `"${STATUS_CONFIG[statusUpdateComplaint.status]?.label || statusUpdateComplaint.status}" is a final state - no further status changes allowed.`
                    }
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status-update">New Status *</Label>
                    <Select 
                      value={statusUpdateForm.status} 
                      onValueChange={(value) => setStatusUpdateForm({...statusUpdateForm, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAllowedStatusTransitions(statusUpdateComplaint.status).map((status) => (
                          <SelectItem key={status} value={status}>
                            {STATUS_CONFIG[status]?.label || status}
                          </SelectItem>
                        ))}
                        {getAllowedStatusTransitions(statusUpdateComplaint.status).length === 0 && (
                          <SelectItem value="" disabled>
                            No status changes allowed (final state)
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {statusUpdateForm.status === 'resolved' && (
                    <div className="space-y-2">
                      <Label htmlFor="work-type">Type of Work Done *</Label>
                      <Select 
                        value={statusUpdateForm.workType} 
                        onValueChange={(value) => setStatusUpdateForm({...statusUpdateForm, workType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select work type" />
                        </SelectTrigger>
                        <SelectContent>
                          {WORK_TYPES.map((workType) => (
                            <SelectItem key={workType.value} value={workType.value}>
                              {workType.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {statusUpdateForm.status === 'resolved' && (
                  <div className="space-y-2">
                    <Label htmlFor="resolution-notes">Resolution Details</Label>
                    <Textarea
                      id="resolution-notes"
                      placeholder="Describe the work performed and resolution details..."
                      value={statusUpdateForm.resolutionNotes}
                      onChange={(e) => setStatusUpdateForm({...statusUpdateForm, resolutionNotes: e.target.value})}
                      rows={3}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="status-notes">Additional Notes</Label>
                  <Textarea
                    id="status-notes"
                    placeholder="Add any additional notes about this status update..."
                    value={statusUpdateForm.notes}
                    onChange={(e) => setStatusUpdateForm({...statusUpdateForm, notes: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setStatusUpdateComplaint(null)}
                  disabled={isUpdatingStatus}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleStatusUpdateSubmit}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isUpdatingStatus || getAllowedStatusTransitions(statusUpdateComplaint.status).length === 0}
                >
                  {isUpdatingStatus ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                      Updating...
                    </>
                  ) : getAllowedStatusTransitions(statusUpdateComplaint.status).length === 0 ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      No Updates Allowed
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Update Status
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ComplaintsList;
export { ComplaintsList };