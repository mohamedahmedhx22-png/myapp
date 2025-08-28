import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Wrench, Search, Filter, Star, MapPin, Building, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import BottomNavigation from "@/components/bottom-navigation";
import type { Service, User } from "@shared/schema";

interface ServiceWithProvider extends Service {
  provider?: User;
}

export default function Services() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all-cities");
  const [priceFilter, setPriceFilter] = useState("all-prices");

  // Get all services
  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services", { isActive: true }],
  });

  // Get all businesses to link services to providers
  const { data: businesses = [] } = useQuery<User[]>({
    queryKey: ["/api/users", { accountType: "business", isActive: true }],
  });

  // Combine services with their providers
  const servicesWithProviders: ServiceWithProvider[] = services.map(service => ({
    ...service,
    provider: businesses.find(business => business.id === service.businessId)
  }));

  // Apply filters
  const filteredServices = servicesWithProviders.filter(service => {
    const matchesSearch = 
      !searchQuery || 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.provider?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "all" || service.category === categoryFilter;
    const matchesCity = cityFilter === "all-cities" || service.provider?.city === cityFilter;
    
    return matchesSearch && matchesCategory && matchesCity;
  });

  // Get unique categories and cities for filters
  const categories = Array.from(new Set(services.map(s => s.category).filter(Boolean)));
  const cities = Array.from(new Set(businesses.map(b => b.city).filter(Boolean)));

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setCityFilter("all-cities");
    setPriceFilter("all-prices");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-20">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <button
              onClick={() => setLocation("/")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              data-testid="button-back-home"
            >
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Wrench className="text-blue-600 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">دليل الخدمات</h1>
              <p className="text-gray-600">استكشف الخدمات المتاحة من مقدمي الخدمات</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث عن خدمة أو مقدم خدمة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                  data-testid="input-search-services"
                />
              </div>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="px-6"
                data-testid="button-clear-filters"
              >
                <Filter className="w-4 h-4 ml-2" />
                مسح الفلاتر
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">فئة الخدمة</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter} data-testid="select-category-filter">
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الفئات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المدينة</label>
                <Select value={cityFilter} onValueChange={setCityFilter} data-testid="select-city-filter">
                  <SelectTrigger>
                    <SelectValue placeholder="جميع المدن" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-cities">جميع المدن</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city || ""}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السعر</label>
                <Select value={priceFilter} onValueChange={setPriceFilter} data-testid="select-price-filter">
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الأسعار" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-prices">جميع الأسعار</SelectItem>
                    <SelectItem value="budget">اقتصادي (أقل من 500 ريال)</SelectItem>
                    <SelectItem value="mid">متوسط (500 - 2000 ريال)</SelectItem>
                    <SelectItem value="premium">مميز (أكثر من 2000 ريال)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              عرض {filteredServices.length} من أصل {services.length} خدمة
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-6xl mx-auto px-4">
        {servicesLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد خدمات</h3>
            <p className="text-gray-500">لم يتم العثور على خدمات تطابق البحث المحدد</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <Card key={service.id} className="hover:shadow-md transition-shadow" data-testid={`card-service-${service.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-right mb-2" data-testid={`text-service-title-${service.id}`}>
                        {service.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2 space-x-reverse mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {service.category}
                        </Badge>
                        {service.price && (
                          <Badge variant="outline" className="text-xs">
                            {service.price}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Wrench className="text-blue-600 w-6 h-6" />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {service.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  
                  {service.provider && (
                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Building className="w-4 h-4 text-gray-400" />
                          <Link
                            href={`/profile/${service.provider.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            data-testid={`link-provider-${service.provider.id}`}
                          >
                            {service.provider.name}
                          </Link>
                        </div>
                        {service.provider.city && (
                          <div className="flex items-center space-x-1 space-x-reverse text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span>{service.provider.city}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <div className={`w-2 h-2 rounded-full ${
                            service.provider.isActive ? "bg-green-400" : "bg-gray-400"
                          }`}></div>
                          <span className="text-xs text-gray-500">
                            {service.provider.isActive ? "متاح الآن" : "غير متاح"}
                          </span>
                        </div>
                        
                        <Link
                          href={`/profile/${service.provider.id}`}
                          className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          عرض الملف الشخصي
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}