import { useState } from "react";
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Globe, 
  Bell, 
  Shield, 
  HelpCircle, 
  Info,
  ChevronRight,
  Download,
  Upload
} from "lucide-react";
import AppHeader from "@/components/app-header";
import BottomNavigation from "@/components/bottom-navigation";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const { toast } = useToast();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark", !isDarkMode);
  };

  const exportData = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`/api/export?format=${format}`);
      if (!response.ok) throw new Error('فشل في التصدير');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "تم التصدير بنجاح",
        description: `تم تصدير جهات الاتصال بصيغة ${format.toUpperCase()}`
      });
    } catch (error) {
      toast({
        title: "خطأ في التصدير",
        description: "فشل في تصدير البيانات",
        variant: "destructive"
      });
    }
  };

  const importMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/import", data);
      return response.json();
    },
    onSuccess: (results) => {
      toast({
        title: "تم الاستيراد",
        description: `تم إضافة ${results.success} جهة اتصال، فشل ${results.failed}`
      });
      setShowImportModal(false);
    },
    onError: () => {
      toast({
        title: "خطأ في الاستيراد",
        variant: "destructive"
      });
    }
  });

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let users;
        
        if (file.name.endsWith('.json')) {
          users = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          // Simple CSV parsing
          const lines = content.split('\n');
          const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
          users = lines.slice(1).filter(line => line.trim()).map(line => {
            const values = line.split(',').map(v => v.replace(/"/g, '').trim());
            return {
              name: values[0],
              phone: values[1],
              city: values[2] || null,
              accountType: values[3] || 'personal',
              isVerified: values[4] === 'true',
              isActive: values[5] !== 'false',
              category: values[6] || null
            };
          });
        } else {
          throw new Error('نوع ملف غير مدعوم');
        }

        importMutation.mutate({ users, format: file.name.endsWith('.csv') ? 'csv' : 'json' });
      } catch (error) {
        toast({
          title: "خطأ في قراءة الملف",
          description: "تأكد من صحة تنسيق الملف",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const settingSections = [
    {
      title: "المظهر والعرض",
      items: [
        {
          icon: isDarkMode ? Sun : Moon,
          label: "الوضع الداكن",
          type: "toggle" as const,
          value: isDarkMode,
          onChange: toggleDarkMode,
          testId: "toggle-dark-mode"
        },
        {
          icon: Globe,
          label: "اللغة",
          type: "navigation" as const,
          value: "العربية",
          testId: "button-language"
        }
      ]
    },
    {
      title: "الإشعارات",
      items: [
        {
          icon: Bell,
          label: "الإشعارات",
          type: "toggle" as const,
          value: notificationsEnabled,
          onChange: () => setNotificationsEnabled(!notificationsEnabled),
          testId: "toggle-notifications"
        }
      ]
    },
    {
      title: "الخصوصية والأمان",
      items: [
        {
          icon: Shield,
          label: "سياسة الخصوصية",
          type: "navigation" as const,
          testId: "button-privacy"
        },
        {
          icon: Shield,
          label: "شروط الاستخدام",
          type: "navigation" as const,
          testId: "button-terms"
        }
      ]
    },
    {
      title: "إدارة البيانات",
      items: [
        {
          icon: Download,
          label: "تصدير جهات الاتصال",
          type: "action" as const,
          action: () => exportData('json'),
          testId: "button-export-json"
        },
        {
          icon: Download,
          label: "تصدير CSV",
          type: "action" as const,
          action: () => exportData('csv'),
          testId: "button-export-csv"
        },
        {
          icon: Upload,
          label: "استيراد جهات الاتصال",
          type: "action" as const,
          action: () => setShowImportModal(true),
          testId: "button-import"
        }
      ]
    },
    {
      title: "المساعدة والدعم",
      items: [
        {
          icon: HelpCircle,
          label: "الأسئلة الشائعة",
          type: "navigation" as const,
          testId: "button-faq"
        },
        {
          icon: Info,
          label: "حول التطبيق",
          type: "navigation" as const,
          testId: "button-about"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <main className="pb-20">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
          </div>

          <div className="space-y-6">
            {settingSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="text-sm font-medium text-gray-500">{section.title}</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {section.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="px-4 py-4 flex items-center justify-between"
                      data-testid={`setting-${item.testId}`}
                    >
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <item.icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-900">{item.label}</span>
                      </div>
                      
                      <div className="flex items-center">
                        {item.type === "toggle" ? (
                          <button
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              item.value ? "bg-primary-500" : "bg-gray-200"
                            }`}
                            onClick={item.onChange}
                            data-testid={item.testId}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                item.value ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        ) : item.type === "action" ? (
                          <button
                            className="flex items-center space-x-2 space-x-reverse text-gray-400 hover:text-gray-600"
                            onClick={item.action}
                            data-testid={item.testId}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            className="flex items-center space-x-2 space-x-reverse text-gray-400"
                            data-testid={item.testId}
                          >
                            {'value' in item && item.value && (
                              <span className="text-sm text-gray-500">{item.value}</span>
                            )}
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* App Version */}
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">كاشف الأرقام</p>
              <p className="text-xs text-gray-400 mt-1">الإصدار 1.0.0</p>
            </div>
          </div>
        </div>
      </main>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">استيراد جهات الاتصال</h3>
            <p className="text-gray-600 mb-4">
              اختر ملف JSON أو CSV لاستيراد جهات الاتصال. يجب أن يحتوي الملف على البيانات بالتنسيق الصحيح.
            </p>
            <input
              type="file"
              accept=".json,.csv"
              onChange={handleFileImport}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              data-testid="input-import-file"
            />
            <div className="flex space-x-2 space-x-reverse">
              <button
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => setShowImportModal(false)}
                data-testid="button-cancel-import"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}
