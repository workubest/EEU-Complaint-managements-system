import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { COMPLAINT_CATEGORIES } from '@/lib/constants';
import { useLanguage } from '@/contexts/LanguageContext';

interface CategoryHelperProps {
  onCategorySelect: (category: string) => void;
  selectedCategory?: string;
}

export function CategoryHelper({ onCategorySelect, selectedCategory }: CategoryHelperProps) {
  const { t } = useLanguage();

  const emergencyCategories = COMPLAINT_CATEGORIES.filter(cat => cat.priority === 'critical');
  const highPriorityCategories = COMPLAINT_CATEGORIES.filter(cat => cat.priority === 'high');
  const standardCategories = COMPLAINT_CATEGORIES.filter(cat => cat.priority === 'medium');
  const lowPriorityCategories = COMPLAINT_CATEGORIES.filter(cat => cat.priority === 'low');

  const CategoryGroup = ({ title, categories, colorClass, bgClass }: {
    title: string;
    categories: typeof COMPLAINT_CATEGORIES;
    colorClass: string;
    bgClass: string;
  }) => (
    <div className="space-y-2">
      <h4 className={`font-medium text-sm ${colorClass}`}>{title}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => onCategorySelect(category.value)}
            className={`p-4 text-left rounded-xl border transition-all duration-200 hover:shadow-lg hover:scale-105 ${
              selectedCategory === category.value
                ? `${bgClass} border-current shadow-md scale-105`
                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm">{category.label}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {category.value === 'power_outage' && 'Emergency - Power supply issues'}
                  {category.value === 'billing_issue' && 'Payment and billing disputes'}
                  {category.value === 'meter_problem' && 'Meter malfunction or reading issues'}
                  {category.value === 'connection_request' && 'New service connection'}
                  {category.value === 'voltage_fluctuation' && 'Power quality problems'}
                  {category.value === 'equipment_damage' && 'Infrastructure damage'}
                  {category.value === 'service_quality' && 'Customer service issues'}
                  {category.value === 'safety_concern' && 'Safety hazards and risks'}
                  {category.value === 'other' && 'Other issues not listed'}
                </div>
              </div>
              <Badge variant="outline" className={`ml-2 ${colorClass} text-xs`}>
                {category.priority}
              </Badge>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="border-eeu-orange shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-eeu-orange-light">
      <CardHeader className="bg-gradient-eeu text-white rounded-t-lg">
        <CardTitle className="flex items-center space-x-2 text-xl">
          <span className="text-2xl">⚡</span>
          <span>Quick Category Selection</span>
        </CardTitle>
        <p className="text-orange-100">
          Choose the category that best describes your electrical service issue
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <CategoryGroup
          title="🚨 Emergency (Immediate Response)"
          categories={emergencyCategories}
          colorClass="text-red-600"
          bgClass="bg-red-50 text-red-800 border-red-300"
        />
        
        <CategoryGroup
          title="⚡ High Priority (Same Day Response)"
          categories={highPriorityCategories}
          colorClass="text-yellow-600"
          bgClass="bg-yellow-50 text-yellow-800 border-yellow-300"
        />
        
        <CategoryGroup
          title="🔧 Standard Priority (1-3 Days)"
          categories={standardCategories}
          colorClass="text-eeu-green"
          bgClass="bg-eeu-green-light text-eeu-green border-eeu-green"
        />
        
        <CategoryGroup
          title="📋 Low Priority (3-7 Days)"
          categories={lowPriorityCategories}
          colorClass="text-eeu-orange"
          bgClass="bg-eeu-orange-light text-eeu-orange border-eeu-orange"
        />
      </CardContent>
    </Card>
  );
}