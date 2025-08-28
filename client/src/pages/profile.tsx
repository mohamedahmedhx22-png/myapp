import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { 
  ArrowRight, 
  Phone, 
  MessageCircle, 
  MapPin, 
  CheckCircle, 
  Building, 
  User as UserIcon,
  Star,
  StarOff,
  Clock,
  Globe,
  Mail,
  Share2,
  Plus,
  Package,
  Wrench,
  Edit,
  Trash2,
  X
} from "lucide-react";
import { User, Review, Service, Product, type InsertService, type InsertProduct } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({
    reviewerName: "",
    rating: 5,
    comment: ""
  });
  
  // Service management state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState<InsertService>({
    businessId: id || "",
    title: "",
    description: "",
    price: "",
    category: "",
    isActive: true
  });
  
  // Product management state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<InsertProduct>({
    businessId: id || "",
    name: "",
    description: "",
    price: "",
    category: "",
    stockQuantity: 0,
    isActive: true
  });

  // If no ID provided, show current user's profile
  const isOwnProfile = !id;
  const profileId = id || currentUser?.id;

  const { data: user, isLoading } = useQuery<User>({
    queryKey: [`/api/users/${profileId}`],
    queryFn: () => fetch(`/api/users/${profileId}`).then(res => res.json()),
    enabled: !!profileId && !isOwnProfile,
  });

  // For own profile, use current user data directly
  const profileUser = isOwnProfile ? currentUser : user;

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: [`/api/users/${id}/reviews`],
    queryFn: () => fetch(`/api/users/${id}/reviews`).then(res => res.json()),
    enabled: !!id,
  });

  const { data: rating } = useQuery<{ average: number; count: number }>({
    queryKey: [`/api/users/${id}/rating`],
    queryFn: () => fetch(`/api/users/${id}/rating`).then(res => res.json()),
    enabled: !!id,
  });
  
  // Get services for this business
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: [`/api/businesses/${id}/services`],
    queryFn: () => fetch(`/api/businesses/${id}/services`).then(res => res.json()),
    enabled: !!id && user?.accountType === 'business',
  });
  
  // Get products for this business
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: [`/api/businesses/${id}/products`],
    queryFn: () => fetch(`/api/businesses/${id}/products`).then(res => res.json()),
    enabled: !!id && user?.accountType === 'business',
  });

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

  const addReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      const response = await apiRequest("POST", `/api/users/${id}/reviews`, reviewData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إضافة التقييم",
        description: "شكراً لك على تقييمك",
      });
      setShowReviewModal(false);
      setNewReview({ reviewerName: "", rating: 5, comment: "" });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${id}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${id}/rating`] });
    },
    onError: () => {
      toast({
        title: "خطأ في إضافة التقييم",
        variant: "destructive",
      });
    },
  });
  
  // Service mutations
  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: InsertService) => {
      const response = await apiRequest("POST", "/api/services", serviceData);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "تم إضافة الخدمة بنجاح" });
      setShowServiceModal(false);
      setNewService({ businessId: id || "", title: "", description: "", price: "", category: "", isActive: true });
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${id}/services`] });
    },
    onError: () => {
      toast({ title: "خطأ في إضافة الخدمة", variant: "destructive" });
    },
  });
  
  const updateServiceMutation = useMutation({
    mutationFn: async ({ id: serviceId, data }: { id: string; data: Partial<InsertService> }) => {
      const response = await apiRequest("PUT", `/api/services/${serviceId}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "تم تحديث الخدمة بنجاح" });
      setShowServiceModal(false);
      setEditingService(null);
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${id}/services`] });
    },
    onError: () => {
      toast({ title: "خطأ في تحديث الخدمة", variant: "destructive" });
    },
  });
  
  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const response = await apiRequest("DELETE", `/api/services/${serviceId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "تم حذف الخدمة بنجاح" });
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${id}/services`] });
    },
    onError: () => {
      toast({ title: "خطأ في حذف الخدمة", variant: "destructive" });
    },
  });
  
  // Product mutations
  const createProductMutation = useMutation({
    mutationFn: async (productData: InsertProduct) => {
      const response = await apiRequest("POST", "/api/products", productData);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "تم إضافة المنتج بنجاح" });
      setShowProductModal(false);
      setNewProduct({ businessId: id || "", name: "", description: "", price: "", category: "", stockQuantity: 0, isActive: true });
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${id}/products`] });
    },
    onError: () => {
      toast({ title: "خطأ في إضافة المنتج", variant: "destructive" });
    },
  });
  
  const updateProductMutation = useMutation({
    mutationFn: async ({ id: productId, data }: { id: string; data: Partial<InsertProduct> }) => {
      const response = await apiRequest("PUT", `/api/products/${productId}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "تم تحديث المنتج بنجاح" });
      setShowProductModal(false);
      setEditingProduct(null);
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${id}/products`] });
    },
    onError: () => {
      toast({ title: "خطأ في تحديث المنتج", variant: "destructive" });
    },
  });
  
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiRequest("DELETE", `/api/products/${productId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "تم حذف المنتج بنجاح" });
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${id}/products`] });
    },
    onError: () => {
      toast({ title: "خطأ في حذف المنتج", variant: "destructive" });
    },
  });

  const shareProfile = async () => {
    if (navigator.share && profileUser) {
      try {
        const displayName = profileUser.firstName && profileUser.lastName 
          ? `${profileUser.firstName} ${profileUser.lastName}` 
          : (profileUser.name || profileUser.email);
        await navigator.share({
          title: displayName || 'Profile',
          text: `جهة اتصال: ${displayName} - ${profileUser.phone || profileUser.email}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      if (profileUser) {
        const displayName = profileUser.firstName && profileUser.lastName 
          ? `${profileUser.firstName} ${profileUser.lastName}` 
          : (profileUser.name || profileUser.email);
        navigator.clipboard.writeText(`${displayName} - ${profileUser.phone || profileUser.email} - ${window.location.href}`);
        toast({
          title: "تم النسخ",
          description: "تم نسخ بيانات جهة الاتصال"
        });
      }
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-primary-500 text-white px-4 py-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-primary-600 rounded-lg transition-colors touch-target"
              data-testid="button-back"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="h-6 bg-primary-400 rounded animate-pulse"></div>
            </div>
          </div>
        </header>

        {/* Loading Content */}
        <main className="px-4 py-6">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4 space-x-reverse mb-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">المستخدم غير موجود</h2>
          <p className="text-gray-500 mb-4">لم يتم العثور على بيانات هذا المستخدم</p>
          <button
            onClick={() => setLocation("/")}
            className="py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-500 text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              onClick={() => setLocation("/")}
              className="p-2 hover:bg-primary-600 rounded-lg transition-colors touch-target"
              data-testid="button-back"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold" data-testid="text-profile-title">
              الملف الشخصي
            </h1>
          </div>
          <button
            onClick={shareProfile}
            className="p-2 hover:bg-primary-600 rounded-lg transition-colors touch-target"
            data-testid="button-share-profile"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-start space-x-4 space-x-reverse">
            {profileUser.profileImageUrl ? (
              <img 
                src={profileUser.profileImageUrl} 
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 ${
                  profileUser.accountType === "business" ? "bg-blue-100" : "bg-primary-100"
                }`}
              >
                {profileUser.accountType === "business" ? (
                  <Building className="text-blue-600 w-10 h-10" />
                ) : (
                  <UserIcon className="text-primary-600 w-10 h-10" />
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900" data-testid="text-profile-name">
                  {profileUser.firstName && profileUser.lastName 
                    ? `${profileUser.firstName} ${profileUser.lastName}` 
                    : (profileUser.name || profileUser.email)}
                </h2>
                <div className="flex items-center space-x-1 space-x-reverse">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      profileUser.isActive ? "bg-green-400" : "bg-yellow-400"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-500">
                    {profileUser.isActive ? "نشط" : "غير متاح"}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse mb-3">
                <span className="text-lg text-primary-600 font-medium" data-testid="text-profile-phone">
                  {profileUser.phone || profileUser.email}
                </span>
                {profileUser.isVerified && (
                  <CheckCircle className="text-green-500 w-5 h-5" />
                )}
              </div>

              {/* Rating Display */}
              {rating && rating.count > 0 && (
                <div className="flex items-center space-x-2 space-x-reverse mb-3">
                  <div className="flex items-center space-x-1 space-x-reverse">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= rating.average ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {rating.average} ({rating.count} تقييم)
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {profileUser.city && (
                  <span className="inline-flex items-center space-x-1 space-x-reverse bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    <MapPin className="w-3 h-3" />
                    <span data-testid="text-profile-city">{profileUser.city}</span>
                  </span>
                )}
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  profileUser.accountType === "business" 
                    ? "bg-blue-100 text-blue-800" 
                    : "bg-green-100 text-green-800"
                }`}>
                  {profileUser.accountType === "business" ? "تجاري" : "شخصي"}
                </span>
                {profileUser.isVerified && (
                  <span className="inline-flex items-center space-x-1 space-x-reverse bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <CheckCircle className="w-3 h-3" />
                    <span>موثق</span>
                  </span>
                )}
              </div>

              {profileUser.accountType === "business" && profileUser.category && (
                <div className="mb-4">
                  <span className="text-sm text-gray-500">التصنيف:</span>
                  <span className="mr-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm" data-testid="text-profile-category">
                    {profileUser.category}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            className="py-4 px-4 bg-primary-500 text-white rounded-xl font-medium touch-target flex items-center justify-center space-x-2 space-x-reverse hover:bg-primary-600 transition-colors"
            onClick={() => window.open(`tel:${profileUser.phone}`, '_self')}
            data-testid="button-call-profile"
          >
            <Phone className="w-5 h-5" />
            <span>اتصال</span>
          </button>
          <button
            className="py-4 px-4 bg-green-500 text-white rounded-xl font-medium touch-target flex items-center justify-center space-x-2 space-x-reverse hover:bg-green-600 transition-colors"
            onClick={() => window.open(`sms:${profileUser.phone}`, '_self')}
            data-testid="button-message-profile"
          >
            <MessageCircle className="w-5 h-5" />
            <span>رسالة</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            className="py-4 px-4 bg-yellow-500 text-white rounded-xl font-medium touch-target flex items-center justify-center space-x-2 space-x-reverse hover:bg-yellow-600 transition-colors"
            onClick={() => addToFavoritesMutation.mutate(profileUser.id)}
            disabled={addToFavoritesMutation.isPending}
            data-testid="button-add-favorite-profile"
          >
            <Star className="w-5 h-5" />
            <span>إضافة للمفضلة</span>
          </button>
          <button
            className="py-4 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium touch-target flex items-center justify-center space-x-2 space-x-reverse hover:bg-gray-200 transition-colors"
            onClick={shareProfile}
            data-testid="button-share-profile-main"
          >
            <Share2 className="w-5 h-5" />
            <span>مشاركة</span>
          </button>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات إضافية</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">نوع الحساب</span>
              <span className="font-medium text-gray-900">
                {profileUser.accountType === "business" ? "حساب تجاري" : "حساب شخصي"}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">حالة التحقق</span>
              <span className={`font-medium ${profileUser.isVerified ? "text-green-600" : "text-yellow-600"}`}>
                {profileUser.isVerified ? "تم التحقق" : "لم يتم التحقق"}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">الحالة</span>
              <span className={`font-medium ${profileUser.isActive ? "text-green-600" : "text-gray-600"}`}>
                {profileUser.isActive ? "نشط" : "غير نشط"}
              </span>
            </div>
            
            {profileUser.city && (
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-600">المدينة</span>
                <span className="font-medium text-gray-900">{profileUser.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Business Information */}
        {profileUser.accountType === "business" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات الأعمال</h3>
            
            <div className="space-y-4">
              {profileUser.category && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">التصنيف</span>
                  <span className="font-medium text-gray-900">{profileUser.category}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">ساعات العمل</span>
                <span className="font-medium text-gray-900">9:00 ص - 6:00 م</span>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-600">أيام العمل</span>
                <span className="font-medium text-gray-900">السبت - الخميس</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Services Section */}
        {profileUser.accountType === "business" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Wrench className="w-5 h-5 ml-2" />
                الخدمات ({services.length})
              </h3>
              <button
                className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 space-x-reverse"
                onClick={() => {
                  setEditingService(null);
                  setNewService({ businessId: id || "", title: "", description: "", price: "", category: "", isActive: true });
                  setShowServiceModal(true);
                }}
                data-testid="button-add-service"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة خدمة</span>
              </button>
            </div>
            
            {services.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-gray-500 font-medium mb-2">لا توجد خدمات بعد</h4>
                <p className="text-gray-400 text-sm">أضف خدماتك ليراها العملاء</p>
              </div>
            ) : (
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4" data-testid={`service-${service.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1" data-testid={`service-title-${service.id}`}>
                          {service.title}
                        </h4>
                        {service.description && (
                          <p className="text-gray-600 text-sm mb-2">
                            {service.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-3 space-x-reverse text-sm">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {service.category}
                          </span>
                          {service.price && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                              {service.price}
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded ${
                            service.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {service.isActive ? "نشط" : "غير نشط"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={() => {
                            setEditingService(service);
                            setNewService({
                              businessId: service.businessId,
                              title: service.title,
                              description: service.description || "",
                              price: service.price || "",
                              category: service.category,
                              isActive: service.isActive
                            });
                            setShowServiceModal(true);
                          }}
                          data-testid={`button-edit-service-${service.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => deleteServiceMutation.mutate(service.id)}
                          data-testid={`button-delete-service-${service.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Products Section */}
        {profileUser.accountType === "business" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="w-5 h-5 ml-2" />
                المنتجات ({products.length})
              </h3>
              <button
                className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2 space-x-reverse"
                onClick={() => {
                  setEditingProduct(null);
                  setNewProduct({ businessId: id || "", name: "", description: "", price: "", category: "", stockQuantity: 0, isActive: true });
                  setShowProductModal(true);
                }}
                data-testid="button-add-product"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج</span>
              </button>
            </div>
            
            {products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-gray-500 font-medium mb-2">لا توجد منتجات بعد</h4>
                <p className="text-gray-400 text-sm">أضف منتجاتك ليراها العملاء</p>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4" data-testid={`product-${product.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1" data-testid={`product-name-${product.id}`}>
                          {product.name}
                        </h4>
                        {product.description && (
                          <p className="text-gray-600 text-sm mb-2">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-3 space-x-reverse text-sm">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            {product.category}
                          </span>
                          {product.price && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {product.price}
                            </span>
                          )}
                          {product.stockQuantity !== null && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              مخزون: {product.stockQuantity}
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded ${
                            product.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {product.isActive ? "نشط" : "غير نشط"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={() => {
                            setEditingProduct(product);
                            setNewProduct({
                              businessId: product.businessId,
                              name: product.name,
                              description: product.description || "",
                              price: product.price || "",
                              category: product.category,
                              stockQuantity: product.stockQuantity || 0,
                              isActive: product.isActive
                            });
                            setShowProductModal(true);
                          }}
                          data-testid={`button-edit-product-${product.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => deleteProductMutation.mutate(product.id)}
                          data-testid={`button-delete-product-${product.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">التقييمات والتعليقات</h3>
            <button
              className="py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2 space-x-reverse"
              onClick={() => setShowReviewModal(true)}
              data-testid="button-add-review"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة تقييم</span>
            </button>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-gray-500 font-medium mb-2">لا توجد تقييمات بعد</h4>
              <p className="text-gray-400 text-sm">كن أول من يقيم هذا المستخدم</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div
                  key={review.id}
                  className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                  data-testid={`review-${review.id}`}
                >
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900" data-testid={`review-name-${review.id}`}>
                          {review.reviewerName}
                        </h5>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600 text-sm mb-2" data-testid={`review-comment-${review.id}`}>
                          {review.comment}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">إضافة تقييم</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسمك</label>
                  <input
                    type="text"
                    value={newReview.reviewerName}
                    onChange={(e) => setNewReview({ ...newReview, reviewerName: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="أدخل اسمك"
                    data-testid="input-reviewer-name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">التقييم</label>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="touch-target"
                        data-testid={`rating-star-${star}`}
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= newReview.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">التعليق (اختياري)</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    placeholder="اكتب تعليقك هنا..."
                    data-testid="textarea-review-comment"
                  />
                </div>
              </div>

              <div className="flex space-x-2 space-x-reverse mt-6">
                <button
                  className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => setShowReviewModal(false)}
                  data-testid="button-cancel-review"
                >
                  إلغاء
                </button>
                <button
                  className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                  onClick={() => addReviewMutation.mutate(newReview)}
                  disabled={!newReview.reviewerName || addReviewMutation.isPending}
                  data-testid="button-submit-review"
                >
                  {addReviewMutation.isPending ? "جارٍ الإضافة..." : "إضافة التقييم"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Service Modal */}
        {showServiceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingService ? "تحرير الخدمة" : "إضافة خدمة جديدة"}
                </h3>
                <button
                  onClick={() => {
                    setShowServiceModal(false);
                    setEditingService(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الخدمة</label>
                  <input
                    type="text"
                    value={newService.title}
                    onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="مثل: تطوير المواقع"
                    data-testid="input-service-title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">وصف الخدمة</label>
                  <textarea
                    value={newService.description || ""}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="اكتب وصفاً مفصلاً عن الخدمة..."
                    data-testid="textarea-service-description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تصنيف الخدمة</label>
                  <input
                    type="text"
                    value={newService.category}
                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="مثل: برمجة وتطوير"
                    data-testid="input-service-category"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">السعر</label>
                  <input
                    type="text"
                    value={newService.price || ""}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="مثل: 1000 ريال أو حسب الطلب"
                    data-testid="input-service-price"
                  />
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id="service-active"
                    checked={newService.isActive}
                    onChange={(e) => setNewService({ ...newService, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    data-testid="checkbox-service-active"
                  />
                  <label htmlFor="service-active" className="text-sm font-medium text-gray-700">
                    خدمة نشطة
                  </label>
                </div>
              </div>

              <div className="flex space-x-2 space-x-reverse mt-6">
                <button
                  className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    setShowServiceModal(false);
                    setEditingService(null);
                  }}
                  data-testid="button-cancel-service"
                >
                  إلغاء
                </button>
                <button
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  onClick={() => {
                    if (editingService) {
                      updateServiceMutation.mutate({ id: editingService.id, data: newService });
                    } else {
                      createServiceMutation.mutate(newService);
                    }
                  }}
                  disabled={!newService.title || !newService.category || createServiceMutation.isPending || updateServiceMutation.isPending}
                  data-testid="button-submit-service"
                >
                  {(createServiceMutation.isPending || updateServiceMutation.isPending) ? "جارِ الحفظ..." : (editingService ? "حفظ التغييرات" : "إضافة الخدمة")}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingProduct ? "تحرير المنتج" : "إضافة منتج جديد"}
                </h3>
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المنتج</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="مثل: برنامج إدارة المبيعات"
                    data-testid="input-product-name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">وصف المنتج</label>
                  <textarea
                    value={newProduct.description || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="اكتب وصفاً مفصلاً عن المنتج..."
                    data-testid="textarea-product-description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تصنيف المنتج</label>
                  <input
                    type="text"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="مثل: برمجيات"
                    data-testid="input-product-category"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">السعر</label>
                  <input
                    type="text"
                    value={newProduct.price || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="مثل: 5000 ريال أو حسب الطلب"
                    data-testid="input-product-price"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">كمية المخزون</label>
                  <input
                    type="number"
                    value={newProduct.stockQuantity || 0}
                    onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    data-testid="input-product-stock"
                  />
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id="product-active"
                    checked={newProduct.isActive}
                    onChange={(e) => setNewProduct({ ...newProduct, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    data-testid="checkbox-product-active"
                  />
                  <label htmlFor="product-active" className="text-sm font-medium text-gray-700">
                    منتج نشط
                  </label>
                </div>
              </div>

              <div className="flex space-x-2 space-x-reverse mt-6">
                <button
                  className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                  }}
                  data-testid="button-cancel-product"
                >
                  إلغاء
                </button>
                <button
                  className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  onClick={() => {
                    if (editingProduct) {
                      updateProductMutation.mutate({ id: editingProduct.id, data: newProduct });
                    } else {
                      createProductMutation.mutate(newProduct);
                    }
                  }}
                  disabled={!newProduct.name || !newProduct.category || createProductMutation.isPending || updateProductMutation.isPending}
                  data-testid="button-submit-product"
                >
                  {(createProductMutation.isPending || updateProductMutation.isPending) ? "جارِ الحفظ..." : (editingProduct ? "حفظ التغييرات" : "إضافة المنتج")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}