import { User } from "@shared/schema";
import { Phone, MessageCircle, Info, MapPin, CheckCircle, Building, Search, User as UserIcon, Heart, Star, Copy } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SearchResultsProps {
  results: User[];
  isLoading?: boolean;
}

export default function SearchResults({ results, isLoading }: SearchResultsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const addToFavoritesMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("POST", `/api/favorites/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الإضافة للمفضلة",
        description: "تم حفظ جهة الاتصال في المفضلة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
    onError: () => {
      toast({
        title: "خطأ في الإضافة للمفضلة",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <section className="px-4 py-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (results.length === 0) {
    return (
      <section className="px-4 py-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">لم يتم العثور على نتائج</h3>
          <p className="text-gray-500">حاول البحث بكلمات مختلفة</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">نتائج البحث</h2>
        <span className="text-sm text-gray-500" data-testid="text-results-count">
          {results.length} نتيجة
        </span>
      </div>

      <div className="space-y-3">
        {results.map((result, index) => (
          <div
            key={result.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
            data-testid={`card-result-${result.id}`}
          >
            <div className="flex items-start space-x-3 space-x-reverse">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  result.accountType === "business"
                    ? "bg-blue-100"
                    : result.name.includes("فاطمة")
                    ? "bg-pink-100"
                    : "bg-primary-100"
                }`}
              >
                {result.accountType === "business" ? (
                  <Building
                    className={`w-6 h-6 ${
                      result.accountType === "business" ? "text-blue-600" : "text-primary-600"
                    }`}
                  />
                ) : (
                  <UserIcon
                    className={`w-6 h-6 ${
                      result.name.includes("فاطمة") ? "text-pink-600" : "text-primary-600"
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900" data-testid={`text-name-${result.id}`}>
                    {result.name}
                  </h3>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        result.isActive ? "bg-green-400" : "bg-yellow-400"
                      }`}
                    ></div>
                    <span className="text-xs text-gray-500">
                      {result.isActive ? "نشط" : "غير متاح"}
                    </span>
                  </div>
                </div>
                <p className="text-primary-600 font-medium mt-1" data-testid={`text-phone-${result.id}`}>
                  {result.phone}
                </p>
                <div className="flex items-center space-x-4 space-x-reverse mt-2 text-sm text-gray-500">
                  {result.city && (
                    <span className="flex items-center space-x-1 space-x-reverse">
                      <MapPin className="w-3 h-3" />
                      <span data-testid={`text-location-${result.id}`}>{result.city}</span>
                    </span>
                  )}
                  {result.isVerified && (
                    <span className="flex items-center space-x-1 space-x-reverse">
                      <CheckCircle className="text-green-500 w-3 h-3" />
                      <span>موثق</span>
                    </span>
                  )}
                  {result.accountType === "business" && result.category && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {result.category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 space-x-reverse mt-4 pt-4 border-t border-gray-100">
              <button
                className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg font-medium touch-target flex items-center justify-center space-x-2 space-x-reverse hover:bg-primary-600 transition-colors"
                onClick={() => window.open(`tel:${result.phone}`, '_self')}
                data-testid={`button-call-${result.id}`}
              >
                <Phone className="w-4 h-4" />
                <span>اتصال</span>
              </button>
              <button
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium touch-target flex items-center justify-center space-x-2 space-x-reverse hover:bg-gray-200 transition-colors"
                onClick={() => window.open(`sms:${result.phone}`, '_self')}
                data-testid={`button-message-${result.id}`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>رسالة</span>
              </button>
              <button
                className="py-2 px-3 bg-blue-100 text-blue-700 rounded-lg touch-target hover:bg-blue-200 transition-colors"
                onClick={() => copyPhoneNumber(result.phone)}
                data-testid={`button-copy-${result.id}`}
                title="نسخ الرقم"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                className="py-2 px-3 bg-yellow-100 text-yellow-700 rounded-lg touch-target hover:bg-yellow-200 transition-colors"
                onClick={() => addToFavoritesMutation.mutate(result.id)}
                disabled={addToFavoritesMutation.isPending}
                data-testid={`button-favorite-${result.id}`}
              >
                <Star className="w-4 h-4" />
              </button>
              <button
                className="py-2 px-3 bg-gray-100 text-gray-700 rounded-lg touch-target hover:bg-gray-200 transition-colors"
                onClick={() => window.location.href = `/profile/${result.id}`}
                data-testid={`button-info-${result.id}`}
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
