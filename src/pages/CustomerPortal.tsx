import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ComplaintCategory, ComplaintPriority } from '@/types/complaint';
import { COMPLAINT_CATEGORIES } from '@/lib/constants';
import { Loader2, CheckCircle, AlertCircle, User, Building2, Zap, Shield, Users, FileText, Clock, ChevronDown } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

// API integration
import { apiService } from '@/lib/api';
import { environment } from '@/config/environment';

export function CustomerPortal() {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // State management
  const [step, setStep] = useState<'account_validation' | 'complaint_form'>('account_validation');
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [customerData, setCustomerData] = useState<any>(null);
  
  // Interactive state
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [clickEffects, setClickEffects] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  // Show floating button after scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingButton(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click effect handler
  const handleInteractiveClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newEffect = {
      id: Date.now(),
      x,
      y
    };
    
    setClickEffects(prev => [...prev, newEffect]);
    
    // Remove effect after animation
    setTimeout(() => {
      setClickEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
    }, 1000);
  };
  
  // Complaint form data
  const [complaintData, setComplaintData] = useState({
    title: '',
    description: '',
    category: '' as ComplaintCategory,
    priority: 'medium' as ComplaintPriority
  });



  // Handle account validation
  const handleAccountValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    try {
      // Get all customers and search for the account number
      const response = await apiService.getCustomers();

      if (response.success && response.data) {
        // Search for customer by account number (handle both string and number types)
        const customer = response.data.find((c: any) => 
          String(c['Account Number']) === accountNumber || 
          String(c.accountNumber) === accountNumber ||
          String(c['Contract Account']) === accountNumber ||
          String(c.ID) === accountNumber ||
          String(c.id) === accountNumber
        );

        if (customer) {
          // Customer found
          setCustomerData({
            type: 'customer' as const,
            data: customer
          });
          setStep('complaint_form');
          toast({
            title: t("customer_portal.validation_success"),
            description: t("customer_portal.account_found"),
          });
        } else {
          // Customer not found, use demo mode
          console.log('Customer not found, using demo mode');
        // Demo mode - simulate validation with mock data
        const mockCustomerData = {
          type: 'customer' as const,
          data: {
            'Full Name': 'አበበ ተስፋዬ (Abebe Tesfaye)',
            'Contract Account': accountNumber,
            'Email': 'abebe.tesfaye@gmail.com',
            'Phone': '+251-911-123456',
            'Address': 'ቦሌ ክ/ከተማ ወረዳ 03 ቤት ቁጥር 123',
            'Region': 'አዲስ አበባ',
            'Account Type': 'Residential'
          }
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCustomerData(mockCustomerData);
        setStep('complaint_form');
        toast({
          title: t("customer_portal.validation_success"),
          description: t("customer_portal.account_found") + " (Demo Mode)",
        });
        }
      } else {
        // API failed, use demo mode
        console.log('API failed, using demo mode');
        const mockCustomerData = {
          type: 'customer' as const,
          data: {
            'Full Name': 'አበበ ተስፋዬ (Abebe Tesfaye)',
            'Contract Account': accountNumber,
            'Email': 'abebe.tesfaye@gmail.com',
            'Phone': '+251-911-123456',
            'Address': 'ቦሌ ክ/ከተማ ወረዳ 03 ቤት ቁጥር 123',
            'Region': 'አዲስ አበባ',
            'Account Type': 'Residential'
          }
        };
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCustomerData(mockCustomerData);
        setStep('complaint_form');
        toast({
          title: t("customer_portal.validation_success"),
          description: t("customer_portal.account_found") + " (Demo Mode)",
        });
      }
    } catch (error) {
      console.error('Account validation error:', error);
      toast({
        title: t("customer_portal.validation_error"),
        description: t("customer_portal.validation_error_desc"),
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Handle complaint submission
  const handleComplaintSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare complaint data with customer information
      const complaintWithCustomerData = {
        ...complaintData,
        customerId: customerData?.data['Customer ID'] || '',
        contractAccount: customerData?.data['Contract Account'] || accountNumber,
        businessPartnerNumber: customerData?.data['Business Partner ID'] || '',
        customerName: customerData?.data['Full Name'] || customerData?.data['Company Name'] || '',
        customerEmail: customerData?.data['Email'] || '',
        customerPhone: customerData?.data['Phone'] || '',
        customerAddress: customerData?.data['Address'] || '',
        region: customerData?.data['Region'] || '',
        createdBy: 'customer_portal'
      };

      // Try to submit complaint via API service
      const result = await apiService.createComplaint(complaintWithCustomerData);
      
      if (result.success) {
        toast({
          title: t("complaint.success"),
          description: `${t("complaint.success_desc")} ${result.data?.id || 'N/A'}`,
        });
        
        // Reset form
        setComplaintData({
          title: '',
          description: '',
          category: '' as ComplaintCategory,
          priority: 'medium' as ComplaintPriority
        });
        setStep('account_validation');
        setAccountNumber('');
        setCustomerData(null);
      } else {
        // If API fails, use demo mode
        // Demo mode - simulate complaint submission with customer data
        const demoComplaintData = {
          ...complaintData,
          customerId: customerData?.data['Customer ID'] || '',
          contractAccount: customerData?.data['Contract Account'] || accountNumber,
          businessPartnerNumber: customerData?.data['Business Partner ID'] || '',
          customerName: customerData?.data['Full Name'] || customerData?.data['Company Name'] || '',
          customerEmail: customerData?.data['Email'] || '',
          customerPhone: customerData?.data['Phone'] || '',
          customerAddress: customerData?.data['Address'] || '',
          region: customerData?.data['Region'] || '',
          createdBy: 'customer_portal'
        };

        // Log the complaint data for demo purposes
        console.log('Demo Mode - Complaint Data with Customer Information:', demoComplaintData);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const mockComplaintId = `DEMO-${Date.now().toString().slice(-6)}`;
        
        toast({
          title: t("complaint.success"),
          description: `${t("complaint.success_desc")} ${mockComplaintId} (Demo Mode)`,
        });
        
        // Reset form
        setComplaintData({
          title: '',
          description: '',
          category: '' as ComplaintCategory,
          priority: 'medium' as ComplaintPriority
        });
        setStep('account_validation');
        setAccountNumber('');
        setCustomerData(null);
        return;
      }
    } catch (error) {
      console.error('Complaint submission error:', error);
      toast({
        title: t("complaint.error"),
        description: error instanceof Error ? error.message : t("complaint.error_desc"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes for complaint form
  const handleComplaintInputChange = (field: string, value: string) => {
    setComplaintData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-suggest priority based on complaint category
      if (field === 'category') {
        const selectedCategory = COMPLAINT_CATEGORIES.find(cat => cat.value === value);
        if (selectedCategory && selectedCategory.priority) {
          newData.priority = selectedCategory.priority as ComplaintPriority;
        }
      }
      
      return newData;
    });
  };

  // Render customer information display
  const renderCustomerInfo = () => {
    if (!customerData) return null;

    const data = customerData.data;
    const isBusinessPartner = customerData.type === 'business_partner';

    return (
      <Card className="mb-6 border-2 border-eeu-green/20 bg-gradient-to-r from-eeu-green/5 to-eeu-orange/5 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-3 bg-gradient-to-r from-eeu-green/10 to-eeu-orange/10 rounded-t-lg">
          <CardTitle className="flex items-center space-x-3 text-eeu-green">
            {/* Enhanced User/Business Icon */}
            <div className="relative w-12 h-12 group cursor-pointer">
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
                <div className="bg-eeu-green text-white px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg font-semibold">
                  {isBusinessPartner ? 'Business Account' : 'Personal Account'}
                </div>
              </div>
              {/* Outer verification glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-eeu-green to-green-600 rounded-full opacity-20 animate-pulse group-hover:opacity-40 transition-opacity duration-500"></div>
              {/* Rotating verification ring */}
              <div className="absolute inset-0.5 border-2 border-eeu-green/40 rounded-full animate-spin group-hover:border-eeu-green transition-colors duration-300" style={{ animationDuration: '5s' }}></div>
              {/* Main user container */}
              <div className="absolute inset-1.5 bg-gradient-to-br from-eeu-green via-green-500 to-green-600 rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
                {isBusinessPartner ? <Building2 className="h-5 w-5 text-white drop-shadow-lg group-hover:rotate-6 transition-transform duration-500" /> : <User className="h-5 w-5 text-white drop-shadow-lg group-hover:scale-125 transition-transform duration-500" />}
              </div>
              {/* Success particles */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-bounce opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-emerald-400 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="font-bold">{t("customer_portal.account_verified")}</span>
            {/* Enhanced Check Icon */}
            <div className="relative w-12 h-12 group cursor-pointer">
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
                <div className="bg-green-500 text-white px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg font-semibold">
                  Verified ✓
                </div>
              </div>
              {/* Outer success glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-eeu-green rounded-full opacity-30 animate-pulse group-hover:animate-ping"></div>
              {/* Success ring animation */}
              <div className="absolute inset-0.5 border-2 border-green-400/60 rounded-full animate-spin group-hover:border-green-400 transition-colors duration-300" style={{ animationDuration: '3s' }}></div>
              {/* Main check container */}
              <div className="absolute inset-1.5 bg-gradient-to-br from-green-400 via-eeu-green to-green-600 rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-125">
                <CheckCircle className="h-5 w-5 text-white drop-shadow-lg group-hover:animate-pulse group-hover:scale-110 transition-transform duration-300" />
              </div>
              {/* Verification sparkles */}
              <div className="absolute -top-0.5 left-1/2 w-1 h-1 bg-green-300 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-1/2 -right-0.5 w-0.5 h-0.5 bg-emerald-300 rounded-full animate-bounce opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ animationDelay: '0.3s' }}></div>
              <div className="absolute -bottom-0.5 left-1/4 w-1 h-1 bg-green-400 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-400" style={{ animationDelay: '0.5s' }}></div>
              {/* Success wave */}
              <div className="absolute inset-0 border border-green-400/30 rounded-full animate-ping group-hover:scale-150 group-hover:opacity-0 transition-all duration-1000"></div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>{t("customer_portal.customer_name")}:</strong> 
              <span className="ml-2">{data['Full Name'] || data['Company Name']}</span>
            </div>
            <div>
              <strong>{t("customer_portal.account_number")}:</strong> 
              <span className="ml-2">{data['Contract Account'] || data['Business Partner ID']}</span>
            </div>
            <div>
              <strong>{t("form.email")}:</strong> 
              <span className="ml-2">{data['Email']}</span>
            </div>
            <div>
              <strong>{t("form.phone_number")}:</strong> 
              <span className="ml-2">{data['Phone']}</span>
            </div>
            <div className="md:col-span-2">
              <strong>{t("form.address")}:</strong> 
              <span className="ml-2">{data['Address']}</span>
            </div>
            <div>
              <strong>{t("common.region")}:</strong> 
              <span className="ml-2">{data['Region']}</span>
            </div>
            <div>
              <strong>{t("customer_portal.account_type")}:</strong> 
              <span className="ml-2">{data['Account Type'] || data['Business Type']}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-eeu-green/5 via-white to-eeu-orange/5 relative overflow-hidden">

      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-eeu-orange rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-eeu-green rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-eeu-green to-eeu-orange rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto space-y-8 p-6">
        {/* Enhanced Header */}
        <div className="animate-fade-in text-center py-12">
          {/* Centered Interactive Logo Section */}
          <div className="flex flex-col items-center justify-center mb-12">
            <div 
              className="w-80 h-80 lg:w-96 lg:h-96 flex items-center justify-center group cursor-pointer relative mx-auto mb-8"
              onClick={handleInteractiveClick}
              onMouseEnter={() => setIsLogoHovered(true)}
              onMouseLeave={() => setIsLogoHovered(false)}
            >
              {/* Enhanced Glow Effects */}
              <div className={`absolute inset-0 bg-gradient-eeu rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-all duration-700 ${isLogoHovered ? 'animate-pulse-glow' : 'animate-pulse'}`}></div>
              <div className="absolute inset-6 bg-gradient-eeu-reverse rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
              
              <img 
                src="/eeu-logo-new.png" 
                alt="Ethiopian Electric Utility Logo" 
                className={`w-full h-full object-contain transform group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 relative z-10 ${isLogoHovered ? 'animate-float' : ''}`}
              />
              
              {/* Multiple Rotating Rings */}
              <div className="absolute inset-0 border-4 border-transparent border-t-eeu-orange border-r-eeu-green rounded-full animate-spin opacity-20 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="absolute inset-4 border-2 border-transparent border-b-eeu-green border-l-eeu-orange rounded-full animate-spin opacity-15 group-hover:opacity-35 transition-opacity duration-500" style={{ animationDirection: 'reverse', animationDuration: '4s' }}></div>
              <div className="absolute inset-8 border border-transparent border-t-white/30 rounded-full animate-spin opacity-10 group-hover:opacity-25 transition-opacity duration-500" style={{ animationDuration: '6s' }}></div>
              
              {/* Enhanced Corner Sparkles */}
              <div className="absolute top-6 right-6 w-4 h-4 bg-eeu-orange rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300"></div>
              <div className="absolute bottom-8 left-8 w-3 h-3 bg-eeu-green rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300" style={{ animationDelay: '0.3s' }}></div>
              <div className="absolute top-12 left-12 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300" style={{ animationDelay: '0.6s' }}></div>
              <div className="absolute bottom-12 right-12 w-2 h-2 bg-eeu-orange/70 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300" style={{ animationDelay: '0.9s' }}></div>
              
              {/* Click Effects */}
              {clickEffects.map(effect => (
                <div
                  key={effect.id}
                  className="absolute w-8 h-8 bg-gradient-eeu rounded-full animate-ping pointer-events-none"
                  style={{
                    left: effect.x - 16,
                    top: effect.y - 16,
                    animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) forwards'
                  }}
                />
              ))}
              
              {/* Interactive Tooltip */}
              {isLogoHovered && (
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-white border-2 border-eeu-orange text-eeu-orange px-4 py-2 rounded-lg text-sm font-medium animate-fade-in shadow-lg">
                  Click me for magic! ✨
                </div>
              )}
            </div>
            
            {/* Modern Title Section with EEU Brand Colors */}
            <div className="text-center space-y-4">
              <div className="relative">
                <p className="text-2xl lg:text-3xl text-eeu-orange font-bold drop-shadow-lg shadow-black/50 relative z-10">
                  Ethiopian Electric Utility Service Portal
                </p>
                {/* Enhanced shadow effect */}
                <p className="absolute inset-0 text-2xl lg:text-3xl text-black/40 font-bold blur-sm transform translate-x-1 translate-y-1">
                  Ethiopian Electric Utility Service Portal
                </p>
              </div>
              <p className="text-xl text-eeu-green font-bold">
                የኢትዮጵያ ኤሌክትሪክ አገልግሎት
              </p>
              <p className="text-lg text-eeu-orange font-semibold">
                Customer Service Portal
              </p>
            </div>
          </div>

          {/* Modern Interactive Features with EEU Brand Colors */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="group flex items-center space-x-4 bg-gradient-to-r from-white to-eeu-green/5 rounded-xl px-8 py-4 shadow-lg border-2 border-eeu-green/20 hover:border-eeu-green hover:shadow-xl hover:shadow-eeu-green/20 transition-all duration-300 cursor-pointer transform hover:scale-105">
              <div className="relative w-12 h-12 bg-gradient-to-br from-eeu-green/10 to-eeu-green/20 border-2 border-eeu-green rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <Zap className="w-6 h-6 text-eeu-green group-hover:scale-110 group-hover:text-green-600 transition-all duration-300" />
                <div className="absolute inset-0 bg-eeu-green/10 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-eeu-green group-hover:text-green-600 transition-colors duration-300">24/7 Service</div>
                <div className="text-sm text-gray-600 font-medium group-hover:text-eeu-green transition-colors duration-300">Always Available</div>
              </div>
            </div>
            
            <div className="group flex items-center space-x-4 bg-gradient-to-r from-white to-eeu-orange/5 rounded-xl px-8 py-4 shadow-lg border-2 border-eeu-orange/20 hover:border-eeu-orange hover:shadow-xl hover:shadow-eeu-orange/20 transition-all duration-300 cursor-pointer transform hover:scale-105">
              <div className="relative w-12 h-12 bg-gradient-to-br from-eeu-orange/10 to-eeu-orange/20 border-2 border-eeu-orange rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <Shield className="w-6 h-6 text-eeu-orange group-hover:scale-110 group-hover:text-orange-600 transition-all duration-300" />
                <div className="absolute inset-0 bg-eeu-orange/10 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-eeu-orange group-hover:text-orange-600 transition-colors duration-300">Secure Portal</div>
                <div className="text-sm text-gray-600 font-medium group-hover:text-eeu-orange transition-colors duration-300">Protected Data</div>
              </div>
            </div>
            
            <div className="group flex items-center space-x-4 bg-gradient-to-r from-white to-eeu-green/5 rounded-xl px-8 py-4 shadow-lg border-2 border-eeu-green/20 hover:border-eeu-green hover:shadow-xl hover:shadow-eeu-green/20 transition-all duration-300 cursor-pointer transform hover:scale-105">
              <div className="relative w-12 h-12 bg-gradient-to-br from-eeu-green/10 to-eeu-green/20 border-2 border-eeu-green rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <Users className="w-6 h-6 text-eeu-green group-hover:scale-110 group-hover:text-green-600 transition-all duration-300" />
                <div className="absolute inset-0 bg-eeu-green/10 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-eeu-green group-hover:text-green-600 transition-colors duration-300">Customer Focus</div>
                <div className="text-sm text-gray-600 font-medium group-hover:text-eeu-green transition-colors duration-300">Your Satisfaction</div>
              </div>
            </div>
          </div>
          
          {/* Modern Welcome Message with EEU Brand Colors */}
          <div className="bg-white rounded-2xl p-10 shadow-xl border-2 border-eeu-orange/20 max-w-4xl mx-auto mb-8 hover:shadow-2xl hover:border-eeu-orange transition-all duration-300">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-16 h-16 bg-gradient-to-br from-eeu-green/10 to-eeu-green/20 border-2 border-eeu-green rounded-full flex items-center justify-center mr-4 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 cursor-pointer group">
                  <Users className="w-8 h-8 text-eeu-green group-hover:scale-110 group-hover:text-green-600 transition-all duration-300" />
                  <div className="absolute inset-0 bg-eeu-green/10 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h2 className="text-4xl font-bold text-eeu-green hover:text-green-600 transition-colors duration-300">
                  Welcome to Your Customer Portal
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="group text-center p-6 bg-gradient-to-br from-eeu-orange/10 to-orange-100/50 rounded-xl border-2 border-eeu-orange/20 hover:border-eeu-orange hover:shadow-lg hover:shadow-eeu-orange/20 transition-all duration-300 cursor-pointer transform hover:scale-105">
                  <div className="relative w-12 h-12 bg-gradient-to-br from-eeu-orange/10 to-eeu-orange/20 border-2 border-eeu-orange rounded-full flex items-center justify-center mx-auto mb-4 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <FileText className="w-6 h-6 text-eeu-orange group-hover:scale-110 group-hover:text-orange-600 transition-all duration-300" />
                    <div className="absolute inset-0 bg-eeu-orange/10 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="font-bold text-eeu-orange text-lg group-hover:text-orange-600 transition-colors duration-300">Submit</div>
                  <div className="text-gray-700 font-medium group-hover:text-eeu-orange transition-colors duration-300">Complaints</div>
                </div>
                <div className="group text-center p-6 bg-gradient-to-br from-eeu-green/10 to-green-100/50 rounded-xl border-2 border-eeu-green/20 hover:border-eeu-green hover:shadow-lg hover:shadow-eeu-green/20 transition-all duration-300 cursor-pointer transform hover:scale-105">
                  <div className="relative w-12 h-12 bg-gradient-to-br from-eeu-green/10 to-eeu-green/20 border-2 border-eeu-green rounded-full flex items-center justify-center mx-auto mb-4 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <Clock className="w-6 h-6 text-eeu-green group-hover:scale-110 group-hover:text-green-600 transition-all duration-300" />
                    <div className="absolute inset-0 bg-eeu-green/10 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="font-bold text-eeu-green text-lg group-hover:text-green-600 transition-colors duration-300">Track</div>
                  <div className="text-gray-700 font-medium group-hover:text-eeu-green transition-colors duration-300">Progress</div>
                </div>
                <div className="group text-center p-6 bg-gradient-to-br from-eeu-orange/10 to-orange-100/50 rounded-xl border-2 border-eeu-orange/20 hover:border-eeu-orange hover:shadow-lg hover:shadow-eeu-orange/20 transition-all duration-300 cursor-pointer transform hover:scale-105">
                  <div className="relative w-12 h-12 bg-gradient-to-br from-eeu-orange/10 to-eeu-orange/20 border-2 border-eeu-orange rounded-full flex items-center justify-center mx-auto mb-4 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <Users className="w-6 h-6 text-eeu-orange group-hover:scale-110 group-hover:text-orange-600 transition-all duration-300" />
                    <div className="absolute inset-0 bg-eeu-orange/10 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="font-bold text-eeu-orange text-lg group-hover:text-orange-600 transition-colors duration-300">Manage</div>
                  <div className="text-gray-700 font-medium group-hover:text-eeu-orange transition-colors duration-300">Account</div>
                </div>
              </div>
              
              <p className="text-gray-600 text-lg leading-relaxed text-center">
                Submit complaints, track your requests, and manage your electric service account with ease. 
                Our secure portal provides you with direct access to customer support and account management tools.
              </p>
              
              {/* Enhanced Interactive Arrow */}
              <div className="flex justify-center mt-8">
                <div className="relative group cursor-pointer">
                  {/* Main arrow container */}
                  <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-eeu-orange/40 hover:border-eeu-orange hover:shadow-2xl transition-all duration-300">
                    <ChevronDown className="w-10 h-10 text-eeu-orange" />
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white border-2 border-eeu-green text-eeu-green px-3 py-1 rounded-lg text-sm whitespace-nowrap shadow-lg font-semibold">
                      Start here ↓
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Step 1: Enhanced Account Validation */}
        {step === 'account_validation' && (
          <div className="space-y-8">
            {/* Enhanced Main Account Validation Card */}
            <Card className="border-2 border-eeu-orange/20 shadow-2xl bg-white/95 backdrop-blur-sm hover:shadow-3xl hover:border-eeu-orange transition-all duration-500 transform hover:scale-[1.02]">
              <CardHeader className="bg-gradient-to-r from-eeu-green via-eeu-green to-eeu-orange text-white rounded-t-xl relative overflow-hidden">
                {/* Enhanced Background Effects */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/10 to-transparent rounded-full translate-y-12 -translate-x-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
                
                <CardTitle className="flex items-center space-x-4 relative z-10">
                  {/* Enhanced Icon Container */}
                  <div className="relative w-16 h-16">
                    {/* Main check container */}
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-eeu-green/40">
                      <CheckCircle className="w-8 h-8 text-eeu-green" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-eeu-orange drop-shadow-2xl shadow-black/80 bg-white/90 px-3 py-1 rounded-lg border-2 border-eeu-orange/50">Account Validation</span>
                    <p className="text-white/90 text-sm font-medium mt-1">Secure access verification</p>
                  </div>
                </CardTitle>
                
                {/* Floating particles */}
                <div className="absolute top-4 right-20 w-1 h-1 bg-white/60 rounded-full animate-ping"></div>
                <div className="absolute bottom-4 left-20 w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
              </CardHeader>
              
              <CardContent className="space-y-8 pt-8 pb-8">
                <div className="text-center space-y-4">
                  {/* Enhanced Central Icon */}
                  <div className="relative w-32 h-32 mx-auto">
                    {/* Main icon container */}
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-eeu-orange/40">
                      <AlertCircle className="w-16 h-16 text-eeu-orange" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-eeu-green">
                    Enter Your Account Number
                  </h3>
                  <p className="text-gray-700 max-w-lg mx-auto text-lg leading-relaxed">
                    Please enter your electric service account number to access your customer portal and submit complaints.
                  </p>
                </div>

                <form onSubmit={handleAccountValidation} className="space-y-6 max-w-lg mx-auto">
                  <div className="space-y-3">
                    <Label htmlFor="accountNumber" className="text-lg font-semibold text-eeu-green">
                      Account Number *
                    </Label>
                    <div className="relative">
                      <Input
                        id="accountNumber"
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Enter your account number"
                        className="text-xl py-4 px-6 border-2 border-eeu-orange/30 focus:border-eeu-orange focus:ring-2 focus:ring-eeu-orange/20 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md text-center font-mono"
                        required
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        {/* Enhanced Account Number Icon */}
                        <div className="relative w-12 h-12 group cursor-pointer">
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
                            <div className="bg-eeu-orange text-white px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg font-semibold">
                              Account ID
                            </div>
                          </div>
                          {/* Outer pulsing ring */}
                          <div className="absolute inset-0 bg-gradient-to-r from-eeu-orange to-orange-600 rounded-full opacity-20 animate-ping"></div>
                          {/* Middle rotating ring */}
                          <div className="absolute inset-1 border-2 border-eeu-orange/40 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                          {/* Main icon container */}
                          <div className="absolute inset-2 bg-gradient-to-br from-eeu-orange via-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
                            <Building2 className="w-5 h-5 text-white drop-shadow-lg group-hover:rotate-12 transition-transform duration-500" />
                          </div>
                          {/* Inner counter-rotating ring */}
                          <div className="absolute inset-3 border border-white/60 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
                          {/* Sparkle effects */}
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-eeu-orange rounded-full animate-bounce opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-orange-400 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ animationDelay: '0.3s' }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-eeu-green/10 to-eeu-green/5 rounded-xl p-4 border-l-4 border-eeu-green shadow-sm">
                      <p className="text-sm text-eeu-green font-medium flex items-center">
                        {/* Enhanced Tip Icon */}
                        <div className="relative w-10 h-10 mr-3 group cursor-pointer">
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
                            <div className="bg-eeu-green text-white px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg font-semibold">
                              Helpful Tip
                            </div>
                          </div>
                          {/* Outer electric glow */}
                          <div className="absolute inset-0 bg-gradient-to-r from-eeu-green to-green-600 rounded-full opacity-30 animate-pulse group-hover:animate-ping"></div>
                          {/* Electric arc ring */}
                          <div className="absolute inset-0.5 border-2 border-eeu-green/50 rounded-full animate-spin group-hover:border-eeu-green transition-colors duration-300" style={{ animationDuration: '4s' }}></div>
                          {/* Main lightning container */}
                          <div className="absolute inset-1.5 bg-gradient-to-br from-eeu-green via-green-500 to-green-600 rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-125">
                            <Zap className="w-4 h-4 text-white drop-shadow-lg group-hover:animate-pulse group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          {/* Electric sparks */}
                          <div className="absolute -top-0.5 left-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute top-1/2 -right-0.5 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-bounce opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ animationDelay: '0.2s' }}></div>
                          <div className="absolute -bottom-0.5 left-1/4 w-1 h-1 bg-green-400 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-400" style={{ animationDelay: '0.4s' }}></div>
                          {/* Energy waves */}
                          <div className="absolute inset-0 border border-eeu-green/20 rounded-full animate-ping group-hover:scale-150 group-hover:opacity-0 transition-all duration-1000"></div>
                        </div>
                        You can find your account number on your electricity bill
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isValidating || !accountNumber.trim()}
                    className="w-full py-4 text-lg bg-gradient-to-r from-eeu-green to-eeu-orange hover:from-eeu-green/90 hover:to-eeu-orange/90 text-white font-semibold transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {isValidating ? (
                      <div className="flex items-center justify-center space-x-3">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                        <span>Validating Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        <CheckCircle className="w-5 h-5" />
                        <span>Validate Account</span>
                        <span className="text-xl">→</span>
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Enhanced Quick Access Cards - Second */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2 border-eeu-orange/20 hover:border-eeu-orange hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 hover:-translate-y-3 relative overflow-hidden hover:bg-white">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-eeu-orange/10 to-eeu-orange/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-eeu-orange/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="relative z-10 text-center space-y-4">
                  {/* Enhanced Icon Container */}
                  <div className="relative w-24 h-24 mx-auto">
                    {/* Main icon background */}
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-eeu-orange/30">
                      <FileText className="w-10 h-10 text-eeu-orange" />
                    </div>
                  </div>
                  <h3 className="font-bold text-xl text-eeu-green group-hover:text-eeu-orange transition-colors duration-300">Submit Complaint</h3>
                  <p className="text-gray-700 group-hover:text-eeu-green transition-colors font-medium">Report service issues or concerns quickly and easily</p>
                  
                  {/* Interactive Elements */}
                  <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-2 h-2 bg-eeu-orange rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-eeu-green rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-eeu-orange rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-eeu-orange font-semibold flex items-center justify-center">
                      Click to start 
                      <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </span>
                  </div>
                  
                  {/* Sparkle Effects */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="w-1 h-1 bg-eeu-orange rounded-full animate-ping"></div>
                  </div>
                  <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ animationDelay: '0.3s' }}>
                    <div className="w-1 h-1 bg-eeu-orange rounded-full animate-ping"></div>
                  </div>
                </div>
              </div>
              
              <div className="group bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2 border-eeu-green/20 hover:border-eeu-green hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 hover:-translate-y-3 relative overflow-hidden hover:bg-white">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-eeu-green/10 to-eeu-green/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-eeu-green/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="relative z-10 text-center space-y-4">
                  {/* Enhanced Icon Container */}
                  <div className="relative w-24 h-24 mx-auto">
                    {/* Main icon background */}
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-eeu-green/30">
                      <Clock className="w-10 h-10 text-eeu-green" />
                    </div>
                  </div>
                  <h3 className="font-bold text-xl text-eeu-orange group-hover:text-eeu-green transition-colors duration-300">Track Status</h3>
                  <p className="text-gray-700 group-hover:text-eeu-orange transition-colors font-medium">Monitor your complaint progress in real-time</p>
                  
                  {/* Interactive Elements */}
                  <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-2 h-2 bg-eeu-green rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-eeu-orange rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-eeu-green rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-eeu-green font-semibold flex items-center justify-center">
                      Coming soon 
                      <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </span>
                  </div>
                  
                  {/* Sparkle Effects */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="w-1 h-1 bg-eeu-green rounded-full animate-ping"></div>
                  </div>
                  <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ animationDelay: '0.3s' }}>
                    <div className="w-1 h-1 bg-eeu-green rounded-full animate-ping"></div>
                  </div>
                </div>
              </div>
              
              <div className="group bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2 border-eeu-orange/20 hover:border-eeu-orange hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 hover:-translate-y-3 relative overflow-hidden hover:bg-white">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-eeu-orange/10 to-eeu-orange/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-eeu-orange/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="relative z-10 text-center space-y-4">
                  {/* Enhanced Icon Container */}
                  <div className="relative w-24 h-24 mx-auto">
                    {/* Main icon background */}
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-eeu-orange/30">
                      <Users className="w-10 h-10 text-eeu-orange" />
                    </div>
                  </div>
                  <h3 className="font-bold text-xl text-eeu-green group-hover:text-eeu-orange transition-colors duration-300">Get Support</h3>
                  <p className="text-gray-700 group-hover:text-eeu-green transition-colors font-medium">Access customer service help and assistance</p>
                  
                  {/* Interactive Elements */}
                  <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-2 h-2 bg-eeu-orange rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-eeu-green rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-eeu-orange rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-eeu-orange font-semibold flex items-center justify-center">
                      Contact us 
                      <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </span>
                  </div>
                  
                  {/* Sparkle Effects */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="w-1 h-1 bg-eeu-orange rounded-full animate-ping"></div>
                  </div>
                  <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ animationDelay: '0.3s' }}>
                    <div className="w-1 h-1 bg-eeu-orange rounded-full animate-ping"></div>
                  </div>
                </div>
              </div>
            </div>


          </div>
        )}

      {/* Step 2: Complaint Form */}
      {step === 'complaint_form' && (
        <div className="space-y-6">
          {/* Customer Information Display */}
          {renderCustomerInfo()}

          {/* Complaint Form */}
          <Card className="border-2 border-eeu-orange/20 shadow-xl hover:shadow-2xl hover:border-eeu-orange transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-eeu-green to-eeu-orange text-white rounded-t-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <CardTitle className="flex items-center space-x-4 relative z-10">
                {/* Enhanced Header Icon */}
                <div className="relative w-16 h-16">
                  {/* Main lightning container */}
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-eeu-orange/40">
                    <Zap className="w-8 h-8 text-eeu-orange" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-bold text-eeu-orange drop-shadow-lg">{t("form.complaint_details")}</span>
                  <p className="text-white/80 text-sm font-medium">Submit your service request</p>
                </div>
              </CardTitle>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <form onSubmit={handleComplaintSubmission} className="space-y-4">
                {/* Customer Information Section */}
                <div className="bg-gradient-to-r from-eeu-green/10 to-eeu-orange/10 rounded-xl p-6 border-2 border-eeu-orange/20">
                  <h3 className="text-lg font-semibold text-eeu-green mb-4 flex items-center">
                    <div className="w-8 h-8 bg-eeu-orange/20 border border-eeu-orange rounded-full flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-eeu-orange" />
                    </div>
                    {t("form.customer_information")}
                    <span className="ml-3 text-xs bg-eeu-green/20 text-eeu-green px-3 py-1 rounded-full border border-eeu-green/30">
                      Auto-filled
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Customer Name */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="customerName" className="text-eeu-green font-semibold">{t("complaint.customer_name")} *</Label>
                      <Input
                        id="customerName"
                        value={customerData?.data['Full Name'] || customerData?.data['Company Name'] || ''}
                        readOnly
                        className="bg-eeu-green/5 border-eeu-green/30 text-gray-700 font-medium"
                      />
                    </div>

                    {/* Account Number */}
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber" className="text-eeu-green font-semibold">{t("complaint.account_number")}</Label>
                      <Input
                        id="accountNumber"
                        value={customerData?.data['Contract Account'] || customerData?.data['Business Partner ID'] || accountNumber}
                        readOnly
                        className="bg-eeu-green/5 border-eeu-green/30 text-gray-700 font-medium"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail" className="text-eeu-green font-semibold">{t("complaint.customer_email")}</Label>
                      <Input
                        id="customerEmail"
                        value={customerData?.data['Email'] || ''}
                        readOnly
                        className="bg-eeu-green/5 border-eeu-green/30 text-gray-700 font-medium"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone" className="text-eeu-green font-semibold">{t("complaint.customer_phone")} *</Label>
                      <Input
                        id="customerPhone"
                        value={customerData?.data['Phone'] || ''}
                        readOnly
                        className="bg-eeu-green/5 border-eeu-green/30 text-gray-700 font-medium"
                      />
                    </div>

                    {/* Region */}
                    <div className="space-y-2">
                      <Label htmlFor="region" className="text-eeu-green font-semibold">{t("complaint.region")}</Label>
                      <Input
                        id="region"
                        value={customerData?.data['Region'] || ''}
                        readOnly
                        className="bg-eeu-green/5 border-eeu-green/30 text-gray-700 font-medium"
                      />
                    </div>

                    {/* Address */}
                    <div className="space-y-2 md:col-span-3">
                      <Label htmlFor="customerAddress" className="text-eeu-green font-semibold">{t("complaint.customer_address")} *</Label>
                      <Input
                        id="customerAddress"
                        value={customerData?.data['Address'] || ''}
                        readOnly
                        className="bg-eeu-green/5 border-eeu-green/30 text-gray-700 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Complaint Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-eeu-orange font-semibold flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-eeu-orange" />
                    {t("form.complaint_title")} *
                  </Label>
                  <Input
                    id="title"
                    value={complaintData.title}
                    onChange={(e) => handleComplaintInputChange('title', e.target.value)}
                    placeholder={t("form.brief_description")}
                    className="border-eeu-orange/30 focus:border-eeu-orange focus:ring-2 focus:ring-eeu-orange/20 transition-all duration-300"
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-eeu-orange font-semibold flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-eeu-orange" />
                    {t("form.category")} *
                  </Label>
                  <Select 
                    value={complaintData.category} 
                    onValueChange={(value: ComplaintCategory) => handleComplaintInputChange('category', value)}
                  >
                    <SelectTrigger className="border-eeu-orange/30 focus:border-eeu-orange focus:ring-2 focus:ring-eeu-orange/20 transition-all duration-300">
                      <SelectValue placeholder={t("form.select_complaint_category")} />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {COMPLAINT_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value} className="py-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{category.icon}</span>
                            <div>
                              <div className="font-medium">{t(category.labelKey)}</div>
                              <div className="text-xs text-muted-foreground">
                                {category.priority === 'critical' ? t('priority.emergency_response') :
                                 category.priority === 'high' ? t('priority.high_priority') :
                                 category.priority === 'medium' ? t('priority.standard_priority') :
                                 t('priority.low_priority')}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-eeu-orange font-semibold flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-eeu-orange" />
                    {t("form.priority")} *
                  </Label>
                  <Select 
                    value={complaintData.priority} 
                    onValueChange={(value: ComplaintPriority) => handleComplaintInputChange('priority', value)}
                  >
                    <SelectTrigger className="border-eeu-orange/30 focus:border-eeu-orange focus:ring-2 focus:ring-eeu-orange/20 transition-all duration-300">
                      <SelectValue placeholder={t("form.select_priority_level")} />
                    </SelectTrigger>
                    <SelectContent>
                      {(['low', 'medium', 'high', 'critical'] as ComplaintPriority[]).map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          <div className="flex items-center justify-between w-full">
                            <span>{t(`priority.${priority}`)}</span>
                            <div className={`w-2 h-2 rounded-full ml-2 ${
                              priority === 'critical' ? 'bg-red-500' :
                              priority === 'high' ? 'bg-orange-500' :
                              priority === 'medium' ? 'bg-yellow-500' :
                              'bg-gray-400'
                            }`} />
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-eeu-orange font-semibold flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-eeu-orange" />
                    {t("form.detailed_description")} *
                  </Label>
                  <Textarea
                    id="description"
                    value={complaintData.description}
                    onChange={(e) => handleComplaintInputChange('description', e.target.value)}
                    placeholder={t("complaint.description_placeholder")}
                    className="min-h-[120px] border-eeu-orange/30 focus:border-eeu-orange focus:ring-2 focus:ring-eeu-orange/20 transition-all duration-300"
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep('account_validation');
                      setCustomerData(null);
                      setAccountNumber('');
                    }}
                    className="flex-1 border-eeu-green text-eeu-green hover:bg-eeu-green hover:text-white transition-all duration-300"
                  >
                    {t("common.back")}
                  </Button>
                  
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-eeu-green to-eeu-orange hover:from-eeu-green/90 hover:to-eeu-orange/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>{t("form.submitting")}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>{t("form.submit_complaint")}</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}



      {/* Floating Action Button */}
      {showFloatingButton && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              handleInteractiveClick({ currentTarget: { getBoundingClientRect: () => ({ left: 0, top: 0 }) }, clientX: 50, clientY: 50 } as any);
            }}
            className="group w-16 h-16 bg-gradient-to-r from-eeu-green to-eeu-orange rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 hover:rotate-12 animate-bounce relative overflow-hidden"
          >
            {/* Background Animation */}
            <div className="absolute inset-0 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300"></div>
            
            {/* Icon */}
            <div className="relative z-10 flex items-center justify-center h-full">
              <Zap className="w-6 h-6 text-white group-hover:animate-pulse" />
            </div>
            
            {/* Ripple Effect */}
            <div className="absolute inset-0 rounded-full border-2 border-white/30 group-hover:scale-150 group-hover:opacity-0 transition-all duration-500"></div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white border-2 border-eeu-orange text-eeu-orange px-3 py-1 rounded-lg text-sm whitespace-nowrap shadow-lg font-semibold">
                Back to top ⬆️
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Enhanced Interactive Background Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* EEU Brand Colored Particles */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-eeu-orange/20 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-4 h-4 bg-eeu-green/25 rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute top-1/2 left-3/4 w-2 h-2 bg-eeu-orange/30 rounded-full animate-ping" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-5 h-5 bg-eeu-green/15 rounded-full animate-ping" style={{ animationDelay: '3s', animationDuration: '6s' }}></div>
        <div className="absolute top-1/6 right-1/3 w-2 h-2 bg-eeu-orange/25 rounded-full animate-ping" style={{ animationDelay: '4s', animationDuration: '7s' }}></div>
        <div className="absolute bottom-1/3 left-1/6 w-3 h-3 bg-eeu-green/20 rounded-full animate-ping" style={{ animationDelay: '5s', animationDuration: '8s' }}></div>
        
        {/* Floating EEU Brand Elements */}
        <div className="absolute top-1/3 right-1/6 w-6 h-6 border border-eeu-orange/10 rounded-full animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/6 right-1/2 w-4 h-4 border border-eeu-green/15 rounded-full animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
      </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default CustomerPortal;