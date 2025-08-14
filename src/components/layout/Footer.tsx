import { useLanguage } from '@/contexts/LanguageContext';

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
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground space-y-2 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <span>{text.designedBy}</span>
            <span className="font-semibold text-primary">{text.designer}</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-2 text-center md:text-right">
            <span>{text.copyright}</span>
            <span className="font-medium text-primary">{text.version}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}