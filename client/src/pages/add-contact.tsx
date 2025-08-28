import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Phone, User, MapPin, Building2, AlertTriangle } from "lucide-react";

// Validation schema
const addContactSchema = z.object({
  phoneNumber: z.string().min(10, "رقم الهاتف يجب أن يكون 10 أرقام على الأقل"),
  contactName: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  userCity: z.string().optional(),
  userCountry: z.string().optional(),
  userRegion: z.string().optional(),
  isVerified: z.boolean().default(false),
});

type AddContactForm = z.infer<typeof addContactSchema>;

export default function AddContact() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const form = useForm<AddContactForm>({
    resolver: zodResolver(addContactSchema),
    defaultValues: {
      phoneNumber: "",
      contactName: "",
      userCity: user?.city || "",
      userCountry: user?.country || "المملكة العربية السعودية",
      userRegion: user?.region || "",
      isVerified: false,
    },
  });

  const addContactMutation = useMutation({
    mutationFn: async (data: AddContactForm) => {
      const response = await apiRequest("POST", "/api/phone-contacts", {
        ...data,
        addedByUserId: user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إضافة جهة الاتصال بنجاح",
        description: "تم حفظ الاسم والرقم في قاعدة البيانات",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/search"] });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في إضافة جهة الاتصال",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: AddContactForm) => {
    addContactMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-500 text-white px-4 py-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <button
            onClick={() => setLocation("/")}
            className="p-2 hover:bg-primary-600 rounded-lg transition-colors touch-target"
            data-testid="button-back"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">إضافة جهة اتصال</h1>
        </div>
      </header>

      <main className="p-4">
        {/* Info Card */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900 mb-1">ساعد في بناء دليل الأرقام</h3>
                <p className="text-sm text-blue-700">
                  عند إضافة رقم جهة اتصال، ستساعد الآخرين في التعرف على هذا الرقم. سيظهر اسمك كمن أضاف هذه المعلومة.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <User className="w-5 h-5 text-primary-600" />
              <span>بيانات جهة الاتصال</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 space-x-reverse">
                        <Phone className="w-4 h-4" />
                        <span>رقم الهاتف</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="966501234567+"
                          type="tel"
                          className="text-lg"
                          data-testid="input-phone-number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Name */}
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 space-x-reverse">
                        <User className="w-4 h-4" />
                        <span>اسم جهة الاتصال</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="أحمد محمد أو شركة التقنية"
                          className="text-lg"
                          data-testid="input-contact-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2 space-x-reverse">
                    <MapPin className="w-4 h-4" />
                    <span>الموقع (اختياري)</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="userCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المدينة</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="الرياض، جدة، الدمام..."
                              data-testid="input-city"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="userRegion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المنطقة</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="الرياض، مكة المكرمة، الشرقية..."
                              data-testid="input-region"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full py-3"
                    disabled={addContactMutation.isPending}
                    data-testid="button-add-contact"
                  >
                    {addContactMutation.isPending ? "جاري الإضافة..." : "إضافة جهة الاتصال"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Recent Additions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">آخر الإضافات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">أحمد المحمد</p>
                    <p className="text-sm text-gray-500">966501234567+</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">اليوم</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">مطعم البركة</p>
                    <p className="text-sm text-gray-500">966112345678+</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">أمس</span>
              </div>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                تم إضافة 127 جهة اتصال هذا الأسبوع بواسطة المستخدمين
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}