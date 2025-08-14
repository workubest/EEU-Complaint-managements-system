import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Phone, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const actions = [
    {
      icon: FileText,
      label: t('complaint.new_complaint'),
      action: () => navigate('/customer-portal'),
      color: 'bg-eeu-orange hover:bg-eeu-orange/90',
    },
    {
      icon: Phone,
      label: 'Emergency Call',
      action: () => window.open('tel:+251-11-EMERGENCY'),
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      icon: Zap,
      label: 'Quick Report',
      action: () => navigate('/quick-report'),
      color: 'bg-eeu-green hover:bg-eeu-green/90',
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Items */}
      <div className={`flex flex-col space-y-3 mb-4 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {actions.map((action, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                {action.label}
              </span>
            </div>
            <Button
              onClick={action.action}
              className={`w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 ${action.color}`}
            >
              <action.icon className="h-5 w-5 text-eeu-orange" />
            </Button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-gradient-eeu hover:opacity-90 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
      >
        <Plus className="h-6 w-6 text-white" />
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}