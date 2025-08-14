import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { apiService } from '@/lib/api';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🚀 Starting login process...');
      console.log('📧 Email:', email);
      console.log('📧 Email type:', typeof email);
      console.log('📧 Email length:', email.length);
      console.log('🔑 Password:', password); // Temporary debug - remove in production
      console.log('🔑 Password type:', typeof password);
      console.log('🔑 Password length:', password.length);
      console.log('🔧 Form data being sent:', { email, password });
      
      // Call the Google Apps Script backend for authentication
      console.log('📡 Calling apiService.login...');
      const response = await apiService.login({ email, password });
      
      console.log('🔍 Login component received response:', response);
      console.log('🔍 Response type:', typeof response);
      console.log('🔍 Response constructor:', response?.constructor?.name);
      console.log('🔍 Response analysis:', {
        success: response.success,
        hasData: !!response.data,
        hasDataUser: !!(response.data && response.data.user),
        hasUser: !!response.user,
        dataKeys: response.data ? Object.keys(response.data) : [],
        responseKeys: Object.keys(response),
        rawResponse: response
      });

      if (response.success) {
        // Get user data from the response - API service should have transformed it
        let user = null;
        
        if (response.data?.user) {
          user = response.data.user;
          console.log('✅ Using response.data.user');
        } else if (response.user) {
          user = response.user;
          console.log('✅ Using response.user');
        } else {
          console.error('❌ No user data found in successful response');
          throw new Error('No user data in login response');
        }
        
        console.log('👤 User data received:', user);
        
        // The API service should have already transformed the data, so use it directly
        // But add fallback for compatibility
        const userData = {
          id: user.id || user.ID || '',
          name: user.name || user.Name || '',
          email: user.email || user.Email || '',
          role: user.role || user.Role || 'technician',
          region: user.region || user.Region || '',
          serviceCenter: user.serviceCenter || user.ServiceCenter || '',
          phone: user.phone || user.Phone || '',
          isActive: user.isActive !== undefined ? user.isActive : (user['Is Active'] !== undefined ? user['Is Active'] : true),
          createdAt: user.createdAt || user['Created At'] || new Date().toISOString(),
        };

        console.log('✅ Final user data for login:', userData);
        
        login(userData);
        toast({
          title: t("login.success"),
          description: t("login.success_desc"),
        });
        navigate('/dashboard');
      } else {
        console.error('❌ Login failed - response.success is false');
        throw new Error(response.error || response.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: t("login.error"),
        description: error instanceof Error ? error.message : t("login.error_desc"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-eeu-orange/8 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-eeu-green/8 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>
      </div>

      {/* Enhanced Language Switcher - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300">
          <LanguageSwitcher />
        </div>
      </div>

      {/* System Status - Top Left */}
      <div className="absolute top-6 left-6 z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20 shadow-lg">
          <div className="flex items-center space-x-2 text-white/80 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>System Online</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md z-10">
        <Card className="shadow-2xl border-2 border-eeu-orange/20 bg-white/95 backdrop-blur-sm hover:shadow-3xl hover:border-eeu-orange/40 transition-all duration-500 transform hover:scale-105 relative overflow-hidden">
          {/* Card Background Animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-eeu-green/5 via-transparent to-eeu-orange/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="text-center pb-3 relative">
            {/* Logo and Title Section */}
            <div className="flex flex-col items-center space-y-3 mb-6">
              {/* Logo Container */}
              <div className="relative group">
                {/* Subtle Glow Effect */}
                <div className="absolute inset-0 bg-gradient-eeu rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                
                {/* Main Logo */}
                <img 
                  src="/eeu-logo-new.png" 
                  alt="Ethiopian Electric Utility Logo" 
                  className="w-40 h-40 object-contain relative z-10 group-hover:scale-105 transition-transform duration-300 drop-shadow-xl"
                />
                
                {/* Simple Border Ring */}
                <div className="absolute inset-0 border-2 border-transparent border-t-eeu-orange border-r-eeu-green rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              
              {/* Enhanced Title Section with EEU Brand Colors */}
              <div className="space-y-3 animate-fade-in">
                <div className="relative">
                  <h1 className="text-2xl lg:text-3xl font-bold text-eeu-orange drop-shadow-lg shadow-black/50 relative z-10">
                    Ethiopian Electric Utility
                  </h1>
                  {/* Enhanced shadow effect */}
                  <h1 className="absolute inset-0 text-2xl lg:text-3xl font-bold text-black/40 blur-sm transform translate-x-1 translate-y-1">
                    Ethiopian Electric Utility
                  </h1>
                </div>
                <p className="text-lg text-eeu-green font-semibold">
                  የኢትዮጵያ ኤሌክትሪክ አገልግሎት
                </p>
                <p className="text-sm text-gray-700 font-medium">
                  Staff Portal Access
                </p>
              </div>
            </div>
            

          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Enhanced Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-eeu-green flex items-center">
                  <div className="w-4 h-4 bg-eeu-green/20 rounded-full flex items-center justify-center mr-2">
                    <div className="w-2 h-2 bg-eeu-green rounded-full"></div>
                  </div>
                  {t("login.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("login.email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-2 border-eeu-green/30 focus:border-eeu-green focus:ring-2 focus:ring-eeu-green/20 transition-all duration-300 rounded-lg bg-gradient-to-r from-white to-eeu-green/5"
                />
              </div>
              
              {/* Enhanced Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-eeu-orange flex items-center">
                  <div className="w-4 h-4 bg-eeu-orange/20 rounded-full flex items-center justify-center mr-2">
                    <div className="w-2 h-2 bg-eeu-orange rounded-full"></div>
                  </div>
                  {t("login.password")}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("login.password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-12 border-2 border-eeu-orange/30 focus:border-eeu-orange focus:ring-2 focus:ring-eeu-orange/20 transition-all duration-300 rounded-lg bg-gradient-to-r from-white to-eeu-orange/5"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-eeu-orange/10 rounded-r-lg transition-all duration-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-eeu-orange" />
                    ) : (
                      <Eye className="h-5 w-5 text-eeu-orange" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full h-12 text-white font-bold rounded-lg cursor-pointer hover:opacity-90 transition-opacity duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center" 
                disabled={isLoading}
                style={{ 
                  background: 'linear-gradient(135deg, #FF8C42 0%, #4CAF50 100%)',
                  pointerEvents: 'auto',
                  zIndex: 10,
                  position: 'relative'
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    {t("login.signing_in")}
                  </>
                ) : (
                  t("login.signin")
                )}
              </button>
            </form>

            {/* Enhanced Interactive Features */}
            <div className="mt-6 space-y-4">
              {/* Professional Security Badge */}
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 bg-gradient-to-r from-eeu-green to-eeu-orange rounded-full flex items-center justify-center shadow-md">
                  <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-eeu-green rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Interactive Brand Elements */}
              <div className="flex justify-center space-x-4">
                <div className="w-2 h-2 bg-eeu-orange rounded-full"></div>
                <div className="w-2 h-2 bg-eeu-green rounded-full"></div>
                <div className="w-2 h-2 bg-eeu-orange rounded-full"></div>
              </div>

              {/* Professional Footer Message */}
              <div className="text-center">
                <p className="text-xs text-gray-600 font-medium">
                  Authorized Personnel Only
                </p>
                <p className="text-xs text-eeu-green font-semibold mt-1">
                  Ethiopian Electric Utility Staff Portal
                </p>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Enhanced Footer Section */}
        <div className="mt-8 text-center space-y-4">
          {/* Professional System Info */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl px-6 py-4 border border-white/20 shadow-lg">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-r from-eeu-green to-eeu-orange rounded-full"></div>
              </div>
              <p className="text-sm text-white/90 font-semibold">
                EEU Complaint Management System
              </p>
            </div>
            <p className="text-xs text-white/70 font-medium">
              System designed by <span className="text-white/90 font-semibold">Worku Mesafint Addis [504530]</span>
            </p>
          </div>
          
          {/* Copyright */}
          <div className="text-center">
            <p className="text-xs text-white/80 font-medium">© 2025 Ethiopian Electric Utility. All rights reserved.</p>
            <div className="flex justify-center space-x-2 mt-2">
              <div className="w-1 h-1 bg-white/60 rounded-full"></div>
              <div className="w-1 h-1 bg-white/60 rounded-full"></div>
              <div className="w-1 h-1 bg-white/60 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}