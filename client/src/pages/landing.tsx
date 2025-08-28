import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Search, Users, Shield, Phone } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            مرحباً بك في دليل الأرقام
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            البحث الذكي عن أصحاب الأرقام والشركات في المملكة العربية السعودية
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="text-lg px-8 py-3 bg-blue-600 hover:bg-blue-700"
            data-testid="button-login"
          >
            تسجيل الدخول
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Search className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle>البحث الذكي</CardTitle>
              <CardDescription>
                ابحث بالرقم أو الاسم للعثور على المعلومات المطلوبة
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle>دليل شامل</CardTitle>
              <CardDescription>
                قاعدة بيانات شاملة للأفراد والشركات المحققة
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle>معلومات موثقة</CardTitle>
              <CardDescription>
                جميع البيانات محققة ومتحقق من صحتها
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Phone className="w-8 h-8 text-red-600 mb-2" />
              <CardTitle>تواصل آمن</CardTitle>
              <CardDescription>
                تواصل مع الأشخاص والشركات بطريقة آمنة
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Benefits */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            لماذا تختار دليل الأرقام؟
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold mb-3">سرعة في البحث</h3>
              <p className="text-gray-600">
                احصل على النتائج في ثوانٍ معدودة مع البحث المتقدم
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">دقة في المعلومات</h3>
              <p className="text-gray-600">
                معلومات محدثة ودقيقة من مصادر موثوقة
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">أمان البيانات</h3>
              <p className="text-gray-600">
                حماية كاملة لخصوصيتك وبياناتك الشخصية
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 p-8 bg-white rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold mb-4">ابدأ الآن</h3>
          <p className="text-gray-600 mb-6">
            انضم إلى آلاف المستخدمين واستمتع بتجربة البحث المتطورة
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            data-testid="button-login-cta"
          >
            سجل الدخول وابدأ البحث
          </Button>
        </div>
      </div>
    </div>
  );
}