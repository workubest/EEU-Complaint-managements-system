import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/lib/api';
import { CategoryHelper } from '@/components/complaints/CategoryHelper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { COMPLAINT_CATEGORIES, COMPLAINT_TITLES, REGIONS, SERVICE_CENTERS } from '@/lib/constants';
import type { ComplaintCategory, ComplaintPriority } from '@/types/complaint';
import {
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard,
  Zap,
  AlertCircle,
  Flag,
  MessageSquare,
  Send,
  CheckCircle
} from 'lucide-react';

export function ComplaintForm() {
  const { toast } = useToast();
  const { user, permissions } = useAuth();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('form');

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    region: user?.region || '',
    serviceCenter: user?.serviceCenter || '',
    complaintNumber: '',
    accountNumber: '',
    title: '',
    description: '',
    category: '' as ComplaintCategory,
    priority: 'medium' as ComplaintPriority
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare complaint data
      const complaintData = {
        customer: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone,
          address: formData.customerAddress,
          region: formData.region,
          serviceCenter: formData.serviceCenter,
          complaintNumber: formData.complaintNumber,
          accountNumber: formData.accountNumber
        },
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        region: formData.region,
        serviceCenter: formData.serviceCenter,
        createdBy: user?.id || 'anonymous'
      };

      const response = await apiService.createComplaint(complaintData);

      if (response.success) {
        toast({
          title: t("complaint.success"),
          description: `${t("complaint.success_desc")} ${response.data?.id || 'CMP-' + Date.now().toString().slice(-6)}`,
        });

        // Reset form
        setFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          customerAddress: '',
          region: user?.region || '',
          serviceCenter: user?.serviceCenter || '',
          complaintNumber: '',
          accountNumber: '',
          title: '',
          description: '',
          category: '' as ComplaintCategory,
          priority: 'medium' as ComplaintPriority
        });
      } else {
        throw new Error(response.error || 'Failed to submit complaint');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast({
        title: t("complaint.error"),
        description: t("complaint.error_desc"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const availablePriorities = permissions.canSetHighPriority 
    ? ['low', 'medium', 'high', 'critical']
    : ['low', 'medium'];

  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category: category as ComplaintCategory,
      title: '' // Reset title when category changes
    }));
    setActiveTab('form'); // Switch back to form tab after selection
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50 relative overflow-hidden">
      {/* Ethiopian Flag Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-1/3 bg-green-600"></div>
        <div className="h-1/3 bg-yellow-400"></div>
        <div className="h-1/3 bg-red-600"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-6">
        {/* Enhanced EEU Header with Ethiopian Colors */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            {/* Decorative elements */}
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-600 rounded-full animate-pulse delay-300"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-red-600 rounded-full animate-pulse delay-700"></div>
            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse delay-1000"></div>
            
            <div className="bg-gradient-to-r from-green-600 via-yellow-400 to-red-600 p-1 rounded-2xl shadow-2xl">
              <div className="bg-white rounded-xl px-8 py-6 shadow-inner">
                <div className="flex items-center justify-center space-x-6">
                  {/* Ethiopian Electric Logo */}
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg">
                      <Zap className="h-8 w-8 text-yellow-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 via-yellow-600 to-red-600 bg-clip-text text-transparent">
                      Ethiopian Electric Utility
                    </h1>
                    <p className="text-green-700 text-lg font-semibold mt-1">
                      የኢትዮጵያ ኤሌክትሪክ አገልግሎት
                    </p>
                    <div className="flex items-center justify-center space-x-2 mt-2">
                      <div className="w-8 h-0.5 bg-green-600"></div>
                      <div className="w-8 h-0.5 bg-yellow-400"></div>
                      <div className="w-8 h-0.5 bg-red-600"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-lg px-6 py-3 inline-block shadow-md">
            <p className="text-gray-800 text-lg font-medium">
              Customer Complaint Management System
            </p>
            <p className="text-green-700 text-sm font-medium">
              የደንበኞች ቅሬታ አስተዳደር ሲስተም
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-gradient-to-r from-green-600 via-yellow-400 to-red-600 p-1 rounded-xl shadow-lg">
            <TabsTrigger 
              value="form" 
              className="flex items-center justify-center space-x-2 py-4 px-6 rounded-lg font-semibold text-sm transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-white/20 text-white"
            >
              <FileText className="h-5 w-5" />
              <span>Complaint Form</span>
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className="flex items-center justify-center space-x-2 py-4 px-6 rounded-lg font-semibold text-sm transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-white/20 text-white relative"
            >
              <Zap className="h-5 w-5" />
              <span>Browse Categories</span>
              {formData.category && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle className="h-2 w-2 text-green-700" />
                </div>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <form onSubmit={handleSubmit}>
              {/* Two-Column Layout with Official EEU Colors */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column - Customer & Contact Information */}
                <Card className="shadow-xl bg-white rounded-xl border-2 border-green-200 hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-green-600 via-yellow-400 to-green-600 text-white py-6 rounded-t-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 via-yellow-400/90 to-green-600/90"></div>
                    <div className="relative z-10">
                      <CardTitle className="text-xl font-bold flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <User className="h-6 w-6" />
                        </div>
                        <span>Customer Information</span>
                      </CardTitle>
                      <p className="text-green-100 text-sm mt-2 font-medium">
                        Personal and contact details • የግል እና የመገናኛ ዝርዝሮች
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="customerName" className="text-sm font-medium text-gray-700">
                        {t("complaint.customer_name")} *
                      </Label>
                      <div className="relative">
                        <Input
                          id="customerName"
                          value={formData.customerName}
                          onChange={(e) => handleInputChange('customerName', e.target.value)}
                          placeholder={t("form.enter_full_name")}
                          className="pl-12 pr-12 py-3 border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg transition-all duration-200 hover:border-green-300"
                          required
                        />
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
                        {formData.customerName && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone" className="text-sm font-medium text-gray-700">
                        {t("form.phone_number")} *
                      </Label>
                      <div className="relative">
                        <Input
                          id="customerPhone"
                          value={formData.customerPhone}
                          onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                          placeholder="+251-9XX-XXXXXX"
                          className="pl-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                          required
                        />
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        {formData.customerPhone && formData.customerPhone.length >= 10 && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail" className="text-sm font-medium text-gray-700">
                        {t("form.email")} <span className="text-gray-500">(Optional)</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="customerEmail"
                          type="email"
                          value={formData.customerEmail}
                          onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                          placeholder="customer@email.com"
                          className="pl-10 border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-lg"
                        />
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        {formData.customerEmail && formData.customerEmail.includes('@') && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                    </div>

                    {/* Account Number Field */}
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber" className="text-sm font-medium text-gray-700">
                        {t("form.account_number")} <span className="text-gray-500">(Optional)</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="accountNumber"
                          value={formData.accountNumber}
                          onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                          placeholder="ACC-123456"
                          className="pl-10 border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-lg"
                        />
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        {formData.accountNumber && formData.accountNumber.length >= 6 && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                    </div>

                    {/* Address Field */}
                    <div className="space-y-2">
                      <Label htmlFor="customerAddress" className="text-sm font-medium text-gray-700">
                        {t("form.address")} *
                      </Label>
                      <div className="relative">
                        <Textarea
                          id="customerAddress"
                          value={formData.customerAddress}
                          onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                          placeholder={t("form.complete_address")}
                          className="pl-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg min-h-[80px] resize-none"
                          required
                        />
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        {formData.customerAddress && formData.customerAddress.length > 10 && (
                          <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                    </div>

                    {/* Region Field */}
                    <div className="space-y-2">
                      <Label htmlFor="region" className="text-sm font-medium text-gray-700">
                        {t("form.region")} *
                      </Label>
                      <div className="relative">
                        <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                          <SelectTrigger className="pl-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg">
                            <SelectValue placeholder={t("form.select_region")} />
                          </SelectTrigger>
                          <SelectContent>
                            {REGIONS.map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Service Center Field */}
                    <div className="space-y-2">
                      <Label htmlFor="serviceCenter" className="text-sm font-medium text-gray-700">
                        {t("form.service_center")} <span className="text-gray-500">(Optional)</span>
                      </Label>
                      <div className="relative">
                        <Select value={formData.serviceCenter} onValueChange={(value) => handleInputChange('serviceCenter', value)}>
                          <SelectTrigger className="pl-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg">
                            <SelectValue placeholder={t("form.select_service_center")} />
                          </SelectTrigger>
                          <SelectContent>
                            {SERVICE_CENTERS.map((center) => (
                              <SelectItem key={center} value={center}>
                                {center}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right Column - Complaint Details */}
                <Card className="shadow-xl bg-white rounded-xl border-2 border-yellow-200 hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 text-white py-6 rounded-t-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/90 via-red-500/90 to-yellow-400/90"></div>
                    <div className="relative z-10">
                      <CardTitle className="text-xl font-bold flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <AlertCircle className="h-6 w-6" />
                        </div>
                        <span>Complaint Details</span>
                      </CardTitle>
                      <p className="text-yellow-100 text-sm mt-2 font-medium">
                        Describe your electrical service issue • የኤሌክትሪክ አገልግሎት ችግርዎን ይግለጹ
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">

                    {/* Category */}
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                        {t("form.complaint_category")} *
                      </Label>
                      <div className="relative">
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                          <SelectTrigger className="pl-10 border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-lg">
                            <SelectValue placeholder={t("form.select_category")} />
                          </SelectTrigger>
                          <SelectContent>
                            {COMPLAINT_CATEGORIES.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
                        {t("form.priority")} *
                      </Label>
                      <div className="relative">
                        <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                          <SelectTrigger className="pl-10 border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-lg">
                            <SelectValue placeholder={t("form.select_priority")} />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePriorities.map((priority) => (
                              <SelectItem key={priority} value={priority}>
                                {t(`priority.${priority}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <AlertCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                        {t("form.complaint_title")} *
                      </Label>
                      {formData.category && COMPLAINT_TITLES[formData.category as keyof typeof COMPLAINT_TITLES] ? (
                        <div className="relative">
                          <Select value={formData.title} onValueChange={(value) => handleInputChange('title', value)}>
                            <SelectTrigger className="pl-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg">
                              <SelectValue placeholder={t("form.select_predefined_title")} />
                            </SelectTrigger>
                            <SelectContent>
                              {COMPLAINT_TITLES[formData.category as keyof typeof COMPLAINT_TITLES].map((title, index) => (
                                <SelectItem key={index} value={title}>
                                  {title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                      ) : (
                        <div className="relative">
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            placeholder={t("form.enter_complaint_title")}
                            className="pl-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                            required
                          />
                          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          {formData.title && (
                            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                        {t("form.detailed_description")} *
                      </Label>
                      <div className="relative">
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder={t("complaint.description_placeholder")}
                          className="pl-10 pr-16 py-3 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg min-h-[120px] resize-none"
                          required
                        />
                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        {formData.description && formData.description.length > 20 && (
                          <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-emerald-500" />
                        )}
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                          {formData.description.length}/500
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Submit Button with Ethiopian Colors */}
              <div className="mt-10">
                <div className="relative">
                  {/* Decorative background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-yellow-400 to-red-600 rounded-xl blur-sm opacity-75"></div>
                  
                  <Button
                    type="submit"
                    className="relative w-full py-6 text-xl font-bold bg-gradient-to-r from-green-600 via-yellow-400 to-red-600 hover:from-green-700 hover:via-yellow-500 hover:to-red-700 text-white rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    disabled={isSubmitting}
                  >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t("form.submitting")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <Send className="h-6 w-6" />
                      <span>{t("form.submit_complaint")}</span>
                    </div>
                  )}
                </Button>
                </div>
                
                {/* Enhanced Progress Indicator with Ethiopian Colors */}
                <div className="mt-6 flex justify-center items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full transition-all duration-500 ${
                      formData.customerName && formData.customerPhone && formData.customerAddress && formData.region 
                        ? 'bg-green-600 shadow-lg shadow-green-300' 
                        : 'bg-gray-300'
                    }`}></div>
                    <span className="text-xs font-medium text-gray-600">Customer Info</span>
                  </div>
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full transition-all duration-500 ${
                      formData.category && formData.title 
                        ? 'bg-yellow-400 shadow-lg shadow-yellow-300' 
                        : 'bg-gray-300'
                    }`}></div>
                    <span className="text-xs font-medium text-gray-600">Complaint Details</span>
                  </div>
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full transition-all duration-500 ${
                      formData.description && formData.description.length > 10 
                        ? 'bg-red-600 shadow-lg shadow-red-300' 
                        : 'bg-gray-300'
                    }`}></div>
                    <span className="text-xs font-medium text-gray-600">Description</span>
                  </div>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="categories">
            <Card className="shadow-xl bg-white rounded-xl border-2 border-yellow-200 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-green-600 via-yellow-400 to-red-600 text-white py-6 rounded-t-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 via-yellow-400/90 to-red-600/90"></div>
                <div className="relative z-10">
                  <CardTitle className="text-xl font-bold flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Zap className="h-6 w-6" />
                    </div>
                    <span>Browse Categories</span>
                  </CardTitle>
                  <p className="text-green-100 text-sm mt-2 font-medium">
                    Select the category that best describes your electrical service issue
                  </p>
                  <p className="text-yellow-100 text-xs mt-1">
                    የኤሌክትሪክ አገልግሎት ችግርዎን በተሻለ ሁኔታ የሚገልጸውን ምድብ ይምረጡ
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CategoryHelper 
                  onCategorySelect={handleCategorySelect}
                  selectedCategory={formData.category}
                />
                {formData.category && (
                  <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-emerald-700 mb-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">Category Selected!</span>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">
                      You've selected <span className="font-medium text-emerald-700">"{COMPLAINT_CATEGORIES.find(cat => cat.value === formData.category)?.label}"</span>
                    </p>
                    <Button
                      onClick={() => setActiveTab('form')}
                      className="bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-600 hover:to-amber-600 text-white px-4 py-2 rounded-lg font-medium text-sm"
                    >
                      Continue to Form →
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}