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
import { COMPLAINT_CATEGORIES, ComplaintCategory, ComplaintPriority } from '@/types/complaint';
import { Loader2, CheckCircle, AlertCircle, User, Building2 } from 'lucide-react';

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
      <Card className="mb-6 border-eeu-orange bg-gradient-eeu-light">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-eeu-green">
            {isBusinessPartner ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
            <span>{t("customer_portal.account_verified")}</span>
            <CheckCircle className="h-5 w-5 text-eeu-green" />
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-6xl mx-auto space-y-8 p-6">
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
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium animate-fade-in">
                  Click me for magic! ✨
                </div>
              )}
            </div>
            
            {/* Enhanced Title Section with White Text and Shadows */}
            <div className="text-center space-y-3">
              <div className="relative">
                <p className="text-xl lg:text-2xl text-white font-bold drop-shadow-lg shadow-black/50 relative z-10">
                  Ethiopian Electric Utility Service Portal
                </p>
                {/* Enhanced shadow effect */}
                <p className="absolute inset-0 text-xl lg:text-2xl text-black/40 font-bold blur-sm transform translate-x-1 translate-y-1">
                  Ethiopian Electric Utility Service Portal
                </p>
              </div>
              <p className="text-lg text-gray-600 font-medium">
                የኢትዮጵያ ኤሌክትሪክ አገልግሎት
              </p>
            </div>
          </div>

          {/* Enhanced Interactive Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="group flex items-center space-x-3 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-110 hover:-translate-y-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <span className="text-white text-lg">⚡</span>
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-gray-800 group-hover:text-green-600 transition-colors">24/7 Service</div>
                <div className="text-xs text-gray-500">Always Available</div>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity"></div>
            </div>
            
            <div className="group flex items-center space-x-3 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-110 hover:-translate-y-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <span className="text-white text-lg">🔒</span>
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Secure Portal</div>
                <div className="text-xs text-gray-500">Protected Data</div>
              </div>
              <div className="w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity"></div>
            </div>
            
            <div className="group flex items-center space-x-3 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-110 hover:-translate-y-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <span className="text-white text-lg">📱</span>
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-gray-800 group-hover:text-orange-600 transition-colors">Mobile Friendly</div>
                <div className="text-xs text-gray-500">Any Device</div>
              </div>
              <div className="w-2 h-2 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity"></div>
            </div>
          </div>
          
          {/* Enhanced Welcome Message */}
          <div className="group bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30 max-w-4xl mx-auto mb-8 hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-green-200/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-200/20 to-yellow-200/20 rounded-full translate-y-12 -translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-eeu rounded-full flex items-center justify-center mr-4 group-hover:rotate-12 transition-transform duration-300">
                  <span className="text-white text-2xl">👋</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 group-hover:text-transparent group-hover:bg-gradient-eeu group-hover:bg-clip-text transition-all duration-300">
                  Welcome to Your Customer Portal
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-white/50 rounded-xl group-hover:bg-white/80 transition-all duration-300">
                  <div className="text-2xl mb-2">📋</div>
                  <div className="font-semibold text-gray-700">Submit</div>
                  <div className="text-sm text-gray-500">Complaints</div>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-xl group-hover:bg-white/80 transition-all duration-300">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-semibold text-gray-700">Track</div>
                  <div className="text-sm text-gray-500">Progress</div>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-xl group-hover:bg-white/80 transition-all duration-300">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-semibold text-gray-700">Manage</div>
                  <div className="text-sm text-gray-500">Account</div>
                </div>
              </div>
              
              <p className="text-gray-600 text-lg leading-relaxed text-center">
                Submit complaints, track your requests, and manage your electric service account with ease. 
                Our secure portal provides you with direct access to customer support and account management tools.
              </p>
              
              {/* Interactive Arrow */}
              <div className="flex justify-center mt-6">
                <div className="animate-bounce">
                  <span className="text-3xl">⬇️</span>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Step 1: Enhanced Account Validation */}
        {step === 'account_validation' && (
          <div className="space-y-8">
            {/* Main Account Validation Card - First */}
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-500">
              <CardHeader className="bg-gradient-eeu text-white rounded-t-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <CardTitle className="flex items-center space-x-3 relative z-10">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xl">🔍</span>
                  </div>
                  <span className="text-xl">Account Validation</span>
                </CardTitle>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
              </CardHeader>
              
              <CardContent className="space-y-8 pt-8 pb-8">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Enter Your Account Number
                  </h3>
                  <p className="text-gray-600 max-w-lg mx-auto text-lg leading-relaxed">
                    Please enter your electric service account number to access your customer portal and submit complaints.
                  </p>
                </div>

                <form onSubmit={handleAccountValidation} className="space-y-6 max-w-lg mx-auto">
                  <div className="space-y-3">
                    <Label htmlFor="accountNumber" className="text-lg font-semibold text-gray-700">
                      Account Number *
                    </Label>
                    <div className="relative">
                      <Input
                        id="accountNumber"
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Enter your account number"
                        className="text-xl py-4 px-6 border-2 border-gray-200 focus:border-eeu-green transition-all duration-300 rounded-xl shadow-sm hover:shadow-md text-center font-mono"
                        required
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <span className="text-gray-400">🔢</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                      <p className="text-sm text-blue-700 font-medium">
                        💡 You can find your account number on your electricity bill
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isValidating || !accountNumber.trim()}
                    className="w-full py-4 text-lg bg-gradient-eeu-reverse hover:opacity-90 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {isValidating ? (
                      <div className="flex items-center justify-center space-x-3">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Validating Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        <span className="text-xl">🔍</span>
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
              <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-110 hover:-translate-y-4 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="relative z-10 text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg group-hover:shadow-blue-500/50">
                    <span className="text-3xl text-white">📋</span>
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 group-hover:text-blue-600 transition-colors duration-300">Submit Complaint</h3>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors">Report service issues or concerns quickly and easily</p>
                  
                  {/* Interactive Elements */}
                  <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-blue-600 font-semibold">Click to start →</span>
                  </div>
                </div>
              </div>
              
              <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-110 hover:-translate-y-4 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="relative z-10 text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg group-hover:shadow-green-500/50">
                    <span className="text-3xl text-white">📊</span>
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 group-hover:text-green-600 transition-colors duration-300">Track Status</h3>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors">Monitor your complaint progress in real-time</p>
                  
                  {/* Interactive Elements */}
                  <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-green-600 font-semibold">Coming soon →</span>
                  </div>
                </div>
              </div>
              
              <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-110 hover:-translate-y-4 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="relative z-10 text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg group-hover:shadow-orange-500/50">
                    <span className="text-3xl text-white">💬</span>
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 group-hover:text-orange-600 transition-colors duration-300">Get Support</h3>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors">Access customer service help and assistance</p>
                  
                  {/* Interactive Elements */}
                  <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-orange-600 font-semibold">Contact us →</span>
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
          <Card className="border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-eeu-reverse text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <span className="text-xl">⚡</span>
                <span>{t("form.complaint_details")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <form onSubmit={handleComplaintSubmission} className="space-y-4">
                {/* Customer Information Section */}
                <div className="bg-gradient-eeu-light rounded-lg p-4 border border-eeu-orange">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">👤</span>
                    {t("form.customer_information")}
                    <span className="ml-2 text-xs bg-eeu-orange-light text-eeu-orange px-2 py-1 rounded-full">
                      Auto-filled
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Customer Name */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="customerName">{t("complaint.customer_name")} *</Label>
                      <Input
                        id="customerName"
                        value={customerData?.data['Full Name'] || customerData?.data['Company Name'] || ''}
                        readOnly
                        className="bg-white border-gray-300"
                      />
                    </div>

                    {/* Account Number */}
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">{t("complaint.account_number")}</Label>
                      <Input
                        id="accountNumber"
                        value={customerData?.data['Contract Account'] || customerData?.data['Business Partner ID'] || accountNumber}
                        readOnly
                        className="bg-white border-gray-300"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">{t("complaint.customer_email")}</Label>
                      <Input
                        id="customerEmail"
                        value={customerData?.data['Email'] || ''}
                        readOnly
                        className="bg-white border-gray-300"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">{t("complaint.customer_phone")} *</Label>
                      <Input
                        id="customerPhone"
                        value={customerData?.data['Phone'] || ''}
                        readOnly
                        className="bg-white border-gray-300"
                      />
                    </div>

                    {/* Region */}
                    <div className="space-y-2">
                      <Label htmlFor="region">{t("complaint.region")}</Label>
                      <Input
                        id="region"
                        value={customerData?.data['Region'] || ''}
                        readOnly
                        className="bg-white border-gray-300"
                      />
                    </div>

                    {/* Address */}
                    <div className="space-y-2 md:col-span-3">
                      <Label htmlFor="customerAddress">{t("complaint.customer_address")} *</Label>
                      <Input
                        id="customerAddress"
                        value={customerData?.data['Address'] || ''}
                        readOnly
                        className="bg-white border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Complaint Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">{t("form.complaint_title")} *</Label>
                  <Input
                    id="title"
                    value={complaintData.title}
                    onChange={(e) => handleComplaintInputChange('title', e.target.value)}
                    placeholder={t("form.brief_description")}
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">{t("form.category")} *</Label>
                  <Select 
                    value={complaintData.category} 
                    onValueChange={(value: ComplaintCategory) => handleComplaintInputChange('category', value)}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="priority">{t("form.priority")} *</Label>
                  <Select 
                    value={complaintData.priority} 
                    onValueChange={(value: ComplaintPriority) => handleComplaintInputChange('priority', value)}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="description">{t("form.detailed_description")} *</Label>
                  <Textarea
                    id="description"
                    value={complaintData.description}
                    onChange={(e) => handleComplaintInputChange('description', e.target.value)}
                    placeholder={t("complaint.description_placeholder")}
                    className="min-h-[120px]"
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
                    className="flex-1"
                  >
                    {t("common.back")}
                  </Button>
                  
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-eeu-reverse hover:opacity-90 transition-opacity"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>{t("form.submitting")}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>📤</span>
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
            className="group w-16 h-16 bg-gradient-eeu rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 hover:rotate-12 animate-bounce relative overflow-hidden"
          >
            {/* Background Animation */}
            <div className="absolute inset-0 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300"></div>
            
            {/* Icon */}
            <div className="relative z-10 flex items-center justify-center h-full">
              <span className="text-white text-2xl group-hover:animate-wiggle">🚀</span>
            </div>
            
            {/* Ripple Effect */}
            <div className="absolute inset-0 rounded-full border-2 border-white/30 group-hover:scale-150 group-hover:opacity-0 transition-all duration-500"></div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-black/80 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap">
                Back to top ⬆️
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Interactive Background Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-green-400/30 rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute top-1/2 left-3/4 w-2 h-2 bg-orange-400/30 rounded-full animate-ping" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-4 h-4 bg-purple-400/20 rounded-full animate-ping" style={{ animationDelay: '3s', animationDuration: '6s' }}></div>
      </div>
      </div>
    </div>
  );
}

export default CustomerPortal;