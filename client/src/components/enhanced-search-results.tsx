
import { useState } from "react";
import { Phone, MessageCircle, MapPin, CheckCircle, AlertTriangle, Eye, Flag, User as UserIcon, Building, Clock, Search, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface PhoneSearchResult {
  phoneNumber: string;
  contacts: Array<{
    id: string;
    contactName: string;
    addedByUser: {
      id: string;
      name: string;
      city?: string;
      country?: string;
      region?: string;
    };
    isVerified: boolean;
    reportCount: number;
    createdAt: Date;
  }>;
}

interface EnhancedSearchResultsProps {
  results: PhoneSearchResult[];
  isLoading?: boolean;
  searchType: "phone" | "name";
  onPhoneSearch?: (phoneNumber: string) => void;
}

export default function EnhancedSearchResults({ results, isLoading, searchType, onPhoneSearch }: EnhancedSearchResultsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");

  const copyPhoneNumber = async (phoneNumber: string) => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      toast({
        title: "تم النسخ",
        description: "تم نسخ رقم الهاتف بنجاح",
      });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = phoneNumber;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast({
          title: "تم النسخ",
          description: "تم نسخ رقم الهاتف بنجاح",
        });
      } catch (fallbackError) {
        toast({
          title: "خطأ في النسخ",
          description: "لم يتمكن من نسخ الرقم",
          variant: "destructive",
        });
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const reportContactMutation = useMutation({
    mutationFn: async ({ contactId, reportType, reportReason }: { contactId: string; reportType: string; reportReason?: string }) => {
      const response = await apiRequest("POST", `/api/contacts/${contactId}/report`, {
        reportedByUserId: "current-user-id", // Should get from auth context
        reportType,
        reportReason
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الإبلاغ بنجاح",
        description: "شكراً لك على المساعدة في تحسين جودة البيانات",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في الإبلاغ",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <section className="px-4 py-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  // Flatten all contacts from all results into individual cards
  const allContacts = results.flatMap(result => 
    result.contacts.map(contact => ({
      ...contact,
      phoneNumber: result.phoneNumber
    }))
  );

  if (allContacts.length === 0) {
    return (
      <section className="px-4 py-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">لم يتم العثور على نتائج</h3>
          <p className="text-gray-500">حاول البحث بكلمات أخرى أو تحقق من الرقم</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {searchType === "phone" ? "أسماء الرقم" : "نتائج البحث"}
        </h2>
        <span className="text-sm text-gray-500">
          {allContacts.length} نتيجة
        </span>
      </div>

      {allContacts.map((contact) => (
        <Card key={contact.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-primary-600 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                {searchType === "name" && onPhoneSearch ? (
                  <button
                    onClick={() => onPhoneSearch(contact.phoneNumber)}
                    className="hover:text-primary-700 hover:underline transition-colors flex items-center gap-2"
                    title="البحث عن هذا الرقم"
                  >
                    {contact.phoneNumber}
                    <Search className="w-4 h-4" />
                  </button>
                ) : (
                  contact.phoneNumber
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {contact.isVerified && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {contact.reportCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {contact.reportCount} تقرير
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2" data-testid={`text-contact-name-${contact.id}`}>
                    {contact.contactName}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3" />
                      <span>من سماني: {contact.addedByUser.name}</span>
                    </div>
                    {contact.addedByUser.city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{contact.addedByUser.city}</span>
                        {contact.addedByUser.country && (
                          <span>, {contact.addedByUser.country}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>أُضيف: {new Date(contact.createdAt).toLocaleDateString('ar')}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`tel:${contact.phoneNumber}`, '_self')}
                    data-testid={`button-call-${contact.id}`}
                  >
                    <Phone className="w-4 h-4 ml-2" />
                    اتصال
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      reportContactMutation.mutate({
                        contactId: contact.id,
                        reportType: "incorrect",
                        reportReason: "معلومات غير صحيحة"
                      });
                    }}
                    className="text-red-600 hover:text-red-700"
                    data-testid={`button-report-${contact.id}`}
                  >
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`sms:${contact.phoneNumber}`, '_self')}
                className="flex-1"
                data-testid={`button-sms-${contact.phoneNumber}`}
              >
                <MessageCircle className="w-4 h-4 ml-2" />
                رسالة
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyPhoneNumber(contact.phoneNumber)}
                className="flex-1"
                data-testid={`button-copy-${contact.phoneNumber}`}
              >
                <Copy className="w-4 h-4 ml-2" />
                نسخ
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // Add contact functionality would go here
                  toast({
                    title: "إضافة جهة اتصال",
                    description: "سيتم إضافة هذه الميزة قريباً",
                  });
                }}
                className="flex-1"
                data-testid={`button-add-contact-${contact.phoneNumber}`}
              >
                <UserIcon className="w-4 h-4 ml-2" />
                حفظ
              </Button>
            </div>

            {/* Trust Indicator */}
            {contact.reportCount > 2 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  تحذير: تم الإبلاغ عن هذا الاسم كمعلومات غير صحيحة
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
