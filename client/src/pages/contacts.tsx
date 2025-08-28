import { useQuery } from "@tanstack/react-query";
import { User as UserIcon, Building, MapPin, Phone, MessageCircle } from "lucide-react";
import AppHeader from "@/components/app-header";
import BottomNavigation from "@/components/bottom-navigation";
import { User } from "@shared/schema";

export default function Contacts() {
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
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
            <h1 className="text-2xl font-bold text-gray-900">جهات الاتصال</h1>
            <span className="text-sm text-gray-500" data-testid="text-contacts-count">
              {users.length} جهة اتصال
            </span>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد جهات اتصال</h3>
              <p className="text-gray-500">ابدأ بإضافة أول جهة اتصال</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                  data-testid={`card-contact-${user.id}`}
                >
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        user.accountType === "business" ? "bg-blue-100" : "bg-primary-100"
                      }`}
                    >
                      {user.accountType === "business" ? (
                        <Building className="text-blue-600 w-6 h-6" />
                      ) : (
                        <UserIcon className="text-primary-600 w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900" data-testid={`text-contact-name-${user.id}`}>
                          {user.name}
                        </h3>
                        {user.accountType === "business" && user.category && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {user.category}
                          </span>
                        )}
                      </div>
                      <p className="text-primary-600 font-medium mt-1" data-testid={`text-contact-phone-${user.id}`}>
                        {user.phone}
                      </p>
                      {user.city && (
                        <div className="flex items-center space-x-1 space-x-reverse mt-2 text-sm text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span data-testid={`text-contact-city-${user.id}`}>{user.city}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 space-x-reverse mt-4 pt-4 border-t border-gray-100">
                    <button
                      className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg font-medium touch-target flex items-center justify-center space-x-2 space-x-reverse hover:bg-primary-600 transition-colors"
                      onClick={() => window.open(`tel:${user.phone}`, '_self')}
                      data-testid={`button-call-contact-${user.id}`}
                    >
                      <Phone className="w-4 h-4" />
                      <span>اتصال</span>
                    </button>
                    <button
                      className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium touch-target flex items-center justify-center space-x-2 space-x-reverse hover:bg-gray-200 transition-colors"
                      onClick={() => window.open(`sms:${user.phone}`, '_self')}
                      data-testid={`button-message-contact-${user.id}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>رسالة</span>
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
