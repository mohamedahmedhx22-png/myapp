import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Plus, UserPlus, IdCard, History as HistoryIcon, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/app-header";
import BottomNavigation from "@/components/bottom-navigation";
import SearchInterface from "@/components/search-interface";
import SearchResults from "@/components/search-results";
import EnhancedSearchResults, { type PhoneSearchResult } from "@/components/enhanced-search-results";
import { User as UserType, SearchHistory } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  // Separate results for each search type
  const [phoneResults, setPhoneResults] = useState<PhoneSearchResult[]>([]);
  const [nameResults, setNameResults] = useState<PhoneSearchResult[]>([]);
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchType, setSearchType] = useState<"name" | "phone">("phone");
  const [useEnhancedSearch, setUseEnhancedSearch] = useState(true);
  const [, setLocation] = useLocation();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "جاري تسجيل الخروج...",
      description: "سيتم إعادة توجيهك قريباً",
    });
    setTimeout(() => {
      window.location.href = "/api/logout";
    }, 500);
  };

  const handleViewMyProfile = () => {
    if (currentUser?.id) {
      setLocation(`/profile/${currentUser.id}`);
    }
  };

  // Get recent searches
  const { data: recentSearches = [] } = useQuery<SearchHistory[]>({
    queryKey: ["/api/search/history"],
    queryFn: () => fetch("/api/search/history").then(res => res.json()),
  });

  const handleSearch = async (query: string, type: "name" | "phone") => {
    // Update search type first
    setSearchType(type);
    
    // If empty query, check if we have previous results for this search type
    if (!query.trim()) {
      const hasResults = type === "phone" ? phoneResults.length > 0 : nameResults.length > 0;
      setShowResults(hasResults);
      return;
    }

    setIsSearching(true);
    
    try {
      let searchQuery = query.trim();
      
      // إذا كان البحث برقم الهاتف، تحقق من وجود مفتاح دولة مكرر وأزله
      if (type === "phone") {
        // إذا احتوى على مفتاح دولة مرتين (+966+966 مثلاً)
        const doubleCountryCodeMatch = searchQuery.match(/^(\+\d{1,4})(\+\d{1,4})/);
        if (doubleCountryCodeMatch) {
          // احتفظ بالمفتاح الأول فقط
          searchQuery = searchQuery.replace(doubleCountryCodeMatch[2], '');
        }
      }

      if (useEnhancedSearch) {
        // Use enhanced search API for phone contacts
        if (type === "phone") {
          const endpoint = `/api/phone/search/${encodeURIComponent(searchQuery)}`;
          const response = await fetch(endpoint);
          const result = await response.json();
          setPhoneResults([result]);
        } else {
          // For name search, use contacts search
          const params = new URLSearchParams({ name: searchQuery });
          const endpoint = `/api/contacts/search?${params.toString()}`;
          const response = await fetch(endpoint);
          const results = await response.json();
          setNameResults(results);
        }
      } else {
        // Use legacy search for backward compatibility
        const params = new URLSearchParams({ query: searchQuery, type });
        const endpoint = `/api/search?${params.toString()}`;
        const response = await fetch(endpoint);
        const results = await response.json();
        setSearchResults(results);
      }
      
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      if (type === "phone") {
        setPhoneResults([]);
      } else {
        setNameResults([]);
      }
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePhoneSearch = async (phoneNumber: string) => {
    // Switch to phone search mode and search for the clicked phone number
    setSearchType("phone");
    await handleSearch(phoneNumber, "phone");
  };

  const repeatSearch = async (search: SearchHistory) => {
    await handleSearch(search.query, search.searchType as "name" | "phone");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader onUserMenuClick={handleViewMyProfile} />
      
      <main className="pb-20">
        <SearchInterface 
          onSearch={handleSearch} 
          isSearching={isSearching} 
          phoneToSearch={searchType === "phone" ? phoneResults[0]?.phoneNumber : undefined}
        />

        {/* Quick Actions */}
        {!showResults && (
          <section className="px-4 py-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">إجراءات سريعة</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow touch-target"
                onClick={() => setLocation("/add-contact")}
                data-testid="button-add-contact"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <UserPlus className="text-green-600 w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-gray-700">إضافة جهة اتصال</span>
              </button>
              
              <button
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow touch-target"
                onClick={() => setLocation("/phone-discovery")}
                data-testid="button-phone-discovery"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <IdCard className="text-blue-600 w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-gray-700">كاشف الأرقام</span>
              </button>
              
              <button
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow touch-target"
                onClick={() => setLocation("/marketplace")}
                data-testid="button-marketplace"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="text-purple-600 w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-gray-700">السوق الإلكتروني</span>
              </button>
              
              <button
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow touch-target"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <LogOut className="text-red-600 w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-gray-700">تسجيل الخروج</span>
              </button>
            </div>
          </section>
        )}

        {/* Search Results */}
        {showResults && (
          <>
            {useEnhancedSearch ? (
              <EnhancedSearchResults 
                results={searchType === "phone" ? phoneResults : nameResults} 
                isLoading={isSearching} 
                searchType={searchType}
                onPhoneSearch={handlePhoneSearch}
              />
            ) : (
              <SearchResults results={searchResults} isLoading={isSearching} />
            )}
          </>
        )}

        {/* Recent Searches */}
        {!showResults && recentSearches.length > 0 && (
          <section className="px-4 py-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">عمليات البحث الأخيرة</h2>
            <div className="space-y-2">
              {recentSearches.map((search) => (
                <button
                  key={search.id}
                  className="w-full bg-white rounded-lg p-3 flex items-center justify-between hover:shadow-sm transition-shadow touch-target"
                  onClick={() => repeatSearch(search)}
                  data-testid={`button-repeat-search-${search.id}`}
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <HistoryIcon className="text-gray-400 w-4 h-4" />
                    <span className="text-gray-700">{search.query}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatTimeAgo(search.timestamp)}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* User Info */}
      {currentUser && (
        <div className="fixed top-16 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-100 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              {currentUser.profileImageUrl ? (
                <img 
                  src={currentUser.profileImageUrl} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
              )}
              <span className="text-sm font-medium text-gray-900">
                {currentUser.name || currentUser.email}
              </span>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="ghost" 
              size="sm"
              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              data-testid="button-logout-header"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}
