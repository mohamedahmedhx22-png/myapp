import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, StarOff, Phone, MessageCircle, Building, MapPin, CheckCircle } from "lucide-react";
import AppHeader from "@/components/app-header";
import BottomNavigation from "@/components/bottom-navigation";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Favorites() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/favorites"],
    queryFn: () => fetch("/api/favorites").then(res => res.json()),
  });

  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/favorites/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الحذف من المفضلة",
        description: "تم حذف جهة الاتصال من المفضلة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
    onError: () => {
      toast({
        title: "خطأ في الحذف من المفضلة",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="pb-20">
          <div className="px-4 py-6">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <main className="pb-20">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2 space-x-reverse">
              <Star className="text-yellow-500 w-6 h-6" />
              <span>المفضلة</span>
            </h1>
            <span className="text-sm text-gray-500" data-testid="text-favorites-count">
              {favorites.length} مفضل
            </span>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد جهات اتصال مفضلة</h3>
              <p className="text-gray-500">ابدأ بإضافة جهات الاتصال المهمة للمفضلة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((favorite, index) => (
                <div
                  key={favorite.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-testid={`card-favorite-${favorite.id}`}
                >
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        favorite.accountType === "business" ? "bg-blue-100" : "bg-primary-100"
                      }`}
                    >
                      {favorite.accountType === "business" ? (
                        <Building className="text-blue-600 w-6 h-6" />
                      ) : (
                        <Star className="text-yellow-500 w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900" data-testid={`text-favorite-name-${favorite.id}`}>
                          {favorite.name}
                        </h3>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              favorite.isActive ? "bg-green-400" : "bg-yellow-400"
                            }`}
                          ></div>
                          <span className="text-xs text-gray-500">
                            {favorite.isActive ? "نشط" : "غير متاح"}
                          </span>
                        </div>
                      </div>
                      <p className="text-primary-600 font-medium mt-1" data-testid={`text-favorite-phone-${favorite.id}`}>
                        {favorite.phone}
                      </p>
                      <div className="flex items-center space-x-4 space-x-reverse mt-2 text-sm text-gray-500">
                        {favorite.city && (
                          <span className="flex items-center space-x-1 space-x-reverse">
                            <MapPin className="w-3 h-3" />
                            <span data-testid={`text-favorite-city-${favorite.id}`}>{favorite.city}</span>
                          </span>
                        )}
                        {favorite.isVerified && (
                          <span className="flex items-center space-x-1 space-x-reverse">
                            <CheckCircle className="text-green-500 w-3 h-3" />
                            <span>موثق</span>
                          </span>
                        )}
                        {favorite.accountType === "business" && favorite.category && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {favorite.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 space-x-reverse mt-4 pt-4 border-t border-gray-100">
                    <button
                      className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg font-medium touch-target flex items-center justify-center space-x-2 space-x-reverse hover:bg-primary-600 transition-colors"
                      onClick={() => window.open(`tel:${favorite.phone}`, '_self')}
                      data-testid={`button-call-favorite-${favorite.id}`}
                    >
                      <Phone className="w-4 h-4" />
                      <span>اتصال</span>
                    </button>
                    <button
                      className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium touch-target flex items-center justify-center space-x-2 space-x-reverse hover:bg-gray-200 transition-colors"
                      onClick={() => window.open(`sms:${favorite.phone}`, '_self')}
                      data-testid={`button-message-favorite-${favorite.id}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>رسالة</span>
                    </button>
                    <button
                      className="py-2 px-3 bg-red-100 text-red-700 rounded-lg touch-target hover:bg-red-200 transition-colors"
                      onClick={() => removeFromFavoritesMutation.mutate(favorite.id)}
                      disabled={removeFromFavoritesMutation.isPending}
                      data-testid={`button-remove-favorite-${favorite.id}`}
                    >
                      <StarOff className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}