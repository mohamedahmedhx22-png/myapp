import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Search, Filter, Store, Package, Star, MapPin, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface BusinessCategory {
  id: string;
  name: string;
  arabicName?: string;
  description?: string;
  icon?: string;
}

interface Service {
  id: string;
  businessId: string;
  title: string;
  description?: string;
  price?: string;
  category: string;
  duration?: string;
  imageUrls?: string[];
  tags?: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

interface Product {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  price?: string;
  originalPrice?: string;
  category: string;
  stockQuantity?: number;
  imageUrls?: string[];
  specifications?: string;
  tags?: string[];
  weight?: string;
  dimensions?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

interface Business {
  id: string;
  name: string;
  category?: string;
  city?: string;
  country?: string;
  logoUrl?: string;
  isVerified: boolean;
}

export default function MarketplacePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');
  const [isSearching, setIsSearching] = useState(false);
  
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/business-categories');
      if (response.ok) {
        const categoriesData = await response.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      if (activeTab === 'services') {
        const response = await fetch(`/api/search/services?query=${encodeURIComponent(searchQuery)}&categoryId=${selectedCategory}`);
        if (response.ok) {
          const servicesData = await response.json();
          setServices(servicesData);
        }
      } else {
        const response = await fetch(`/api/search/products?query=${encodeURIComponent(searchQuery)}&categoryId=${selectedCategory}`);
        if (response.ok) {
          const productsData = await response.json();
          setProducts(productsData);
        }
      }
    } catch (error) {
      toast({
        title: "خطأ في البحث",
        description: "حدث خطأ أثناء البحث، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'services' | 'products');
    setServices([]);
    setProducts([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.arabicName || category?.name || categoryId;
  };

  const handleViewBusiness = (businessId: string) => {
    setLocation(`/profile/${businessId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">السوق الإلكتروني</h1>
        <p className="text-center text-muted-foreground">
          اكتشف الخدمات والمنتجات من مختلف الأعمال التجارية
        </p>
      </div>

      {/* Search and Filter Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            البحث والتصفية
          </CardTitle>
          <CardDescription>
            ابحث عن الخدمات أو المنتجات وصفف النتائج حسب الفئة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="ابحث عن الخدمات أو المنتجات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="جميع الفئات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع الفئات</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.arabicName || category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="w-full lg:w-auto"
            >
              {isSearching ? 'جاري البحث...' : <Search className="w-4 h-4 ml-2" />}
              بحث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Services and Products */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            الخدمات
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            المنتجات
          </TabsTrigger>
        </TabsList>
        
        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          {services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{service.title}</CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {getCategoryName(service.category)}
                          </Badge>
                          {service.isFeatured && (
                            <Badge variant="default" className="text-xs">
                              مميز
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {service.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      {service.price && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">السعر:</span>
                          <span className="text-primary">{service.price}</span>
                        </div>
                      )}
                      
                      {service.duration && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{service.duration}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>تاريخ النشر: {formatDate(service.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleViewBusiness(service.businessId)}
                      >
                        <Eye className="w-4 h-4 ml-2" />
                        عرض العمل التجاري
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">لا توجد خدمات</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `لا توجد نتائج للبحث عن "${searchQuery}"`
                  : "ابدأ بالبحث عن الخدمات المتاحة"
                }
              </p>
            </div>
          )}
        </TabsContent>
        
        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {getCategoryName(product.category)}
                          </Badge>
                          {product.isFeatured && (
                            <Badge variant="default" className="text-xs">
                              مميز
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">السعر:</span>
                        <div className="flex items-center gap-2">
                          {product.originalPrice && product.originalPrice !== product.price && (
                            <span className="text-muted-foreground line-through text-xs">
                              {product.originalPrice}
                            </span>
                          )}
                          <span className="text-primary font-semibold">{product.price}</span>
                        </div>
                      </div>
                      
                      {product.stockQuantity !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">المخزون:</span>
                          <span className={product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}>
                            {product.stockQuantity > 0 ? `${product.stockQuantity} متوفر` : 'غير متوفر'}
                          </span>
                        </div>
                      )}
                      
                      {product.weight && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>الوزن: {product.weight}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>تاريخ النشر: {formatDate(product.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleViewBusiness(product.businessId)}
                      >
                        <Eye className="w-4 h-4 ml-2" />
                        عرض العمل التجاري
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">لا توجد منتجات</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `لا توجد نتائج للبحث عن "${searchQuery}"`
                  : "ابدأ بالبحث عن المنتجات المتاحة"
                }
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Categories Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>فئات الأعمال التجارية</CardTitle>
          <CardDescription>
            تصفح الخدمات والمنتجات حسب الفئة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => {
                  setSelectedCategory(category.id);
                  setSearchQuery('');
                  setServices([]);
                  setProducts([]);
                }}
              >
                {category.icon && <span className="text-2xl">{category.icon}</span>}
                <span className="font-medium text-center">
                  {category.arabicName || category.name}
                </span>
                {category.description && (
                  <span className="text-xs text-center opacity-75 line-clamp-2">
                    {category.description}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}