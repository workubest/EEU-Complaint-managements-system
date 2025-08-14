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
import { Eye, EyeOff, Loader2, Info } from 'lucide-react';
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
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-eeu-orange/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-eeu-green/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Enhanced Language Switcher - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Floating System Status - Top Left */}
      <div className="absolute top-6 left-6 z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20 shadow-lg">
          <div className="flex items-center space-x-2 text-white/80 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>System Online</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md z-10">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 transform hover:scale-105">
          <CardHeader className="text-center pb-3 relative">
            {/* Logo and Title Section */}
            <div className="flex flex-col items-center space-y-3 mb-6">
              {/* Animated Logo Container */}
              <div className="relative group cursor-pointer">
                {/* Enhanced Glow Effects */}
                <div className="absolute inset-0 bg-gradient-eeu rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-all duration-700 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-eeu-reverse rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
                
                {/* Main Logo */}
                <img 
                  src="/eeu-logo-new.png" 
                  alt="Ethiopian Electric Utility Logo" 
                  className="w-40 h-40 object-contain relative z-10 transform group-hover:scale-125 group-hover:rotate-3 transition-all duration-700 drop-shadow-2xl"
                />
                
                {/* Enhanced Rotating Rings */}
                <div className="absolute inset-0 border-4 border-transparent border-t-eeu-orange border-r-eeu-green rounded-full animate-spin opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
                <div className="absolute inset-2 border-2 border-transparent border-b-eeu-green border-l-eeu-orange rounded-full animate-spin opacity-20 group-hover:opacity-40 transition-opacity duration-500" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                
                {/* Sparkle Effects */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-eeu-orange rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300"></div>
                <div className="absolute bottom-6 left-6 w-2 h-2 bg-eeu-green rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-8 left-8 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300" style={{ animationDelay: '1s' }}></div>
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
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm">{t("login.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("login.email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm">{t("login.password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("login.password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-10 bg-gradient-eeu hover:opacity-90 hover:scale-105 transition-all duration-300 rounded-lg text-base font-semibold shadow-lg hover:shadow-xl transform" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t("login.signing_in")}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>🚀</span>
                    <span>{t("login.signin")}</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Interactive Features */}
            <div className="mt-4 space-y-3">
              {/* Quick Access Info */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1 text-gray-600">
                  <Info className="h-3 w-3" />
                  <span>Secure Login</span>
                </div>
                <div className="text-eeu-orange hover:text-eeu-green cursor-pointer transition-colors font-medium">
                  Need Help?
                </div>
              </div>

              {/* Demo Credentials */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-2">
                <div className="text-xs text-blue-800 font-medium mb-1">🔑 Demo Credentials:</div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="bg-white/70 rounded px-1 py-1">
                    <span className="text-gray-600">Admin:</span> <span className="font-mono text-[10px]">admin@eeu.gov.et</span>
                  </div>
                  <div className="bg-white/70 rounded px-1 py-1">
                    <span className="text-gray-600">Pass:</span> <span className="font-mono text-[10px]">admin123</span>
                  </div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>



        <div className="mt-6 text-center space-y-4">
          <p className="text-xs text-white/60">
            System designed by <span className="font-medium text-white/80">Worku Mesafint Addis [504530]</span>
          </p>
          <p>© 2025 Ethiopian Electric Utility. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}