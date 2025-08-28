import { useState } from "react";
import { X, User, Building } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InsertUser } from "@shared/schema";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [formData, setFormData] = useState<InsertUser>({
    name: "",
    phone: "",
    city: "",
    accountType: "personal",
    isVerified: false,
    isActive: true,
  });
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const createUserMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
    onSuccess: (newUser) => {
      // Store the current user ID in localStorage
      localStorage.setItem('currentUserId', newUser.id);

      toast({
        title: "تم إنشاء الملف الشخصي",
        description: "تم حفظ بياناتك بنجاح",
      });
      onClose();
      resetForm();
      // التنقل إلى صفحة الملف الشخصي
      setLocation(`/profile/${newUser.id}`);

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إنشاء الملف الشخصي",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      city: "",
      accountType: "personal",
      isVerified: false,
      isActive: true,
    });
    setPrivacyAccepted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!privacyAccepted) {
      toast({
        title: "يجب الموافقة على سياسة الخصوصية",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.phone) {
      toast({
        title: "يرجى ملء الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof InsertUser, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">إنشاء ملف شخصي</h2>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg touch-target"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <X className="text-gray-500 w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="أدخل اسمك الكامل"
                required
                data-testid="input-name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="+966 5X XXX XXXX"
                required
                data-testid="input-phone"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المدينة</label>
              <select
                value={formData.city || ""}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                data-testid="select-city"
              >
                <option value="">اختر المدينة</option>
                <option value="الرياض">الرياض</option>
                <option value="جدة">جدة</option>
                <option value="الدمام">الدمام</option>
                <option value="مكة المكرمة">مكة المكرمة</option>
                <option value="المدينة المنورة">المدينة المنورة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع الحساب</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`p-3 border rounded-lg text-center touch-target transition-colors ${
                    formData.accountType === "personal"
                      ? "bg-primary-50 border-primary-500 text-primary-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => handleInputChange("accountType", "personal")}
                  data-testid="button-account-personal"
                >
                  <User className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-sm">شخصي</span>
                </button>
                <button
                  type="button"
                  className={`p-3 border rounded-lg text-center touch-target transition-colors ${
                    formData.accountType === "business"
                      ? "bg-primary-50 border-primary-500 text-primary-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => handleInputChange("accountType", "business")}
                  data-testid="button-account-business"
                >
                  <Building className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-sm">تجاري</span>
                </button>
              </div>
            </div>

            {formData.accountType === "business" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">فئة النشاط</label>
                <input
                  type="text"
                  value={formData.category || ""}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="مثل: تقنية المعلومات، طب، تجارة"
                  data-testid="input-category"
                />
              </div>
            )}

            <div className="flex items-center space-x-3 space-x-reverse">
              <input
                type="checkbox"
                id="privacy"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                data-testid="checkbox-privacy"
              />
              <label htmlFor="privacy" className="text-sm text-gray-600">
                أوافق على{" "}
                <a href="#" className="text-primary-600 underline">
                  سياسة الخصوصية
                </a>{" "}
                *
              </label>
            </div>

            <button
              type="submit"
              disabled={createUserMutation.isPending}
              className="w-full py-4 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors touch-target disabled:opacity-50"
              data-testid="button-create-profile"
            >
              {createUserMutation.isPending ? "جاري الحفظ..." : "إنشاء الملف الشخصي"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}