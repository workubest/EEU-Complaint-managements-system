import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const getSuggestions = (pathname: string) => {
    const suggestions = [];
    
    if (pathname.includes('notification')) {
      suggestions.push({
        path: '/dashboard/notifications',
        label: 'Notifications Dashboard',
        description: 'View system notifications and alerts'
      });
    }
    
    if (pathname.includes('complaint')) {
      suggestions.push({
        path: '/dashboard/complaints',
        label: 'Complaints List',
        description: 'View and manage complaints'
      });
    }
    
    if (pathname.includes('dashboard') || pathname.includes('admin')) {
      suggestions.push({
        path: '/dashboard',
        label: 'Main Dashboard',
        description: 'Access the main dashboard'
      });
    }
    
    return suggestions;
  };

  const suggestions = getSuggestions(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Page Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              The page <code className="bg-muted px-2 py-1 rounded text-sm">{location.pathname}</code> could not be found.
            </p>
            
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Did you mean:</p>
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate(suggestion.path)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{suggestion.label}</div>
                      <div className="text-xs text-muted-foreground">{suggestion.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button variant="outline" onClick={handleGoBack} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={() => navigate('/')} className="flex-1">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default NotFound;
