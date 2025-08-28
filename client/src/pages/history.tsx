import { useQuery } from "@tanstack/react-query";
import { History as HistoryIcon, Search, User, Phone } from "lucide-react";
import AppHeader from "@/components/app-header";
import BottomNavigation from "@/components/bottom-navigation";
import { SearchHistory } from "@shared/schema";

export default function History() {
  const { data: searches = [], isLoading } = useQuery<SearchHistory[]>({
    queryKey: ["/api/search/history"],
    queryFn: () => fetch("/api/search/history?limit=50").then(res => res.json()),
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return days === 1 ? "أمس" : `منذ ${days} أيام`;
    } else if (hours > 0) {
      return hours === 1 ? "منذ ساعة" : `منذ ${hours} ساعات`;
    } else {
      return "منذ قليل";
    }
  };

  const getSearchTypeIcon = (searchType: string) => {
    return searchType === "phone" ? Phone : User;
  };

  const getSearchTypeLabel = (searchType: string) => {
    return searchType === "phone" ? "البحث بالرقم" : "البحث بالاسم";
  };

  const repeatSearch = async (search: SearchHistory) => {
    // In a real app, this would trigger the search and navigate to home page
    console.log("Repeating search:", search.query, search.searchType);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="pb-20">
          <div className="px-4 py-6">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">سجل البحث</h1>
            <span className="text-sm text-gray-500" data-testid="text-history-count">
              {searches.length} عملية بحث
            </span>
          </div>

          {searches.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HistoryIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا يوجد سجل بحث</h3>
              <p className="text-gray-500">ابدأ بالبحث عن الأرقام والأسماء</p>
            </div>
          ) : (
            <div className="space-y-3">
              {searches.map((search) => {
                const IconComponent = getSearchTypeIcon(search.searchType);
                const results = search.results ? JSON.parse(search.results) : [];
                
                return (
                  <button
                    key={search.id}
                    className="w-full bg-white rounded-lg p-4 border border-gray-100 text-left hover:shadow-sm transition-shadow"
                    onClick={() => repeatSearch(search)}
                    data-testid={`button-search-history-${search.id}`}
                  >
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 truncate" data-testid={`text-search-query-${search.id}`}>
                            {search.query}
                          </h3>
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(search.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {getSearchTypeLabel(search.searchType)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {results.length} نتيجة
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(search.timestamp)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
