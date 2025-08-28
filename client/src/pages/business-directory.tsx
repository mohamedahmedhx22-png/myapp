import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building, MapPin, Star, Package, Wrench, Search, Filter, Users, Heart, Grid3X3, List, SortDesc, Eye, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import BottomNavigation from "@/components/bottom-navigation";
import type { User, Service, Product } from "@shared/schema";

interface BusinessWithItems extends User {
  services?: Service[];
  products?: Product[];
  rating?: { average: number; count: number };
}

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'newest' | 'oldest' | 'category';

export default function BusinessDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('name');

  // Get all businesses
  const { data: businesses = [], isLoading: businessesLoading } = useQuery<User[]>({
    queryKey: ["/api/users", { accountType: "business", isActive: true }],
  });

  // Get all services
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services", { isActive: true }],
  });

  // Get all products
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", { isActive: true }],
  });

  // Combine businesses with their services and products
  const [businessesWithItems, setBusinessesWithItems] = useState<BusinessWithItems[]>([]);

  useEffect(() => {
    if (businesses.length > 0) {
      const combined = businesses.map((business) => ({
        ...business,
        services: services.filter((service) => service.businessId === business.id),
        products: products.filter((product) => product.businessId === business.id),
      }));
      setBusinessesWithItems(combined);
    }
  }, [businesses, services, products]);

  // Apply filters
  const filteredBusinesses = businessesWithItems.filter(business => {
    const matchesSearch = 
      !searchQuery || 
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (business.category && business.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      business.services?.some(service => 
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      business.products?.some(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory = !categoryFilter || categoryFilter === "all" || business.category === categoryFilter;
    const matchesCity = !cityFilter || cityFilter === "all-cities" || business.city === cityFilter;

    return matchesSearch && matchesCategory && matchesCity;
  });

  // Get unique categories and cities for filters
  const categories = Array.from(new Set(businesses.map((b) => b.category).filter(Boolean)));
  const cities = Array.from(new Set(businesses.map((b) => b.city).filter(Boolean)));

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setCityFilter("all-cities");
  };

  // Sort businesses
  const sortedBusinesses = filteredBusinesses.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name, 'ar');
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'category':
        return (a.category || '').localeCompare(b.category || '', 'ar');
      default:
        return 0;
    }
  });

  const filteredByTab = sortedBusinesses.filter(business => {
    if (activeTab === "all") return true;
    if (activeTab === "services") return (business.services?.length || 0) > 0;
    if (activeTab === "products") return (business.products?.length || 0) > 0;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-20">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Building className="text-primary-600 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">دليل الأعمال</h1>
              <p className="text-gray-600">اكتشف المتاجر ومقدمي الخدمات في منطقتك</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث عن متجر، خدمة، أو منتج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                  data-testid="input-search-business"
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">فئة النشاط</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter} data-testid="select-category-filter">
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الفئات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category as string}>
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
                      <SelectItem key={city} value={city as string}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ترتيب حسب</label>
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)} data-testid="select-sort">
                  <SelectTrigger>
                    <SelectValue placeholder="الترتيب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">الاسم</SelectItem>
                    <SelectItem value="newest">الأحدث</SelectItem>
                    <SelectItem value="oldest">الأقدم</SelectItem>
                    <SelectItem value="category">الفئة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">طريقة العرض</label>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="flex-1"
                    data-testid="button-grid-view"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="flex-1"
                    data-testid="button-list-view"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" data-testid="tab-all">
              <Users className="w-4 h-4 ml-2" />
              جميع الأعمال ({filteredBusinesses.length})
            </TabsTrigger>
            <TabsTrigger value="services" data-testid="tab-services">
              <Wrench className="w-4 h-4 ml-2" />
              مقدمو الخدمات
            </TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">
              <Package className="w-4 h-4 ml-2" />
              المتاجر
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {businessesLoading ? (
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
            ) : filteredByTab.length === 0 ? (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أعمال</h3>
                <p className="text-gray-500">لم يتم العثور على أعمال تجارية تطابق البحث المحدد</p>
              </div>
            ) : (
              <div className={`gap-6 ${viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col'}`}>
                {filteredByTab.map((business) => (
                  <Card key={business.id} className={`hover:shadow-md transition-shadow ${viewMode === 'list' ? 'max-w-full' : ''}`} data-testid={`card-business-${business.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {business.logoUrl ? (
                              <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
                            ) : (
                              <Building className="text-blue-600 w-6 h-6" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg text-right" data-testid={`text-business-name-${business.id}`}>
                              {business.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 flex-wrap mt-1">
                              {business.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {business.category}
                                </Badge>
                              )}
                              {business.isVerified && (
                                <Badge variant="default" className="text-xs">
                                  موثق
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" data-testid={`button-favorite-${business.id}`}>
                            <Heart className="w-4 h-4" />
                          </Button>
                          {business.website && (
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Globe className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {business.city && (
                          <div className="flex items-center space-x-1 space-x-reverse text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span data-testid={`text-business-city-${business.id}`}>{business.city}</span>
                          </div>
                        )}
                        
                        {business.description && (
                          <p className="text-sm text-gray-600 line-clamp-2" data-testid={`text-business-description-${business.id}`}>
                            {business.description}
                          </p>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        {/* Services */}
                        {business.services && business.services.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                              <Wrench className="w-4 h-4 ml-2" />
                              الخدمات ({business.services.length})
                            </h4>
                            <div className="space-y-2">
                              {business.services.slice(0, 2).map((service) => (
                                <div key={service.id} className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <p className="font-medium text-sm" data-testid={`text-service-title-${service.id}`}>
                                        {service.title}
                                      </p>
                                      {service.description && (
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                          {service.description}
                                        </p>
                                      )}
                                    </div>
                                    {service.price && (
                                      <Badge variant="outline" className="text-xs">
                                        {service.price}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {business.services.length > 2 && (
                                <p className="text-xs text-gray-500 text-center">
                                  +{business.services.length - 2} خدمة أخرى
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Products */}
                        {business.products && business.products.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                              <Package className="w-4 h-4 ml-2" />
                              المنتجات ({business.products.length})
                            </h4>
                            <div className="space-y-2">
                              {business.products.slice(0, 2).map((product) => (
                                <div key={product.id} className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <p className="font-medium text-sm" data-testid={`text-product-name-${product.id}`}>
                                        {product.name}
                                      </p>
                                      {product.description && (
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                          {product.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-left">
                                      {product.price && (
                                        <Badge variant="outline" className="text-xs">
                                          {product.price}
                                        </Badge>
                                      )}
                                      {product.stockQuantity !== null && product.stockQuantity !== undefined && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          المخزون: {product.stockQuantity}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {business.products.length > 2 && (
                                <p className="text-xs text-gray-500 text-center">
                                  +{business.products.length - 2} منتج آخر
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <Separator />

                        {/* Contact Info */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <p className="font-medium text-primary-600" data-testid={`text-business-phone-${business.id}`}>
                              {business.phone}
                            </p>
                          </div>
                          <Link href={`/business/${business.id}`}>
                            <Button size="sm" variant="outline" data-testid={`button-view-profile-${business.id}`}>
                              <Eye className="w-4 h-4 ml-2" />
                              عرض المتجر
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNavigation />
    </div>
  );
}