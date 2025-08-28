import { Home, Users, Building, Settings, Star, User, Search, Store } from "lucide-react";
import { useLocation } from "wouter";
import { Link } from "wouter";

export default function BottomNavigation() {
  const [location] = useLocation();

  // Get current user ID from localStorage
  const currentUserId = localStorage.getItem('currentUserId');

  const navItems = [
    { path: "/", icon: Home, label: "الرئيسية", testId: "nav-home" },
    { path: "/phone-discovery", icon: Search, label: "كاشف الأرقام", testId: "nav-phone-discovery" },
    { path: "/marketplace", icon: Store, label: "السوق", testId: "nav-marketplace" },
    { path: "/business", icon: Building, label: "دليل الأعمال", testId: "nav-business" },
    { path: "/contacts", icon: Users, label: "جهات الاتصال", testId: "nav-contacts" },
    { path: "/settings", icon: Settings, label: "الإعدادات", testId: "nav-settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-6">
        {navItems.map(({ path, icon: Icon, label, testId }) => (
          <Link key={path} href={path}>
            <button
              className={`py-2 px-1 flex flex-col items-center space-y-1 touch-target transition-colors ${
                location === path
                  ? "text-primary-600 bg-primary-50"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              data-testid={testId}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          </Link>
        ))}
      </div>
    </nav>
  );
}