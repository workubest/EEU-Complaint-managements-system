import { useLanguage } from '@/contexts/LanguageContext';
import { Zap } from 'lucide-react';

export function Footer() {
  const { language } = useLanguage();

  const footerText = {
    en: {
      designedBy: "System Designed by:",
      designer: "WORKU MESAFINT ADDIS [504530]",
      copyright: "© 2025 Ethiopian Electric Utility. All rights reserved.",
      version: "Version 1.0.0"
    },
    am: {
      designedBy: "ሲስተሙ የተዘጋጀው በ:",
      designer: "ወርቁ መሳፍንት አዲስ [504530]",
      copyright: "© 2025 የኢትዮጵያ ኤሌክትሪክ ኮርፖሬሽን። ሁሉም መብቶች የተጠበቁ ናቸው።",
      version: "ስሪት 1.0.0"
    }
  };

  const text = footerText[language];

  return (
    <footer className="bg-background border-t-2 border-eeu-orange/20 mt-auto relative">
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-eeu-green to-eeu-orange"></div>
      
      <div className="container mx-auto px-4 py-6">
        {/* EEU Brand Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-eeu-green to-eeu-orange rounded-full flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center text-sm space-y-3 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center gap-2 text-center md:text-left">
            <span className="text-muted-foreground">{text.designedBy}</span>
            <span className="font-semibold text-eeu-orange">{text.designer}</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-2 text-center md:text-right">
            <span className="text-muted-foreground">{text.copyright}</span>
            <span className="font-medium text-eeu-green">{text.version}</span>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="flex justify-center mt-4 space-x-2">
          <div className="w-1 h-1 bg-eeu-orange rounded-full animate-ping"></div>
          <div className="w-1 h-1 bg-eeu-green rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="w-1 h-1 bg-eeu-orange rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
    </footer>
  );
}