import { useState } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { ComplaintCategory, ComplaintPriority } from '@/types/complaint';
import { COMPLAINT_CATEGORIES } from '@/lib/constants';
import { ETHIOPIAN_REGIONS, SERVICE_CENTERS } from '@/types/user';
import { apiService } from '@/lib/api';

export function ComplaintFormAmharic() {
  const { toast } = useToast();
  const { user, permissions } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    region: user?.region || '',
    serviceCenter: user?.serviceCenter || '',
    meterNumber: '',
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
          meterNumber: formData.meterNumber,
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
          title: "ቅሬታ በተሳካ ሁኔታ ተልክዋል",
          description: `ቅሬታ መለያ: ${response.data?.id || 'CMP-' + Date.now().toString().slice(-6)} ተፈጥሯል።`,
        });

        // Reset form
        setFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          customerAddress: '',
          region: user?.region || '',
          serviceCenter: user?.serviceCenter || '',
          meterNumber: '',
          accountNumber: '',
          title: '',
          description: '',
          category: '' as ComplaintCategory,
          priority: 'medium' as ComplaintPriority
        });
      } else {
        throw new Error(response.error || 'ቅሬታ ማስገባት አልተሳካም');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast({
        title: "ስህተት",
        description: error instanceof Error ? error.message : "ቅሬታ ማስገባት አልተሳካም። እባክዎ እንደገና ይሞክሩ።",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="animate-slide-up">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-xl bg-white rounded-xl border-2 border-green-200 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-600 via-yellow-400 to-green-600 text-white py-6 rounded-t-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 via-yellow-400/90 to-green-600/90"></div>
              <div className="relative z-10">
                <CardTitle className="text-xl font-bold">
                  የደንበኛ መረጃ
                </CardTitle>
                <p className="text-green-100 text-sm mt-2 font-medium">
                  የግል እና የመገናኛ ዝርዝሮች
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>ሙሉ ስም *</Label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="ሙሉ ስም ያስገቡ"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ኢሜይል</Label>
                  <Input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder="customer@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ስልክ ቁጥር *</Label>
                  <Input
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="+251-9XX-XXXXXX"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>አድራሻ *</Label>
                <Textarea
                  value={formData.customerAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                  placeholder="ሙሉ አድራሻ ክፍለ ከተማ/ወረዳ ጨምሮ"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>ክልል *</Label>
                <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value, serviceCenter: '' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="ክልል ይምረጡ" />
                  </SelectTrigger>
                  <SelectContent>
                    {ETHIOPIAN_REGIONS.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>የአገልግሎት ማዕከል *</Label>
                <Select 
                  value={formData.serviceCenter} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, serviceCenter: value }))}
                  disabled={!formData.region}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.region ? "የአገልግሎት ማዕከል ይምረጡ" : "መጀመሪያ ክልል ይምረጡ"} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.region && SERVICE_CENTERS[formData.region as keyof typeof SERVICE_CENTERS]?.map((center) => (
                      <SelectItem key={center} value={center}>
                        {center}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-eeu-green shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-eeu-green-light">
            <CardHeader className="bg-gradient-eeu-reverse text-white rounded-t-lg">
              <CardTitle>
                የቅሬታ ዝርዝር
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>የቅሬታ ርዕስ *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="የችግሩ አጭር መግለጫ"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>ምድብ *</Label>
                <Select value={formData.category} onValueChange={(value: ComplaintCategory) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="የቅሬታ ምድብ ይምረጡ" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPLAINT_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ዝርዝር መግለጫ *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="የችግሩ ዝርዝር መግለጫ፣ መቼ እንደጀመረ፣ የተጎዱ አካባቢዎች እና ሌሎች አስፈላጊ መረጃዎችን ያካትቱ..."
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full py-4 text-lg font-semibold bg-gradient-eeu hover:opacity-90 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>እየላካል...</span>
                    </div>
                  ) : (
                    <span>ቅሬታ አስገባ</span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

export default ComplaintFormAmharic;